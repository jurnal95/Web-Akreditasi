/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, AlertTriangle, FileText, CheckCircle2, 
  Clock, X, Mail, Phone, User, Award, ShieldAlert, CheckSquare, 
  Building2, ArrowUpRight, BarChart2, Check, RefreshCw, Search
} from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { StudyProgram, LAMCluster, AccreditationStatus, DocStatus } from '../types';
import InteractiveAccreditationChart from './InteractiveAccreditationChart';

interface DashboardSuperAdminProps {
  programs: StudyProgram[];
  onAddProgram: (program: StudyProgram) => void;
  onUpdateProgram: (program: StudyProgram) => void;
  onDeleteProgram: (id: string) => void;
  onResetToDefault: () => void;
}

export default function DashboardSuperAdmin({ 
  programs, 
  onAddProgram, 
  onUpdateProgram, 
  onDeleteProgram,
  onResetToDefault
}: DashboardSuperAdminProps) {
  
  // State for Add/Edit Modal
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<StudyProgram | null>(null);

  // State for Reviewing Berkas Akreditasi
  const [selectedReviewProdi, setSelectedReviewProdi] = useState<StudyProgram | null>(null);
  const [reviewDocuments, setReviewDocuments] = useState<any[]>([]);
  const [isReviewLoading, setIsReviewLoading] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null);

  const handleReviewProdi = async (p: StudyProgram) => {
    setSelectedReviewProdi(p);
    setIsReviewLoading(true);
    setIsReviewOpen(true);
    setReviewDocuments([]);
    setExpandedDocId(null);
    try {
      const res = await fetch(`/api/prodi/berkas-akreditasi/${p.id}`);
      if (res.ok) {
        const data = await res.json();
        setReviewDocuments(data || []);
      }
    } catch (err) {
      console.error("Gagal mengambil data review berkas:", err);
    } finally {
      setIsReviewLoading(false);
    }
  };

  // Account Management States
  const [activeTab, setActiveTab] = useState<'master' | 'accounts'>('master');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);
  const [selectedProdiId, setSelectedProdiId] = useState('');
  const [usernameAkses, setUsernameAkses] = useState('');
  const [tokenMasuk, setTokenMasuk] = useState('');
  const [statusPakai, setStatusPakai] = useState('aktif');
  const [submittingAccount, setSubmittingAccount] = useState(false);
  const [accountSuccessMsg, setAccountSuccessMsg] = useState('');
  const [accountErrorMsg, setAccountErrorMsg] = useState('');

  const fetchAccounts = async () => {
    setIsLoadingAccounts(true);
    try {
      const res = await fetch('/api/admin/list-akun');
      if (res.ok) {
        const data = await res.json();
        setAccounts(data);
      }
    } catch (err) {
      console.error("Gagal memuat akun akses:", err);
    } finally {
      setIsLoadingAccounts(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'accounts') {
      fetchAccounts();
    }
  }, [activeTab]);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProdiId || !usernameAkses || !tokenMasuk) {
      setAccountErrorMsg('Semua kolom wajib diisi!');
      return;
    }
    setSubmittingAccount(true);
    setAccountSuccessMsg('');
    setAccountErrorMsg('');
    try {
      const res = await fetch('/api/admin/create-akun', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prodi_id: selectedProdiId,
          username_akses: usernameAkses,
          token_masuk: tokenMasuk,
          status_pakai: statusPakai
        })
      });
      const data = await res.json();
      if (res.ok) {
        setAccountSuccessMsg(data.message || 'Akun berhasil dibuat!');
        setUsernameAkses('');
        setTokenMasuk('');
        setSelectedProdiId('');
        fetchAccounts();
      } else {
        setAccountErrorMsg(data.error || 'Gagal membuat akun.');
      }
    } catch (err) {
      setAccountErrorMsg('Terjadi kesalahan jaringan.');
    } finally {
      setSubmittingAccount(false);
    }
  };
  
  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    faculty: '',
    level: 'S1',
    lam: 'LAM INFOKOM' as LAMCluster,
    accreditationStatus: 'Unggul' as AccreditationStatus,
    skNumber: '',
    expiryDate: '',
    kaprodi: '',
    phone: '',
    email: '',
    description: '',
    vision: '',
    mission: '' // Will parse lines
  });

  // Search filter inside Super Admin panel
  const [adminSearch, setAdminSearch] = useState('');

  // Expiring programs (< 1 year)
  const expiringPrograms = useMemo(() => {
    return programs.filter(p => {
      if (!p.expiryDate || p.expiryDate === '-') return false;
      const expiry = new Date(p.expiryDate);
      const now = new Date();
      const diffTime = expiry.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 365; // Expiring in less than 365 days
    }).sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
  }, [programs]);

  // Document statistics
  const docStats = useMemo(() => {
    let totalLedFinal = 0;
    let totalLedDraf = 0;
    let totalLedNone = 0;

    let totalLkpsFinal = 0;
    let totalLkpsDraf = 0;
    let totalLkpsNone = 0;

    let totalLegalitasFinal = 0;
    let totalLegalitasDraf = 0;
    let totalLegalitasNone = 0;

    const total = programs.length || 1;

    programs.forEach(p => {
      // LED
      if (p.documents.led.status === 'Final') totalLedFinal++;
      else if (p.documents.led.status === 'Draf') totalLedDraf++;
      else totalLedNone++;

      // LKPS
      if (p.documents.lkps.status === 'Final') totalLkpsFinal++;
      else if (p.documents.lkps.status === 'Draf') totalLkpsDraf++;
      else totalLkpsNone++;

      // Legalitas
      if (p.documents.legalitas.status === 'Final') totalLegalitasFinal++;
      else if (p.documents.legalitas.status === 'Draf') totalLegalitasDraf++;
      else totalLegalitasNone++;
    });

    return {
      led: { final: totalLedFinal, draf: totalLedDraf, none: totalLedNone, pctFinal: Math.round((totalLedFinal / total) * 100) },
      lkps: { final: totalLkpsFinal, draf: totalLkpsDraf, none: totalLkpsNone, pctFinal: Math.round((totalLkpsFinal / total) * 100) },
      legalitas: { final: totalLegalitasFinal, draf: totalLegalitasDraf, none: totalLegalitasNone, pctFinal: Math.round((totalLegalitasFinal / total) * 100) },
      averageDocsReady: Math.round(((totalLedFinal + totalLkpsFinal + totalLegalitasFinal) / (total * 3)) * 100)
    };
  }, [programs]);

  // Filter study programs listed in management table
  const filteredPrograms = useMemo(() => {
    return programs.filter(p => 
      p.name.toLowerCase().includes(adminSearch.toLowerCase()) ||
      p.code.includes(adminSearch) ||
      p.faculty.toLowerCase().includes(adminSearch.toLowerCase()) ||
      p.profile.kaprodi.toLowerCase().includes(adminSearch.toLowerCase())
    );
  }, [programs, adminSearch]);

  // Open Form for Adding New
  const handleOpenAdd = () => {
    setEditingProgram(null);
    setFormData({
      name: '',
      code: '',
      faculty: 'Fakultas Teknik dan Ilmu Komputer',
      level: 'S1',
      lam: 'LAM INFOKOM',
      accreditationStatus: 'Baik Sekali',
      skNumber: '',
      expiryDate: '',
      kaprodi: '',
      phone: '',
      email: '',
      description: '',
      vision: '',
      mission: 'Menyelenggarakan tri dharma perguruan tinggi berkualitas.\nMeningkatkan jaminan mutu lulusan.\nMengembangkan jaringan kerjasama nasional.'
    });
    setIsFormOpen(true);
  };

  // Open Form for Editing Existing
  const handleOpenEdit = (p: StudyProgram) => {
    setEditingProgram(p);
    setFormData({
      name: p.name,
      code: p.code,
      faculty: p.faculty,
      level: p.level,
      lam: p.lam,
      accreditationStatus: p.accreditationStatus,
      skNumber: p.skNumber,
      expiryDate: p.expiryDate,
      kaprodi: p.profile.kaprodi,
      phone: p.profile.phone,
      email: p.profile.email,
      description: p.profile.description,
      vision: p.profile.vision,
      mission: p.profile.mission.join('\n')
    });
    setIsFormOpen(true);
  };

  // Form Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code || !formData.skNumber || !formData.expiryDate) {
      alert('Tolong lengkapi form wajib (Nama, Kode, SK, Tanggal Kedaluwarsa)');
      return;
    }

    const parsedMission = formData.mission
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const targetId = editingProgram ? editingProgram.id : `prodi-${Date.now()}`;
    
    // Maintain existing document state and criteria progress if editing, or create defaults
    const existingDocs = editingProgram ? editingProgram.documents : {
      led: { status: 'Belum Ada' as DocStatus, lastUpdated: '-' },
      lkps: { status: 'Belum Ada' as DocStatus, lastUpdated: '-' },
      legalitas: { status: 'Belum Ada' as DocStatus, lastUpdated: '-' }
    };

    const existingCriteria = editingProgram ? editingProgram.criteriaProgress : {
      k1: 'Belum Mulai' as const,
      k2: 'Belum Mulai' as const,
      k3: 'Belum Mulai' as const,
      k4: 'Belum Mulai' as const,
      k5: 'Belum Mulai' as const,
      k6: 'Belum Mulai' as const,
      k7: 'Belum Mulai' as const,
      k8: 'Belum Mulai' as const
    };

    const payload: StudyProgram = {
      id: targetId,
      name: formData.name,
      code: formData.code,
      faculty: formData.faculty,
      level: formData.level,
      lam: formData.lam,
      accreditationStatus: formData.accreditationStatus,
      skNumber: formData.skNumber,
      expiryDate: formData.expiryDate,
      profile: {
        kaprodi: formData.kaprodi || 'Belum diisi',
        phone: formData.phone || '-',
        email: formData.email || '-',
        description: formData.description || 'Program studi berfokus pada keunggulan akademik.',
        vision: formData.vision || 'Menjadi program studi bermutu unggul.',
        mission: parsedMission.length > 0 ? parsedMission : ['Menyelenggarakan pendidikan bermutu.']
      },
      documents: existingDocs,
      criteriaProgress: existingCriteria
    };

    if (editingProgram) {
      onUpdateProgram(payload);
    } else {
      onAddProgram(payload);
    }

    setIsFormOpen(false);
  };

  // Delete handler with custom confirm
  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus Program Studi "${name}" dari data master? Tindakan ini tidak bisa dibatalkan.`)) {
      onDeleteProgram(id);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Block */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 bg-white p-6 rounded-2xl border border-slate-200">
          <div>
            <div className="flex items-center space-x-2 text-indigo-600 mb-1.5">
              <Building2 className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Universitas / LPM</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Data Master Akreditasi</h1>
            <p className="text-xs text-slate-500 mt-1">Kelola data program studi, pantau kedaluwarsa SK, dan evaluasi progres unggahan dokumen mutu.</p>
          </div>
          
          <div className="flex items-center space-x-2.5">
            <button
              onClick={onResetToDefault}
              className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-all border border-slate-200"
              title="Kembalikan semua data ke setelan demo awal"
              id="btn-reset-demo"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Reset Demo Data</span>
            </button>
            <button
              onClick={handleOpenAdd}
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              id="btn-add-prodi"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Prodi Baru</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1.5 border-b border-slate-200 mb-8">
          <button
            onClick={() => setActiveTab('master')}
            className={`px-4.5 py-2.5 font-bold text-xs border-b-2 transition-all cursor-pointer ${
              activeTab === 'master'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200'
            }`}
          >
            Data Master & Progress Akreditasi
          </button>
          <button
            onClick={() => {
              setActiveTab('accounts');
              setAccountSuccessMsg('');
              setAccountErrorMsg('');
            }}
            className={`px-4.5 py-2.5 font-bold text-xs border-b-2 transition-all cursor-pointer ${
              activeTab === 'accounts'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200'
            }`}
          >
            Manajemen Akun Akses Prodi
          </button>
        </div>

        {activeTab === 'master' && (
          <>
            {/* TOP STATS GRAPH/SUMMARY & EXPIRY ALERT ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
          
          {/* Document Progress Summary Graph (Left) */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-3xs">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center space-x-2">
                  <BarChart2 className="h-4 w-4 text-indigo-600" />
                  <span>Grafik Progres Dokumen Mutu Universitas</span>
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Persentase dokumen yang telah berstatus FINAL di universitas.</p>
              </div>
              <div className="bg-emerald-50 text-emerald-800 text-xs font-black px-2.5 py-1 rounded-lg">
                Rerata: {docStats.averageDocsReady}%
              </div>
            </div>

            {/* Custom SVG/Bar visual graph */}
            <div className="space-y-4">
              
              {/* LED progress */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-bold text-slate-700">Laporan Evaluasi Diri (LED)</span>
                  <span className="font-mono font-bold text-slate-500">
                    {docStats.led.final} Final / {docStats.led.draf} Draf ({docStats.led.pctFinal}%)
                  </span>
                </div>
                <div className="h-3.5 bg-slate-100 rounded-full overflow-hidden flex">
                  {/* Final Segment */}
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-500" 
                    style={{ width: `${docStats.led.pctFinal}%` }}
                    title={`Final: ${docStats.led.final}`}
                  />
                  {/* Draf Segment */}
                  <div 
                    className="h-full bg-amber-400 transition-all duration-500" 
                    style={{ width: `${Math.round((docStats.led.draf / (programs.length || 1)) * 100)}%` }}
                    title={`Draf: ${docStats.led.draf}`}
                  />
                </div>
              </div>

              {/* LKPS progress */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-bold text-slate-700">Laporan Kinerja Program Studi (LKPS)</span>
                  <span className="font-mono font-bold text-slate-500">
                    {docStats.lkps.final} Final / {docStats.lkps.draf} Draf ({docStats.lkps.pctFinal}%)
                  </span>
                </div>
                <div className="h-3.5 bg-slate-100 rounded-full overflow-hidden flex">
                  {/* Final Segment */}
                  <div 
                    className="h-full bg-teal-500 transition-all duration-500" 
                    style={{ width: `${docStats.lkps.pctFinal}%` }}
                  />
                  {/* Draf Segment */}
                  <div 
                    className="h-full bg-amber-400 transition-all duration-500" 
                    style={{ width: `${Math.round((docStats.lkps.draf / (programs.length || 1)) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Legalitas progress */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-bold text-slate-700">Dokumen Legalitas &amp; Pengantar</span>
                  <span className="font-mono font-bold text-slate-500">
                    {docStats.legalitas.final} Final / {docStats.legalitas.draf} Draf ({docStats.legalitas.pctFinal}%)
                  </span>
                </div>
                <div className="h-3.5 bg-slate-100 rounded-full overflow-hidden flex">
                  {/* Final Segment */}
                  <div 
                    className="h-full bg-indigo-500 transition-all duration-500" 
                    style={{ width: `${docStats.legalitas.pctFinal}%` }}
                  />
                  {/* Draf Segment */}
                  <div 
                    className="h-full bg-amber-400 transition-all duration-500" 
                    style={{ width: `${Math.round((docStats.legalitas.draf / (programs.length || 1)) * 100)}%` }}
                  />
                </div>
              </div>

            </div>

            {/* Color keys */}
            <div className="flex space-x-4 mt-4.5 pt-3.5 border-t border-slate-100 text-[10px] text-slate-500 font-semibold uppercase">
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-xs inline-block" />
                <span>Dokumen Final</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 bg-amber-400 rounded-xs inline-block" />
                <span>Dokumen Draf</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 bg-slate-200 rounded-xs inline-block" />
                <span>Belum Ada Unggahan</span>
              </div>
            </div>

          </div>

          {/* Expiry Alarm Monitor Panel (Right) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-3xs flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center space-x-2 border-b border-slate-100 pb-3 mb-3">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span>Peringatan Kedaluwarsa SK Akreditasi</span>
              </h3>
              
              {expiringPrograms.length > 0 ? (
                <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                  {expiringPrograms.map(p => {
                    const expiry = new Date(p.expiryDate);
                    const now = new Date();
                    const diffTime = expiry.getTime() - now.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    const isExpired = diffDays < 0;

                    return (
                      <div 
                        key={p.id} 
                        className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                          isExpired 
                            ? 'bg-rose-50 border-rose-150 text-rose-800' 
                            : diffDays <= 180 
                              ? 'bg-amber-50 border-amber-150 text-amber-800' 
                              : 'bg-yellow-50/50 border-yellow-150 text-yellow-800'
                        }`}
                      >
                        <div>
                          <p className="font-bold">{p.name} ({p.level})</p>
                          <p className="text-[10px] opacity-80 mt-0.5">
                            {isExpired ? 'TELAH KEDALUWARSA!' : `Sisa ${diffDays} hari lagi • ${p.expiryDate}`}
                          </p>
                        </div>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-sm border ${
                          isExpired 
                            ? 'bg-rose-100 border-rose-200 text-rose-700' 
                            : 'bg-amber-100 border-amber-200 text-amber-700'
                        }`}>
                          {p.accreditationStatus}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                  <p className="font-semibold text-slate-600">Aman Terkendali</p>
                  <p className="opacity-80">Tidak ada prodi yang masa akreditasinya habis dalam waktu dekat (1 tahun).</p>
                </div>
              )}
            </div>

            <div className="text-[10px] text-slate-400 bg-slate-50 border border-slate-100 p-2.5 rounded-xl leading-relaxed mt-4">
              <strong>Info:</strong> Super Admin mengelola Master Data. Pengisian berkas kualitatif dan progres kriteria dilakukan oleh masing-masing akun <strong>Admin Prodi</strong>.
            </div>
          </div>

        </div>

        {/* INTERACTIVE ACCREDITATION CHART SECTION */}
        <InteractiveAccreditationChart programs={programs} />

        {/* MASTER CRUD TABLE SECTION */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs overflow-hidden">
          {/* Header Controls inside card */}
          <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Kelola Data Master Program Studi</h2>
              <p className="text-[11px] text-slate-500">Gunakan tombol edit atau hapus untuk memutakhirkan detail dasar program studi.</p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari prodi / kaprodi..."
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 bg-white text-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-800"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {filteredPrograms.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 text-[11px] font-bold uppercase tracking-wider">
                    <th className="px-6 py-3.5">Kode</th>
                    <th className="px-6 py-3.5">Program Studi</th>
                    <th className="px-6 py-3.5">Rumpun LAM</th>
                    <th className="px-6 py-3.5">Kesiapan (AI)</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">No. SK Akreditasi</th>
                    <th className="px-6 py-3.5">Kedaluwarsa SK</th>
                    <th className="px-6 py-3.5 text-right">Kelola</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800 text-xs">
                  {filteredPrograms.map(p => (
                    <tr 
                      key={p.id} 
                      onClick={() => handleReviewProdi(p)}
                      className="hover:bg-slate-100/85 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 font-mono font-bold text-slate-500">{p.code}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{p.name} ({p.level})</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Kaprodi: {p.profile.kaprodi} • {p.faculty}</div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-600">{p.lam}</td>
                      <td className="px-6 py-4">
                        {(() => {
                          let count = 0;
                          if (p.documents.led.status === 'Final' || p.documents.led.status === 'Draf') count++;
                          if (p.documents.lkps.status === 'Final' || p.documents.lkps.status === 'Draf') count++;
                          if (p.documents.legalitas.status === 'Final' || p.documents.legalitas.status === 'Draf') count++;
                          const pct = Math.round((count / 3) * 100);
                          
                          return (
                            <div className="flex items-center space-x-2">
                              <div className="w-12 bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    pct >= 100 ? 'bg-emerald-500' :
                                    pct >= 33 ? 'bg-amber-400' :
                                    'bg-slate-400'
                                  }`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="font-bold text-[10px] font-mono">{pct}%</span>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black border ${
                          p.accreditationStatus === 'Unggul' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                          p.accreditationStatus === 'Baik Sekali' ? 'bg-teal-50 text-teal-800 border-teal-200' :
                          'bg-indigo-50 text-indigo-800 border-indigo-200'
                        }`}>
                          {p.accreditationStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-[10px] text-slate-500">{p.skNumber}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold">{p.expiryDate}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex space-x-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEdit(p);
                            }}
                            className="p-1.5 rounded-md text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Edit data master prodi"
                            id={`btn-edit-prodi-${p.id}`}
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(p.id, p.name);
                            }}
                            className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Hapus prodi"
                            id={`btn-delete-prodi-${p.id}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <ShieldAlert className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold">Tidak ada program studi yang cocok dengan pencarian.</p>
              </div>
            )}
          </div>
        </div>
      </>
    )}

    {activeTab === 'accounts' && (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4 animate-fade-in" id="accounts-management-grid">
        {/* Left Column: Form manual account creation (4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
          <div className="flex items-center space-x-2 pb-3 mb-4 border-b border-slate-100">
            <User className="h-4.5 w-4.5 text-indigo-600" />
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">Buat Akun Manual</h3>
          </div>

          {accountSuccessMsg && (
            <div className="mb-4 bg-emerald-50 text-emerald-800 text-xs p-3 rounded-xl border border-emerald-200 flex items-start space-x-2 font-medium">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{accountSuccessMsg}</span>
            </div>
          )}

          {accountErrorMsg && (
            <div className="mb-4 bg-rose-50 text-rose-800 text-xs p-3 rounded-xl border border-rose-200 flex items-start space-x-2 font-medium">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{accountErrorMsg}</span>
            </div>
          )}

          <form onSubmit={handleCreateAccount} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Pilih Program Studi *</label>
              <select
                value={selectedProdiId}
                onChange={(e) => setSelectedProdiId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 cursor-pointer"
                required
              >
                <option value="">-- Pilih Program Studi --</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.level})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Username Akses *</label>
              <input
                type="text"
                required
                placeholder="contoh: mpi_akses"
                value={usernameAkses}
                onChange={(e) => setUsernameAkses(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">Username ini digunakan prodi untuk login.</p>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Password / Token Masuk *</label>
              <input
                type="text"
                required
                placeholder="Masukkan token/password akses"
                value={tokenMasuk}
                onChange={(e) => setTokenMasuk(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-800 font-mono focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Status Keaktifan</label>
              <select
                value={statusPakai}
                onChange={(e) => setStatusPakai(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 cursor-pointer"
              >
                <option value="aktif">Aktif</option>
                <option value="belum">Belum Aktif</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submittingAccount}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              {submittingAccount ? (
                <span>Menyimpan...</span>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Simpan Akun Akses</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Existing Accounts Table (8 cols) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Award className="h-4.5 w-4.5 text-indigo-600" />
              <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">Daftar Akun Akses Prodi</h3>
            </div>
            <button
              onClick={fetchAccounts}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center space-x-1 cursor-pointer"
            >
              <RefreshCw className={`h-3 w-3 ${isLoadingAccounts ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {isLoadingAccounts ? (
            <div className="py-20 text-center text-slate-400 text-xs font-medium">
              Memuat daftar akun akses dari database...
            </div>
          ) : accounts.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-xl">
              <User className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-500">Belum ada akun akses yang dibuat</p>
              <p className="text-[10px] text-slate-400 mt-1">Gunakan formulir di samping untuk mendaftarkan akun akses program studi pertama.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
                    <th className="px-4 py-3.5">Program Studi</th>
                    <th className="px-4 py-3.5">Username</th>
                    <th className="px-4 py-3.5">Token Masuk</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Terakhir Diperbarui</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800 text-xs">
                  {accounts.map((acc) => {
                    const associatedProdi = programs.find((p) => p.id === acc.prodi_id || acc.prodi_id === `00000000-0000-0000-0000-${p.id.replace('prodi-', '').padStart(12, '0')}`);
                    return (
                      <tr key={acc.prodi_id + acc.username_akses} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-900">{associatedProdi?.name || 'Program Studi Terdaftar'}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{associatedProdi?.faculty || 'Fakultas'}</div>
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-slate-700 font-mono text-[11px]">{acc.username_akses}</td>
                        <td className="px-4 py-3.5 font-bold text-indigo-600 font-mono text-[11px]">{acc.token_masuk}</td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            acc.status_pakai === 'aktif' || acc.status === 'aktif'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-150'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {acc.status_pakai === 'aktif' || acc.status === 'aktif' ? 'Aktif' : 'Belum Aktif'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-400 text-[10px]">
                          {new Date(acc.updated_at || acc.created_at || Date.now()).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    )}

      </div>

      {/* ADD/EDIT MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background Overlay */}
            <div 
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-3xs transition-opacity" 
              onClick={() => setIsFormOpen(false)}
            />
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            {/* Modal Box */}
            <form 
              onSubmit={handleSubmit}
              className="relative z-10 inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-slate-200"
            >
              
              {/* Header */}
              <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-2.5">
                  <div className="bg-indigo-600 p-2 rounded-lg text-white">
                    <Building2 className="h-4.5 w-4.5" />
                  </div>
                  <h3 className="text-sm font-extrabold uppercase tracking-wider">
                    {editingProgram ? 'Edit Program Studi' : 'Tambah Program Studi Baru'}
                  </h3>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form Content */}
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                
                {/* Row 1: Nama & Kode */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nama Program Studi *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: S1 Informatika Medis"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Kode Prodi *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 55201"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                {/* Row 2: Jenjang, Rumpun LAM, Fakultas */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Jenjang Pendidikan</label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="D3">D3 (Diploma)</option>
                      <option value="D4">D4 (Sarjana Terapan)</option>
                      <option value="S1">S1 (Sarjana)</option>
                      <option value="S2">S2 (Magister)</option>
                      <option value="S3">S3 (Doktor)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Rumpun LAM *</label>
                    <select
                      value={formData.lam}
                      onChange={(e) => setFormData({ ...formData, lam: e.target.value as LAMCluster })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="LAM INFOKOM">LAM INFOKOM (Komputer)</option>
                      <option value="LAMDIK">LAMDIK (Kependidikan)</option>
                      <option value="LAMEMBA">LAMEMBA (Ekonomi)</option>
                      <option value="LAMSAMA">LAMSAMA (Sains Murni)</option>
                      <option value="LAM-PTKes">LAM-PTKes (Kesehatan)</option>
                      <option value="BAN-PT">BAN-PT (Nasional)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Fakultas Pengampu</label>
                    <input
                      type="text"
                      placeholder="Contoh: Fakultas Teknik"
                      value={formData.faculty}
                      onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Row 3: Status Akreditasi, No SK, Tanggal Kedaluwarsa */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Status Akreditasi</label>
                    <select
                      value={formData.accreditationStatus}
                      onChange={(e) => setFormData({ ...formData, accreditationStatus: e.target.value as AccreditationStatus })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="Unggul">Unggul</option>
                      <option value="Baik Sekali">Baik Sekali</option>
                      <option value="Baik">Baik</option>
                      <option value="Terakreditasi">Terakreditasi</option>
                      <option value="Belum Terakreditasi">Belum Terakreditasi</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">No SK Akreditasi *</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 120/SK/BAN-PT/2026"
                      value={formData.skNumber}
                      onChange={(e) => setFormData({ ...formData, skNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tanggal Kedaluwarsa SK *</label>
                    <input
                      type="date"
                      required
                      value={formData.expiryDate}
                      onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Row 4: Kaprodi & Kontak */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nama Kaprodi</label>
                    <input
                      type="text"
                      placeholder="Nama lengkap Kaprodi"
                      value={formData.kaprodi}
                      onChange={(e) => setFormData({ ...formData, kaprodi: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Nomor Telepon Kaprodi</label>
                    <input
                      type="text"
                      placeholder="Contoh: 0812-xxxx-xxxx"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Email Resmi Prodi</label>
                    <input
                      type="email"
                      placeholder="Contoh: prodi@kampus.ac.id"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Row 5: Deskripsi Singkat */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Deskripsi Profil Prodi</label>
                  <textarea
                    rows={2}
                    placeholder="Tuliskan gambaran umum, keunggulan atau kekhasan program studi..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                  />
                </div>

                {/* Row 6: Visi & Misi */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Visi Keilmuan Prodi</label>
                    <textarea
                      rows={3}
                      placeholder="Visi jangka panjang program studi..."
                      value={formData.vision}
                      onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Misi Prodi (Tulis per baris)</label>
                    <textarea
                      rows={3}
                      placeholder="Satu misi per baris baru..."
                      value={formData.mission}
                      onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 font-sans"
                    />
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-150 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold px-4 py-2 rounded-xl text-xs transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4.5 py-2 rounded-xl text-xs transition-colors shadow-xs"
                >
                  Simpan Data
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* REVIEW BERKAS AKREDITASI MODAL */}
      {isReviewOpen && selectedReviewProdi && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background Overlay */}
            <div 
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-3xs transition-opacity" 
              onClick={() => setIsReviewOpen(false)}
            />
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            {/* Modal Box */}
            <div 
              className="relative z-10 inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full border border-slate-200"
            >
              {/* Header */}
              <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-2.5">
                  <div className="bg-emerald-600 p-2 rounded-lg text-white">
                    <CheckSquare className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold uppercase tracking-wider">
                      Review Dokumen &amp; Berkas Akreditasi
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-wider leading-none">
                      {selectedReviewProdi.name} ({selectedReviewProdi.level})
                    </p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsReviewOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                <div className="border-b border-slate-100 pb-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Informasi Program Studi</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2 text-xs">
                    <div>
                      <span className="text-slate-400 block font-medium">Lembaga Akreditasi:</span>
                      <span className="font-extrabold text-slate-800">{selectedReviewProdi.lam}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Status Akreditasi Saat Ini:</span>
                      <span className="font-extrabold text-slate-800">{selectedReviewProdi.accreditationStatus}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Nomor SK / Masa Berlaku:</span>
                      <span className="font-extrabold text-slate-800">{selectedReviewProdi.skNumber} ({selectedReviewProdi.expiryDate})</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Daftar Berkas Utama (Tabel berkas_akreditasi)</span>
                  
                  {isReviewLoading ? (
                    <div className="py-12 text-center text-slate-400 text-xs font-semibold">
                      <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-3 text-indigo-500" />
                      <span>Sedang memuat berkas real-time dari database...</span>
                    </div>
                  ) : (
                    (['LED', 'LKPS', 'IZIN'] as const).map(jenis => {
                      // Look up the document in fetched reviewDocuments
                      const docRecord = reviewDocuments.find(b => String(b.jenis_dokumen).toUpperCase() === jenis);
                      
                      // Fallback status/date from local program state if database row is not yet created
                      const docLabel = 
                        jenis === 'LED' ? 'Laporan Evaluasi Diri (LED)' : 
                        jenis === 'LKPS' ? 'Laporan Kinerja Program Studi (LKPS)' : 
                        'Surat Legalitas & Izin Operasional';

                      // Find matching local doc state
                      const localDocKey = jenis === 'IZIN' ? 'legalitas' : jenis.toLowerCase() as 'led' | 'lkps';
                      const localDoc = selectedReviewProdi.documents[localDocKey];

                      const statusBerkas = docRecord?.status_berkas || localDoc?.status || 'Belum Ada';
                      const namaFile = docRecord?.nama_file || localDoc?.fileName || 'Belum ada file diunggah';
                      const updatedAt = docRecord?.updated_at 
                        ? new Date(docRecord.updated_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                        : (localDoc?.lastUpdated && localDoc.lastUpdated !== '-' ? localDoc.lastUpdated : 'Belum pernah diperbarui');

                      const markdownContent = docRecord?.konten_markdown || null;

                      return (
                        <div 
                          key={jenis} 
                          className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/30"
                        >
                          {/* Row Summary */}
                          <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white border-b border-slate-100">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-black text-slate-900">{docLabel}</span>
                                <span className="text-[9px] uppercase font-black bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-sm font-mono text-slate-500">{jenis}</span>
                              </div>
                              <p className="text-[11px] text-slate-500 font-mono mt-1 select-all">
                                File: {namaFile}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                Diperbarui: {updatedAt}
                              </p>
                            </div>

                            <div className="flex items-center space-x-2 shrink-0">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                statusBerkas === 'Final' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                                statusBerkas === 'Draf' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                                'bg-slate-50 text-slate-600 border-slate-200'
                              }`}>
                                {statusBerkas}
                              </span>

                              {markdownContent && (
                                <button
                                  type="button"
                                  onClick={() => setExpandedDocId(expandedDocId === jenis ? null : jenis)}
                                  className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-black text-[10px] uppercase tracking-wider rounded-lg transition-colors flex items-center space-x-1 cursor-pointer"
                                >
                                  <span>{expandedDocId === jenis ? 'Tutup Preview' : 'Lihat Isi AI'}</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Markdown Preview Area */}
                          {expandedDocId === jenis && markdownContent && (
                            <div className="p-5 max-h-80 overflow-y-auto bg-slate-50 border-t border-slate-100 text-xs text-slate-800 leading-relaxed">
                              <div className="max-w-none prose prose-slate">
                                <div className="markdown-body">
                                  <Markdown remarkPlugins={[remarkGfm]}>
                                    {markdownContent}
                                  </Markdown>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Close Button */}
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-150 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsReviewOpen(false)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2 rounded-xl text-xs transition-colors shadow-xs cursor-pointer"
                >
                  Selesai Review
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
