/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StudyProgram, LAMCluster, LAMCharacteristic } from './types';

export const LAM_CHARACTERISTICS: Record<LAMCluster, LAMCharacteristic> = {
  'LAM INFOKOM': {
    name: 'Lembaga Akreditasi Mandiri Informatika dan Komputer',
    focus: 'Rekayasa Perangkat Lunak, Infrastruktur TI, Sertifikasi Kompetensi Digital, Proyek Software, dan Inovasi Teknologi Informasi.',
    bgColor: 'bg-indigo-50 border-indigo-200',
    textColor: 'text-indigo-800',
    borderColor: 'border-indigo-300',
    criteriaNames: {
      k1: 'Visi & Misi Sistem Pendidikan Informatika',
      k2: 'Tata Kelola Organisasi & Kemitraan Industri TI',
      k3: 'Standar Penerimaan & Prestasi Mahasiswa Bidang Komputasi',
      k4: 'Kualifikasi Dosen Spesialis & Praktisi Industri Digital',
      k5: 'Infrastruktur Laboratorium Komputer & Server Cloud Kampus',
      k6: 'Kurikulum Berbasis KKNI & Studi Kasus Rekayasa Perangkat Lunak',
      k7: 'Riset Terapan Informatika & Hak Kekayaan Intelektual (HKI) Software',
      k8: 'Pengabdian Masyarakat Berbasis Teknologi & Luaran Aplikasi Sistem'
    }
  },
  'LAMDIK': {
    name: 'Lembaga Akreditasi Mandiri Kependidikan',
    focus: 'Kompetensi Pedagogik, Praktek Pengalaman Lapangan (PPL) di Sekolah Mitra, Laboratorium Microteaching, Riset Pembelajaran Kreatif, dan Sertifikasi Pendidik.',
    bgColor: 'bg-emerald-50 border-emerald-200',
    textColor: 'text-emerald-800',
    borderColor: 'border-emerald-300',
    criteriaNames: {
      k1: 'Visi Keilmuan Keguruan & Profil Lulusan Tenaga Pendidik',
      k2: 'Tata Pamong & Kemitraan Strategis dengan Sekolah Mitra',
      k3: 'Rekrutmen Mahasiswa Baru & Pembinaan Karakter Keguruan',
      k4: 'Kualifikasi Dosen Kependidikan & Kompetensi Guru Pamong',
      k5: 'Laboratorium Microteaching & Fasilitas Pembelajaran Interaktif',
      k6: 'Kurikulum LPTK, Struktur SKS Praktek & Program Magang PPL',
      k7: 'Penelitian Pembelajaran & Pengembangan Media Edukatif',
      k8: 'Abdimas Penerapan Ilmu Pendidikan & Publikasi Jurnal Pedagogi'
    }
  },
  'LAMEMBA': {
    name: 'Lembaga Akreditasi Mandiri Ekonomi, Manajemen, Bisnis dan Akuntansi',
    focus: 'Kewirausahaan, Inkubasi Bisnis, Studi Kasus Korporasi, Praktik Kerja Lapang, Sertifikasi Profesi Keuangan/Akuntansi, dan Kemitraan BUMN/Swasta.',
    bgColor: 'bg-amber-50 border-amber-200',
    textColor: 'text-amber-800',
    borderColor: 'border-amber-300',
    criteriaNames: {
      k1: 'Visi Strategis Bisnis, Manajemen & Semangat Kewirausahaan',
      k2: 'Tata Kelola Akuntabel & Kolaborasi Sektor Korporasi/Industri',
      k3: 'Pengembangan Kompetensi Global Mahasiswa & Inkubator Bisnis',
      k4: 'Kombinasi Dosen Akademisi & Praktisi Bisnis/Akuntan Publik',
      k5: 'Fasilitas Galeri Investasi, Lab Akuntansi, & Pusat Pengembangan Karir',
      k6: 'Kurikulum Berbasis Problem-Based Learning & Magang Industri',
      k7: 'Penelitian Terapan Bidang Ekonomi, Manajemen & Akuntansi',
      k8: 'Abdimas Pemberdayaan Ekonomi Kreatif UMKM & Mitra Komunitas'
    }
  },
  'LAMSAMA': {
    name: 'Lembaga Akreditasi Mandiri Sains Alam dan Ilmu Formal',
    focus: 'Keilmuan Murni, Standar Keamanan Laboratorium Kimia/Fisika/Biologi, Publikasi Jurnal Internasional Bereputasi, dan Riset Eksperimental Dasar.',
    bgColor: 'bg-blue-50 border-blue-200',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-300',
    criteriaNames: {
      k1: 'Visi Keilmuan Sains Murni & Peta Jalan Riset Dasar',
      k2: 'Tata Kelola Fakultas MIPA & Kerjasama Pusat Penelitian Global',
      k3: 'Penerimaan Mahasiswa Berbakat Eksakta & Pembinaan Olimpiade',
      k4: 'Kualifikasi Akademik Tinggi Dosen (Doktor/Profesor) & Peneliti Utama',
      k5: 'Standar Keamanan Lab Sains, Instrumentasi Analitis & Bahan Kimia',
      k6: 'Struktur Kurikulum Teoritis Mendalam & Praktek Eksperimen Mandiri',
      k7: 'Penelitian Dasar (Basic Science) & Publikasi Jurnal Terindeks Scopus/Sinta',
      k8: 'Abdimas Literasi Sains & Diseminasi Teknologi Tepat Guna'
    }
  },
  'LAM-PTKes': {
    name: 'Lembaga Akreditasi Mandiri Pendidikan Tinggi Kesehatan',
    focus: 'Jam Praktek Klinik Rumah Sakit/Puskesmas, Sertifikasi Kompetensi Medis, Standardisasi OSCE/CBT, Alat Kesehatan Steril, dan Etika Profesi Tenaga Kesehatan.',
    bgColor: 'bg-rose-50 border-rose-200',
    textColor: 'text-rose-800',
    borderColor: 'border-rose-300',
    criteriaNames: {
      k1: 'Visi Kompetensi Tenaga Kesehatan Profesional & Layanan Medis',
      k2: 'Kemitraan Rumah Sakit Pendidikan, Puskesmas & Klinik Rujukan',
      k3: 'Seleksi Mahasiswa Selektif & Pencapaian Uji Kompetensi Nasional (UKOM)',
      k4: 'Dosen Klinis Medis, Preceptor Bersertifikat & Rasio Bimbingan',
      k5: 'Lab Keterampilan Medik (OSCE), Lab Anatomi, & Kepatuhan Alat Medis',
      k6: 'Kurikulum Blok Klinik, Rotasi Internsip, & Penanaman Etika Medis',
      k7: 'Penelitian Eksperimental Klinis, Epidemiologi, & Terapan Medis',
      k8: 'Abdimas Promosi Kesehatan Masyarakat, Imunisasi & Bakti Sosial Kesehatan'
    }
  },
  'BAN-PT': {
    name: 'Badan Akreditasi Nasional Perguruan Tinggi',
    focus: 'Standar Umum Pendidikan Tinggi, Penjaminan Mutu Internal (SPMI), Pelacakan Alumni (Tracer Study), Pengabdian Umum, dan Fasilitas Kampus.',
    bgColor: 'bg-slate-50 border-slate-200',
    textColor: 'text-slate-800',
    borderColor: 'border-slate-300',
    criteriaNames: {
      k1: 'Visi, Misi, Tujuan dan Strategi Institusional Program Studi',
      k2: 'Tata Pamong, Tata Kelola dan Kerjasama Tridharma Perguruan Tinggi',
      k3: 'Mahasiswa dan Lulusan (Sistem Rekrutmen & Pelacakan Alumni/Tracer)',
      k4: 'Sumber Daya Manusia (Kecukupan Dosen Tetap & Tenaga Kependidikan)',
      k5: 'Efisiensi Pengelolaan Keuangan, Sarana, dan Prasarana Pembelajaran',
      k6: 'Kurikulum Pendidikan, Proses Pembelajaran, & Atmosfer Akademik',
      k7: 'Penelitian Dosen & Keterlibatan Mahasiswa dalam Riset Program Studi',
      k8: 'Pengabdian kepada Masyarakat (PkM) Dosen & Integrasi Hasil Riset'
    }
  }
};

