/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, Award, BookOpen, Clock, CheckCircle2, 
  ChevronRight, Phone, Mail, User, ShieldAlert, X,
  FileText, ArrowUpRight, CheckSquare, Sparkles, Building2
} from 'lucide-react';
import { StudyProgram, LAMCluster, AccreditationStatus } from '../types';
import { LAM_CHARACTERISTICS } from '../data';

interface HomepagePublicProps {
  programs: StudyProgram[];
  onLoginClick: () => void;
}

export default function HomepagePublic({ programs, onLoginClick }: HomepagePublicProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLam, setSelectedLam] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedFaculty, setSelectedFaculty] = useState<string>('ALL');
  
  // Selected Program for Detail Modal
  const [selectedProgram, setSelectedProgram] = useState<StudyProgram | null>(null);

  // Statistics calculation
  const stats = useMemo(() => {
    let unggul = 0;
    let baikSekali = 0;
    let baik = 0;
    let total = programs.length;

    programs.forEach(p => {
      if (p.accreditationStatus === 'Unggul') unggul++;
      else if (p.accreditationStatus === 'Baik Sekali') baikSekali++;
      else if (p.accreditationStatus === 'Baik') baik++;
    });

    return { unggul, baikSekali, baik, total };
  }, [programs]);

  // Filtered Programs
  const filteredPrograms = useMemo(() => {
    return programs.filter(p => {
      const matchesSearch = 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.includes(searchTerm) ||
        p.faculty.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.profile.kaprodi.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesLam = selectedLam === 'ALL' || p.lam === selectedLam;
      const matchesStatus = selectedStatus === 'ALL' || p.accreditationStatus === selectedStatus;
      const matchesFaculty = selectedFaculty === 'ALL' || p.faculty === selectedFaculty;

      return matchesSearch && matchesLam && matchesStatus && matchesFaculty;
    });
  }, [programs, searchTerm, selectedLam, selectedStatus, selectedFaculty]);

  // LAM Badge styling
  const getLamBadgeStyle = (lam: LAMCluster) => {
    switch (lam) {
      case 'LAM INFOKOM': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'LAMDIK': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'LAMEMBA': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'LAMSAMA': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'LAM-PTKes': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // Accreditation Status badge styling
  const getAccreditationBadgeStyle = (status: AccreditationStatus) => {
    switch (status) {
      case 'Unggul':
        return 'bg-amber-100 text-amber-800 border-amber-200 shadow-xs';
      case 'Baik Sekali':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'Baik':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Terakreditasi':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      default:
        return 'bg-red-50 text-red-700 border-red-200';
    }
  };

  // Helper to format Date
  const formatDateIndo = (dateStr: string) => {
    if (!dateStr || dateStr === '-') return '-';
    try {
      const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateStr).toLocaleDateString('id-ID', options);
    } catch {
      return dateStr;
    }
  };

  // Helper to check if expired or nearing expiry
  const getExpiryLabel = (dateStr: string) => {
    if (!dateStr || dateStr === '-') return { text: 'Tidak ada data', color: 'text-slate-500' };
    
    const expiry = new Date(dateStr);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: 'Kedaluwarsa', color: 'text-rose-600 font-bold' };
    } else if (diffDays <= 180) {
      return { text: `Segera Habis (< 6 bulan)`, color: 'text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-sm border border-amber-200' };
    } else if (diffDays <= 365) {
      return { text: `Nearing Expiry (< 1 tahun)`, color: 'text-yellow-600 font-semibold' };
    }
    return { text: formatDateIndo(dateStr), color: 'text-slate-600' };
  };

  return (
    <div className="bg-slate-50/50 min-h-screen">
      {/* Hero Section */}
      <div className="bg-white border-b border-slate-100 py-16 px-4 relative overflow-hidden">
        {/* Background subtle minimal grid line or soft glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-50/40 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-100 px-3.5 py-1.5 rounded-full text-indigo-700 text-xs font-semibold mb-6 tracking-wide uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Pusat Data Akreditasi & Penjaminan Mutu</span>
          </div>
          
          <h1 className="font-sans font-extrabold text-3xl md:text-5xl tracking-tight text-slate-900 mb-4 max-w-4xl mx-auto leading-tight">
            Transparansi Mutu &amp; Akses Publik <br />
            <span className="text-indigo-600">Akreditasi Program Studi Universitas Islam Bogor</span>
          </h1>
          
          <p className="text-slate-500 text-sm md:text-base max-w-2xl mx-auto leading-relaxed mb-8">
            Pantau dan verifikasi status akreditasi, progres dokumen mutu, serta instrumen penilaian terkini dari seluruh program studi secara real-time.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <a 
              href="#tabel-akreditasi" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5.5 py-2.5 rounded-xl transition-all duration-200 text-sm shadow-xs"
            >
              Cari Akreditasi Prodi
            </a>
            <button 
              onClick={onLoginClick}
              className="bg-slate-900 hover:bg-slate-850 text-white font-semibold px-5.5 py-2.5 rounded-xl transition-all duration-200 text-sm"
            >
              Sistem Internal LPM
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Space */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 pb-16 relative z-20">
        
        {/* Statistics Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          
          {/* Total */}
          <div className="bg-indigo-600 p-5 rounded-2xl text-white shadow-sm flex flex-col justify-between min-h-[120px]">
            <p className="text-xs font-medium opacity-80 uppercase tracking-wider">Total Prodi</p>
            <h3 className="text-3xl font-extrabold mt-2">{stats.total}</h3>
          </div>

          {/* Unggul */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between min-h-[120px]">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Prodi Unggul</p>
            <h3 className="text-3xl font-extrabold text-emerald-600 mt-2">{stats.unggul}</h3>
          </div>

          {/* Baik Sekali */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between min-h-[120px]">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Baik Sekali</p>
            <h3 className="text-3xl font-extrabold text-blue-600 mt-2">{stats.baikSekali}</h3>
          </div>

          {/* Baik */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between min-h-[120px]">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Prodi Baik</p>
            <h3 className="text-3xl font-extrabold text-orange-500 mt-2">{stats.baik}</h3>
          </div>

        </div>

        {/* Filters and Table Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden" id="tabel-akreditasi">
          <div className="p-6 border-b border-slate-200 bg-slate-50/50">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Daftar Akreditasi Program Studi</h2>
                <p className="text-xs text-slate-500">Informasi terverifikasi sesuai SK Badan Akreditasi Nasional &amp; Lembaga Akreditasi Mandiri.</p>
              </div>
              <div className="text-xs text-slate-500 bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-mono shadow-xs">
                Menampilkan <span className="font-bold text-indigo-600">{filteredPrograms.length}</span> dari {programs.length} prodi
              </div>
            </div>

            {/* Quick Faculty Filters */}
            <div className="mt-4 pt-3.5 border-t border-slate-100">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Filter Berdasarkan Fakultas</label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedFaculty('ALL')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    selectedFaculty === 'ALL'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  🌐 Semua Fakultas
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFaculty('Fakultas Ilmu Tarbiyah dan Keguruan')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    selectedFaculty === 'Fakultas Ilmu Tarbiyah dan Keguruan'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  🎓 Tarbiyah &amp; Keguruan
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFaculty('Fakultas Ekonomi & Bisnis')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    selectedFaculty === 'Fakultas Ekonomi & Bisnis'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  📈 Ekonomi &amp; Bisnis
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFaculty('Fakultas Dakwah dan Komunikasi Islam')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    selectedFaculty === 'Fakultas Dakwah dan Komunikasi Islam'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  📣 Dakwah &amp; Komunikasi
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFaculty('Fakultas Umum')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    selectedFaculty === 'Fakultas Umum'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  🏛️ Fakultas Umum
                </button>
              </div>
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-5">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari prodi, fakultas, atau kaprodi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 placeholder-slate-400 transition-all"
                />
              </div>

              {/* Filter LAM */}
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Filter className="h-4 w-4" />
                </div>
                <select
                  value={selectedLam}
                  onChange={(e) => setSelectedLam(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 transition-all appearance-none cursor-pointer"
                >
                  <option value="ALL">Semua Rumpun LAM</option>
                  <option value="LAM INFOKOM">LAM INFOKOM (Komputer)</option>
                  <option value="LAMDIK">LAMDIK (Pendidikan)</option>
                  <option value="LAMEMBA">LAMEMBA (Ekonomi)</option>
                  <option value="LAMSAMA">LAMSAMA (Sains Alam)</option>
                  <option value="LAM-PTKes">LAM-PTKes (Kesehatan)</option>
                  <option value="BAN-PT">BAN-PT (Nasional)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>

              {/* Filter Status */}
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Award className="h-4 w-4" />
                </div>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 transition-all appearance-none cursor-pointer"
                >
                  <option value="ALL">Semua Status Akreditasi</option>
                  <option value="Unggul">Unggul</option>
                  <option value="Baik Sekali">Baik Sekali</option>
                  <option value="Baik">Baik</option>
                  <option value="Terakreditasi">Terakreditasi</option>
                  <option value="Belum Terakreditasi">Belum Terakreditasi</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            {filteredPrograms.length > 0 ? (
              <table className="w-full text-left border-collapse" id="table-prodi-public">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">Kode</th>
                    <th className="px-6 py-4 font-semibold">Nama Program Studi</th>
                    <th className="px-6 py-4 font-semibold">Fakultas</th>
                    <th className="px-6 py-4 font-semibold">Lembaga Akreditasi</th>
                    <th className="px-6 py-4 text-center font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Masa Berlaku</th>
                    <th className="px-6 py-4 text-right font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPrograms.map((p) => {
                    const expiry = getExpiryLabel(p.expiryDate);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition-colors text-slate-800 text-sm">
                        <td className="px-6 py-4.5 font-mono text-xs text-slate-500 font-semibold">{p.code}</td>
                        <td className="px-6 py-4.5">
                          <div className="font-semibold text-slate-900">{p.name}</div>
                          <div className="text-xs text-slate-400 mt-0.5 font-medium">{p.level} • Kaprodi: {p.profile.kaprodi}</div>
                        </td>
                        <td className="px-6 py-4.5 text-slate-600 font-medium">{p.faculty}</td>
                        <td className="px-6 py-4.5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${getLamBadgeStyle(p.lam)}`}>
                            {p.lam}
                          </span>
                        </td>
                        <td className="px-6 py-4.5 text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getAccreditationBadgeStyle(p.accreditationStatus)}`}>
                            {p.accreditationStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4.5">
                          <div className="flex items-center space-x-1.5">
                             <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className={`text-xs ${expiry.color}`}>{expiry.text}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4.5 text-right">
                          <button
                            onClick={() => setSelectedProgram(p)}
                            className="inline-flex items-center space-x-1.5 text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all"
                            id={`btn-detail-${p.id}`}
                          >
                            <span>Detail</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="py-16 text-center text-slate-500">
                <div className="max-w-xs mx-auto">
                  <ShieldAlert className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="font-bold text-slate-700">Data tidak ditemukan</p>
                  <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau bersihkan filter.</p>
                  <button 
                    onClick={() => { setSearchTerm(''); setSelectedLam('ALL'); setSelectedStatus('ALL'); setSelectedFaculty('ALL'); }}
                    className="mt-4 inline-flex items-center text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition-colors"
                  >
                    Reset Semua Pencarian
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Program Detail Modal */}
      {selectedProgram && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          {/* Overlay */}
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" 
              onClick={() => setSelectedProgram(null)}
              id="modal-overlay"
            />
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            {/* Modal Body */}
            <div className="relative z-10 inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full border border-slate-150 animate-in fade-in zoom-in-95 duration-200">
              
              {/* Header */}
              <div className="bg-slate-900 text-white px-6 py-5 flex justify-between items-start">
                <div className="flex items-start space-x-3.5">
                  <div className="bg-indigo-600 p-2.5 rounded-xl text-white mt-1">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                      <span className="text-xs font-mono tracking-wider font-semibold bg-white/15 px-2 py-0.5 rounded-md text-indigo-200">
                        KODE: {selectedProgram.code}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${getLamBadgeStyle(selectedProgram.lam)}`}>
                        {selectedProgram.lam}
                      </span>
                    </div>
                    <h3 className="text-lg md:text-xl font-extrabold text-white mt-1 tracking-tight">
                      {selectedProgram.name} ({selectedProgram.level})
                    </h3>
                    <p className="text-xs text-slate-300 font-medium mt-0.5">{selectedProgram.faculty}</p>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedProgram(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                  id="btn-close-modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body Content */}
              <div className="p-6 md:p-8 space-y-8">
                
                {/* Visual Header Summary Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5">
                  {/* Status Box */}
                  <div className="bg-amber-50/50 border border-amber-200 p-4.5 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-800">Status Akreditasi</span>
                    <div className="mt-1.5 flex items-baseline space-x-2">
                      <span className="text-xl font-extrabold text-amber-900">{selectedProgram.accreditationStatus}</span>
                    </div>
                    <span className="text-xs text-slate-500 font-mono mt-1 leading-normal">SK: {selectedProgram.skNumber}</span>
                  </div>

                  {/* Expiry Box */}
                  <div className="bg-indigo-50/40 border border-indigo-150 p-4.5 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-800">Masa Berlaku</span>
                    <div className="mt-1.5 flex items-center space-x-1.5">
                      <Clock className="h-5 w-5 text-indigo-600" />
                      <span className="text-sm font-bold text-indigo-900">{formatDateIndo(selectedProgram.expiryDate)}</span>
                    </div>
                    <span className="text-xs text-slate-500 font-medium mt-1 leading-normal">
                      {getExpiryLabel(selectedProgram.expiryDate).text}
                    </span>
                  </div>

                  {/* Kaprodi Box */}
                  <div className="bg-slate-50 border border-slate-200 p-4.5 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-700">Kepala Program Studi</span>
                    <div className="mt-1.5 flex items-center space-x-2">
                      <User className="h-5 w-5 text-slate-500 shrink-0" />
                      <span className="text-sm font-bold text-slate-800 leading-tight line-clamp-1">{selectedProgram.profile.kaprodi}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex flex-col">
                      <span>Telp: {selectedProgram.profile.phone}</span>
                      <span>Email: {selectedProgram.profile.email}</span>
                    </div>
                  </div>
                </div>

                {/* Profile Description */}
                <div className="space-y-3.5">
                  <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center space-x-2">
                    <span className="w-1.5 h-3.5 bg-indigo-600 rounded-xs inline-block" />
                    <span>Profil Singkat Program Studi</span>
                  </h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {selectedProgram.profile.description}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 pt-1">
                    <div className="bg-slate-50/50 p-4.5 rounded-xl border border-slate-150">
                      <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">Visi Keilmuan</h5>
                      <p className="text-xs text-slate-600 leading-relaxed italic">
                        "{selectedProgram.profile.vision}"
                      </p>
                    </div>
                    <div className="bg-slate-50/50 p-4.5 rounded-xl border border-slate-150">
                      <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">Misi Program Studi</h5>
                      <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                        {selectedProgram.profile.mission.map((m, idx) => (
                          <li key={idx} className="leading-relaxed">{m}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Document Readiness Checklist */}
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center space-x-2 mb-4">
                    <span className="w-1.5 h-3.5 bg-indigo-600 rounded-xs inline-block" />
                    <span>Kelengkapan Berkas Akreditasi Utama</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* LED */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-slate-100 p-2.5 rounded-lg text-slate-600">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">LED</p>
                          <p className="text-[10px] text-slate-400">Laporan Evaluasi Diri</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                        selectedProgram.documents.led.status === 'Final' ? 'bg-emerald-100 text-emerald-800' :
                        selectedProgram.documents.led.status === 'Draf' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {selectedProgram.documents.led.status}
                      </span>
                    </div>

                    {/* LKPS */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-slate-100 p-2.5 rounded-lg text-slate-600">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">LKPS</p>
                          <p className="text-[10px] text-slate-400">Laporan Kinerja Prodi</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                        selectedProgram.documents.lkps.status === 'Final' ? 'bg-emerald-100 text-emerald-800' :
                        selectedProgram.documents.lkps.status === 'Draf' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {selectedProgram.documents.lkps.status}
                      </span>
                    </div>

                    {/* Legalitas */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-slate-100 p-2.5 rounded-lg text-slate-600">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">Legalitas</p>
                          <p className="text-[10px] text-slate-400">Izin &amp; Pengantar SPMI</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                        selectedProgram.documents.legalitas.status === 'Final' ? 'bg-emerald-100 text-emerald-800' :
                        selectedProgram.documents.legalitas.status === 'Draf' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {selectedProgram.documents.legalitas.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ADAPTIVE INSTRUMENT CRITERIA (This dynamically adapts to selected program's LAM cluster) */}
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 p-4.5 rounded-2xl">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-600" />
                      <span>Karakteristik &amp; Fokus Penilaian {selectedProgram.lam}</span>
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {LAM_CHARACTERISTICS[selectedProgram.lam]?.focus}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center space-x-2 mb-4">
                      <span className="w-1.5 h-3.5 bg-emerald-600 rounded-xs inline-block" />
                      <span>Progres 8 Kriteria Mutu Internasional ({selectedProgram.lam})</span>
                    </h4>

                    {/* Progress grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(selectedProgram.criteriaProgress).map(([key, value]) => {
                        // Retrieve name from LAM Characteristics based on key (k1 - k8)
                        const critName = LAM_CHARACTERISTICS[selectedProgram.lam]?.criteriaNames[key as 'k1' | 'k2' | 'k3' | 'k4' | 'k5' | 'k6' | 'k7' | 'k8'] || `Kriteria ${key.substring(1)}`;
                        
                        return (
                          <div 
                            key={key} 
                            className="bg-white p-3.5 rounded-xl border border-slate-150 flex items-center justify-between shadow-3xs"
                          >
                            <div className="flex items-start space-x-3 pr-2">
                              <span className="text-xs font-mono font-bold text-slate-400 uppercase mt-0.5 shrink-0">
                                {key.toUpperCase()}
                              </span>
                              <p className="text-xs font-semibold text-slate-700 leading-tight">
                                {critName}
                              </p>
                            </div>
                            
                            {/* Value badge */}
                            <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full shrink-0 ${
                              value === 'Siap' ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20' :
                              value === 'Proses' ? 'bg-amber-500/10 text-amber-700 border border-amber-500/20' :
                              'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}>
                              {value}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-150 flex justify-end">
                <button
                  onClick={() => setSelectedProgram(null)}
                  className="bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-semibold px-4.5 py-2 rounded-xl text-xs transition-colors"
                  id="btn-close-modal-bottom"
                >
                  Tutup
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
