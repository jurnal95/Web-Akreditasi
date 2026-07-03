/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Filter, Calendar, TrendingUp, CheckCircle2, AlertCircle, 
  Award, Info, Layers, SortAsc, FileText, Activity, Check, 
  Clock, BarChart3, PieChart, Sparkles, ChevronRight, X
} from 'lucide-react';
import { StudyProgram, LAMCluster, AccreditationStatus, DocStatus } from '../types';

interface InteractiveAccreditationChartProps {
  programs: StudyProgram[];
}

// Completion percentage helper matching the main table logic
export function calculateCompletionPercentage(p: StudyProgram): number {
  let docScore = 0;
  if (p.documents.led.status === 'Final') docScore += 10;
  else if (p.documents.led.status === 'Draf') docScore += 5;
  
  if (p.documents.lkps.status === 'Final') docScore += 10;
  else if (p.documents.lkps.status === 'Draf') docScore += 5;
  
  if (p.documents.legalitas.status === 'Final') docScore += 10;
  else if (p.documents.legalitas.status === 'Draf') docScore += 5;

  let critScore = 0;
  const criteriaKeys = ['k1', 'k2', 'k3', 'k4', 'k5', 'k6', 'k7', 'k8'] as const;
  criteriaKeys.forEach(key => {
    const status = p.criteriaProgress[key];
    if (status === 'Siap') critScore += 10;
    else if (status === 'Proses') critScore += 5;
  });

  const docPercent = (docScore / 30) * 45;
  const critPercent = (critScore / 80) * 55;
  return Math.round(docPercent + critPercent);
}

