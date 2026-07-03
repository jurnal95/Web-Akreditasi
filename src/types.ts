/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type LAMCluster = 'LAM INFOKOM' | 'LAMDIK' | 'LAMEMBA' | 'LAMSAMA' | 'LAM-PTKes' | 'BAN-PT';

export type AccreditationStatus = 'Unggul' | 'Baik Sekali' | 'Baik' | 'Terakreditasi' | 'Belum Terakreditasi';

export type DocStatus = 'Belum Ada' | 'Draf' | 'Final';

export type ProgressStatus = 'Belum Mulai' | 'Proses' | 'Siap';

export interface DocumentItem {
  status: DocStatus;
  lastUpdated: string;
  fileName?: string;
  fileUrl?: string;
}

export interface DocChecklist {
  led: DocumentItem;       // Laporan Evaluasi Diri
  lkps: DocumentItem;      // Laporan Kinerja Program Studi
  legalitas: DocumentItem; // Surat Pengantar & Izin Operasional
}

export interface CriteriaProgress {
  k1: ProgressStatus; // Visi, Misi, Tujuan, dan Strategi
  k2: ProgressStatus; // Tata Pamong, Tata Kelola, dan Kerjasama
  k3: ProgressStatus; // Mahasiswa
  k4: ProgressStatus; // Sumber Daya Manusia
  k5: ProgressStatus; // Keuangan, Sarana, dan Prasarana
  k6: ProgressStatus; // Pendidikan / Kurikulum
  k7: ProgressStatus; // Penelitian & Publikasi
  k8: ProgressStatus; // Pengabdian kepada Masyarakat & Luaran
}

export interface StudyProgram {
  id: string;
  name: string;
  code: string;
  faculty: string;
  level: string;
  lam: LAMCluster;
  accreditationStatus: AccreditationStatus;
  skNumber: string;
  expiryDate: string;
  profile: {
    kaprodi: string;
    phone: string;
    email: string;
    description: string;
    vision: string;
    mission: string[];
  };
  documents: DocChecklist;
  criteriaProgress: CriteriaProgress;
}

export interface UserSession {
  username: string;
  role: 'superadmin' | 'adminprodi';
  prodiId?: string; // Only for adminprodi
  name: string;
}

export interface LAMCharacteristic {
  name: string;
  focus: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  criteriaNames: {
    k1: string;
    k2: string;
    k3: string;
    k4: string;
    k5: string;
    k6: string;
    k7: string;
    k8: string;
  };
}
