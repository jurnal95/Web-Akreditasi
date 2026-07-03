/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Building2, FileText, CheckCircle2, Clock, Upload, Check, 
  Sparkles, Save, User, Phone, Mail, Award, AlertTriangle, HelpCircle,
  BookOpen, Eye, Edit3, ArrowRight, ListTodo, Loader2, Download, CheckSquare, AlertCircle, TrendingUp,
  Lock
} from 'lucide-react';
import { StudyProgram, DocStatus, ProgressStatus, LAMCharacteristic } from '../types';
import { LAM_CHARACTERISTICS } from '../data';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface DashboardAdminProdiProps {
  program: StudyProgram;
  onUpdateProgram: (program: StudyProgram) => void;
}

export default function DashboardAdminProdi({ program, onUpdateProgram }: DashboardAdminProdiProps) {
  // Tabs: 'profil' | 'dokumen' | 'kriteria' | 'ai_generator' | 'ganti_password'
  const [activeTab, setActiveTab] = useState<'profil' | 'dokumen' | 'kriteria' | 'ai_generator' | 'ganti_password'>('ai_generator');

  // Ganti Password States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleGantiPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    if (newPassword !== confirmNewPassword) {
      setPasswordError('Konfirmasi password baru tidak cocok!');
      return;
    }

    if (newPassword.length < 4) {
      setPasswordError('Password baru minimal harus 4 karakter.');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch('/api/prodi/ganti-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prodi_id: program.id,
          password_lama: oldPassword,
          password_baru: newPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordSuccess(data.message || 'Password berhasil diperbarui!');
        setOldPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        setPasswordError(data.error || 'Gagal mengganti password.');
      }
    } catch (err) {
      setPasswordError('Terjadi kesalahan jaringan.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Success toast/message state
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // AI Generator States
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState('');
  const [generatedFileName, setGeneratedFileName] = useState('');
  const [selectedDocType, setSelectedDocType] = useState<'led' | 'lkps' | 'legalitas' | 'kriteria_mutu'>('led');
  const [selectedCriteriaKey, setSelectedCriteriaKey] = useState<'k1' | 'k2' | 'k3' | 'k4' | 'k5' | 'k6' | 'k7' | 'k8'>('k1');
  const [customInstruction, setCustomInstruction] = useState('');
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatorEngine, setGeneratorEngine] = useState<'offline' | 'gemini'>('offline');
  const [generationMode, setGenerationMode] = useState<'direct' | 'interactive'>('direct');
  const [referenceText, setReferenceText] = useState('');

  // Dropdown format acuan kampus from Supabase
  const [referensiList, setReferensiList] = useState<any[]>([]);
  const [selectedReferensiId, setSelectedReferensiId] = useState<string>('');

  // States for uploading reference document
  const [showUploadRef, setShowUploadRef] = useState(false);
  const [newRefName, setNewRefName] = useState('');
  const [newRefLam, setNewRefLam] = useState('BAN-PT');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploadingRef, setIsUploadingRef] = useState(false);
  const [uploadRefError, setUploadRefError] = useState<string | null>(null);
  const [uploadRefSuccess, setUploadRefSuccess] = useState<string | null>(null);

  // Form states for Profil
  const [profileForm, setProfileForm] = useState({
    kaprodi: '',
    phone: '',
    email: '',
    description: '',
    vision: '',
    mission: ''
  });

  // Load references list from database
  const loadReferences = async (selectNewId?: string) => {
    try {
      const refRes = await fetch('/api/referensi-dokumen');
      if (refRes.ok) {
        const refData = await refRes.json();
        setReferensiList(refData || []);
        if (selectNewId) {
          setSelectedReferensiId(selectNewId);
        } else if (refData && refData.length > 0 && !selectedReferensiId) {
          setSelectedReferensiId(refData[0].id);
        }
        return refData;
      }
    } catch (e) {
      console.error("Gagal memuat ulang daftar acuan:", e);
    }
  };

  // Upload a new reference document to the server
  const handleUploadReference = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRefName.trim()) {
      setUploadRefError('Nama referensi wajib diisi.');
      return;
    }
    if (selectedFiles.length === 0) {
      setUploadRefError('Silakan pilih file (.docx, .pdf, atau .md/.txt) terlebih dahulu.');
      return;
    }

    setIsUploadingRef(true);
    setUploadRefError(null);
    setUploadRefSuccess(null);

    try {
      const formData = new FormData();
      formData.append('nama_referensi', newRefName);
      formData.append('kategori_lam', newRefLam);
      formData.append('prodi_id', program.id);

      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

      const res = await fetch('/api/referensi-dokumen/upload', {
        method: 'POST',
        body: formData,
      });

      let data: any = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        const cleanText = text.replace(/<[^>]*>/g, '').slice(0, 150).trim();
        throw new Error(cleanText || `Error server dengan status ${res.status}`);
      }

      if (!res.ok) {
        throw new Error(data.error || 'Terjadi kesalahan saat mengunggah dokumen.');
      }

      setUploadRefSuccess(data.message || 'Dokumen berhasil diunggah!');
      
      // Reset form inputs
      setNewRefName('');
      setSelectedFiles([]);
      
      // Reload reference list and auto-select the new one
      if (data.data && data.data.id) {
        await loadReferences(data.data.id);
      } else {
        await loadReferences();
      }

      // Hide form after success delay
      setTimeout(() => {
        setShowUploadRef(false);
        setUploadRefSuccess(null);
      }, 3000);

    } catch (err: any) {
      console.error('Error uploading reference doc:', err);
      setUploadRefError(err.message || 'Gagal mengunggah dan mengurai dokumen.');
    } finally {
      setIsUploadingRef(false);
    }
  };

  // Fetch Supabase referensi_dokumen and previous prodi input state
  useEffect(() => {
    const fetchReferencesAndInputs = async () => {
      try {
        // Fetch references
        await loadReferences();

        // Fetch saved prodi inputs
        if (program && program.id) {
          const inputRes = await fetch(`/api/prodi/input-data/${program.id}`);
          if (inputRes.ok) {
            const inputData = await inputRes.json();
            if (inputData && inputData.data) {
              const data = inputData.data;
              if (data.profileForm) {
                setProfileForm(data.profileForm);
              }
              if (data.referenceText) {
                setReferenceText(data.referenceText);
              }
              if (data.customInstruction) {
                setCustomInstruction(data.customInstruction);
              }
              if (data.criteriaProgress) {
                const updatedProgram: StudyProgram = {
                  ...program,
                  criteriaProgress: {
                    ...program.criteriaProgress,
                    ...data.criteriaProgress
                  }
                };
                onUpdateProgram(updatedProgram);
              }
            }
          }

          // Fetch latest generated draft document
          const draftRes = await fetch(`/api/prodi/hasil-generator/${program.id}`);
          if (draftRes.ok) {
            const draftData = await draftRes.json();
            if (draftData && draftData.data) {
              setGeneratedText(draftData.data.konten_output_markdown);
              setGeneratedFileName(draftData.data.nama_dokumen || 'draf_dokumen_akreditasi.md');
            }
          }
        }
      } catch (err) {
        console.error("Gagal menarik inisialisasi data dari Supabase:", err);
      }
    };

    fetchReferencesAndInputs();
  }, [program.id]);

  // Handle saving Profile Form
  const saveToDatabase = async (overrideData?: any) => {
    if (!program || !program.id) return;
    
    const payload = {
      profileForm,
      referenceText,
      customInstruction,
      criteriaProgress: program.criteriaProgress,
      ...overrideData
    };

    try {
      await fetch('/api/prodi/input-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prodiId: program.id,
          data_mentah_json: payload
        })
      });
    } catch (err) {
      console.error("Gagal mensinkronisasikan data ke database Supabase:", err);
    }
  };

  // Handle saving Profile Form
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsedMission = profileForm.mission
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const updatedProfile = {
      kaprodi: profileForm.kaprodi || 'Belum Diisi',
      phone: profileForm.phone || '-',
      email: profileForm.email || '-',
      description: profileForm.description || '',
      vision: profileForm.vision || '',
      mission: parsedMission.length > 0 ? parsedMission : ['Menyelenggarakan pendidikan bermutu.']
    };

    const updatedProgram: StudyProgram = {
      ...program,
      profile: updatedProfile
    };

    onUpdateProgram(updatedProgram);
    // Persist to Supabase
    saveToDatabase({
      profileForm: {
        ...profileForm,
        mission: parsedMission.join('\n')
      }
    });
    triggerSuccessToast('Profil prodi berhasil diperbarui & disimpan di database!');
  };

  // Trigger temporary success notification
  const triggerSuccessToast = (msg: string) => {
    setSaveSuccess(msg);
    setTimeout(() => {
      setSaveSuccess(null);
    }, 3000);
  };

  // Handle Document Status & File changes
  const handleDocChange = (docType: 'led' | 'lkps' | 'legalitas', status: DocStatus, fileName?: string) => {
    // Current date stamp
    const today = new Date().toISOString().split('T')[0];
    
    const updatedDocs = {
      ...program.documents,
      [docType]: {
        ...program.documents[docType],
        status,
        lastUpdated: today,
        fileName: fileName !== undefined ? fileName : (program.documents[docType].fileName || `berkas_${docType}_draft.pdf`)
      }
    };

    const updatedProgram: StudyProgram = {
      ...program,
      documents: updatedDocs
    };

    onUpdateProgram(updatedProgram);
    triggerSuccessToast(`Status berkas ${docType.toUpperCase()} berhasil dimutakhirkan!`);
  };

  // Handle Criteria Progress changes (Auto-saves on select!)
  const handleCriteriaChange = (critKey: 'k1' | 'k2' | 'k3' | 'k4' | 'k5' | 'k6' | 'k7' | 'k8', status: ProgressStatus) => {
    const updatedCriteria = {
      ...program.criteriaProgress,
      [critKey]: status
    };

    const updatedProgram: StudyProgram = {
      ...program,
      criteriaProgress: updatedCriteria
    };

    onUpdateProgram(updatedProgram);
    // Persist to Supabase
    saveToDatabase({
      criteriaProgress: updatedCriteria
    });
    triggerSuccessToast(`Progres Kriteria ${critKey.toUpperCase()} diubah menjadi ${status} & tersimpan!`);
  };

  // Calculate dynamic readiness percentage
  const calculateReadiness = () => {
    let docScore = 0;
    // led
    if (program.documents.led.status === 'Final') docScore += 10;
    else if (program.documents.led.status === 'Draf') docScore += 5;
    
    // lkps
    if (program.documents.lkps.status === 'Final') docScore += 10;
    else if (program.documents.lkps.status === 'Draf') docScore += 5;
    
    // legalitas
    if (program.documents.legalitas.status === 'Final') docScore += 10;
    else if (program.documents.legalitas.status === 'Draf') docScore += 5;

    let critScore = 0;
    const criteriaKeys = ['k1', 'k2', 'k3', 'k4', 'k5', 'k6', 'k7', 'k8'] as const;
    criteriaKeys.forEach(key => {
      const status = program.criteriaProgress[key];
      if (status === 'Siap') critScore += 10;
      else if (status === 'Proses') critScore += 5;
    });

    // Weighted score: documents count for 45%, criteria count for 55%
    const docPercent = (docScore / 30) * 45;
    const critPercent = (critScore / 80) * 55;
    return Math.round(docPercent + critPercent);
  };

  // Client-side trigger for server-side AI generation
  const handleGenerateDocument = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    setGeneratedText('');

    try {
      const formData = new FormData();
      formData.append('documentType', selectedDocType);
      formData.append('prodiInfo', JSON.stringify({
        name: program.name,
        level: program.level,
        faculty: program.faculty,
        lam: program.lam,
        profile: program.profile
      }));
      formData.append('focus', program.lam);
      if (selectedDocType === 'kriteria_mutu' && selectedCriteriaKey) {
        formData.append('criteriaKey', selectedCriteriaKey);
      }
      formData.append('customPrompt', customInstruction || '');
      formData.append('referenceText', referenceText || '');
      formData.append('generationMode', generationMode);
      formData.append('referensiId', selectedReferensiId || '');
      formData.append('prodiId', program.id);

      // Append selected files for RAG mode
      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Terjadi kesalahan saat generate dokumen.');
      }

      const data = await response.json();
      setGeneratedText(data.text);
      setGeneratedFileName(data.fileName);
      triggerSuccessToast('Dokumen akreditasi berhasil digenerate dengan AI & tersimpan di database!');
    } catch (err: any) {
      console.error(err);
      setGenerationError(err.message || 'Gagal melakukan generate dokumen.');
    } finally {
      setIsGenerating(false);
    }
  };

  // High-quality local template generation fallback when API access is blocked or restricted
  const handleGenerateOffline = () => {
    setIsGenerating(true);
    setGenerationError(null);
    setGeneratedText('');
    
    setTimeout(() => {
      let offlineText = "";
      const cleanDate = new Date().toISOString().slice(2, 10).replace(/-/g, "");
      const fileName = `${generationMode === 'interactive' ? 'panduan_wawancara' : selectedDocType}_${program.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${cleanDate}.md`;

      const referenceSection = referenceText && referenceText.trim() !== ''
        ? `> 📌 **Data Referensi Anda Terdeteksi & Terintegrasi:**\n> *"Hasil draf ini telah menyelaraskan informasi berdasarkan data referensi yang Anda berikan berikut: ${referenceText.slice(0, 150)}${referenceText.length > 150 ? '...' : ''}"*\n\n---\n\n`
        : '';

      if (generationMode === 'interactive') {
        // INTERACTIVE PRE-GENERATION QUESTIONNAIRE TEMPLATES
        if (selectedDocType === 'kriteria_mutu') {
          const critName = lamInfo.criteriaNames[selectedCriteriaKey] || "Kriteria Mutu";
          offlineText = `# 📋 PANDUAN PENGUMPULAN DATA & WAWANCARA KRITERIA MUTU
## KRITERIA: ${selectedCriteriaKey.toUpperCase()} - ${critName}
## Program Studi: ${program.name} (${program.level}) - ${program.lam}

${referenceSection}### I. Deskripsi Kebutuhan Data & Dokumen Bukti (Evidence)
Sebelum menulis narasi evaluasi diri untuk Kriteria ${selectedCriteriaKey.toUpperCase()}, Tim Penyusun wajib mengumpulkan dokumen berikut:
1. **Rencana Strategis (Renstra)** & Rencana Operasional (Renop) Fakultas/UPPS.
2. **Dokumen Kebijakan Standar Mutu** khusus untuk kriteria ini yang disahkan Senat.
3. **Laporan Audit Mutu Internal (AMI)** beserta bukti rapat tinjauan manajemen (RTM) selama 3 tahun terakhir.
4. **Survei Kepuasan Pemangku Kepentingan** (mahasiswa/dosen/alumni/mitra) terkait kriteria ini.

### II. Daftar Pertanyaan Wawancara Terarah (Wajib Dijawab)
Silakan diskusikan dan jawab pertanyaan berikut sebelum menyusun narasi draf:
1. **Bagaimana kepemimpinan dan pengelolaan** yang berjalan pada kriteria ini di tingkat prodi ${program.name}? Apakah sudah transparan dan akuntabel?
2. **Apa saja standar mutu internal** yang ditetapkan prodi? Apakah indikator kinerjanya melampaui Standar Nasional Pendidikan Tinggi (SN-Dikti)?
3. **Bagaimana siklus PPEPP** (Penetapan, Pelaksanaan, Evaluasi, Pengendalian, Peningkatan) diterapkan khusus pada kriteria ini? Berikan contoh riil kasusnya.
4. **Apa kendala utama** yang menghambat pencapaian target mutu kriteria ini dalam 2 tahun terakhir?
5. **Upaya strategis apa** yang sudah disiapkan untuk meningkatkan skor kriteria ini ke depan?

### III. Lembar Isian Ringkas (Template Data Mentah)
| Nama Indikator Kinerja | Angka Target | Angka Riil Saat Ini | Status Pencapaian |
|---|---|---|---|
| Skor Kepuasan Pengguna | >= 3.50 (Skala 4) | 3.65 (Sangat Baik) | Melampaui Target |
| Keterlibatan Dosen Tetap | 100% Aktif | 92% Aktif | Tercapai Sebagian |
| Audit Mutu Internal (AMI) | 1 Kali / Tahun | Terlaksana | Tercapai |

> *Petunjuk: Anda dapat menyalin lembar isian di atas, mengisinya, lalu menempelkannya ke kotak 'Referensi Data' untuk melakukan generate ulang draf draf dokumen final.*`;
        } else if (selectedDocType === 'led') {
          offlineText = `# 📋 PANDUAN INTERAKTIF PENGUMPULAN DATA & WAWANCARA LAPORAN EVALUASI DIRI (LED)
## Dokumen: Laporan Evaluasi Diri (LED) Komprehensif
## Program Studi: ${program.name} (${program.level}) - ${program.lam}

${referenceSection}### I. Kebutuhan Data Pokok LED (Lembaga Akreditasi ${program.lam})
Untuk menyusun draf LED yang berbobot unggul, persiapkan data makro berikut:
1. **Sejarah Ringkat & Legalitas Pendirian:** SK Izin Operasional Prodi, SK Akreditasi terakhir, serta SK Pejabat struktural UPPS.
2. **Data Tata Kelola (UPPS):** Struktur organisasi, manual mutu, kode etik dosen/mahasiswa, serta rencana mitigasi risiko operasional.
3. **Analisis SWOT Komparatif:** Rekap data keunggulan unik (selling points) prodi dibandingkan kompetitor utama.

### II. Pertanyaan Wawancara Strategis (Pimpinan Fakultas & Prodi)
Jawablah pertanyaan-pertanyaan pemantik berikut untuk memperkaya narasi evaluasi diri:
1. **Visi Keilmuan:** Apa keunikan kompetensi lulusan ${program.name} di prodi ini yang tidak dimiliki universitas lain?
2. **Sinergi UPPS & Prodi:** Sejauh mana Fakultas (UPPS) memberikan dukungan finansial dan fasilitas untuk pengembangan riset dan pengabdian masyarakat di tingkat prodi?
3. **Keberlanjutan (Sustainability):** Bagaimana strategi prodi dalam menjaga keberlanjutan animo mahasiswa baru dan kemandirian dana operasional?
4. **Penjaminan Mutu:** Apakah sistem SPMI di prodi ini sudah memiliki auditor internal bersertifikasi? Bagaimana tindak lanjut audit dilakukan?

### III. Checklist Kelengkapan Dokumen Evidence LED
- [ ] Dokumen Rencana Strategis (Renstra) UPPS yang masih berlaku.
- [ ] Laporan evaluasi pencapaian Visi Misi Tujuan Strategis (VMTS).
- [ ] Dokumen Rencana Induk Penelitian (RIP) prodi.
- [ ] SOP-SOP Akademik dan Non-Akademik lengkap.

> *Saran: Kumpulkan poin-poin jawaban di atas, tempelkan pada input 'Referensi Data' di halaman ini, lalu klik 'Generate' untuk mengonversi jawaban mentah Anda menjadi bab draf LED formal.*`;
        } else if (selectedDocType === 'lkps') {
          offlineText = `# 📋 PANDUAN INTERAKTIF WAWANCARA & PRE-GEN DATA LKPS
## Dokumen: Laporan Kinerja Program Studi (LKPS) - Data Tabel
## Program Studi: ${program.name} (${program.level}) - ${program.lam}

${referenceSection}### I. Daftar Tabel Kritis yang Memerlukan Pengisian Data
Sesuai instrumen ${program.lam}, Anda harus mengumpulkan data angka riil untuk tabel berikut:
1. **Tabel Profil Dosen Tetap:** NIDN/NIDK, kualifikasi S2/S3, jabatan akademik, kesesuaian bidang keahlian, dan sertifikasi pendidik.
2. **Tabel Seleksi & Daya Tampung Mahasiswa:** Jumlah pendaftar, jumlah yang lulus seleksi, jumlah mahasiswa baru (reguler/transfer), dan jumlah mahasiswa aktif.
3. **Tabel Kurikulum, SKS, dan RPS:** Peta mata kuliah tiap semester, bobot SKS (teori/praktikum), mata kuliah penciri prodi, dan ketersediaan RPS terbaru.
4. **Tabel Produktivitas Ilmiah:** Jumlah publikasi dosen di jurnal nasional terakreditasi (Sinta 1-6) dan jurnal internasional bereputasi (Scopus/SJR) selama 3 tahun terakhir.

### II. Pertanyaan Wawancara Validasi Data (Tim PDDIKTI & Akademik)
Verifikasi hal-hal berikut untuk menghindari kesalahan audit data:
1. **Kecocokan PDDIKTI:** Apakah seluruh dosen tetap prodi ${program.name} telah terdaftar dengan homebase yang benar di sistem PDDIKTI?
2. **Rasio Dosen-Mahasiswa:** Berapa rasio rill dosen terhadap mahasiswa aktif saat ini? Apakah sudah memenuhi batas aman minimum?
3. **Masa Studi Lulusan:** Berapa rata-rata masa studi lulusan dalam 3 tahun terakhir? Berapa persentase kelulusan tepat waktu (KTW)?
4. **Kesesuaian Kompetensi Dosen:** Apakah ada dosen yang mengajar mata kuliah di luar bidang keahlian utamanya? Bagaimana solusinya?

### III. Format Isian Cepat untuk Tabel Dosen
Salin teks di bawah ini, isi datanya, dan gunakan sebagai **Referensi Data** untuk generate draf LKPS otomatis:
\`\`\`text
[DOSEN-1] Nama: Prof. Dr. Ahmad Fauzi, Pendidikan: S3, Jafung: Guru Besar, Sertifikasi: Ya, Bidang: Sistem Akreditasi
[DOSEN-2] Nama: Dr. Siti Rahma, Pendidikan: S3, Jafung: Lektor Kepala, Sertifikasi: Ya, Bidang: Manajemen Mutu
[MAHASISWA] Baru 2024: 120, Baru 2025: 145, Aktif Total: 420
\`\`\`

> *Saran: Tempelkan data format di atas yang sudah Anda lengkapi ke dalam kolom 'Referensi Data' untuk menyusun tabel LKPS siap pakai.*`;
        } else {
          offlineText = `# 📋 PANDUAN INTERAKTIF PENGUMPULAN DATA LEGALITAS, SK, & SURAT PENGANTAR
## Dokumen: Legalitas & Kerangka SPMI
## Program Studi: ${program.name} (${program.level}) - ${program.lam}

${referenceSection}### I. Kebutuhan Informasi Dokumen Legalitas
Untuk menyiapkan draf legalitas dan kerangka tata kerja tim akreditasi, pastikan informasi ini telah disepakati:
1. **Nomor Surat & Tanggal Pengajuan:** Penomoran resmi surat keluar dari Fakultas/Dekanat.
2. **Personel Tim Akreditasi:** Susunan lengkap tim penyusun akreditasi prodi (Ketua, Sekretaris, Koordinator LED, Koordinator LKPS).
3. **Siklus Mutu SPMI:** Konsep penerapan siklus PPEPP penjaminan mutu yang berlaku di perguruan tinggi Anda.

### II. Daftar Pertanyaan Koordinasi Tim Akreditasi
Sebelum menerbitkan SK dan Surat Pengantar, rapat koordinasi pertama harus menyepakati:
1. **Tanggung Jawab:** Apa batas tanggung jawab dan tenggat waktu pengisian data untuk masing-masing bidang (LED vs LKPS)?
2. **Alur Koordinasi:** Bagaimana mekanisme review internal sebelum dokumen final diserahkan ke Dekanat untuk diajukan ke ${program.lam}?
3. **Sistem Pengarsipan Bukti:** Di mana seluruh folder bukti fisik (evidence) akreditasi akan disimpan secara digital untuk mempermudah asesmen lapangan?

### III. Template Isian Personel Tim Akreditasi
Isi list berikut untuk draf dokumen SK otomatis:
- Dekan Fakultas: [Nama Lengkap & NIP/NIDN]
- Ketua Tim Akreditasi: [Nama Lengkap & NIP/NIDN]
- Sekretaris: [Nama Lengkap & NIP/NIDN]
- Penanggung Jawab Kriteria 1-3: [Nama Lengkap]
- Penanggung Jawab Kriteria 4-9: [Nama Lengkap]

> *Saran: Isi informasi personel di atas, tempelkan di kotak 'Referensi Data', lalu lakukan generate draf legalitas.*`;
        }
      } else {
        // DIRECT GENERATION WITH OPTIONAL REFERENCE DATA
        if (selectedDocType === 'kriteria_mutu') {
          const critName = lamInfo.criteriaNames[selectedCriteriaKey] || "Kriteria Mutu";
          offlineText = `# DRAF EVALUASI KRITERIA MUTU ${selectedCriteriaKey.toUpperCase()}: ${critName}
## Program Studi: ${program.name} (${program.level})
## Fakultas: ${program.faculty}
## Lembaga Akreditasi: ${program.lam}

${referenceSection}### I. Deskripsi Kondisi & Analisis SWOT
${referenceText && referenceText.trim() !== '' ? `*Draf disusun dengan mengintegrasikan data referensi Anda terkait kriteria ini:*
- **Analisis Kondisi Nyata:** Berdasarkan data masukan, prodi menunjukkan kinerja operasional yang solid dan sesuai standar penjaminan mutu.
- **Kekuatan (Strengths):** ${referenceText.slice(0, 100)}... Memiliki kurikulum berbasis KKNI dan OBE (Outcome-Based Education) yang sangat relevan.` : `- **Kekuatan (Strengths):** Memiliki kurikulum berbasis KKNI dan OBE (Outcome-Based Education) yang sangat relevan dengan standar ${program.lam}. Profil kaprodi dan dosen pengajar sesuai dengan standar rasio minimum.`}
- **Kelemahan (Weaknesses):** Integrasi hasil penelitian dosen ke dalam materi pembelajaran interaktif masih perlu dioptimalkan secara terstruktur untuk mahasiswa.
- **Peluang (Opportunities):** Permintaan industri dan institusi nasional terhadap lulusan ${program.name} terus meningkat secara berkelanjutan seiring perkembangan zaman.
- **Ancaman (Threats):** Tingkat persaingan yang ketat dengan lulusan program sejenis dari universitas nasional terkemuka.

### II. Rencana Tindak Lanjut Strategis (Action Plan)
| No | Upaya Peningkatan | Indikator Kinerja Utama | Target Waktu | Penanggung Jawab |
|---|---|---|---|---|
| 1 | Lokakarya integrasi penelitian ke kurikulum | Tersedianya silabus/RPS terintegrasi | Semester Depan | Kaprodi / Tim Kurikulum |
| 2 | Pembinaan sertifikasi profesi mahasiswa | 85% Lulusan tersertifikasi nasional | 12 Bulan | Unit Kemahasiswaan |

> *Catatan: Draf ini digenerate dalam mode offline aman sebagai draf terstruktur berbasis template.*`;
        } else if (selectedDocType === 'led') {
          offlineText = `# LAPORAN EVALUASI DIRI (LED) KOMPREHENSIF
## Program Studi: ${program.name} (${program.level}) - Fakultas ${program.faculty}
## Akreditasi Target: ${program.lam}

${referenceSection}### BAB I: PENDAHULUAN
Program Studi ${program.name} berkomitmen penuh untuk menyelenggarakan pendidikan tinggi berkualitas prima demi mencetak generasi unggul berdaya saing global sesuai standar nasional dan kriteria penjaminan mutu ${program.lam}.

### BAB II: EVALUASI KINERJA UNIT PENGELOLA (UPPS)
1. **Visi, Misi, Tujuan, dan Strategi:** Visi Keilmuan prodi adalah "*${program.profile?.vision || "Menjadi program studi unggul berdaya saing nasional"}*" yang diturunkan ke dalam langkah misi strategis yang sistematis.
2. **Sistem Penjaminan Mutu:** Implementasi siklus PPEPP (Penetapan, Pelaksanaan, Evaluasi, Pengendalian, dan Peningkatan) berjalan secara konsisten di tingkat program studi dan fakultas.
3. **Mahasiswa dan Lulusan:** Standar input mahasiswa yang ketat menghasilkan rasio kelulusan tepat waktu yang sangat memuaskan.

${referenceText && referenceText.trim() !== '' ? `### BAB III: INTEGRASI DATA REFERENSI PENGGUNA
Berikut adalah analisis penyelarasan fakta dari data bukti yang Anda lampirkan:
- **Fakta Bukti Lapangan:** ${referenceText}
- **Rekomendasi Asesor:** Data di atas sangat kuat untuk diajukan sebagai eviden pendukung bab tata kelola dan SDM.` : ''}

### BAB IV: ANALISIS SWOT INTEGRATIF
- **Strengths:** Dukungan penuh dari dekanat, reputasi baik di tingkat lokal, serta dosen bersertifikasi pendidik profesional.
- **Weaknesses:** Kuantitas publikasi internasional bereputasi (Scopus/Sinta 1-2) masih perlu didorong.
- **Opportunities:** Kerja sama strategis dengan asosiasi profesi bidang ${program.lam}.
- **Threats:** Kecepatan adaptasi teknologi kurikulum baru di tingkat industri global.

> *Catatan: Draf offline dibuat otomatis untuk membantu visualisasi struktur instrumen.*`;
        } else if (selectedDocType === 'lkps') {
          offlineText = `# LAPORAN KINERJA PROGRAM STUDI (LKPS)
## Program Studi: ${program.name} (${program.level}) - Fakultas ${program.faculty}

${referenceSection}### Tabel 1: Profil Kualifikasi Dosen Tetap (Disesuaikan dengan Referensi)
${referenceText && referenceText.trim() !== '' ? `*Menampilkan dosen berdasarkan data referensi yang Anda masukkan:*` : ''}
| No | Nama Dosen | Pendidikan | Jabatan Akademik | Bidang Keahlian | Sertifikasi |
|---|---|---|---|---|---|
| 1 | Prof. Dr. Ahmad Fauzi | S3 Doktor | Guru Besar | Ilmu ${program.name} | Pendidik Prof. |
| 2 | Dr. Siti Rahma, M.T. | S3 Doktor | Lektor Kepala | Metodologi Riset | Pendidik Prof. |
| 3 | Budi Hartono, M.Cs. | S2 Magister | Lektor | Keilmuan Terapan | Terdaftar |

### Tabel 2: Kurikulum & Pembelajaran
| Semester | Kode MK | Nama Mata Kuliah | Bobot SKS | Sifat MK | RPS Terlampir |
|---|---|---|---|---|---|
| I | MKU101 | Pendidikan Agama &amp; Etika | 2 SKS | Wajib | Ya |
| III | MKP302 | Teori Bidang Inti | 3 SKS | Wajib | Ya |
| VIII | MKS499 | Tugas Akhir / Skripsi | 6 SKS | Wajib | Ya |

### Tabel 3: Data Aktivitas Penelitian &amp; PKM
| Tahun | Judul Publikasi/Pengabdian | Jurnal/Media Publikasi | Kategori Sinta | Dana Hibah |
|---|---|---|---|---|
| 2024 | Kajian Teoretis Sistem ${program.name} | Jurnal Teknologi Nasional | Sinta 3 | Internal UPPS |
| 2025 | Implementasi Pengabdian Masyarakat | Jurnal Pengabdian Mandiri | Sinta 4 | Hibah Dikti |

> *Catatan: Draf data simulasi siap disesuaikan dengan data riil dari PDDIKTI.*`;
        } else {
          offlineText = `# DRAF DOKUMEN LEGALITAS & PENJAMINAN MUTU (SPMI)
## Program Studi: ${program.name} (${program.level}) - Fakultas ${program.faculty}

${referenceSection}### 1. Format Surat Pengantar Pengajuan Akreditasi
Nomor: 015/F/${program.faculty.toUpperCase()}/VI/2026
Lampiran: 1 (Satu) Berkas Lengkap LED & LKPS
Perihal: Permohonan Pengajuan Akreditasi Program Studi ${program.name}

Kepada Yth.
**Direktur Dewan Eksekutif ${program.lam}**
Jakarta, Indonesia

Dengan hormat, bersama surat ini kami mengajukan permohonan akreditasi untuk Program Studi ${program.name} jenjang ${program.level} di lingkungan Fakultas ${program.faculty}. Seluruh berkas instrumen LED dan LKPS telah kami siapkan sesuai pedoman resmi.

Hormat kami,
**Dekan Fakultas ${program.faculty}**

---

### 2. Surat Keputusan (SK) Tim Akreditasi Prodi
**MEMUTUSKAN:**
- **Ketua Panitia:** Dr. Siti Rahma, M.T.
- **Sekretaris:** Budi Hartono, M.Cs.
- **Koordinator Bidang LED:** Dr. Ahmad Fauzi
- **Koordinator Bidang LKPS:** Dr. H. Faisal

> *Catatan: Draf offline dibuat otomatis untuk membantu visualisasi struktur instrumen.*`;
        }
      }

      if (customInstruction && customInstruction.trim() !== '') {
        offlineText += `\n\n### III. Rekomendasi Tambahan (Berdasarkan Catatan Anda)
- **Instruksi Khusus Pengguna:** *"${customInstruction}"*
- **Saran Tindak Lanjut Lokal:** Tim penyusun akreditasi wajib menyelaraskan poin di atas ke dalam instrumen akhir sebelum proses finalisasi dokumen.`;
      }

      setGeneratedText(offlineText);
      setGeneratedFileName(fileName);
      setIsGenerating(false);
      triggerSuccessToast(generationMode === 'interactive' ? "Panduan Wawancara & Data berhasil digenerate!" : "Draf lokal berhasil dibuat secara instan!");
    }, 600);
  };

  // Format markdown nicely for downloads (prevent squished elements)
  const formatMarkdownForDownload = (content: string): string => {
    if (!content) return '';
    // Normalize line endings to LF
    let formatted = content.replace(/\r\n/g, '\n');
    
    // Ensure exactly two newlines before headings
    formatted = formatted.replace(/\n+(#+ )/g, '\n\n$1');
    
    // Ensure exactly two newlines before lists
    formatted = formatted.replace(/\n+(\s*[-*+]\s)/g, '\n\n$1');
    formatted = formatted.replace(/\n+(\s*\d+\.\s)/g, '\n\n$1');
    
    // Ensure exactly two newlines before blockquotes
    formatted = formatted.replace(/\n+(\s*>\s)/g, '\n\n$1');
    
    // Ensure exactly two newlines before tables
    formatted = formatted.replace(/\n+(\s*\|)/g, '\n\n$1');

    // Replace 3+ consecutive newlines with 2
    formatted = formatted.replace(/\n{3,}/g, '\n\n');

    return formatted.trim();
  };

  // Convert markdown structure to clean HTML with beautiful inline CSS styles for Word output
  const convertMarkdownToHtml = (markdown: string): string => {
    if (!markdown) return '';
    
    let text = markdown.replace(/\r\n/g, '\n');
    const blocks = text.split(/\n\s*\n/);
    
    const htmlBlocks = blocks.map(block => {
      const trimmedBlock = block.trim();
      if (!trimmedBlock) return '';
      
      // Headers
      if (trimmedBlock.startsWith('# ')) {
        return `<h1 style="font-size: 18pt; font-weight: bold; color: #0f172a; margin-top: 24px; margin-bottom: 12px; border-bottom: 1px solid #cbd5e1; padding-bottom: 6px; font-family: 'Segoe UI', Arial, sans-serif;">${trimmedBlock.substring(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</h1>`;
      }
      if (trimmedBlock.startsWith('## ')) {
        return `<h2 style="font-size: 14pt; font-weight: bold; color: #1e293b; margin-top: 20px; margin-bottom: 10px; font-family: 'Segoe UI', Arial, sans-serif;">${trimmedBlock.substring(3).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</h2>`;
      }
      if (trimmedBlock.startsWith('### ')) {
        return `<h3 style="font-size: 12pt; font-weight: bold; color: #334155; margin-top: 16px; margin-bottom: 8px; font-family: 'Segoe UI', Arial, sans-serif;">${trimmedBlock.substring(4).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</h3>`;
      }
      if (trimmedBlock.startsWith('#### ')) {
        return `<h4 style="font-size: 11pt; font-weight: bold; color: #475569; margin-top: 14px; margin-bottom: 6px; font-family: 'Segoe UI', Arial, sans-serif;">${trimmedBlock.substring(5).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</h4>`;
      }
      
      // Blockquotes
      if (trimmedBlock.startsWith('>')) {
        const content = trimmedBlock.replace(/^>\s*/gm, '').replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return `<div style="border-left: 4px solid #4f46e5; background-color: #f8fafc; padding: 12px 16px; margin-top: 14px; margin-bottom: 14px; border-radius: 0 8px 8px 0; font-style: italic; color: #312e81; font-family: 'Segoe UI', Arial, sans-serif;">${content}</div>`;
      }
      
      // Tables
      if (trimmedBlock.includes('|')) {
        const lines = trimmedBlock.split('\n');
        const headerLine = lines[0];
        const rows = lines.slice(1).filter(l => !l.includes('---')); // Skip the divider row
        
        const parseCells = (line: string) => line.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
        
        const headers = parseCells(headerLine);
        if (headers.length > 0) {
          let tableHtml = `<table style="width: 100%; border-collapse: collapse; margin-top: 16px; margin-bottom: 16px; font-size: 10pt; font-family: 'Segoe UI', Arial, sans-serif; border: 1px solid #cbd5e1;">`;
          tableHtml += `<thead style="background-color: #f1f5f9; font-weight: bold; text-align: left; border-bottom: 2px solid #cbd5e1;"><tr>`;
          headers.forEach(h => {
            tableHtml += `<th style="padding: 10px 12px; border: 1px solid #cbd5e1; color: #1e293b; font-weight: 800;">${h.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</th>`;
          });
          tableHtml += `</tr></thead><tbody style="background-color: #ffffff;">`;
          
          rows.forEach((rowLine, rIdx) => {
            const cells = parseCells(rowLine);
            if (cells.length > 0) {
              const rowBg = rIdx % 2 === 1 ? '#f8fafc' : '#ffffff';
              tableHtml += `<tr style="background-color: ${rowBg}; border-bottom: 1px solid #cbd5e1;">`;
              cells.forEach(cell => {
                tableHtml += `<td style="padding: 10px 12px; border: 1px solid #cbd5e1; color: #334155;">${cell.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</td>`;
              });
              tableHtml += `</tr>`;
            }
          });
          
          tableHtml += `</tbody></table>`;
          return tableHtml;
        }
      }
      
      // Unordered lists
      if (trimmedBlock.startsWith('- ') || trimmedBlock.startsWith('* ')) {
        const listItems = trimmedBlock.split('\n');
        let listHtml = `<ul style="margin-top: 0; margin-bottom: 14px; padding-left: 24px; list-style-type: disc; color: #334155; font-family: 'Segoe UI', Arial, sans-serif;">`;
        listItems.forEach(item => {
          const itemContent = item.replace(/^[-*]\s+/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          listHtml += `<li style="margin-bottom: 6px; line-height: 1.6;">${itemContent}</li>`;
        });
        listHtml += `</ul>`;
        return listHtml;
      }
      
      // Ordered lists
      if (/^\d+\.\s/.test(trimmedBlock)) {
        const listItems = trimmedBlock.split('\n');
        let listHtml = `<ol style="margin-top: 0; margin-bottom: 14px; padding-left: 24px; list-style-type: decimal; color: #334155; font-family: 'Segoe UI', Arial, sans-serif;">`;
        listItems.forEach(item => {
          const itemContent = item.replace(/^\d+\.\s+/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          listHtml += `<li style="margin-bottom: 6px; line-height: 1.6;">${itemContent}</li>`;
        });
        listHtml += `</ol>`;
        return listHtml;
      }
      
      // Standard paragraphs
      const formattedParagraph = trimmedBlock.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      return `<p style="margin-top: 0; margin-bottom: 16px; line-height: 1.6; color: #334155; font-family: 'Segoe UI', Arial, sans-serif;">${formattedParagraph}</p>`;
    });
    
    return htmlBlocks.filter(b => b !== '').join('\n');
  };

  // Download Markdown file directly with beautiful spacing format
  const downloadMarkdownFile = (filename: string, content: string) => {
    const formattedContent = formatMarkdownForDownload(content);
    const element = document.createElement("a");
    const file = new Blob([formattedContent], { type: 'text/markdown;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    triggerSuccessToast('Draf dokumen Markdown (.md) berhasil diunduh!');
  };

  // Download beautiful formatted Word file (.doc) directly
  const downloadWordFile = (filename: string, content: string) => {
    const docFilename = filename.replace(/\.(md|txt)$/, '') + '.doc';
    const bodyHtml = convertMarkdownToHtml(content);
    
    const fullHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>Draf Dokumen Akreditasi - ${program.name}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
            <w:DoNotOptimizeForBrowser/>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page {
            size: 8.5in 11in;
            margin: 1.0in 1.0in 1.0in 1.0in;
            mso-header-margin: .5in;
            mso-footer-margin: .5in;
            mso-paper-source: 0;
          }
          body {
            font-family: 'Calibri', 'Segoe UI', Arial, sans-serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #1e293b;
            margin: 0;
            padding: 0;
          }
          h1 {
            font-family: 'Calibri Light', 'Segoe UI', Arial, sans-serif;
            font-size: 18pt;
            font-weight: bold;
            color: #0f172a;
            margin-top: 24pt;
            margin-bottom: 12pt;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 6px;
          }
          h2 {
            font-family: 'Calibri Light', 'Segoe UI', Arial, sans-serif;
            font-size: 14pt;
            font-weight: bold;
            color: #1e293b;
            margin-top: 18pt;
            margin-bottom: 10pt;
          }
          h3 {
            font-family: 'Calibri Light', 'Segoe UI', Arial, sans-serif;
            font-size: 12pt;
            font-weight: bold;
            color: #334155;
            margin-top: 14pt;
            margin-bottom: 8pt;
          }
          h4 {
            font-family: 'Calibri Light', 'Segoe UI', Arial, sans-serif;
            font-size: 11pt;
            font-weight: bold;
            color: #475569;
            margin-top: 12pt;
            margin-bottom: 6pt;
          }
          p {
            margin-top: 0;
            margin-bottom: 12pt;
            line-height: 1.6;
            color: #334155;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 14pt;
            margin-bottom: 14pt;
          }
          th {
            background-color: #f1f5f9;
            font-weight: bold;
            border: 1px solid #cbd5e1;
            padding: 8pt 10pt;
            color: #1e293b;
            text-align: left;
          }
          td {
            border: 1px solid #cbd5e1;
            padding: 8pt 10pt;
            color: #334155;
          }
          ul, ol {
            margin-top: 0;
            margin-bottom: 12pt;
            padding-left: 20pt;
          }
          li {
            margin-bottom: 4pt;
            line-height: 1.6;
            color: #334155;
          }
        </style>
      </head>
      <body>
        <div style="font-family: 'Calibri', 'Segoe UI', Arial, sans-serif; font-size: 11pt; line-height: 1.6; color: #1e293b;">
          ${bodyHtml}
        </div>
      </body>
      </html>
    `;

    const element = document.createElement("a");
    const file = new Blob([fullHtml], { type: 'application/msword;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = docFilename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    triggerSuccessToast('Draf dokumen Word (.doc) berhasil diunduh!');
  };

  // Apply simulated filename & status directly to the study program data
  const applyGeneratedDocument = (status: DocStatus) => {
    if (!generatedText) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    if (selectedDocType === 'kriteria_mutu') {
      const mappedStatus: ProgressStatus = status === 'Final' ? 'Siap' : 'Proses';
      const updatedCriteria = {
        ...program.criteriaProgress,
        [selectedCriteriaKey]: mappedStatus
      };
      
      const updatedProgram: StudyProgram = {
        ...program,
        criteriaProgress: updatedCriteria
      };
      onUpdateProgram(updatedProgram);
      triggerSuccessToast(`Kriteria ${selectedCriteriaKey.toUpperCase()} diubah menjadi ${mappedStatus}!`);
    } else {
      const docKey = selectedDocType as 'led' | 'lkps' | 'legalitas';
      const updatedDocs = {
        ...program.documents,
        [docKey]: {
          status,
          lastUpdated: today,
          fileName: generatedFileName
        }
      };
      
      const updatedProgram: StudyProgram = {
        ...program,
        documents: updatedDocs
      };
      onUpdateProgram(updatedProgram);
      triggerSuccessToast(`Dokumen ${docKey.toUpperCase()} berhasil dimutakhirkan sebagai ${status}!`);
    }
  };

  // Dynamic LAM info
  const lamInfo: LAMCharacteristic = LAM_CHARACTERISTICS[program.lam] || BAN_PT_FALLBACK;

  // Render countdown alert if nearing expiry
  const renderExpiryAlert = () => {
    if (!program.expiryDate || program.expiryDate === '-') return null;
    const expiry = new Date(program.expiryDate);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 365) {
      return (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start space-x-3 text-xs text-amber-800 mb-6">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
          <div>
            <span className="font-bold">Perhatian: SK Akreditasi Prodi Segera Habis!</span>
            <p className="opacity-90 mt-0.5">
              Masa berlaku akreditasi prodi ini berakhir dalam <span className="font-bold">{diffDays} hari</span> ({program.expiryDate}). Segera rampungkan pengunggahan berkas LED dan evaluasi ke-8 kriteria mutu sebelum pengajuan re-akreditasi.
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* Success Toast */}
        {saveSuccess && (
          <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center space-x-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-5 duration-200">
            <div className="bg-emerald-500 p-1 rounded-full text-white">
              <Check className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold">{saveSuccess}</span>
          </div>
        )}

        {/* Dashboard Header Block */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-xs">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <span className="text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200">
                  KODE: {program.code}
                </span>
                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-200">
                  {program.lam}
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 mt-1 leading-none tracking-tight">
                {program.name} ({program.level})
              </h1>
              <p className="text-xs text-slate-500 mt-1.5 font-medium">{program.faculty}</p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl flex items-center space-x-3 text-right">
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400 block leading-none">Akreditasi Saat Ini</span>
              <span className="text-sm font-extrabold text-slate-800">{program.accreditationStatus}</span>
            </div>
            <div className="h-8 w-[1px] bg-slate-200" />
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400 block leading-none">Masa Berlaku</span>
              <span className="text-xs font-bold text-indigo-600 font-mono">{program.expiryDate}</span>
            </div>
          </div>
        </div>

        {/* Expiry Alarm Alert */}
        {renderExpiryAlert()}

        {/* TABS SELECTOR */}
        <div className="flex border-b border-slate-200 mb-6 bg-white p-1 rounded-xl border flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('ai_generator')}
            className={`flex-1 min-w-[130px] py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'ai_generator'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
            id="tab-btn-ai-generator"
          >
            <Sparkles className="h-4 w-4" />
            <span>AI Dokumen &amp; Kesiapan</span>
          </button>

          <button
            onClick={() => setActiveTab('profil')}
            className={`flex-1 min-w-[130px] py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'profil'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
            id="tab-btn-profil"
          >
            <Edit3 className="h-4 w-4" />
            <span>Kustomisasi Profil</span>
          </button>
          
          <button
            onClick={() => setActiveTab('dokumen')}
            className={`flex-1 min-w-[130px] py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'dokumen'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
            id="tab-btn-dokumen"
          >
            <FileText className="h-4 w-4" />
            <span>Ceklis Berkas Dokumen</span>
          </button>

          <button
            onClick={() => setActiveTab('kriteria')}
            className={`flex-1 min-w-[130px] py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'kriteria'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
            id="tab-btn-kriteria"
          >
            <ListTodo className="h-4 w-4" />
            <span>8 Kriteria Mutu ({program.lam})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('ganti_password');
              setPasswordSuccess(null);
              setPasswordError(null);
            }}
            className={`flex-1 min-w-[130px] py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
              activeTab === 'ganti_password'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
            id="tab-btn-ganti-password"
          >
            <Lock className="h-4 w-4" />
            <span>Ganti Password</span>
          </button>
        </div>

        {/* TAB CONTENTS */}
        
        {/* TAB 0: AI GENERATOR & READINESS PROGRESS */}
        {activeTab === 'ai_generator' && (
          <div className="space-y-6 animate-in fade-in duration-150" id="ai-generator-tab-content">
            
            {/* PROGRESS MONITOR SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Giant Dial showing total progress */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-3xs flex flex-col items-center justify-center text-center">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3 block">Persentase Kesiapan</span>
                
                <div className="relative flex items-center justify-center w-36 h-36">
                  {/* Circle SVG */}
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="72"
                      cy="72"
                      r="60"
                      className="stroke-slate-100"
                      strokeWidth="12"
                      fill="transparent"
                    />
                    <circle
                      cx="72"
                      cy="72"
                      r="60"
                      className="stroke-indigo-600 transition-all duration-500"
                      strokeWidth="12"
                      fill="transparent"
                      strokeDasharray={377}
                      strokeDashoffset={377 - (377 * calculateReadiness()) / 100}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-black text-slate-950 font-mono">{calculateReadiness()}%</span>
                    <span className="text-[9px] font-bold text-emerald-600 uppercase mt-0.5 tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {calculateReadiness() >= 80 ? 'Sangat Siap' : calculateReadiness() >= 50 ? 'Cukup Siap' : 'Perlu Upaya'}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 mt-4 leading-relaxed font-medium">
                  Kalkulasi bobot dinamis: <br/> 
                  <span className="font-bold">45%</span> 3 Dokumen Utama &amp; <span className="font-bold">55%</span> 8 Kriteria Mutu
                </p>
              </div>

              {/* Status Breakdown of items */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-3xs md:col-span-2 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-indigo-600" />
                    <span>Rincian Status Berkas &amp; Instrumen</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Documents section */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-150">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block mb-2">3 Dokumen Akreditasi Utama</span>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-600">LED (Evaluasi Diri)</span>
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[9px] ${
                            program.documents.led.status === 'Final' ? 'bg-emerald-100 text-emerald-800' :
                            program.documents.led.status === 'Draf' ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-100 text-slate-500'
                          }`}>{program.documents.led.status}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-600">LKPS (Kinerja Prodi)</span>
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[9px] ${
                            program.documents.lkps.status === 'Final' ? 'bg-emerald-100 text-emerald-800' :
                            program.documents.lkps.status === 'Draf' ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-100 text-slate-500'
                          }`}>{program.documents.lkps.status}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-600">Legalitas &amp; Pengantar</span>
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[9px] ${
                            program.documents.legalitas.status === 'Final' ? 'bg-emerald-100 text-emerald-800' :
                            program.documents.legalitas.status === 'Draf' ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-100 text-slate-500'
                          }`}>{program.documents.legalitas.status}</span>
                        </div>
                      </div>
                    </div>

                    {/* Criteria checklist counts */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block mb-2">Evaluasi 8 Kriteria Mutu</span>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-600">Status "Siap":</span>
                            <span className="font-bold text-slate-800 font-mono">
                              {Object.values(program.criteriaProgress).filter(s => s === 'Siap').length} dari 8
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-600">Status "Proses":</span>
                            <span className="font-bold text-amber-600 font-mono">
                              {Object.values(program.criteriaProgress).filter(s => s === 'Proses').length} Kriteria
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-600">Belum Mulai:</span>
                            <span className="font-bold text-slate-400 font-mono">
                              {Object.values(program.criteriaProgress).filter(s => s === 'Belum Mulai').length} Kriteria
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Recommendations */}
                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800">Rekomendasi Tindakan: </span>
                    {calculateReadiness() === 100 ? (
                      <span>Semua berkas final dan kriteria mutakhir! Dokumen Anda siap diunduh untuk di-upload manual ke sistem LAMDIK/SAPTO BAN-PT.</span>
                    ) : (
                      <span>Gunakan Asisten AI di bawah ini untuk membantu membuat draf tulisan LED, LKPS, atau narasi Kriteria Mutu yang berstatus "Belum Ada" atau "Proses".</span>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* AI DOCUMENT GENERATOR CORE PANEL */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs overflow-hidden">
              <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-indigo-600 p-2.5 rounded-xl">
                    <Sparkles className="h-5 w-5 text-indigo-100 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-white">Asisten Dokumen Akreditasi AI &amp; Template</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Generate draf Laporan Evaluasi Diri (LED), LKPS, atau Kriteria Mutu terstruktur disesuaikan dengan klaster {program.lam}.</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold border px-3 py-1 rounded-full uppercase tracking-wider hidden sm:block ${
                  generatorEngine === 'offline' 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                    : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                }`}>
                  {generatorEngine === 'offline' ? 'Template Cerdas Aktif' : 'Gemini AI Aktif'}
                </span>
              </div>

              <div className="p-6 md:p-8 space-y-6">
                
                {/* ENGINE / MODE SELECTOR */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2.5">PILIH MODE GENERATOR (GRATIS VS KUNCI API)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setGeneratorEngine('offline');
                        setGenerationError(null);
                      }}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start space-x-3 ${
                        generatorEngine === 'offline'
                          ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/10 shadow-xs'
                          : 'bg-white/50 border-slate-200 opacity-75 hover:opacity-100 hover:bg-white'
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 ${generatorEngine === 'offline' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                        <CheckSquare className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                          Template Cerdas Terstruktur 
                          <span className="text-[8px] px-1.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded">100% Gratis &amp; Instan</span>
                        </span>
                        <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                          Tidak perlu kunci API / Billing. Hasil langsung jadi dalam 1 detik sesuai standar {program.lam}.
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setGeneratorEngine('gemini');
                        setGenerationError(null);
                      }}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start space-x-3 ${
                        generatorEngine === 'gemini'
                          ? 'bg-white border-indigo-500 ring-2 ring-indigo-500/10 shadow-xs'
                          : 'bg-white/50 border-slate-200 opacity-75 hover:opacity-100 hover:bg-white'
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 ${generatorEngine === 'gemini' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                          Gemini AI Pro 
                          <span className="text-[8px] px-1.5 py-0.5 bg-indigo-100 text-indigo-800 font-bold rounded">Memerlukan Kunci API</span>
                        </span>
                        <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                          Menulis draf kualitatif mendalam menggunakan API Gemini. Membutuhkan konfigurasi kunci di menu Settings.
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Inputs Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Config */}
                  <div className="space-y-5">
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Pilih Tipe Dokumen Akreditasi</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedDocType('led')}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            selectedDocType === 'led'
                              ? 'bg-indigo-50 border-indigo-500 text-indigo-950 ring-2 ring-indigo-500/10'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="font-extrabold text-xs block">Laporan Evaluasi Diri (LED)</span>
                          <span className="text-[9px] text-slate-400 mt-1 block">Analisis kualitatif &amp; evaluasi komprehensif prodi.</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedDocType('lkps')}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            selectedDocType === 'lkps'
                              ? 'bg-indigo-50 border-indigo-500 text-indigo-950 ring-2 ring-indigo-500/10'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="font-extrabold text-xs block">Kinerja Prodi (LKPS)</span>
                          <span className="text-[9px] text-slate-400 mt-1 block">Simulasi data tabel kuantitatif, kurikulum, &amp; SDM.</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedDocType('legalitas')}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            selectedDocType === 'legalitas'
                              ? 'bg-indigo-50 border-indigo-500 text-indigo-950 ring-2 ring-indigo-500/10'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="font-extrabold text-xs block">SK &amp; Pengantar</span>
                          <span className="text-[9px] text-slate-400 mt-1 block">Draft SK Tim Penyusun &amp; Surat Pengantar Dekan.</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedDocType('kriteria_mutu')}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            selectedDocType === 'kriteria_mutu'
                              ? 'bg-indigo-50 border-indigo-500 text-indigo-950 ring-2 ring-indigo-500/10'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="font-extrabold text-xs block">Narasi Kriteria Mutu</span>
                          <span className="text-[9px] text-slate-400 mt-1 block">Fokus pembahasan naratif 1 dari 8 standar akreditasi.</span>
                        </button>
                      </div>
                    </div>

                    {/* Criteria selection (Only if Kriteria Mutu is selected) */}
                    {selectedDocType === 'kriteria_mutu' && (
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 animate-in slide-in-from-top-3 duration-200">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Pilih Kriteria Mutu ({program.lam})</label>
                        <select
                          value={selectedCriteriaKey}
                          onChange={(e) => setSelectedCriteriaKey(e.target.value as any)}
                          className="w-full text-xs rounded-lg border border-slate-200 p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 font-medium cursor-pointer"
                        >
                          {Object.entries(lamInfo.criteriaNames).map(([key, name]) => (
                            <option key={key} value={key}>
                              {key.toUpperCase()}: {name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Custom instructions & References */}
                  <div className="flex flex-col justify-between space-y-4">
                    <div className="space-y-4">
                      {/* Generation Mode Selector */}
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Pilih Mode Output AI</label>
                        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                          <button
                            type="button"
                            onClick={() => setGenerationMode('direct')}
                            className={`py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${
                              generationMode === 'direct'
                                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                                : 'text-slate-500 hover:text-slate-900'
                            }`}
                          >
                            📝 Tulis Draf Langsung
                          </button>
                          <button
                            type="button"
                            onClick={() => setGenerationMode('interactive')}
                            className={`py-2 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer text-center ${
                              generationMode === 'interactive'
                                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                                : 'text-slate-500 hover:text-slate-900'
                            }`}
                          >
                            📋 Panduan &amp; Checklist
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1.5 leading-tight">
                          {generationMode === 'direct'
                            ? 'AI langsung menyusun narasi dokumen lengkap siap unduh.'
                            : 'AI menyusun daftar pertanyaan wawancara terarah & checklist dokumen fisik yang wajib Anda siapkan.'}
                        </p>
                      </div>

                      {/* Campus Reference Format Dropdown */}
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2 flex justify-between">
                          <span>Pilih Format Acuan Kampus</span>
                          {referensiList.length === 0 && (
                            <span className="text-[9px] text-rose-500 normal-case font-medium">Koneksi database...</span>
                          )}
                        </label>
                        <select
                          value={selectedReferensiId}
                          onChange={(e) => setSelectedReferensiId(e.target.value)}
                          className="w-full text-xs rounded-xl border border-slate-200 p-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 font-medium cursor-pointer"
                        >
                          {referensiList.map((ref) => (
                            <option key={ref.id} value={ref.id}>
                              {ref.nama_referensi || ref.nama_dokumen || 'Format Acuan Dokumen'} {ref.kategori_lam ? `(${ref.kategori_lam})` : ''}
                            </option>
                          ))}
                          {referensiList.length === 0 && (
                            <option value="">Memuat format acuan dari database...</option>
                          )}
                        </select>

                        {/* Upload reference document toggle action */}
                        <div className="mt-2 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setShowUploadRef(!showUploadRef);
                              setUploadRefError(null);
                              setUploadRefSuccess(null);
                            }}
                            className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 ml-auto transition-colors focus:outline-none cursor-pointer"
                          >
                            <Upload className="w-3 h-3" />
                            {showUploadRef ? 'Sembunyikan Form Unggah' : 'Unggah Acuan (.docx/.pdf) Baru'}
                          </button>
                        </div>

                        {/* Interactive reference document upload panel */}
                        {showUploadRef && (
                          <div className="mt-3 p-3.5 bg-indigo-50/30 border border-indigo-100 rounded-xl space-y-3 transition-all animate-fadeIn">
                            <h4 className="text-[10px] font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                              Unggah & Ekstrak Acuan Kampus Luar
                            </h4>
                            <p className="text-[10px] text-slate-500 leading-tight">
                              Sistem akan mengekstrak dokumen <code className="text-indigo-600 font-bold">.docx</code> atau <code className="text-indigo-600 font-bold">.pdf</code> kampus rujukan secara instan menjadi format Markdown terstruktur untuk memandu kecerdasan AI.
                            </p>
                            
                            <form onSubmit={handleUploadReference} className="space-y-2.5">
                              <div>
                                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                  Nama Referensi / Kampus Rujukan
                                </label>
                                <input
                                  type="text"
                                  value={newRefName}
                                  onChange={(e) => setNewRefName(e.target.value)}
                                  placeholder="Contoh: Borang Akreditasi ITB (Unggul)"
                                  className="w-full text-xs rounded-lg border border-slate-200 px-2.5 py-1.5 bg-white text-slate-800 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    Lembaga / LAM
                                  </label>
                                  <select
                                    value={newRefLam}
                                    onChange={(e) => setNewRefLam(e.target.value)}
                                    className="w-full text-xs rounded-lg border border-slate-200 px-2.5 py-1.5 bg-white text-slate-800 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-medium cursor-pointer"
                                  >
                                    <option value="BAN-PT">BAN-PT</option>
                                    <option value="LAM INFOKOM">LAM INFOKOM</option>
                                    <option value="LAMDIK">LAMDIK</option>
                                    <option value="LAM-PTKes">LAM-PTKes</option>
                                    <option value="LAMEMBA">LAMEMBA</option>
                                    <option value="LAMSAMA">LAMSAMA</option>
                                    <option value="LAM Teknik">LAM Teknik</option>
                                  </select>
                                </div>
                                
                                <div>
                                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                    Pilih File Acuan (Bisa Banyak)
                                  </label>
                                  <input
                                    type="file"
                                    multiple
                                    accept=".docx,.pdf,.txt,.md"
                                    onChange={(e) => {
                                      if (e.target.files) {
                                        const filesArray = Array.from(e.target.files);
                                        setSelectedFiles(filesArray);
                                      }
                                    }}
                                    className="w-full text-[10px] text-slate-600 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                                  />
                                </div>
                              </div>

                              {selectedFiles.length > 0 && (
                                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 animate-fadeIn">
                                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                    <span>File Terpilih ({selectedFiles.length}):</span>
                                  </p>
                                  <div className="max-h-32 overflow-y-auto space-y-1 pr-0.5">
                                    {selectedFiles.map((file, idx) => (
                                      <div key={idx} className="flex items-center justify-between text-[10px] text-slate-700 font-medium bg-white px-2.5 py-1.5 rounded-lg border border-slate-150 shadow-2xs">
                                        <div className="flex items-center gap-1.5 truncate max-w-[80%]">
                                          <span className="shrink-0 text-slate-400">📄</span>
                                          <span className="truncate">{file.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                          <span className="text-[8px] text-slate-400 font-mono">({(file.size / 1024).toFixed(1)} KB)</span>
                                          <button 
                                            type="button" 
                                            onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))}
                                            className="text-slate-400 hover:text-rose-600 font-bold transition-colors w-4 h-4 flex items-center justify-center rounded-full hover:bg-rose-50 cursor-pointer"
                                            title="Hapus file"
                                          >
                                            ✕
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {uploadRefError && (
                                <div className="p-2 bg-rose-50 border border-rose-100 text-rose-600 text-[10px] rounded-lg flex items-center gap-1.5 font-medium">
                                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                  <span>{uploadRefError}</span>
                                </div>
                              )}

                              {uploadRefSuccess && (
                                <div className="p-2 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] rounded-lg flex items-center gap-1.5 font-medium">
                                  <CheckSquare className="w-3.5 h-3.5 shrink-0" />
                                  <span>{uploadRefSuccess}</span>
                                </div>
                              )}

                              <div className="flex justify-end gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => setShowUploadRef(false)}
                                  className="px-2.5 py-1 text-[10px] text-slate-500 hover:bg-slate-150 rounded-lg transition-colors focus:outline-none cursor-pointer"
                                >
                                  Batal
                                </button>
                                <button
                                  type="submit"
                                  disabled={isUploadingRef}
                                  className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-bold hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center gap-1 transition-colors focus:outline-none shadow-sm cursor-pointer"
                                >
                                  {isUploadingRef ? (
                                    <>
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                      Mengekstrak...
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="w-3 h-3" />
                                      Unggah & Ekstrak
                                    </>
                                  )}
                                </button>
                              </div>
                            </form>
                          </div>
                        )}
                      </div>

                      {/* Reference Data Textarea */}
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2 flex justify-between">
                          <span>Referensi Data / Dokumen Tambahan (Opsional)</span>
                          <span className="text-[9px] text-slate-400 normal-case font-medium">Tempel data mentah di sini</span>
                        </label>
                        <textarea
                          rows={3}
                          value={referenceText}
                          onChange={(e) => setReferenceText(e.target.value)}
                          className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500"
                          placeholder="Contoh: Tempel visi-misi tambahan, data dosen rill, sarana prasarana, atau bukti audit di sini. AI akan langsung menyelaraskan isi dokumen dengan referensi nyata Anda!"
                        />
                      </div>

                      {/* Custom Instruction */}
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5 flex justify-between">
                          <span>Instruksi Khusus Tambahan (Opsional)</span>
                        </label>
                        <textarea
                          rows={2}
                          value={customInstruction}
                          onChange={(e) => setCustomInstruction(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500"
                          placeholder="Contoh: 'Fokuskan pada kerja sama dosen', 'Gunakan gaya bahasa formal dan analitis.'"
                        />
                      </div>
                    </div>

                     <button
                      type="button"
                      disabled={isGenerating}
                      onClick={generatorEngine === 'offline' ? handleGenerateOffline : handleGenerateDocument}
                      className={`w-full py-3 px-4 disabled:opacity-60 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2.5 cursor-pointer ${
                        generatorEngine === 'offline'
                          ? 'bg-emerald-600 hover:bg-emerald-700'
                          : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-white" />
                          <span>
                            {generationMode === 'interactive' 
                              ? 'AI Sedang Merumuskan Panduan Wawancara...' 
                              : 'AI Sedang Menulis Draf Dokumen...'} (Sabar ya, 1-15 detik)
                          </span>
                        </>
                      ) : (
                        <>
                          {generatorEngine === 'offline' ? (
                            <>
                              <CheckSquare className="h-4 w-4 text-emerald-100" />
                              <span>
                                {generationMode === 'interactive'
                                  ? 'Generate Panduan &amp; Checklist Instan (100% Gratis)'
                                  : 'Generate Draf Dokumen Instan (100% Gratis)'}
                              </span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4 text-indigo-100" />
                              <span>
                                {generationMode === 'interactive'
                                  ? 'Generate Panduan &amp; Checklist dengan Gemini'
                                  : 'Generate Draf Dokumen dengan Gemini (Online)'}
                              </span>
                            </>
                          )}
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Error Banner */}
                {generationError && (
                  <div className="bg-rose-50 border border-rose-200 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-rose-800 animate-in fade-in duration-150">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-extrabold text-slate-900 block text-sm">Akses API Terhambat / Dibatasi</span>
                        <p className="opacity-90 mt-1 leading-relaxed">
                          {generationError}
                        </p>
                        <p className="text-slate-500 mt-1.5">
                          Jangan khawatir! Anda dapat tetap melanjutkan simulasi dokumen menggunakan pemicu draf terstruktur berbasis template offline di sebelah kanan.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleGenerateOffline}
                      className="shrink-0 w-full md:w-auto px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>Buat Draf Offline Instan</span>
                    </button>
                  </div>
                )}

                {/* PREVIEW CONTAINER */}
                {generatedText && (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs bg-white animate-in fade-in duration-200">
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                      <div>
                        <span className="text-[10px] uppercase font-black text-slate-400 block leading-none tracking-wider">Dokumen Hasil Evaluasi AI</span>
                        <span className="text-xs font-bold text-indigo-700 font-mono mt-1.5 block">{generatedFileName}</span>
                      </div>

                      {/* Apply Actions & Download with Multi-Format Support */}
                      <div className="flex items-center space-x-2 flex-wrap gap-2">
                        {/* Download MD Option */}
                        <button
                          type="button"
                          onClick={() => downloadMarkdownFile(generatedFileName, generatedText)}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 font-black text-[10px] uppercase tracking-wider rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer"
                          title="Unduh draf dalam format Markdown (.md) dengan pembagi paragraf rapi"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>Unduh .MD</span>
                        </button>

                        {/* Download Word Option */}
                        <button
                          type="button"
                          onClick={() => downloadWordFile(generatedFileName, generatedText)}
                          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-wider rounded-xl shadow-xs hover:shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer"
                          title="Konversi ke draf rapi Microsoft Word (.doc) lengkap dengan heading dan tabel ber-styling"
                        >
                          <FileText className="h-3.5 w-3.5 text-indigo-200" />
                          <span>Unduh Word (.doc)</span>
                        </button>
                        
                        <div className="h-4 w-[1px] bg-slate-200 hidden sm:block" />

                        <button
                          type="button"
                          onClick={() => applyGeneratedDocument('Draf')}
                          className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer"
                        >
                          <CheckSquare className="h-3.5 w-3.5" />
                          <span>Terapkan Draf</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => applyGeneratedDocument('Final')}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Terapkan Final</span>
                        </button>
                      </div>
                    </div>

                    {/* Styled High-Quality Custom Markdown Component View */}
                    <div className="p-8 max-h-[600px] overflow-y-auto bg-slate-50/20 text-xs text-slate-800 border-t border-slate-150">
                      <div className="space-y-4 max-w-4xl mx-auto leading-relaxed">
                        <Markdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({ children }) => (
                              <h1 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-2.5 mt-6 mb-4 leading-snug tracking-tight">
                                {children}
                              </h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-lg font-extrabold text-slate-900 mt-5 mb-3 leading-snug tracking-tight">
                                {children}
                              </h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-sm font-black text-slate-950 mt-4 mb-2.5 leading-snug">
                                {children}
                              </h3>
                            ),
                            h4: ({ children }) => (
                              <h4 className="text-xs font-black text-slate-800 mt-3.5 mb-2 leading-snug uppercase tracking-wider">
                                {children}
                              </h4>
                            ),
                            p: ({ children }) => (
                              <p className="leading-relaxed text-xs text-slate-700 mb-4">
                                {children}
                              </p>
                            ),
                            ul: ({ children }) => (
                              <ul className="list-disc pl-5 mb-5 space-y-2 text-slate-700">
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal pl-5 mb-5 space-y-2 text-slate-700">
                                {children}
                              </ol>
                            ),
                            li: ({ children }) => (
                              <li className="text-xs leading-relaxed text-slate-700 pl-1">
                                {children}
                              </li>
                            ),
                            table: ({ children }) => (
                              <div className="overflow-x-auto my-5 rounded-xl border border-gray-300 shadow-3xs">
                                <table className="min-w-full text-xs text-left text-slate-700 bg-white border-collapse">
                                  {children}
                                </table>
                              </div>
                            ),
                            thead: ({ children }) => (
                              <thead className="bg-slate-100 font-black uppercase tracking-wider text-[10px] text-slate-600 border-b border-gray-300">
                                {children}
                              </thead>
                            ),
                            tbody: ({ children }) => (
                              <tbody className="bg-white">
                                {children}
                              </tbody>
                            ),
                            tr: ({ children }) => (
                              <tr className="hover:bg-slate-50/50 transition-colors">
                                {children}
                              </tr>
                            ),
                            th: ({ children }) => (
                              <th className="px-4 py-3 font-extrabold text-slate-700 bg-slate-50 border border-gray-300">
                                {children}
                              </th>
                            ),
                            td: ({ children }) => (
                              <td className="px-4 py-3 text-slate-600 font-medium border border-gray-300">
                                {children}
                              </td>
                            ),
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-4 border-indigo-500 pl-4 py-2 italic bg-indigo-50/30 text-indigo-950 rounded-r-lg my-4 text-xs leading-relaxed">
                                {children}
                              </blockquote>
                            ),
                            code: ({ children }) => (
                              <code className="bg-slate-100 text-slate-800 font-mono text-[11px] px-1.5 py-0.5 rounded-sm">
                                {children}
                              </code>
                            ),
                            pre: ({ children }) => (
                              <pre className="bg-slate-900 text-slate-100 font-mono text-[11px] p-4 rounded-xl overflow-x-auto my-4 shadow-3xs leading-relaxed">
                                {children}
                              </pre>
                            ),
                          }}
                        >
                          {generatedText}
                        </Markdown>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        )}

        {/* TAB 1: PROFILE CUSTOMIZATION */}
        {activeTab === 'profil' && (
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-3xs animate-in fade-in duration-150">
            <div className="border-b border-slate-100 pb-4 mb-6">
              <h2 className="text-base font-extrabold text-slate-900">Kustomisasi Profil Program Studi</h2>
              <p className="text-xs text-slate-500 mt-1">Sesuaikan informasi kontak, deskripsi program studi, visi keilmuan, serta misi untuk konsumsi publik portal.</p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 flex items-center space-x-1">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span>Nama Kaprodi *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.kaprodi}
                    onChange={(e) => setProfileForm({ ...profileForm, kaprodi: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-200 text-slate-800 focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500"
                    placeholder="Contoh: Dr. Heru Prasetyo"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 flex items-center space-x-1">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span>Telepon Kantor prodi *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-200 text-slate-800 focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 font-mono"
                    placeholder="Contoh: 0812-xxxx-xxxx"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 flex items-center space-x-1">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span>Email Resmi prodi *</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-200 text-slate-800 focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500"
                    placeholder="Contoh: prodi@kampus.ac.id"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Deskripsi Profil Singkat Prodi</label>
                <textarea
                  rows={3}
                  value={profileForm.description}
                  onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-200 text-slate-800 focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500"
                  placeholder="Ceritakan tentang fokus program studi, prospek karir lulusan, atau pencapaian utama..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Visi Keilmuan Prodi</label>
                  <textarea
                    rows={4}
                    value={profileForm.vision}
                    onChange={(e) => setProfileForm({ ...profileForm, vision: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-200 text-slate-800 focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 italic"
                    placeholder="Visi keilmuan yang spesifik..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Misi Prodi (Tulis per baris baru)</label>
                  <textarea
                    rows={4}
                    value={profileForm.mission}
                    onChange={(e) => setProfileForm({ ...profileForm, mission: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-200 text-slate-800 focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500"
                    placeholder="Misi 1&#10;Misi 2&#10;Misi 3..."
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-xs flex items-center space-x-2 cursor-pointer"
                  id="btn-save-profile"
                >
                  <Save className="h-4 w-4" />
                  <span>Simpan Perubahan Profil</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: DOCUMENT CHECKLIST (LED, LKPS, LEGALITAS) */}
        {activeTab === 'dokumen' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-3xs">
              <h2 className="text-base font-extrabold text-slate-900">Kelengkapan Berkas Dokumen Akreditasi Utama</h2>
              <p className="text-xs text-slate-500 mt-1">Unggah berkas Laporan Evaluasi Diri (LED), Laporan Kinerja Program Studi (LKPS), serta Surat Legalitas Pendirian/Izin Operasional untuk diverifikasi LPM Universitas.</p>
            </div>

            {/* Document Cards List */}
            {(['led', 'lkps', 'legalitas'] as const).map((docType) => {
              const doc = program.documents[docType];
              const docLabel = 
                docType === 'led' ? 'Laporan Evaluasi Diri (LED)' : 
                docType === 'lkps' ? 'Laporan Kinerja Program Studi (LKPS)' : 
                'Dokumen Legalitas & Pengantar';
              const docDesc = 
                docType === 'led' ? 'Dokumen analisis kualitatif komparatif standar mutu prodi.' : 
                docType === 'lkps' ? 'Laporan data kuantitatif kinerja, dosen, mahasiswa dan alumni.' : 
                'Surat pengantar dekan, SPMI, dan SK izin operasional resmi kementerian.';

              return (
                <div key={docType} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-3xs flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-150">
                  
                  {/* Left Side: Info */}
                  <div className="p-6 md:w-2/5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center space-x-2.5">
                        <div className="bg-slate-100 p-2.5 rounded-xl text-slate-700">
                          <FileText className="h-5 w-5" />
                        </div>
                        <h3 className="font-extrabold text-slate-900 text-sm">{docLabel}</h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">{docDesc}</p>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-slate-100 text-[11px] text-slate-400">
                      Terakhir Diperbarui: <span className="font-bold text-slate-600">{doc.lastUpdated}</span>
                    </div>
                  </div>

                  {/* Right Side: Manage & Upload */}
                  <div className="p-6 md:w-3/5 bg-slate-50/50 flex flex-col justify-between space-y-4">
                    
                    {/* Status selection Row */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Status Berkas Saat Ini</label>
                      <div className="flex space-x-2">
                        {(['Belum Ada', 'Draf', 'Final'] as const).map((status) => (
                          <button
                            key={status}
                            onClick={() => handleDocChange(docType, status)}
                            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold border transition-all ${
                              doc.status === status
                                ? status === 'Final' 
                                  ? 'bg-emerald-600 text-white border-emerald-600'
                                  : status === 'Draf'
                                    ? 'bg-amber-500 text-white border-amber-500'
                                    : 'bg-slate-700 text-white border-slate-700'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Simulation Input / File Name */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Nama File Lampiran (Simulasi)</label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={doc.fileName || ''}
                          placeholder={`Contoh: ${docType.toUpperCase()}_prodi_2026.pdf`}
                          onChange={(e) => handleDocChange(docType, doc.status, e.target.value)}
                          className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 font-mono focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const simulatedName = `${docType.toUpperCase()}_SIMULASI_UPLOAD_${new Date().toISOString().slice(2,10).replace(/-/g,'')}.pdf`;
                            handleDocChange(docType, 'Final', simulatedName);
                          }}
                          className="bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 p-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5"
                          title="Simulasikan drag and drop / upload instan file"
                        >
                          <Upload className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Simulasi Upload</span>
                        </button>
                      </div>
                    </div>

                  </div>

                </div>
              );
            })}

          </div>
        )}

        {/* TAB 3: 8 CRITERIA PROGRESS (ADAPTIVE BASED ON SELECTED LAM) */}
        {activeTab === 'kriteria' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            
            {/* Characteristics block */}
            <div className={`p-6 rounded-2xl border ${lamInfo.bgColor}`}>
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-indigo-600 shrink-0 animate-pulse" />
                <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                  Karakteristik Penilaian Adaptif {program.lam}
                </h2>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {lamInfo.focus}
              </p>
              <div className="mt-4 inline-flex items-center space-x-1.5 text-[10px] bg-white/60 px-3 py-1 rounded-md border border-slate-200 font-semibold text-slate-600">
                <span>Instrumen otomatis disesuaikan dengan kurikulum standar mutu {program.lam}</span>
              </div>
            </div>

            {/* Criteria Checklist Cards */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-3xs">
              <div className="border-b border-slate-100 pb-3 mb-6">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Evaluasi &amp; Kesiapan 8 Kriteria Mutu</h3>
                <p className="text-xs text-slate-400 mt-0.5">Tandai progres kesiapan penulisan narasi, bukti dokumen, dan data dukung masing-masing kriteria di bawah ini.</p>
              </div>

              <div className="space-y-4">
                {Object.entries(program.criteriaProgress).map(([key, value]) => {
                  const critKey = key as 'k1' | 'k2' | 'k3' | 'k4' | 'k5' | 'k6' | 'k7' | 'k8';
                  const critName = lamInfo.criteriaNames[critKey] || `Kriteria ${key.substring(1)}`;

                  return (
                    <div 
                      key={key} 
                      className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:border-slate-300 transition-colors"
                    >
                      {/* Left: Code & Text */}
                      <div className="flex items-start space-x-3 md:w-3/5">
                        <span className="text-xs font-mono font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md shrink-0 uppercase">
                          {key.toUpperCase()}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-slate-800 leading-normal">{critName}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Standar mutu pengujian &amp; data dukung instrumen kualitatif.</p>
                        </div>
                      </div>

                      {/* Right: Tristate Segment Selector (Belum Mulai, Proses, Siap) */}
                      <div className="flex bg-slate-100 p-1 rounded-lg md:w-2/5 max-w-sm">
                        {(['Belum Mulai', 'Proses', 'Siap'] as const).map((status) => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => handleCriteriaChange(critKey, status)}
                            className={`flex-1 py-1 px-2.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                              value === status
                                ? status === 'Siap'
                                  ? 'bg-emerald-500 text-white shadow-3xs'
                                  : status === 'Proses'
                                    ? 'bg-amber-500 text-white shadow-3xs'
                                    : 'bg-slate-500 text-white shadow-3xs'
                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: GANTI PASSWORD */}
        {activeTab === 'ganti_password' && (
          <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-3xs animate-in fade-in duration-150 mt-4" id="ganti-password-container">
            <div className="flex items-center space-x-2.5 pb-4 mb-6 border-b border-slate-100">
              <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">Ganti Password Akses</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Perbarui kredensial masuk untuk program studi {program.name}</p>
              </div>
            </div>

            {passwordSuccess && (
              <div className="mb-5 bg-emerald-50 text-emerald-800 text-xs p-3.5 rounded-xl border border-emerald-200 flex items-start space-x-2 font-medium">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="mb-5 bg-rose-50 text-rose-800 text-xs p-3.5 rounded-xl border border-rose-200 flex items-start space-x-2 font-medium">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleGantiPassword} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Password / Token Lama *</label>
                <input
                  type="password"
                  required
                  placeholder="Masukkan password saat ini"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Password / Token Baru *</label>
                <input
                  type="password"
                  required
                  placeholder="Masukkan password baru"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Konfirmasi Password Baru *</label>
                <input
                  type="password"
                  required
                  placeholder="Ulangi password baru"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 mt-6"
              >
                {passwordLoading ? (
                  <span>Memperbarui...</span>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Simpan Password Baru</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}

const BAN_PT_FALLBACK = {
  name: 'Badan Akreditasi Nasional Perguruan Tinggi',
  focus: 'Standardisasi mutu dasar seluruh prodi nasional.',
  bgColor: 'bg-slate-50 border-slate-200',
  textColor: 'text-slate-800',
  borderColor: 'border-slate-300',
  criteriaNames: {
    k1: 'Visi, Misi, Tujuan dan Strategi',
    k2: 'Tata Pamong, Tata Kelola dan Kerjasama',
    k3: 'Mahasiswa',
    k4: 'Sumber Daya Manusia',
    k5: 'Keuangan, Sarana, dan Prasarana',
    k6: 'Pendidikan',
    k7: 'Penelitian',
    k8: 'Pengabdian kepada Masyarakat'
  }
};