export default function InteractiveAccreditationChart({ programs }: InteractiveAccreditationChartProps) {
  // Tabs: 'individual' (Progress per Prodi) or 'aggregate' (Total & Aggregate Analytics)
  const [activeTab, setActiveTab] = useState<'individual' | 'aggregate'>('individual');
  
  // Filters
  const [selectedLam, setSelectedLam] = useState<LAMCluster | 'ALL'>('ALL');
  const [expiryPreset, setExpiryPreset] = useState<'ALL' | '1YEAR' | '3YEARS' | 'CUSTOM'>('ALL');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'highest' | 'lowest' | 'alphabetical' | 'expiry'>('highest');

  // Detail view for clicking on a prodi bar
  const [selectedProdiId, setSelectedProdiId] = useState<string | null>(null);

  // Hovered item for custom tooltip on bars
  const [hoveredProdiId, setHoveredProdiId] = useState<string | null>(null);

  // Available LAM categories present in data for filter pills
  const availableLams = useMemo(() => {
    const lams = new Set<LAMCluster>();
    programs.forEach(p => {
      if (p.lam) lams.add(p.lam);
    });
    return Array.from(lams);
  }, [programs]);

  // Apply filters
  const filteredPrograms = useMemo(() => {
    return programs.filter(p => {
      // 1. LAM Filter
      if (selectedLam !== 'ALL' && p.lam !== selectedLam) return false;

      // 2. Expiration Date Filter
      if (!p.expiryDate || p.expiryDate === '-') return expiryPreset === 'ALL';
      const expiry = new Date(p.expiryDate);
      const now = new Date();

      if (expiryPreset === '1YEAR') {
        const diffTime = expiry.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 365;
      }

      if (expiryPreset === '3YEARS') {
        const diffTime = expiry.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 1095;
      }

      if (expiryPreset === 'CUSTOM') {
        if (customStartDate) {
          const start = new Date(customStartDate);
          if (expiry < start) return false;
        }
        if (customEndDate) {
          const end = new Date(customEndDate);
          if (expiry > end) return false;
        }
      }

      return true;
    }).map(p => ({
      ...p,
      completionPct: calculateCompletionPercentage(p)
    }));
  }, [programs, selectedLam, expiryPreset, customStartDate, customEndDate]);

  // Sort filtered programs
  const sortedPrograms = useMemo(() => {
    const list = [...filteredPrograms];
    if (sortBy === 'highest') {
      return list.sort((a, b) => b.completionPct - a.completionPct);
    }
    if (sortBy === 'lowest') {
      return list.sort((a, b) => a.completionPct - b.completionPct);
    }
    if (sortBy === 'alphabetical') {
      return list.sort((a, b) => a.name.localeCompare(b.name));
    }
    if (sortBy === 'expiry') {
      return list.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
    }
    return list;
  }, [filteredPrograms, sortBy]);

  // Total statistics for filtered items
  const stats = useMemo(() => {
    const count = filteredPrograms.length || 1;
    let totalPct = 0;
    let finalLed = 0;
    let finalLkps = 0;
    let finalLegalitas = 0;

    let drafLed = 0;
    let drafLkps = 0;
    let drafLegalitas = 0;

    // Criteria states (K1 - K8)
    const criteriaCounts = {
      k1: { Siap: 0, Proses: 0, BelumMulai: 0 },
      k2: { Siap: 0, Proses: 0, BelumMulai: 0 },
      k3: { Siap: 0, Proses: 0, BelumMulai: 0 },
      k4: { Siap: 0, Proses: 0, BelumMulai: 0 },
      k5: { Siap: 0, Proses: 0, BelumMulai: 0 },
      k6: { Siap: 0, Proses: 0, BelumMulai: 0 },
      k7: { Siap: 0, Proses: 0, BelumMulai: 0 },
      k8: { Siap: 0, Proses: 0, BelumMulai: 0 },
    };

    // Accreditation cluster
    const accStatusCounts = {
      Unggul: 0,
      'Baik Sekali': 0,
      Baik: 0,
      Terakreditasi: 0,
      'Belum Terakreditasi': 0
    };

    filteredPrograms.forEach(p => {
      totalPct += p.completionPct;
      
      if (p.documents.led.status === 'Final') finalLed++;
      else if (p.documents.led.status === 'Draf') drafLed++;

      if (p.documents.lkps.status === 'Final') finalLkps++;
      else if (p.documents.lkps.status === 'Draf') drafLkps++;

      if (p.documents.legalitas.status === 'Final') finalLegalitas++;
      else if (p.documents.legalitas.status === 'Draf') drafLegalitas++;

      // Criteria counts
      const keys = ['k1', 'k2', 'k3', 'k4', 'k5', 'k6', 'k7', 'k8'] as const;
      keys.forEach(k => {
        const val = p.criteriaProgress[k];
        if (val === 'Siap') criteriaCounts[k].Siap++;
        else if (val === 'Proses') criteriaCounts[k].Proses++;
        else criteriaCounts[k].BelumMulai++;
      });

      // Acc counts
      if (p.accreditationStatus in accStatusCounts) {
        accStatusCounts[p.accreditationStatus as keyof typeof accStatusCounts]++;
      }
    });

    const averageProgress = filteredPrograms.length > 0 ? Math.round(totalPct / filteredPrograms.length) : 0;

    return {
      averageProgress,
      totalCount: filteredPrograms.length,
      finalLed,
      finalLkps,
      finalLegalitas,
      drafLed,
      drafLkps,
      drafLegalitas,
      criteriaCounts,
      accStatusCounts,
      averageDocsPct: Math.round(((finalLed + finalLkps + finalLegalitas) / (count * 3)) * 100)
    };
  }, [filteredPrograms]);

  // Selected program details
  const selectedProdiDetails = useMemo(() => {
    if (!selectedProdiId) return null;
    return programs.find(p => p.id === selectedProdiId);
  }, [programs, selectedProdiId]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-10" id="interactive-analytics-panel">
      
      {/* Visual Header Banner */}
      <div className="bg-linear-to-r from-indigo-900 to-slate-900 p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 mb-1">
            <Sparkles className="h-4 w-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Interactive Analytics Center</span>
          </div>
          <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-400" />
            Monitoring Progres Akreditasi Interaktif
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">Filter data master akreditasi per Rumpun LAM, pantau persentase dokumen, serta telusuri detail per prodi.</p>
        </div>

        {/* Tab switcher */}
        <div className="bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 inline-flex self-start md:self-auto">
          <button
            onClick={() => setActiveTab('individual')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'individual'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Progres Per Prodi</span>
          </button>
          <button
            onClick={() => setActiveTab('aggregate')}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'aggregate'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PieChart className="h-3.5 w-3.5" />
            <span>Analisis Agregat</span>
          </button>
        </div>
      </div>

      {/* FILTER CONTROL HUB */}
      <div className="p-6 bg-slate-50 border-b border-slate-200">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
          
          {/* LAM Filter Group */}
          <div className="lg:col-span-5 space-y-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center space-x-1">
              <Layers className="h-3.5 w-3.5 text-indigo-500" />
              <span>Filter Rumpun LAM (Lembaga Akreditasi Mandiri)</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedLam('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                  selectedLam === 'ALL'
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100'
                }`}
              >
                Semua LAM
              </button>
              {['LAM INFOKOM', 'LAMDIK', 'LAMEMBA', 'LAMSAMA', 'LAM-PTKes', 'BAN-PT'].map(lam => (
                <button
                  key={lam}
                  onClick={() => setSelectedLam(lam as LAMCluster)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                    selectedLam === lam
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {lam}
                </button>
              ))}
            </div>
          </div>

          {/* Time Range Filter Group */}
          <div className="lg:col-span-4 space-y-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center space-x-1">
              <Calendar className="h-3.5 w-3.5 text-indigo-500" />
              <span>Rentang Waktu Kedaluwarsa SK</span>
            </span>
            <select
              value={expiryPreset}
              onChange={(e) => setExpiryPreset(e.target.value as any)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">Semua Tanggal SK (Tanpa Batasan)</option>
              <option value="1YEAR">Kedaluwarsa Dekat (Sisa ≤ 1 Tahun)</option>
              <option value="3YEARS">Kedaluwarsa Menengah (Sisa ≤ 3 Tahun)</option>
              <option value="CUSTOM">Kustomisasi Rentang Tanggal SK...</option>
            </select>
          </div>

          {/* Sort By Group */}
          <div className="lg:col-span-3 space-y-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center space-x-1">
              <SortAsc className="h-3.5 w-3.5 text-indigo-500" />
              <span>Urutan Tampilan Grafik</span>
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 cursor-pointer"
            >
              <option value="highest">Progres Tertinggi ke Terendah</option>
              <option value="lowest">Progres Terendah ke Tertinggi</option>
              <option value="alphabetical">Nama Program Studi (A-Z)</option>
              <option value="expiry">Tanggal Kedaluwarsa Terdekat</option>
            </select>
          </div>

        </div>

        {/* Custom date range inputs when CUSTOM is selected */}
        <AnimatePresence>
          {expiryPreset === 'CUSTOM' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Mulai Tanggal SK</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:ring-2 focus:ring-indigo-500/15 cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Hingga Tanggal SK</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:ring-2 focus:ring-indigo-500/15 cursor-pointer"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* THREE QUICK INSIGHT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 border-b border-slate-200 text-slate-800">
        
        {/* Card 1 */}
        <div className="p-6 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/20">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Rata-Rata Progres</p>
              <h4 className="text-3xl font-black text-indigo-950 mt-1">{stats.averageProgress}%</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Akumulasi berkas &amp; kriteria dari <strong className="text-indigo-600">{stats.totalCount}</strong> prodi terfilter.
              </p>
            </div>
            <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          {/* Progress Mini Bar */}
          <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600" style={{ width: `${stats.averageProgress}%` }} />
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-6 border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/20">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Kelengkapan Dokumen Utama</p>
              <h4 className="text-3xl font-black text-emerald-950 mt-1">{stats.averageDocsPct}%</h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Rerata berkas <strong className="text-emerald-600">LED, LKPS, &amp; Legalitas</strong> berstatus FINAL.
              </p>
            </div>
            <div className="bg-emerald-50 p-2.5 rounded-xl text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          {/* Detailed Document Ready */}
          <div className="mt-3.5 flex items-center justify-between text-[10px] font-bold text-slate-500">
            <span>LED: {stats.finalLed} / {stats.totalCount}</span>
            <span>LKPS: {stats.finalLkps} / {stats.totalCount}</span>
            <span>Izin: {stats.finalLegalitas} / {stats.totalCount}</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="p-6 bg-slate-50/20">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Distribusi Status Akreditasi</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {Object.entries(stats.accStatusCounts).map(([status, count]) => {
                  if (count === 0) return null;
                  return (
                    <span 
                      key={status} 
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black border ${
                        status === 'Unggul' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                        status === 'Baik Sekali' ? 'bg-teal-50 text-teal-800 border-teal-200' :
                        status === 'Baik' ? 'bg-indigo-50 text-indigo-800 border-indigo-200' :
                        'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {status}: {count}
                    </span>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-500 mt-2.5">Tingkatan peringkat mutu dari seluruh prodi yang terfilter.</p>
            </div>
            <div className="bg-amber-50 p-2.5 rounded-xl text-amber-600">
              <Award className="h-5 w-5" />
            </div>
          </div>
        </div>

      </div>

      {/* CORE VISUALIZATION CONTENT AREA */}
      <div className="p-6">
        {sortedPrograms.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400">
            <AlertCircle className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-600">Tidak Ada Program Studi Terdeteksi</p>
            <p className="text-xs opacity-85 mt-1 max-w-sm mx-auto">
              Silakan sesuaikan filter rumpun LAM atau rentang tanggal SK Anda untuk menampilkan data analisis akreditasi.
            </p>
          </div>
        ) : activeTab === 'individual' ? (
          
          /* VIEW 1: PROGRESS PER PRODI (HORIZONTAL BAR CHART) */
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            
            {/* Interactive Bar Chart List (Left) */}
            <div className={`${selectedProdiId ? 'xl:col-span-7' : 'xl:col-span-12'} space-y-4`}>
              <div className="flex justify-between items-center mb-1">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">Daftar Progres Evaluasi Mandiri</h4>
                <p className="text-[10px] text-slate-400">Klik salah satu program studi untuk melihat analisis kriteria lengkap.</p>
              </div>

              <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-2">
                {sortedPrograms.map(p => {
                  const isSelected = selectedProdiId === p.id;
                  const isHovered = hoveredProdiId === p.id;
                  
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedProdiId(isSelected ? null : p.id)}
                      onMouseEnter={() => setHoveredProdiId(p.id)}
                      onMouseLeave={() => setHoveredProdiId(null)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer relative group ${
                        isSelected 
                          ? 'bg-indigo-50/50 border-indigo-200 shadow-3xs' 
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
                      }`}
                    >
                      {/* Left color bar reflecting accreditation status */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-xl ${
                        p.accreditationStatus === 'Unggul' ? 'bg-amber-400' :
                        p.accreditationStatus === 'Baik Sekali' ? 'bg-teal-500' :
                        p.accreditationStatus === 'Baik' ? 'bg-indigo-500' :
                        'bg-slate-300'
                      }`} />

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pl-2">
                        {/* Name and Basic Metadata */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-mono font-black text-slate-400">#{p.code}</span>
                            <span className="text-[10px] font-bold uppercase text-indigo-600 bg-indigo-50/50 px-1.5 py-0.5 rounded-md">
                              {p.lam}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">
                              SK Exp: {p.expiryDate}
                            </span>
                          </div>
                          <h5 className="text-xs font-black text-slate-900 mt-1 truncate group-hover:text-indigo-600 transition-colors">
                            {p.name} ({p.level})
                          </h5>
                        </div>

                        {/* Interactive Badges for LED / LKPS / Legalitas */}
                        <div className="flex items-center space-x-1.5 self-start sm:self-auto text-[9px] font-black uppercase">
                          <div className="flex items-center space-x-1" title={`Laporan Evaluasi Diri (LED): ${p.documents.led.status}`}>
                            <span className={`w-2.5 h-2.5 rounded-xs ${
                              p.documents.led.status === 'Final' ? 'bg-emerald-500' :
                              p.documents.led.status === 'Draf' ? 'bg-amber-400' :
                              'bg-slate-200'
                            }`} />
                            <span className="text-slate-400">LED</span>
                          </div>
                          <div className="flex items-center space-x-1" title={`Laporan Kinerja Program Studi (LKPS): ${p.documents.lkps.status}`}>
                            <span className={`w-2.5 h-2.5 rounded-xs ${
                              p.documents.lkps.status === 'Final' ? 'bg-emerald-500' :
                              p.documents.lkps.status === 'Draf' ? 'bg-amber-400' :
                              'bg-slate-200'
                            }`} />
                            <span className="text-slate-400">LKPS</span>
                          </div>
                          <div className="flex items-center space-x-1" title={`Legalitas Operasional: ${p.documents.legalitas.status}`}>
                            <span className={`w-2.5 h-2.5 rounded-xs ${
                              p.documents.legalitas.status === 'Final' ? 'bg-emerald-500' :
                              p.documents.legalitas.status === 'Draf' ? 'bg-amber-400' :
                              'bg-slate-200'
                            }`} />
                            <span className="text-slate-400">Izin</span>
                          </div>
                        </div>

                        {/* Pct display */}
                        <div className="text-right flex items-center space-x-1">
                          <span className="text-sm font-black text-slate-950 font-mono">{p.completionPct}%</span>
                          <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                        </div>
                      </div>

                      {/* Main Progress Bar Area */}
                      <div className="mt-3 pl-2">
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex relative">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${p.completionPct}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className={`h-full rounded-full transition-all duration-300 bg-linear-to-r ${
                              p.completionPct >= 80 ? 'from-indigo-500 to-emerald-500' :
                              p.completionPct >= 50 ? 'from-amber-400 to-amber-500' :
                              'from-slate-400 to-slate-500'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Side Detail Drilldown Card when a prodi is selected */}
            <AnimatePresence>
              {selectedProdiId && selectedProdiDetails && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="xl:col-span-5 bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-3xs flex flex-col self-start sticky top-4"
                  id="prodi-drilldown-panel"
                >
                  <div className="flex justify-between items-center border-b border-slate-200 pb-3 mb-4">
                    <div>
                      <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
                        {selectedProdiDetails.lam}
                      </span>
                      <h4 className="text-sm font-black text-slate-900 mt-1">{selectedProdiDetails.name}</h4>
                    </div>
                    <button
                      onClick={() => setSelectedProdiId(null)}
                      className="text-slate-400 hover:text-slate-600 p-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Summary progress circle */}
                  <div className="flex items-center space-x-4 mb-5 bg-white p-4 rounded-xl border border-slate-200">
                    <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 text-indigo-700">
                      {/* SVG circular progress indicator */}
                      <svg className="absolute w-16 h-16 transform -rotate-90">
                        <circle cx="32" cy="32" r="28" stroke="#f1f5f9" strokeWidth="4" fill="transparent" />
                        <circle 
                          cx="32" 
                          cy="32" 
                          r="28" 
                          stroke="#4f46e5" 
                          strokeWidth="4" 
                          fill="transparent" 
                          strokeDasharray={175.9} 
                          strokeDashoffset={175.9 - (175.9 * calculateCompletionPercentage(selectedProdiDetails)) / 100} 
                        />
                      </svg>
                      <span className="text-xs font-black font-mono">{calculateCompletionPercentage(selectedProdiDetails)}%</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kalkulasi Kesiapan Berkas</p>
                      <h5 className="text-xs font-bold text-slate-800 mt-0.5">Akreditasi {selectedProdiDetails.accreditationStatus}</h5>
                      <p className="text-[10px] text-slate-500 mt-0.5">SK Berlaku sampai {selectedProdiDetails.expiryDate}</p>
                    </div>
                  </div>

                  {/* Document details list */}
                  <div className="space-y-3">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Unggahan Dokumen Mutu</h5>
                    
                    {/* LED */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-indigo-500" />
                        <div>
                          <p className="font-bold">Laporan Evaluasi Diri (LED)</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{selectedProdiDetails.documents.led.fileName || 'Belum ada berkas'}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${
                        selectedProdiDetails.documents.led.status === 'Final' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                        selectedProdiDetails.documents.led.status === 'Draf' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                        'bg-slate-50 border-slate-200 text-slate-500'
                      }`}>
                        {selectedProdiDetails.documents.led.status}
                      </span>
                    </div>

                    {/* LKPS */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-emerald-500" />
                        <div>
                          <p className="font-bold">Laporan Kinerja Prodi (LKPS)</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{selectedProdiDetails.documents.lkps.fileName || 'Belum ada berkas'}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${
                        selectedProdiDetails.documents.lkps.status === 'Final' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                        selectedProdiDetails.documents.lkps.status === 'Draf' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                        'bg-slate-50 border-slate-200 text-slate-500'
                      }`}>
                        {selectedProdiDetails.documents.lkps.status}
                      </span>
                    </div>

                    {/* Legalitas */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-indigo-500" />
                        <div>
                          <p className="font-bold">Izin Operasional &amp; SK</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{selectedProdiDetails.documents.legalitas.fileName || 'Belum ada berkas'}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${
                        selectedProdiDetails.documents.legalitas.status === 'Final' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                        selectedProdiDetails.documents.legalitas.status === 'Draf' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                        'bg-slate-50 border-slate-200 text-slate-500'
                      }`}>
                        {selectedProdiDetails.documents.legalitas.status}
                      </span>
                    </div>
                  </div>

                  {/* Criteria indicator lists */}
                  <div className="mt-5 space-y-2">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Kesiapan 8 Standar / Kriteria</h5>
                    <div className="grid grid-cols-4 gap-1.5">
                      {Object.entries(selectedProdiDetails.criteriaProgress).map(([crit, status]) => (
                        <div 
                          key={crit} 
                          className={`p-2 rounded-lg border text-center transition-all ${
                            status === 'Siap' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                            status === 'Proses' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                            'bg-slate-50 border-slate-100 text-slate-400'
                          }`}
                        >
                          <p className="text-[9px] font-black uppercase">{crit}</p>
                          <p className="text-[8px] font-bold mt-0.5 leading-none">{status}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        ) : (
          
          /* VIEW 2: AGGREGATE ANALYTICS (SUMMARY GRAPHS) */
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Aggregation of 8 Criteria Progress Standard */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <div className="mb-4">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                    <Activity className="h-4.5 w-4.5 text-indigo-600" />
                    <span>Statistik Pemenuhan 8 Kriteria Mutu</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Pemetaan tingkat kesiapan dokumen per Kriteria Tridharma dari prodi terfilter.
                  </p>
                </div>

                <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
                  {['k1', 'k2', 'k3', 'k4', 'k5', 'k6', 'k7', 'k8'].map(k => {
                    const counts = stats.criteriaCounts[k as keyof typeof stats.criteriaCounts];
                    const total = (counts.Siap + counts.Proses + counts.BelumMulai) || 1;
                    const readyPct = Math.round((counts.Siap / total) * 100);
                    const processPct = Math.round((counts.Proses / total) * 100);
                    const pendingPct = 100 - readyPct - processPct;

                    // Standard label text
                    const labels: Record<string, string> = {
                      k1: 'Kriteria 1: Visi, Misi & Strategi',
                      k2: 'Kriteria 2: Tata Pamong & Kerjasama',
                      k3: 'Kriteria 3: Kemahasiswaan & Alumni',
                      k4: 'Kriteria 4: Sumber Daya Manusia (SDM)',
                      k5: 'Kriteria 5: Keuangan & Sarana Prasarana',
                      k6: 'Kriteria 6: Kurikulum & Pembelajaran',
                      k7: 'Kriteria 7: Riset & Publikasi Ilmiah',
                      k8: 'Kriteria 8: Pengabdian Masyarakat & Luaran'
                    };

                    return (
                      <div key={k} className="bg-white p-3 rounded-xl border border-slate-200">
                        <div className="flex justify-between items-center text-xs mb-1.5 font-bold text-slate-700">
                          <span>{labels[k]}</span>
                          <span className="font-mono text-[10px] text-slate-500">
                            {counts.Siap} Siap • {counts.Proses} Proses
                          </span>
                        </div>
                        
                        {/* Stacked bar */}
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex">
                          <div 
                            className="h-full bg-emerald-500" 
                            style={{ width: `${readyPct}%` }} 
                            title={`Siap: ${counts.Siap}`} 
                          />
                          <div 
                            className="h-full bg-amber-400" 
                            style={{ width: `${processPct}%` }} 
                            title={`Proses: ${counts.Proses}`} 
                          />
                          <div 
                            className="h-full bg-slate-200" 
                            style={{ width: `${pendingPct}%` }} 
                            title={`Belum Mulai: ${counts.BelumMulai}`} 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Legend keys */}
                <div className="flex space-x-4 mt-5 text-[9px] text-slate-500 font-black uppercase">
                  <div className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-xs" />
                    <span>Kriteria Siap (100%)</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 bg-amber-400 rounded-xs" />
                    <span>Kriteria Proses (50%)</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="w-2.5 h-2.5 bg-slate-200 rounded-xs" />
                    <span>Belum Mulai</span>
                  </div>
                </div>
              </div>

              {/* Document Type Completion distribution */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="mb-4">
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                      <FileText className="h-4.5 w-4.5 text-indigo-600" />
                      <span>Rasio Dokumen LED vs LKPS</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Perbandingan persentase berkas yang sudah mencapai tahap FINAL di sistem universitas.
                    </p>
                  </div>

                  <div className="space-y-5 py-4">
                    {/* LED ratio chart */}
                    <div>
                      <div className="flex justify-between text-xs mb-1.5 font-bold">
                        <span className="text-slate-700">Laporan Evaluasi Diri (LED)</span>
                        <span className="font-mono text-slate-500">
                          {stats.finalLed} / {stats.totalCount} Selesai ({Math.round((stats.finalLed / (stats.totalCount || 1)) * 100)}%)
                        </span>
                      </div>
                      <div className="h-5 bg-slate-100 rounded-xl overflow-hidden flex border border-slate-200">
                        <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${Math.round((stats.finalLed / (stats.totalCount || 1)) * 100)}%` }} />
                        <div className="h-full bg-amber-300 transition-all duration-500" style={{ width: `${Math.round((stats.drafLed / (stats.totalCount || 1)) * 100)}%` }} />
                      </div>
                    </div>

                    {/* LKPS ratio chart */}
                    <div>
                      <div className="flex justify-between text-xs mb-1.5 font-bold">
                        <span className="text-slate-700">Laporan Kinerja Program Studi (LKPS)</span>
                        <span className="font-mono text-slate-500">
                          {stats.finalLkps} / {stats.totalCount} Selesai ({Math.round((stats.finalLkps / (stats.totalCount || 1)) * 100)}%)
                        </span>
                      </div>
                      <div className="h-5 bg-slate-100 rounded-xl overflow-hidden flex border border-slate-200">
                        <div className="h-full bg-teal-500 transition-all duration-500" style={{ width: `${Math.round((stats.finalLkps / (stats.totalCount || 1)) * 100)}%` }} />
                        <div className="h-full bg-amber-300 transition-all duration-500" style={{ width: `${Math.round((stats.drafLkps / (stats.totalCount || 1)) * 100)}%` }} />
                      </div>
                    </div>

                    {/* Legalitas ratio chart */}
                    <div>
                      <div className="flex justify-between text-xs mb-1.5 font-bold">
                        <span className="text-slate-700">Legalitas &amp; Pengantar Operasional</span>
                        <span className="font-mono text-slate-500">
                          {stats.finalLegalitas} / {stats.totalCount} Selesai ({Math.round((stats.finalLegalitas / (stats.totalCount || 1)) * 100)}%)
                        </span>
                      </div>
                      <div className="h-5 bg-slate-100 rounded-xl overflow-hidden flex border border-slate-200">
                        <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${Math.round((stats.finalLegalitas / (stats.totalCount || 1)) * 100)}%` }} />
                        <div className="h-full bg-amber-300 transition-all duration-500" style={{ width: `${Math.round((stats.drafLegalitas / (stats.totalCount || 1)) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 bg-white border border-slate-200 p-3 rounded-xl leading-relaxed mt-4 flex items-start space-x-2">
                  <Info className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                  <span>
                    Grafik ini menghitung rasio agregat unggahan dokumen oleh Admin Prodi. Dokumen berstatus <strong>Final</strong> menandakan berkas siap diajukan ke Lembaga Akreditasi, sedangkan <strong>Draf</strong> berarti proses evaluasi internal sedang berjalan.
                  </span>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

    </div>
  );
}
