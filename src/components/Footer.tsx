/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GraduationCap, Award, ShieldCheck, Heart, Database, RefreshCw, AlertTriangle, CheckCircle2, XCircle, X } from 'lucide-react';
import logoImg from '../assets/logo.png';

interface FooterProps {
  currentView?: 'public' | 'dashboard';
}

export default function Footer({ currentView }: FooterProps) {
  const currentYear = new Date().getFullYear();

  // Diagnostic states
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [diagnosticLogs, setDiagnosticLogs] = useState<string[]>([]);
  const [diagnosticResult, setDiagnosticResult] = useState<{
    status: 'success' | 'warning' | 'error' | null;
    message: string;
    prodiCount?: number;
    prodiSample?: string;
    uploadStatus?: string;
  }>({ status: null, message: '' });

  const runConnectionCheck = async () => {
    setIsTesting(true);
    setShowDiagnostic(true);
    setDiagnosticLogs(["Memulai uji koneksi Supabase & API..."]);
    setDiagnosticResult({ status: null, message: "" });

    try {
      // 1. Check /api/prodi
      setDiagnosticLogs(prev => [...prev, "Menghubungi endpoint /api/prodi..."]);
      const resProdi = await fetch('/api/prodi');
      setDiagnosticLogs(prev => [...prev, `Menerima status HTTP ${resProdi.status} dari /api/prodi`]);
      
      const rawTextProdi = await resProdi.text();
      setDiagnosticLogs(prev => [...prev, `Respons mentah /api/prodi diterima (${rawTextProdi.length} karakter)`]);

      // Detect HTML error page
      if (rawTextProdi.trim().startsWith('<!DOCTYPE html') || rawTextProdi.trim().startsWith('<html')) {
        setDiagnosticLogs(prev => [
          ...prev, 
          "⚠️ DETEKSI ERROR: Server mengembalikan halaman HTML, bukan JSON!",
          `Pratinjau respons: "${rawTextProdi.slice(0, 150)}..."`
        ]);
        throw new Error("Endpoint /api/prodi mengembalikan halaman HTML. Ini biasanya terjadi jika rute tidak ditemukan (404) atau terjadi error server (500).");
      }

      let prodiData;
      try {
        prodiData = JSON.parse(rawTextProdi);
        setDiagnosticLogs(prev => [...prev, "✅ Berhasil mengurai respons /api/prodi sebagai JSON."]);
      } catch (jsonErr: any) {
        setDiagnosticLogs(prev => [
          ...prev, 
          `❌ GAGAL PARSE JSON: ${jsonErr.message}`,
          `Konten ilegal: "${rawTextProdi.slice(0, 100)}..."`
        ]);
        throw new Error(`Gagal mengurai respons /api/prodi sebagai JSON: ${jsonErr.message}`);
      }

      const count = Array.isArray(prodiData) ? prodiData.length : 0;
      setDiagnosticLogs(prev => [...prev, `Ditemukan ${count} record program studi di database.`]);

      // 2. Check /api/upload
      setDiagnosticLogs(prev => [...prev, "Menghubungi endpoint /api/upload..."]);
      const resUpload = await fetch('/api/upload');
      setDiagnosticLogs(prev => [...prev, `Menerima status HTTP ${resUpload.status} dari /api/upload`]);
      
      const rawTextUpload = await resUpload.text();
      setDiagnosticLogs(prev => [...prev, `Respons mentah /api/upload diterima (${rawTextUpload.length} karakter)`]);

      if (rawTextUpload.trim().startsWith('<!DOCTYPE html') || rawTextUpload.trim().startsWith('<html')) {
        setDiagnosticLogs(prev => [
          ...prev, 
          "⚠️ DETEKSI ERROR: Endpoint upload mengembalikan halaman HTML, bukan JSON!",
          `Pratinjau respons: "${rawTextUpload.slice(0, 150)}..."`
        ]);
        throw new Error("Endpoint /api/upload mengembalikan halaman HTML. Silakan periksa rute alias server.");
      }

      let uploadData;
      try {
        uploadData = JSON.parse(rawTextUpload);
        setDiagnosticLogs(prev => [...prev, "✅ Berhasil mengurai respons /api/upload sebagai JSON."]);
      } catch (jsonErr: any) {
        setDiagnosticLogs(prev => [
          ...prev, 
          `❌ GAGAL PARSE JSON UPLOAD: ${jsonErr.message}`,
          `Konten ilegal: "${rawTextUpload.slice(0, 100)}..."`
        ]);
        throw new Error(`Gagal mengurai respons /api/upload sebagai JSON: ${jsonErr.message}`);
      }

      setDiagnosticLogs(prev => [...prev, "🎉 Semua pengujian berhasil! Koneksi berjalan normal."]);
      setDiagnosticResult({
        status: 'success',
        message: "Koneksi ke Supabase dan server API berhasil dibangun secara sempurna!",
        prodiCount: count,
        prodiSample: count > 0 ? JSON.stringify(prodiData[0], null, 2) : "Tidak ada data prodi",
        uploadStatus: uploadData.message || "Endpoint upload aktif"
      });

    } catch (err: any) {
      setDiagnosticLogs(prev => [...prev, `❌ ERROR UTAMA: ${err.message}`]);
      setDiagnosticResult({
        status: 'error',
        message: err.message || "Terjadi kesalahan yang tidak diketahui saat menguji koneksi."
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2.5 text-white mb-3">
              <img 
                src={logoImg} 
                alt="Universitas Islam Bogor Logo" 
                className="h-11 w-auto object-contain brightness-100"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm mt-3">
              Sistem Penjaminan Mutu Internal dan Publikasi Real-Time Akreditasi Program Studi demi keunggulan mutu berkelanjutan.
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-semibold text-sm mb-3 tracking-wide uppercase">Rumpun Lembaga Akreditasi</h3>
            <ul className="text-sm space-y-2">
              <li><span className="hover:text-white transition-colors">LAM INFOKOM (Komputer & Informatika)</span></li>
              <li><span className="hover:text-white transition-colors">LAMDIK (Kependidikan & Keguruan)</span></li>
              <li><span className="hover:text-white transition-colors">LAMEMBA (Ekonomi, Manajemen & Bisnis)</span></li>
              <li><span className="hover:text-white transition-colors">LAMSAMA (Sains Alam & Ilmu Formal)</span></li>
              <li><span className="hover:text-white transition-colors">LAM-PTKes (Pendidikan Tinggi Kesehatan)</span></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-sm mb-3 tracking-wide uppercase">Kontak Lembaga Mutu</h3>
            <p className="text-sm leading-relaxed mb-1">
              Direktorat Penjaminan Mutu & Akreditasi
            </p>
            <p className="text-xs text-slate-500 mb-3">
              Gedung Rektorat Utama, Lantai 2, Kampus Terpadu
            </p>
            <p className="text-sm text-slate-300">
              Email: <span className="text-indigo-400">lpm@uib.ac.id</span>
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs">
          <div className="flex items-center space-x-4 flex-wrap gap-y-2">
            <p>© {currentYear} Universitas Islam Bogor. Hak Cipta Dilindungi.</p>
            {currentView === 'dashboard' && (
              <button
                onClick={runConnectionCheck}
                className="bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/30 hover:border-indigo-500 px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all text-[11px] font-bold cursor-pointer"
                id="check-connection-btn"
              >
                <Database className="h-3.5 w-3.5 animate-pulse" />
                <span>Cek Koneksi Supabase</span>
              </button>
            )}
          </div>
          <p className="flex items-center mt-2 sm:mt-0">
            Dibuat dengan <Heart className="h-3.5 w-3.5 text-rose-500 mx-1 fill-rose-500" /> untuk Indonesia Maju
          </p>
        </div>
      </div>

      {/* DIAGNOSTIC MODAL */}
      {showDiagnostic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150" id="diagnostic-modal-backdrop">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
              <div className="flex items-center space-x-2.5">
                <Database className="h-5 w-5 text-indigo-400" />
                <div>
                  <h3 className="font-bold text-sm tracking-tight text-white">IT Diagnostik Koneksi Supabase</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Uji kesehatan parser, API endpoints, dan relasi database</p>
                </div>
              </div>
              <button 
                onClick={() => setShowDiagnostic(false)}
                className="text-slate-500 hover:text-white hover:bg-slate-800 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content (Scrollable) */}
            <div className="p-6 overflow-y-auto space-y-5 flex-grow font-sans text-xs">
              {/* Uji Status Result Card */}
              {diagnosticResult.status && (
                <div className={`p-4 rounded-xl border flex items-start space-x-3.5 ${
                  diagnosticResult.status === 'success' ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300' :
                  'bg-rose-500/10 border-rose-500/25 text-rose-300'
                }`}>
                  <div className="shrink-0 mt-0.5">
                    {diagnosticResult.status === 'success' ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <XCircle className="h-5 w-5 text-rose-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">
                      {diagnosticResult.status === 'success' ? 'Sistem Terhubung Normal' : 'Gangguan Koneksi / Parsing Error'}
                    </h4>
                    <p className="mt-1 leading-relaxed text-[11px] opacity-90">
                      {diagnosticResult.message}
                    </p>
                    
                    {diagnosticResult.status === 'success' && (
                      <div className="mt-3.5 space-y-1.5 text-[10px] text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-800 font-mono">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Record Terdaftar:</span>
                          <span className="text-emerald-400 font-bold">{diagnosticResult.prodiCount} Program Studi</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Endpoint Upload:</span>
                          <span className="text-indigo-400 font-bold">{diagnosticResult.uploadStatus}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Progress & Live Console Output */}
              <div className="space-y-2">
                <span className="font-extrabold uppercase tracking-wider text-[10px] text-slate-500 flex items-center justify-between">
                  <span>Alur Diagnostik &amp; Konsol Log</span>
                  {isTesting && (
                    <span className="flex items-center space-x-1 text-indigo-400 font-bold normal-case animate-pulse">
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      <span>Sedang Menguji...</span>
                    </span>
                  )}
                </span>
                
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[10px] leading-relaxed text-slate-400 overflow-x-auto max-h-[180px] space-y-1">
                  {diagnosticLogs.map((log, idx) => (
                    <div key={idx} className={
                      log.includes('❌') || log.includes('Error') ? 'text-rose-400' :
                      log.includes('⚠️') ? 'text-amber-400' :
                      log.includes('✅') || log.includes('🎉') ? 'text-emerald-400' :
                      log.includes('===') ? 'text-indigo-400 font-bold' :
                      'text-slate-300'
                    }>
                      {log}
                    </div>
                  ))}
                </div>
              </div>

              {/* Samples block if success */}
              {diagnosticResult.status === 'success' && diagnosticResult.prodiSample && (
                <div className="space-y-2">
                  <span className="font-extrabold uppercase tracking-wider text-[10px] text-slate-500">Pratinjau Respon JSON Valid (/api/prodi)</span>
                  <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[9px] text-slate-300 overflow-x-auto max-h-[140px]">
                    {diagnosticResult.prodiSample}
                  </pre>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-slate-800 bg-slate-950/30 flex justify-end space-x-3">
              <button
                onClick={runConnectionCheck}
                disabled={isTesting}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>Uji Ulang</span>
              </button>
              <button
                onClick={() => setShowDiagnostic(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