export const INITIAL_STUDY_PROGRAMS: StudyProgram[] = [
  {
    id: 'prodi-1',
    name: 'S1 Manajemen Pendidikan Islam',
    code: '86208',
    faculty: 'Fakultas Ilmu Tarbiyah dan Keguruan',
    level: 'S1',
    lam: 'LAMDIK',
    accreditationStatus: 'Unggul',
    skNumber: '085/SK/LAMDIK/Akred/S/VI/2025',
    expiryDate: '2030-06-15',
    profile: {
      kaprodi: 'Dr. H. Fauzi, M.Pd.',
      phone: '0812-3456-0001',
      email: 'mpi@kampus.ac.id',
      description: 'Mempersiapkan tenaga pengelola dan manajer lembaga pendidikan Islam yang profesional, akuntabel, dan menguasai sistem penjaminan mutu pendidikan modern berbasis teknologi.',
      vision: 'Menjadi program studi unggulan tingkat nasional dalam pengembangan tata kelola manajemen pendidikan Islam berstandar mutu internasional pada tahun 2030.',
      mission: [
        'Menyelenggarakan pendidikan manajemen kependidikan Islam yang integratif dan holistik.',
        'Mengembangkan penelitian dalam bidang tata pamong dan administrasi sekolah/madrasah.',
        'Mendorong kegiatan pengabdian masyarakat guna meningkatkan kapasitas manajerial madrasah swasta.'
      ]
    },
    documents: {
      led: { status: 'Final', lastUpdated: '2025-05-10', fileName: 'LED_MPI_Final_2025.pdf' },
      lkps: { status: 'Final', lastUpdated: '2025-05-12', fileName: 'LKPS_MPI_V2.xlsx' },
      legalitas: { status: 'Final', lastUpdated: '2025-04-01', fileName: 'SK_Izin_Operasional_MPI.pdf' }
    },
    criteriaProgress: {
      k1: 'Siap',
      k2: 'Siap',
      k3: 'Siap',
      k4: 'Siap',
      k5: 'Siap',
      k6: 'Siap',
      k7: 'Siap',
      k8: 'Siap'
    }
  },
  {
    id: 'prodi-2',
    name: 'S1 Bimbingan Konseling dan Pendidikan Islam',
    code: '86201',
    faculty: 'Fakultas Ilmu Tarbiyah dan Keguruan',
    level: 'S1',
    lam: 'LAMDIK',
    accreditationStatus: 'Baik Sekali',
    skNumber: '1120/SK/LAMDIK/Akred/S/V/2024',
    expiryDate: '2029-05-20',
    profile: {
      kaprodi: 'Dr. Siti Rahma, M.Pd.',
      phone: '0812-3456-0002',
      email: 'bkpi@kampus.ac.id',
      description: 'Program studi BKPI melatih konselor pendidikan Islam yang humanis dan kompeten dalam membimbing moral serta kesehatan mental peserta didik di sekolah maupun madrasah.',
      vision: 'Menghasilkan konselor sekolah Islam yang adaptif, menguasai metode konseling multikultural, dan berakhlak mulia.',
      mission: [
        'Menyelenggarakan pendidikan bimbingan konseling berbasis pendekatan psikologi Islam dan umum.',
        'Mengembangkan riset di bidang kesehatan mental remaja dan diagnosis kesulitan belajar.',
        'Memberikan layanan konsultasi gratis bagi bimbingan belajar anak madrasah di lingkungan sekitar.'
      ]
    },
    documents: {
      led: { status: 'Draf', lastUpdated: '2026-06-15', fileName: 'DRAF_LED_BKPI_2026.docx' },
      lkps: { status: 'Proses' as any, lastUpdated: '2026-06-20', fileName: 'LKPS_BKPI_Draft_v1.xlsx' },
      legalitas: { status: 'Final', lastUpdated: '2024-01-10', fileName: 'Izin_Operasional_BKPI.pdf' }
    },
    criteriaProgress: {
      k1: 'Siap',
      k2: 'Proses',
      k3: 'Siap',
      k4: 'Proses',
      k5: 'Belum Mulai',
      k6: 'Proses',
      k7: 'Proses',
      k8: 'Belum Mulai'
    }
  },
  {
    id: 'prodi-3',
    name: 'S1 Pendidikan Bahasa Arab',
    code: '84204',
    faculty: 'Fakultas Ilmu Tarbiyah dan Keguruan',
    level: 'S1',
    lam: 'LAMDIK',
    accreditationStatus: 'Unggul',
    skNumber: '4321/SK/LAMDIK/Akred/S/IX/2024',
    expiryDate: '2031-03-15',
    profile: {
      kaprodi: 'Dr. Ahmad Fauzi, M.Pd.I.',
      phone: '0812-3456-0003',
      email: 'pba@kampus.ac.id',
      description: 'Menghasilkan tenaga pengajar Bahasa Arab yang terampil secara komunikatif, menguasai metode pembelajaran digital, serta berwawasan global dalam penulisan karya ilmiah Arab.',
      vision: 'Menjadi pusat rujukan pembelajaran bahasa Arab yang inovatif berbasis multimedia di tingkat nasional pada tahun 2029.',
      mission: [
        'Melaksanakan pengajaran bahasa Arab yang interaktif dengan standar kebahasaan modern.',
        'Mengembangkan penelitian metodologi pembelajaran bahasa Arab bagi non-native speaker.',
        'Mengadakan pelatihan kebahasaan Arab secara berkala bagi guru-guru pesantren.'
      ]
    },
    documents: {
      led: { status: 'Final', lastUpdated: '2024-08-15', fileName: 'LED_PBA_Final_2024.pdf' },
      lkps: { status: 'Final', lastUpdated: '2024-08-18', fileName: 'LKPS_PBA_Fixed.xlsx' },
      legalitas: { status: 'Final', lastUpdated: '2024-03-01', fileName: 'SK_Izin_PBA_Kemenag.pdf' }
    },
    criteriaProgress: {
      k1: 'Siap',
      k2: 'Siap',
      k3: 'Siap',
      k4: 'Siap',
      k5: 'Siap',
      k6: 'Siap',
      k7: 'Siap',
      k8: 'Siap'
    }
  },
  {
    id: 'prodi-4',
    name: 'S1 Pendidikan Guru Madrasah Ibtidaiyah',
    code: '86205',
    faculty: 'Fakultas Ilmu Tarbiyah dan Keguruan',
    level: 'S1',
    lam: 'LAMDIK',
    accreditationStatus: 'Baik',
    skNumber: '023/SK/LAMDIK/Akred/S/II/2026',
    expiryDate: '2028-11-10',
    profile: {
      kaprodi: 'Dr. H. Faisal, M.Pd.',
      phone: '0812-3456-0004',
      email: 'pgmi@kampus.ac.id',
      description: 'Mempersiapkan pendidik sekolah dasar (SD/MI) kelas awal yang kreatif, menguasai pendekatan tematik-integratif, serta memahami penguatan pendidikan karakter anak.',
      vision: 'Mencetak guru kelas madrasah ibtidaiyah yang profesional, kreatif, dan mahir mendesain media belajar visual.',
      mission: [
        'Menyelenggarakan perkuliahan keguruan guru kelas dasar dengan penekanan pada akhlakul karimah.',
        'Mendorong penelitian tindakan kelas (PTK) inovatif bagi pemecahan masalah pembelajaran dasar.',
        'Menjalin kemitraan dalam pembinaan mutu pembelajaran di MI wilayah binaan.'
      ]
    },
    documents: {
      led: { status: 'Draf', lastUpdated: '2026-06-25', fileName: 'Draf_LED_PGMI_Selesai_Bab_4.docx' },
      lkps: { status: 'Belum Ada', lastUpdated: '-', fileName: '' },
      legalitas: { status: 'Final', lastUpdated: '2021-02-14', fileName: 'SK_Izin_PGMI_Kemenag.pdf' }
    },
    criteriaProgress: {
      k1: 'Siap',
      k2: 'Proses',
      k3: 'Proses',
      k4: 'Belum Mulai',
      k5: 'Belum Mulai',
      k6: 'Proses',
      k7: 'Belum Mulai',
      k8: 'Belum Mulai'
    }
  },
  {
    id: 'prodi-5',
    name: 'S1 Perbankan Syariah',
    code: '61205',
    faculty: 'Fakultas Ekonomi & Bisnis',
    level: 'S1',
    lam: 'LAMEMBA',
    accreditationStatus: 'Unggul',
    skNumber: '4589/SK/LAMEMBA/Akred/S/X/2025',
    expiryDate: '2030-10-25',
    profile: {
      kaprodi: 'Dr. Hendra Wijaya, S.E., M.Si.',
      phone: '0812-3456-0005',
      email: 'pbs@kampus.ac.id',
      description: 'Mengembangkan kompetensi dalam operasional perbankan syariah, analisis pembiayaan, kepatuhan syariah (syariah compliance), serta analisis pasar keuangan syariah.',
      vision: 'Menjadi kiblat pendidikan tinggi perbankan syariah yang inovatif, berdaya saing internasional, dan mengedepankan integritas moral.',
      mission: [
        'Melaksanakan kurikulum perbankan syariah berbasis kompetensi sertifikasi profesi.',
        'Mengembangkan kajian ilmiah terkait manajemen risiko perbankan tanpa riba.',
        'Mengadakan pendampingan pengajuan pembiayaan halal bagi pelaku UMKM.'
      ]
    },
    documents: {
      led: { status: 'Final', lastUpdated: '2025-08-12', fileName: 'LED_PerbankanSyariah_Final.pdf' },
      lkps: { status: 'Final', lastUpdated: '2025-08-15', fileName: 'LKPS_PerbankanSyariah_Selesai.xlsx' },
      legalitas: { status: 'Final', lastUpdated: '2024-02-18', fileName: 'SK_Izin_PBS_Kemenag.pdf' }
    },
    criteriaProgress: {
      k1: 'Siap',
      k2: 'Siap',
      k3: 'Siap',
      k4: 'Siap',
      k5: 'Siap',
      k6: 'Siap',
      k7: 'Siap',
      k8: 'Siap'
    }
  },
  {
    id: 'prodi-6',
    name: 'S1 Ekonomi Syariah',
    code: '61202',
    faculty: 'Fakultas Ekonomi & Bisnis',
    level: 'S1',
    lam: 'LAMEMBA',
    accreditationStatus: 'Baik Sekali',
    skNumber: '0912/SK/LAMEMBA/Akred/S/XII/2024',
    expiryDate: '2029-12-05',
    profile: {
      kaprodi: 'Siti Aminah, S.E.I., M.E.',
      phone: '0812-3456-0006',
      email: 'eks@kampus.ac.id',
      description: 'Mengkaji teori ekonomi makro dan mikro Islam, zakat-wakaf (zakatology), serta kebijakan publik Islam guna mewujudkan keadilan distribusi kekayaan di masyarakat.',
      vision: 'Mencetak ekonom syariah yang berjiwa peneliti, berintegritas, dan inovatif dalam memecahkan isu kemiskinan umat.',
      mission: [
        'Menyelenggarakan proses belajar mengajar ekonomi syariah yang bernuansa riset empiris.',
        'Mempromosikan pengembangan model pengelolaan zakat dan wakaf produktif secara digital.',
        'Mengedukasi literasi keuangan syariah kepada kelompok masyarakat ekonomi bawah.'
      ]
    },
    documents: {
      led: { status: 'Final', lastUpdated: '2024-11-10', fileName: 'LED_EkonomiSyariah_Final.pdf' },
      lkps: { status: 'Final', lastUpdated: '2024-11-15', fileName: 'LKPS_EkonomiSyariah_Revisi.xlsx' },
      legalitas: { status: 'Final', lastUpdated: '2022-01-20', fileName: 'Izin_Kemenag_EkonomiSyariah.pdf' }
    },
    criteriaProgress: {
      k1: 'Siap',
      k2: 'Siap',
      k3: 'Siap',
      k4: 'Siap',
      k5: 'Siap',
      k6: 'Siap',
      k7: 'Siap',
      k8: 'Siap'
    }
  },
  {
    id: 'prodi-7',
    name: 'S1 Manajemen Bisnis Syariah',
    code: '61207',
    faculty: 'Fakultas Ekonomi & Bisnis',
    level: 'S1',
    lam: 'LAMEMBA',
    accreditationStatus: 'Baik',
    skNumber: '1287/SK/LAMEMBA/Akred/S/IV/2026',
    expiryDate: '2027-04-18',
    profile: {
      kaprodi: 'Budi Santoso, S.E., M.M.',
      phone: '0812-3456-0007',
      email: 'mbs@kampus.ac.id',
      description: 'Fokus pada penanaman jiwa kewirausahaan Islam (preneurship), strategi pemasaran beretika syariah, serta tata kelola rantai pasok industri halal.',
      vision: 'Menjadi wadah pencetak wirausahawan muslim berdaya saing tinggi yang adaptif dengan ekosistem ekonomi digital.',
      mission: [
        'Menyediakan inkubasi bisnis praktis syariah bagi pengembangan start-up mahasiswa.',
        'Meneliti dinamika perilaku konsumen muslim dan tren pasar industri halal dunia.',
        'Mengadakan program bakti bisnis untuk pendampingan digital branding UMKM lokal.'
      ]
    },
    documents: {
      led: { status: 'Draf', lastUpdated: '2026-06-25', fileName: 'Draf_LED_MBS_V1.docx' },
      lkps: { status: 'Belum Ada', lastUpdated: '-', fileName: '' },
      legalitas: { status: 'Final', lastUpdated: '2023-04-15', fileName: 'SK_Izin_MBS.pdf' }
    },
    criteriaProgress: {
      k1: 'Siap',
      k2: 'Proses',
      k3: 'Proses',
      k4: 'Belum Mulai',
      k5: 'Belum Mulai',
      k6: 'Proses',
      k7: 'Belum Mulai',
      k8: 'Belum Mulai'
    }
  },
  {
    id: 'prodi-8',
    name: 'S1 Komunikasi Penyiaran Islam',
    code: '70201',
    faculty: 'Fakultas Dakwah dan Komunikasi Islam',
    level: 'S1',
    lam: 'BAN-PT',
    accreditationStatus: 'Baik Sekali',
    skNumber: '2240/SK/BAN-PT/Akred/S/VII/2024',
    expiryDate: '2029-07-30',
    profile: {
      kaprodi: 'Rahmat Hidayat, S.Sos., M.I.Kom.',
      phone: '0812-3456-0008',
      email: 'kpi@kampus.ac.id',
      description: 'Mempersiapkan jurnalis muslim, produser konten media kreatif, dan praktisi penyiaran radio/TV/podcasting yang memiliki landasan dakwah moral luhur.',
      vision: 'Menjadi pionir program studi komunikasi penyiaran Islam berbasis multimedia digital dan penyiaran kreatif.',
      mission: [
        'Menyelenggarakan pendidikan jurnalistik dan produksi penyiaran Islam berkualitas profesional.',
        'Melakukan penelitian terkait opini publik dan literasi bermedia sosial yang sehat.',
        'Memberikan pelatihan teknik public speaking dan kreasi video dakwah sehat bagi remaja.'
      ]
    },
    documents: {
      led: { status: 'Final', lastUpdated: '2024-05-18', fileName: 'LED_KPI_2024.pdf' },
      lkps: { status: 'Draf', lastUpdated: '2024-05-20', fileName: 'Draf_LKPS_KPI.xlsx' },
      legalitas: { status: 'Final', lastUpdated: '2022-09-10', fileName: 'Izin_Operasional_KPI.pdf' }
    },
    criteriaProgress: {
      k1: 'Siap',
      k2: 'Siap',
      k3: 'Siap',
      k4: 'Proses',
      k5: 'Proses',
      k6: 'Siap',
      k7: 'Proses',
      k8: 'Proses'
    }
  },
  {
    id: 'prodi-9',
    name: 'S1 Manajemen Dakwah',
    code: '70202',
    faculty: 'Fakultas Dakwah dan Komunikasi Islam',
    level: 'S1',
    lam: 'BAN-PT',
    accreditationStatus: 'Baik',
    skNumber: '3110/SK/BAN-PT/Akred/S/IX/2023',
    expiryDate: '2028-09-14',
    profile: {
      kaprodi: 'Drs. H. Mulyadi, M.A.',
      phone: '0812-3456-0009',
      email: 'md@kampus.ac.id',
      description: 'Membekali lulusan dengan kemampuan mengelola lembaga dakwah, yayasan sosial keagamaan, travel haji-umroh, serta manajemen pariwisata religi profesional.',
      vision: 'Menjadi program studi terdepan dalam tata kelola manajemen lembaga dakwah dan wisata syariah di tingkat regional.',
      mission: [
        'Melaksanakan perkuliahan tata kelola dakwah, administrasi haji/umrah, dan organisasi nirlaba.',
        'Meneliti model-model manajemen pemberdayaan masyarakat berbasis masjid dan baitul mal.',
        'Mengadakan pembekalan teknik pengelolaan kepemimpinan remaja masjid secara intensif.'
      ]
    },
    documents: {
      led: { status: 'Draf', lastUpdated: '2026-06-15', fileName: 'Draf_LED_MD_2026.docx' },
      lkps: { status: 'Belum Ada', lastUpdated: '-', fileName: '' },
      legalitas: { status: 'Final', lastUpdated: '2022-04-12', fileName: 'Izin_Kemenag_MD.pdf' }
    },
    criteriaProgress: {
      k1: 'Siap',
      k2: 'Proses',
      k3: 'Proses',
      k4: 'Belum Mulai',
      k5: 'Belum Mulai',
      k6: 'Proses',
      k7: 'Belum Mulai',
      k8: 'Belum Mulai'
    }
  },
  {
    id: 'prodi-10',
    name: 'S1 Administrasi Publik',
    code: '63201',
    faculty: 'Fakultas Umum',
    level: 'S1',
    lam: 'BAN-PT',
    accreditationStatus: 'Baik Sekali',
    skNumber: '1012/SK/BAN-PT/Akred/S/VI/2024',
    expiryDate: '2029-06-20',
    profile: {
      kaprodi: 'Dr. H. Hendrawan, M.Si.',
      phone: '0812-3456-0010',
      email: 'ap@kampus.ac.id',
      description: 'Membentuk analis kebijakan publik, administrator pemerintahan, dan manajer organisasi nirlaba yang berintegritas tinggi serta adaptif terhadap transformasi digital sektor publik.',
      vision: 'Menjadi program studi administrasi publik yang unggul dalam tata kelola pemerintahan digital di tingkat nasional pada tahun 2030.',
      mission: [
        'Menyelenggarakan pendidikan administrasi negara/publik yang responsif dan berbasis teknologi.',
        'Mengembangkan riset kebijakan publik inovatif untuk perbaikan pelayanan masyarakat.',
        'Melaksanakan pengabdian kepada instansi pemerintahan daerah dalam optimalisasi e-government.'
      ]
    },
    documents: {
      led: { status: 'Final', lastUpdated: '2025-02-12', fileName: 'LED_AP_Final_2025.pdf' },
      lkps: { status: 'Final', lastUpdated: '2025-02-15', fileName: 'LKPS_AP_Revisi_2.xlsx' },
      legalitas: { status: 'Final', lastUpdated: '2023-01-15', fileName: 'SK_Izin_AP.pdf' }
    },
    criteriaProgress: {
      k1: 'Siap',
      k2: 'Siap',
      k3: 'Siap',
      k4: 'Siap',
      k5: 'Siap',
      k6: 'Siap',
      k7: 'Siap',
      k8: 'Siap'
    }
  },
  {
    id: 'prodi-11',
    name: 'S1 Administrasi Kesehatan',
    code: '13262',
    faculty: 'Fakultas Umum',
    level: 'S1',
    lam: 'LAM-PTKes',
    accreditationStatus: 'Baik',
    skNumber: '0412/SK/LAM-PTKes/Akred/S/X/2025',
    expiryDate: '2030-10-15',
    profile: {
      kaprodi: 'Farida Ariyani, S.KM., M.Kes.',
      phone: '0812-3456-0011',
      email: 'ak@kampus.ac.id',
      description: 'Mempersiapkan tenaga pengelola administrasi rumah sakit, puskesmas, asuransi kesehatan, serta instansi kesehatan lainnya dengan standar mutu manajemen kesehatan modern.',
      vision: 'Menghasilkan administrator kesehatan yang profesional, unggul dalam manajemen sistem informasi kesehatan nasional pada tahun 2029.',
      mission: [
        'Menyelenggarakan proses pembelajaran administrasi kesehatan berbasis kompetensi industri pelayanan medis.',
        'Mendorong penelitian sistem rujukan kesehatan masyarakat dan efisiensi operasional faskes.',
        'Mengadakan penyuluhan literasi jaminan kesehatan bagi masyarakat pedesaan sekitar.'
      ]
    },
    documents: {
      led: { status: 'Draf', lastUpdated: '2026-06-18', fileName: 'Draf_LED_Adkes_v1.docx' },
      lkps: { status: 'Belum Ada', lastUpdated: '-', fileName: '' },
      legalitas: { status: 'Final', lastUpdated: '2024-05-10', fileName: 'SK_Kemenkes_Izin_Adkes.pdf' }
    },
    criteriaProgress: {
      k1: 'Siap',
      k2: 'Proses',
      k3: 'Proses',
      k4: 'Belum Mulai',
      k5: 'Belum Mulai',
      k6: 'Proses',
      k7: 'Belum Mulai',
      k8: 'Belum Mulai'
    }
  },
  {
    id: 'prodi-12',
    name: 'S1 Administrasi Bisnis',
    code: '62201',
    faculty: 'Fakultas Umum',
    level: 'S1',
    lam: 'LAMEMBA',
    accreditationStatus: 'Unggul',
    skNumber: '2105/SK/LAMEMBA/Akred/S/II/2025',
    expiryDate: '2030-02-28',
    profile: {
      kaprodi: 'Drs. Supriatna, M.B.A.',
      phone: '0812-3456-0012',
      email: 'ab@kampus.ac.id',
      description: 'Fokus pada pengembangan keterampilan kewirausahaan korporasi, tata kelola bisnis internasional, analisis keuangan bisnis, serta manajemen strategis perusahaan.',
      vision: 'Menjadi kiblat utama pendidikan administrasi bisnis digital yang melahirkan intrapreneur berdaya saing global.',
      mission: [
        'Melaksanakan kurikulum administrasi bisnis berbasis studi kasus riil korporasi.',
        'Mengembangkan riset inovasi model bisnis baru dan kelayakan investasi pasar berkembang.',
        'Memberikan layanan inkubator bisnis untuk akselerasi pertumbuhan UMKM binaan.'
      ]
    },
    documents: {
      led: { status: 'Final', lastUpdated: '2025-01-10', fileName: 'LED_AB_Final.pdf' },
      lkps: { status: 'Final', lastUpdated: '2025-01-12', fileName: 'LKPS_AB_Selesai.xlsx' },
      legalitas: { status: 'Final', lastUpdated: '2023-08-20', fileName: 'Izin_Operasional_AB.pdf' }
    },
    criteriaProgress: {
      k1: 'Siap',
      k2: 'Siap',
      k3: 'Siap',
      k4: 'Siap',
      k5: 'Siap',
      k6: 'Siap',
      k7: 'Siap',
      k8: 'Siap'
    }
  },
  {
    id: 'prodi-13',
    name: 'S1 Bisnis Digital',
    code: '62202',
    faculty: 'Fakultas Umum',
    level: 'S1',
    lam: 'LAMEMBA',
    accreditationStatus: 'Baik',
    skNumber: '1102/SK/LAMEMBA/Akred/S/VIII/2026',
    expiryDate: '2027-08-14',
    profile: {
      kaprodi: 'Ir. Rian Hermawan, M.M.',
      phone: '0812-3456-0013',
      email: 'bd@kampus.ac.id',
      description: 'Mengkombinasikan ilmu manajemen bisnis dengan keahlian teknologi digital seperti e-commerce, digital marketing, analisis data besar (big data), serta finansial teknologi (fintech).',
      vision: 'Mencetak inovator bisnis digital yang kreatif, tangguh, dan mampu menciptakan start-up digital skala nasional.',
      mission: [
        'Menyelenggarakan proses pembelajaran interdisipliner bisnis dan teknologi digital terkini.',
        'Mengadakan riset perilaku konsumen digital dan strategi pemasaran omnichannel.',
        'Membantu transformasi digitalisasi koperasi dan UMKM tradisional di wilayah sekitar.'
      ]
    },
    documents: {
      led: { status: 'Draf', lastUpdated: '2026-06-25', fileName: 'Draf_LED_BisnisDigital.docx' },
      lkps: { status: 'Belum Ada', lastUpdated: '-', fileName: '' },
      legalitas: { status: 'Final', lastUpdated: '2024-11-12', fileName: 'SK_Izin_BisnisDigital.pdf' }
    },
    criteriaProgress: {
      k1: 'Siap',
      k2: 'Proses',
      k3: 'Proses',
      k4: 'Belum Mulai',
      k5: 'Belum Mulai',
      k6: 'Proses',
      k7: 'Belum Mulai',
      k8: 'Belum Mulai'
    }
  },
  {
    id: 'prodi-14',
    name: 'S1 Informatika',
    code: '55201',
    faculty: 'Fakultas Umum',
    level: 'S1',
    lam: 'LAM INFOKOM',
    accreditationStatus: 'Baik Sekali',
    skNumber: '0315/SK/LAM-INFOKOM/Akred/S/III/2025',
    expiryDate: '2030-03-22',
    profile: {
      kaprodi: 'Novianti, S.Kom., M.T.I.',
      phone: '0812-3456-0014',
      email: 'if@kampus.ac.id',
      description: 'Mempelajari rekayasa perangkat lunak, sistem keamanan informasi, pengolahan data cerdas (data science), serta komputasi awan guna menghasilkan lulusan berdaya saing global.',
      vision: 'Menjadi pusat unggulan pendidikan teknologi informasi dan rekayasa perangkat lunak cerdas di tingkat nasional.',
      mission: [
        'Membekali mahasiswa dengan kemampuan pemrograman lanjut dan penguasaan arsitektur sistem.',
        'Mengembangkan riset kecerdasan buatan terapan untuk memecahkan problem masyarakat.',
        'Mengadakan pelatihan literasi keamanan siber dan pemanfaatan TI sehat di kalangan sekolah.'
      ]
    },
    documents: {
      led: { status: 'Final', lastUpdated: '2025-02-18', fileName: 'LED_Informatika_Final.pdf' },
      lkps: { status: 'Final', lastUpdated: '2025-02-20', fileName: 'LKPS_Informatika_Selesai.xlsx' },
      legalitas: { status: 'Final', lastUpdated: '2023-05-12', fileName: 'SK_Izin_Informatika.pdf' }
    },
    criteriaProgress: {
      k1: 'Siap',
      k2: 'Siap',
      k3: 'Siap',
      k4: 'Siap',
      k5: 'Siap',
      k6: 'Siap',
      k7: 'Siap',
      k8: 'Siap'
    }
  },
  {
    id: 'prodi-15',
    name: 'S1 Fisika',
    code: '45201',
    faculty: 'Fakultas Umum',
    level: 'S1',
    lam: 'LAMSAMA',
    accreditationStatus: 'Unggul',
    skNumber: '0711/SK/LAMSAMA/Akred/S/V/2025',
    expiryDate: '2030-05-18',
    profile: {
      kaprodi: 'Dr. Ahmad Fauzi, M.Si.',
      phone: '0812-3456-0015',
      email: 'fisika@kampus.ac.id',
      description: 'Mengembangkan pemahaman mendalam tentang konsep-konsep fisika material, instrumentasi elektronik, energi terbarukan, serta simulasi komputasi fisika modern.',
      vision: 'Menjadi program studi sains fisika terkemuka dalam pengembangan teknologi material maju dan energi baru terbarukan.',
      mission: [
        'Menyelenggarakan pendidikan fisika murni dan terapan berkualitas tinggi berbasis riset laboratorium.',
        'Mendorong penelitian inovatif terkait konversi energi dan karakterisasi material baru.',
        'Melakukan pengabdian melalui penyuluhan teknologi energi surya praktis bagi masyarakat pedesaan.'
      ]
    },
    documents: {
      led: { status: 'Final', lastUpdated: '2025-04-10', fileName: 'LED_Fisika_Final_2025.pdf' },
      lkps: { status: 'Final', lastUpdated: '2025-04-12', fileName: 'LKPS_Fisika_Final.xlsx' },
      legalitas: { status: 'Final', lastUpdated: '2023-10-15', fileName: 'SK_Izin_Fisika.pdf' }
    },
    criteriaProgress: {
      k1: 'Siap',
      k2: 'Siap',
      k3: 'Siap',
      k4: 'Siap',
      k5: 'Siap',
      k6: 'Siap',
      k7: 'Siap',
      k8: 'Siap'
    }
  }
];

const LOCAL_STORAGE_KEY = 'akrida_study_programs';

export function getStudyPrograms(): StudyProgram[] {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_STUDY_PROGRAMS));
    return INITIAL_STUDY_PROGRAMS;
  }
  try {
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed) || parsed.length !== INITIAL_STUDY_PROGRAMS.length) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_STUDY_PROGRAMS));
      return INITIAL_STUDY_PROGRAMS;
    }
    return parsed;
  } catch (error) {
    console.error('Error parsing study programs from localStorage', error);
    return INITIAL_STUDY_PROGRAMS;
  }
}

export function saveStudyPrograms(programs: StudyProgram[]): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(programs));
}
