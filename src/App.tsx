/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomepagePublic from './components/HomepagePublic';
import DashboardSuperAdmin from './components/DashboardSuperAdmin';
import DashboardAdminProdi from './components/DashboardAdminProdi';
import LoginModal from './components/LoginModal';
import { StudyProgram, UserSession, DocStatus, DocChecklist } from './types';
import { getStudyPrograms, saveStudyPrograms, INITIAL_STUDY_PROGRAMS } from './data';
import { ShieldAlert, BookOpen } from 'lucide-react';

export default function App() {
  const [programs, setPrograms] = useState<StudyProgram[]>([]);
  const [session, setSession] = useState<UserSession | null>(null);
  const [currentView, setCurrentView] = useState<'public' | 'dashboard'>('public');
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    // 1. Initial local load
    const loadedPrograms = getStudyPrograms();
    setPrograms(loadedPrograms);

    // 2. Load from Supabase to stay updated with live database
    const syncWithSupabase = async () => {
      try {
        const res = await fetch('/api/prodi');
        const rawText = await res.text();
        console.log("=== DIAGNOSTIC: Raw API Response from /api/prodi ===");
        console.log(rawText.slice(0, 1000) + (rawText.length > 1000 ? "... (truncated)" : ""));
        console.log("====================================================");

        if (res.ok) {
          let dbProdis;
          try {
            dbProdis = JSON.parse(rawText);
          } catch (jsonErr: any) {
            console.error("=== DIAGNOSTIC ERROR: Failed to parse /api/prodi as JSON ===", jsonErr);
            return;
          }

          if (Array.isArray(dbProdis) && dbProdis.length > 0) {
            // Map db rows to StudyProgram format
            const mappedProdis: StudyProgram[] = dbProdis.map((p: any) => {
              // Find matching program to inherit existing structured objects
              const existing = loadedPrograms.find(ep => 
                ep.id === p.id || 
                ep.name === (p.nama_prodi || p.nama || p.name) ||
                (p.id && ep.id && p.id.replace(/-/g, '').endsWith(ep.id.replace('prodi-', '').padStart(12, '0'))) ||
                ep.code === (p.kode_prodi || p.code)
              );
              
              return {
                id: p.id || existing?.id || `prodi-${p.code || Math.random()}`,
                name: p.nama_prodi || p.nama || p.name || existing?.name || 'Program Studi',
                level: p.jenjang || p.level || existing?.level || 'S1',
                code: p.kode_prodi || p.code || existing?.code || '00000',
                faculty: p.fakultas || p.faculty || existing?.faculty || 'Fakultas',
                lam: p.lembaga_akreditasi || p.lam || existing?.lam || 'BAN-PT',
                accreditationStatus: p.status_akreditasi || p.accreditation_status || p.accreditationStatus || existing?.accreditationStatus || 'Baik',
                skNumber: p.no_sk || p.sk_number || p.skNumber || existing?.skNumber || '-',
                expiryDate: p.tanggal_kadaluarsa || p.expiry_date || p.expiryDate || existing?.expiryDate || '-',
                profile: existing?.profile || {
                  kaprodi: 'Belum Diisi',
                  phone: '-',
                  email: '-',
                  description: '',
                  vision: '',
                  mission: []
                },
                documents: (() => {
                  const defaultDocs: DocChecklist = {
                    led: { status: 'Belum Ada', lastUpdated: '-', fileName: '' },
                    lkps: { status: 'Belum Ada', lastUpdated: '-', fileName: '' },
                    legalitas: { status: 'Belum Ada', lastUpdated: '-', fileName: '' }
                  };
                  
                  if (existing?.documents) {
                    defaultDocs.led = { ...existing.documents.led };
                    defaultDocs.lkps = { ...existing.documents.lkps };
                    defaultDocs.legalitas = { ...existing.documents.legalitas };
                  }

                  if (Array.isArray(p.berkas)) {
                    p.berkas.forEach((b: any) => {
                      const jenis = String(b.jenis_dokumen).toLowerCase();
                      const statusMapped = (b.status_berkas || 'Belum Ada') as DocStatus;
                      const fileNm = b.nama_file || '';
                      const updated = b.updated_at ? b.updated_at.split('T')[0] : '-';
                      
                      if (jenis === 'led') {
                        defaultDocs.led = { status: statusMapped, lastUpdated: updated, fileName: fileNm };
                      } else if (jenis === 'lkps') {
                        defaultDocs.lkps = { status: statusMapped, lastUpdated: updated, fileName: fileNm };
                      } else if (jenis === 'izin' || jenis === 'legalitas') {
                        defaultDocs.legalitas = { status: statusMapped, lastUpdated: updated, fileName: fileNm };
                      }
                    });
                  }
                  return defaultDocs;
                })(),
                criteriaProgress: existing?.criteriaProgress || {
                  k1: 'Belum Mulai',
                  k2: 'Belum Mulai',
                  k3: 'Belum Mulai',
                  k4: 'Belum Mulai',
                  k5: 'Belum Mulai',
                  k6: 'Belum Mulai',
                  k7: 'Belum Mulai',
                  k8: 'Belum Mulai'
                }
              };
            });
            setPrograms(mappedProdis);
            saveStudyPrograms(mappedProdis);
          }
        }
      } catch (err) {
        console.error("Gagal sinkronisasi data prodi dari Supabase:", err);
      }
    };

    syncWithSupabase();

    // Register a global window diagnostic helper
    (window as any).runAkridaDiagnostic = async () => {
      console.log("=== RUNNING AKRIDA DIAGNOSTIC ===");
      try {
        console.log("1. Fetching raw /api/prodi...");
        const resProdi = await fetch('/api/prodi');
        const textProdi = await resProdi.text();
        console.log(`[STATUS ${resProdi.status}] /api/prodi response:`);
        console.log(textProdi);
      } catch (err) {
        console.error("Error fetching /api/prodi:", err);
      }

      try {
        console.log("2. Fetching raw /api/upload...");
        const resUpload = await fetch('/api/upload');
        const textUpload = await resUpload.text();
        console.log(`[STATUS ${resUpload.status}] /api/upload response:`);
        console.log(textUpload);
      } catch (err) {
        console.error("Error fetching /api/upload:", err);
      }
      console.log("=== DIAGNOSTIC COMPLETED ===");
    };

    // 3. Session recovery
    const storedSession = sessionStorage.getItem('akrida_session');
    if (storedSession) {
      try {
        setSession(JSON.parse(storedSession));
        setCurrentView('dashboard');
      } catch (e) {
        console.error('Error parsing stored session', e);
      }
    }
  }, []);

  // Sync state & LocalStorage for adding a study program
  const handleAddProgram = (newProg: StudyProgram) => {
    const updated = [...programs, newProg];
    setPrograms(updated);
    saveStudyPrograms(updated);
  };

  // Sync state & LocalStorage for updating a study program
  const handleUpdateProgram = (updatedProg: StudyProgram) => {
    const updated = programs.map(p => p.id === updatedProg.id ? updatedProg : p);
    setPrograms(updated);
    saveStudyPrograms(updated);
  };

  // Sync state & LocalStorage for deleting a study program
  const handleDeleteProgram = (id: string) => {
    const updated = programs.filter(p => p.id !== id);
    setPrograms(updated);
    saveStudyPrograms(updated);
  };

  // Reset to initial mock data
  const handleResetToDefault = () => {
    if (window.confirm('Apakah Anda yakin ingin mengatur ulang semua data program studi kembali ke data bawaan demo? Data kustomisasi Anda akan terhapus.')) {
      localStorage.removeItem('akrida_study_programs');
      setPrograms(INITIAL_STUDY_PROGRAMS);
      saveStudyPrograms(INITIAL_STUDY_PROGRAMS);
    }
  };

  // Login handler
  const handleLoginSuccess = (userSession: UserSession) => {
    setSession(userSession);
    sessionStorage.setItem('akrida_session', JSON.stringify(userSession));
    setCurrentView('dashboard');
  };

  // Logout handler
  const handleLogout = () => {
    setSession(null);
    sessionStorage.removeItem('akrida_session');
    setCurrentView('public');
  };

  // Nav coordinator
  const handleNavigate = (view: 'public' | 'dashboard') => {
    if (view === 'dashboard' && !session) {
      setIsLoginOpen(true);
      return;
    }
    setCurrentView(view);
  };

  // Safeguard: Reset view to public if session is cleared but view remains on dashboard
  useEffect(() => {
    if (!session && currentView === 'dashboard') {
      setCurrentView('public');
    }
  }, [session, currentView]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 antialiased font-sans" id="app-root-container">
      {/* Navigation Header */}
      <Navbar 
        session={session}
        onLoginClick={() => setIsLoginOpen(true)}
        onLogout={handleLogout}
        currentView={currentView}
        onNavigate={handleNavigate}
      />

      {/* Main Viewport Router */}
      <main className="flex-grow">
        {currentView === 'public' ? (
          <HomepagePublic 
            programs={programs} 
            onLoginClick={() => setIsLoginOpen(true)} 
          />
        ) : (
          session && (
            session.role === 'superadmin' ? (
              <DashboardSuperAdmin 
                programs={programs}
                onAddProgram={handleAddProgram}
                onUpdateProgram={handleUpdateProgram}
                onDeleteProgram={handleDeleteProgram}
                onResetToDefault={handleResetToDefault}
              />
            ) : (
              (() => {
                // Find program managed by this prodi admin
                const matchedProg = programs.find(p => p.id === session.prodiId);
                
                if (matchedProg) {
                  return (
                    <DashboardAdminProdi 
                      program={matchedProg}
                      onUpdateProgram={handleUpdateProgram}
                    />
                  );
                } else {
                  return (
                    <div className="py-20 text-center max-w-md mx-auto px-4" id="fallback-no-prodi-view">
                      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto mb-4" />
                        <h2 className="text-lg font-bold text-slate-950">Akses Terputus</h2>
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                          Program Studi yang dikaitkan dengan akun Anda tidak ditemukan di sistem master. Kemungkinan program studi tersebut baru saja dihapus oleh Super Admin Universitas.
                        </p>
                        <button
                          onClick={handleLogout}
                          className="mt-6 bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all"
                        >
                          Logout dari Akun
                        </button>
                      </div>
                    </div>
                  );
                }
              })()
            )
          )
        )}
      </main>

      {/* General Footer */}
      <Footer currentView={currentView} />

      {/* Modular Login Overlay Modal */}
      <LoginModal 
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
