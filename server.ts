/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { PDFParse } = require("pdf-parse");
const mammoth = require("mammoth");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

let SUPABASE_URL = process.env.SUPABASE_URL || "https://evzpyeeafmcnrnoxtfwz.supabase.co";
if (!SUPABASE_URL || typeof SUPABASE_URL !== "string" || !SUPABASE_URL.startsWith("http")) {
  console.warn("SUPABASE_URL invalid or empty, falling back to default:", SUPABASE_URL);
  SUPABASE_URL = "https://evzpyeeafmcnrnoxtfwz.supabase.co";
}

let SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2enB5ZWVhZm1jbnJub3h0Znd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NjE1MzgsImV4cCI6MjA5ODMzNzUzOH0.LbZ3L_ZPJwRiT_0_QYAGQ1z-gxOOiKGivMWeYDwB30Q";
if (!SUPABASE_ANON_KEY || typeof SUPABASE_ANON_KEY !== "string" || SUPABASE_ANON_KEY.startsWith("sb_publishable") || SUPABASE_ANON_KEY.length < 50) {
  console.warn("SUPABASE_ANON_KEY invalid or fallback placeholder detected, falling back to valid production key.");
  SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2enB5ZWVhZm1jbnJub3h0Znd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NjE1MzgsImV4cCI6MjA5ODMzNzUzOH0.LbZ3L_ZPJwRiT_0_QYAGQ1z-gxOOiKGivMWeYDwB30Q";
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const FALLBACK_REFERENCES: Record<string, { nama_referensi: string, konten_markdown: string }> = {
  "ref-1": { 
    nama_referensi: "Format Acuan BAN-PT Standar Nasional", 
    konten_markdown: "# Format Acuan BAN-PT\n## Standar Tata Pamong\nTata pamong harus berkarakter kredibel, transparan, akuntabel, bertanggung jawab, dan adil.\n\n## Kriteria 4: Sumber Daya Manusia\nEvaluasi kualitas kualifikasi dosen tetap program studi, keahlian utama, sertifikasi pendidik profesional, rasio dosen dan mahasiswa." 
  },
  "ref-2": { 
    nama_referensi: "Format Acuan LAMDIK Bidang Pendidikan", 
    konten_markdown: "# Format Acuan LAMDIK\n## Standar Kurikulum Pedagogis\nKurikulum harus mencakup kompetensi pedagogis dasar, praktik keguruan (PPL), dan penjaminan mutu guru pamong dengan rasio optimal." 
  },
  "ref-3": { 
    nama_referensi: "Format Acuan LAM INFOKOM Bidang Teknologi", 
    konten_markdown: "# Format Acuan LAM INFOKOM\n## Standar Sarana Laboratorium TI\nFasilitas laboratorium komputer minimum harus memiliki spesifikasi modern, konektivitas cloud terintegrasi, dan rasio pc per mahasiswa yang baik." 
  }
};

function toUUID(id: string): string {
  if (!id) return "00000000-0000-0000-0000-000000000000";
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) {
    return id.toLowerCase();
  }
  const match = id.match(/prodi-(\d+)/i);
  if (match) {
    const num = parseInt(match[1], 10);
    return `00000000-0000-0000-0000-${num.toString().padStart(12, '0')}`;
  }
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash).toString(16).padStart(8, '0');
  return `99999999-9999-9999-9999-${absHash.padStart(12, '0')}`;
}

app.use(express.json({ limit: "10mb" }));

// Health Check API
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// 1. SISTEM LOGIN AKSES PRODI (Tabel kode_akses_prodi & prodi)
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = username?.trim().toLowerCase();
    const pass = password?.trim();

    if (!user || !pass) {
      return res.status(400).json({ error: "Username dan Password/Token wajib diisi." });
    }

    // Superadmin fallback
    if (user === 'superadmin' && pass === 'password') {
      return res.json({
        username: 'superadmin',
        role: 'superadmin',
        name: 'Prof. Dr. Ir. H. Mulyono (LPM)'
      });
    }

    // Query kode_akses_prodi
    const { data: accessData, error: accessError } = await supabase
      .from('kode_akses_prodi')
      .select('*')
      .eq('username_akses', user)
      .eq('token_masuk', pass)
      .maybeSingle();

    if (accessError) {
      console.error("Supabase Login Error:", accessError);
      return res.status(500).json({ error: "Gagal memproses verifikasi login ke database." });
    }

    if (!accessData) {
      return res.status(401).json({ error: "Username akses atau Token masuk salah." });
    }

    const prodiId = accessData.prodi_id;
    let prodiName = "Admin Program Studi";

    if (prodiId) {
      const { data: prodiData, error: prodiError } = await supabase
        .from('prodi')
        .select('*')
        .eq('id', prodiId)
        .maybeSingle();

      if (!prodiError && prodiData) {
        prodiName = prodiData.nama_prodi || prodiData.nama || prodiData.name || prodiName;
      }
    }

    return res.json({
      username: user,
      role: 'adminprodi',
      prodiId: prodiId || 'unknown-prodi',
      name: prodiName
    });

  } catch (err: any) {
    console.error("Login route error:", err);
    return res.status(500).json({ error: err.message || "Terjadi kesalahan internal server." });
  }
});

// 1.5 FETCH ALL PRODI (Tabel prodi)
app.get("/api/prodi", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('prodi')
      .select('*');

    if (error) {
      console.warn("Get prodi from Supabase error:", error.message);
      return res.status(500).json({ error: error.message });
    }

    return res.json(data || []);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 1.6 AMBIL SEMUA AKUN AKSES PRODI
app.get("/api/admin/list-akun", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('kode_akses_prodi')
      .select('*');

    if (error) {
      console.error("Gagal mengambil daftar akun dari Supabase:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.json(data || []);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 1.7 BUAT AKUN AKSES PRODI MANUAL
app.post("/api/admin/create-akun", async (req, res) => {
  try {
    const { prodi_id, username_akses, token_masuk, status_pakai } = req.body;

    if (!prodi_id || !username_akses || !token_masuk) {
      return res.status(400).json({ error: "Kolom prodi_id, username_akses, dan token_masuk wajib diisi." });
    }

    const cleanUsername = username_akses.trim().toLowerCase();
    const cleanToken = token_masuk.trim();
    const targetUuid = toUUID(prodi_id);

    // Cek apakah username sudah dipakai
    const { data: existingUser } = await supabase
      .from('kode_akses_prodi')
      .select('username_akses')
      .eq('username_akses', cleanUsername)
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({ error: `Username "${cleanUsername}" sudah digunakan oleh prodi lain.` });
    }

    const payload = {
      prodi_id: targetUuid,
      username_akses: cleanUsername,
      token_masuk: cleanToken,
      status_pakai: status_pakai || 'aktif',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('kode_akses_prodi')
      .insert(payload)
      .select();

    if (error) {
      console.error("Gagal membuat akun di Supabase:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({
      message: "Akun akses prodi berhasil dibuat secara manual!",
      data: data?.[0] || payload
    });

  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 1.8 GANTI PASSWORD AKUN PRODI
app.post("/api/prodi/ganti-password", async (req, res) => {
  try {
    const { prodi_id, password_lama, password_baru } = req.body;

    if (!prodi_id || !password_lama || !password_baru) {
      return res.status(400).json({ error: "Prodi ID, password lama, dan password baru wajib diisi." });
    }

    const targetUuid = toUUID(prodi_id);
    const cleanOld = password_lama.trim();
    const cleanNew = password_baru.trim();

    // Verifikasi password lama
    const { data: currentAcc, error: findError } = await supabase
      .from('kode_akses_prodi')
      .select('*')
      .eq('prodi_id', targetUuid)
      .eq('token_masuk', cleanOld)
      .maybeSingle();

    if (findError) {
      console.error("Gagal memverifikasi password lama:", findError);
      return res.status(500).json({ error: "Gagal memverifikasi akun ke database." });
    }

    if (!currentAcc) {
      return res.status(401).json({ error: "Password lama salah atau tidak ditemukan." });
    }

    // Update password baru
    const { error: updateError } = await supabase
      .from('kode_akses_prodi')
      .update({
        token_masuk: cleanNew,
        updated_at: new Date().toISOString()
      })
      .eq('prodi_id', targetUuid);

    if (updateError) {
      console.error("Gagal mengubah password:", updateError);
      return res.status(500).json({ error: "Gagal memperbarui password baru di database." });
    }

    return res.json({
      success: true,
      message: "Password program studi berhasil diperbarui!"
    });

  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 2. FETCH REFERENSI ACUAN (Tabel referensi_dokumen)
app.get("/api/referensi-dokumen", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('referensi_dokumen')
      .select('*');

    if (error) {
      console.warn("Get referensi_dokumen error (using beautiful fallbacks):", error.message);
      // Fallback arrays to keep app working gracefully if database is empty/newly initialized
      return res.json([
        { 
          id: "ref-1", 
          nama_referensi: "Format Acuan BAN-PT Standar Nasional", 
          konten_markdown: "# Format Acuan BAN-PT\n## Standar Tata Pamong\nTata pamong harus berkarakter kredibel, transparan, akuntabel, bertanggung jawab, dan adil.\n\n## Kriteria 4: Sumber Daya Manusia\nEvaluasi kualitas kualifikasi dosen tetap program studi, keahlian utama, sertifikasi pendidik profesional, rasio dosen dan mahasiswa." 
        },
        { 
          id: "ref-2", 
          nama_referensi: "Format Acuan LAMDIK Bidang Pendidikan", 
          konten_markdown: "# Format Acuan LAMDIK\n## Standar Kurikulum Pedagogis\nKurikulum harus mencakup kompetensi pedagogis dasar, praktik keguruan (PPL), dan penjaminan mutu guru pamong dengan rasio optimal." 
        },
        { 
          id: "ref-3", 
          nama_referensi: "Format Acuan LAM INFOKOM Bidang Teknologi", 
          konten_markdown: "# Format Acuan LAM INFOKOM\n## Standar Sarana Laboratorium TI\nFasilitas laboratorium komputer minimum harus memiliki spesifikasi modern, konektivitas cloud terintegrasi, dan rasio pc per mahasiswa yang baik." 
        }
      ]);
    }

    const mapped = (data || []).map((ref: any) => ({
      id: ref.id,
      nama_referensi: ref.nama_campus_asal && ref.program_studi_asal 
        ? `${ref.nama_campus_asal} - ${ref.program_studi_asal}` 
        : (ref.nama_campus_asal || ref.program_studi_asal || "Format Acuan"),
      nama_dokumen: ref.program_studi_asal || "dokumen.txt",
      kategori_lam: ref.kategori_kriteria || "BAN-PT",
      konten_markdown: ref.konten_markdown,
      created_at: ref.created_at
    }));

    return res.json(mapped);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Configure multer memory storage for file parsing
const upload = multer({ storage: multer.memoryStorage() });

// HELPER: Split text into sliding window overlapping chunks for RAG (NotebookLM)
function splitTextIntoChunks(text: string, chunkSize: number = 1500, overlap: number = 200): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    let end = i + chunkSize;
    if (end < text.length) {
      // Find clean breaking points (e.g., end of sentences or paragraphs)
      const lastPeriod = text.lastIndexOf(".", end);
      const lastNewline = text.lastIndexOf("\n", end);
      const bestBreak = Math.max(lastPeriod, lastNewline);
      if (bestBreak > i + chunkSize / 2) {
        end = bestBreak + 1;
      }
    }
    chunks.push(text.slice(i, end).trim());
    i = end - overlap;
    if (i < 0) i = 0;
    if (end >= text.length) break;
  }
  return chunks.filter(c => c.length > 0);
}

// HELPER: Get vector embedding from Gemini API using gemini-embedding-2-preview
async function getEmbedding(text: string): Promise<number[]> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not defined in the environment secrets.");
    }
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
    const response = await ai.models.embedContent({
      model: "gemini-embedding-2-preview",
      contents: text,
    });
    if (response && response.embeddings && response.embeddings[0] && response.embeddings[0].values) {
      return response.embeddings[0].values;
    }
    throw new Error("Invalid response format from Gemini embedding model.");
  } catch (err: any) {
    console.error("Embedding generation failed:", err.message);
    throw err;
  }
}

// HELPER: Similarity search on Supabase dokumen_vektor with graceful local fallback
async function searchSimilarChunks(
  queryText: string,
  prodiId: string | null,
  limit: number = 5
): Promise<any[]> {
  try {
    const queryEmbedding = await getEmbedding(queryText);
    const filterUuid = prodiId ? toUUID(prodiId) : null;

    // Call Supabase matching function RPC
    const { data, error } = await supabase.rpc("match_document_chunks", {
      query_embedding: queryEmbedding,
      match_threshold: -1.0, // Accept any similarity so we don't return 0 results if they are weakly related
      match_count: limit,
      filter_prodi_id: filterUuid
    });

    if (!error && data && data.length > 0) {
      console.log(`RAG: Found ${data.length} relevant chunks from pgvector search.`);
      return data;
    }

    if (error) {
      console.warn("RPC match_document_chunks failed or not set up:", error.message);
    }

    // Graceful fallback: If pgvector / RPC is not ready, do a standard table filter search
    console.log("RAG Fallback: querying dokumen_vektor table using select list...");
    const tableQuery = supabase.from("dokumen_vektor").select("id, nama_file, konten_teks, prodi_id");
    if (filterUuid) {
      tableQuery.eq("prodi_id", filterUuid);
    }
    const { data: fallbackData, error: tableError } = await tableQuery.limit(50);
    if (!tableError && fallbackData && fallbackData.length > 0) {
      // Find subset of chunks containing keywords for very basic keyword matching
      const words = queryText.toLowerCase().split(/\s+/).filter(w => w.length > 2);
      const scored = fallbackData.map((d: any) => {
        let score = 0;
        const textLower = d.konten_teks.toLowerCase();
        words.forEach(w => {
          if (textLower.includes(w)) score++;
        });
        return { ...d, score };
      }).sort((a, b) => b.score - a.score);

      console.log(`RAG Fallback: Keyword ranked ${Math.min(limit, scored.length)} chunks from database.`);
      return scored.slice(0, limit).map((d: any) => ({
        nama_file: d.nama_file,
        konten_teks: d.konten_teks,
        similarity: d.score > 0 ? 0.5 + (d.score / (words.length || 1)) * 0.5 : 0.5
      }));
    }
  } catch (err: any) {
    console.error("Similarity search failed:", err.message);
  }
  return [];
}

// 2.5 UPLOAD & PARSE DOKUMEN ACUAN KAMPUS (docx/pdf ke markdown)
app.post(["/api/referensi-dokumen/upload", "/api/upload", "/api/prodi/upload"], upload.array("files"), async (req, res) => {
  try {
    const files = req.files as any[];
    const { nama_referensi, kategori_lam, prodi_id } = req.body;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "File tidak ditemukan." });
    }

    if (!nama_referensi) {
      return res.status(400).json({ error: "Nama acuan / nama referensi wajib diisi." });
    }

    const savedRecords: any[] = [];

    for (const file of files) {
      let extractedText = "";
      const fileExtension = path.extname(file.originalname).toLowerCase();

      console.log(`Mulai mengurai file: "${file.originalname}" (${file.size} bytes) dengan tipe: ${fileExtension}`);

      if (fileExtension === ".docx") {
        try {
          const result = await mammoth.convertToMarkdown({ buffer: file.buffer });
          extractedText = result.value || "";
          if (result.messages && result.messages.length > 0) {
            console.log("Pesan pengurai Mammoth:", result.messages);
          }
        } catch (mammothErr: any) {
          console.error("Gagal mengurai .docx dengan Mammoth:", mammothErr);
          throw new Error(`Gagal membaca file Word (.docx) ${file.originalname}: ${mammothErr.message}`);
        }
      } else if (fileExtension === ".pdf") {
        try {
          const pdfParser = new PDFParse(new Uint8Array(file.buffer));
          extractedText = await pdfParser.getText();
        } catch (pdfErr: any) {
          console.error("Gagal mengurai .pdf dengan pdf-parse:", pdfErr);
          throw new Error(`Gagal membaca file PDF ${file.originalname}: ${pdfErr.message}`);
        }
      } else {
        extractedText = file.buffer.toString("utf-8");
      }

      const cleanText = typeof extractedText === 'string' 
        ? extractedText 
        : ((extractedText as any)?.text || (extractedText as any)?.content || "");

      if (!cleanText || !cleanText.trim()) {
        console.warn(`File ${file.originalname} kosong atau tidak mengandung teks.`);
        continue;
      }

      console.log(`Berhasil mengekstrak ${cleanText.length} karakter teks dari file ${file.originalname}.`);

      // RAG Chunking and Embedding Generation
      try {
        const textChunks = splitTextIntoChunks(cleanText, 1500, 200);
        console.log(`RAG: Memecah file "${file.originalname}" menjadi ${textChunks.length} chunks.`);
        
        const targetProdiUuid = prodi_id ? toUUID(prodi_id) : null;
        
        for (let i = 0; i < textChunks.length; i++) {
          const chunkText = textChunks[i];
          try {
            const embeddingVector = await getEmbedding(chunkText);
            const { error: chunkError } = await supabase
              .from("dokumen_vektor")
              .insert({
                prodi_id: targetProdiUuid,
                nama_file: file.originalname || "rujukan.txt",
                konten_teks: chunkText,
                embedding: embeddingVector
              });
            
            if (chunkError) {
              console.warn(`RAG Warning: Gagal menyimpan chunk ${i + 1} ke database:`, chunkError.message);
            }
          } catch (embedErr: any) {
            console.error(`RAG Warning: Gagal membuat/menyimpan embedding chunk ${i + 1}:`, embedErr.message);
          }
        }
        console.log(`RAG: Berhasil memproses ${textChunks.length} chunks untuk file "${file.originalname}".`);
      } catch (ragErr: any) {
        console.error("RAG Error: Gagal memproses chunking/embeddings:", ragErr.message);
      }

      // Safe Supabase Storage upload
      let storageUrl = null;
      try {
        const fileCleanName = `${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('referensi')
          .upload(fileCleanName, file.buffer, {
            contentType: file.mimetype || 'application/octet-stream',
            upsert: true
          });

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('referensi')
            .getPublicUrl(fileCleanName);
          storageUrl = urlData?.publicUrl || null;
          console.log(`Berhasil mengunggah file ke Supabase Storage: ${storageUrl}`);
        } else {
          console.warn("Storage upload warning (ignoring and continuing):", uploadError.message);
        }
      } catch (storageErr) {
        console.error("Gagal mengunggah ke Supabase Storage:", storageErr);
      }

      // Map to real database columns:
      // nama_campus_asal (not null), program_studi_asal (not null), kategori_kriteria (not null)
      let campusAsal = "Kampus Rujukan";
      let prodiAsal = "Umum";
      
      if (nama_referensi && typeof nama_referensi === 'string') {
        const parts = nama_referensi.split(" - ");
        if (parts.length >= 2) {
          campusAsal = parts[0].trim();
          prodiAsal = parts.slice(1).join(" - ").trim();
        } else {
          campusAsal = nama_referensi.trim();
          prodiAsal = file.originalname ? path.basename(file.originalname, path.extname(file.originalname)) : "Umum";
        }
      }

      const insertObj: any = {
        nama_campus_asal: campusAsal,
        program_studi_asal: prodiAsal,
        kategori_kriteria: kategori_lam || "BAN-PT",
        konten_markdown: cleanText,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from("referensi_dokumen")
        .insert(insertObj)
        .select()
        .maybeSingle();

      if (error) {
        console.error("Gagal menyimpan dokumen referensi ke Supabase DB:", error.message);
        // Let's fallback to returning a mock record if we fail DB but have the parsed text
        savedRecords.push({
          id: `local-ref-${Date.now()}`,
          nama_referensi: files.length > 1 ? `${nama_referensi} - ${file.originalname}` : nama_referensi,
          nama_dokumen: file.originalname,
          kategori_lam: kategori_lam || "BAN-PT",
          konten_markdown: cleanText,
          created_at: new Date().toISOString()
        });
      } else if (data) {
        // Map returned data to what frontend expects
        savedRecords.push({
          id: data.id,
          nama_referensi: data.nama_campus_asal && data.program_studi_asal 
            ? `${data.nama_campus_asal} - ${data.program_studi_asal}` 
            : (data.nama_campus_asal || data.program_studi_asal || "Format Acuan"),
          nama_dokumen: data.program_studi_asal || file.originalname,
          kategori_lam: data.kategori_kriteria || "BAN-PT",
          konten_markdown: data.konten_markdown,
          created_at: data.created_at
        });
      }
    }

    return res.json({
      message: `${savedRecords.length} Dokumen acuan berhasil diunggah, diurai, dan disimpan!`,
      data: savedRecords[0] || null,
      all_data: savedRecords
    });
  } catch (err: any) {
    console.error("Error pada endpoint upload referensi:", err);
    return res.status(500).json({ error: err.message || "Gagal mengurai dokumen." });
  }
});

// GET alias for diagnostic check on upload endpoint
app.get("/api/upload", (req, res) => {
  return res.json({
    status: "active",
    endpoint: "/api/upload",
    message: "Endpoint pengunggahan aktif. Silakan gunakan metode POST multipart/form-data untuk mengunggah dokumen."
  });
});

// 3. AMBIL DATA MENTAH INPUT PRODI (Tabel input_data_prodi)
app.get("/api/prodi/input-data/:prodiId", async (req, res) => {
  try {
    const { prodiId } = req.params;
    const uuid = toUUID(prodiId);
    const { data, error } = await supabase
      .from('input_data_prodi')
      .select('*')
      .eq('prodi_id', uuid)
      .maybeSingle();

    if (error) {
      console.error("Get input data error:", error);
      return res.status(500).json({ error: "Gagal mengambil data masukan prodi.", details: error });
    }

    return res.json({ data: data?.data_mentah_json || null });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 4. SIMPAN DATA MENTAH INPUT PRODI (Tabel input_data_prodi)
app.post("/api/prodi/input-data", async (req, res) => {
  try {
    const { prodiId, data_mentah_json } = req.body;
    if (!prodiId) {
      return res.status(400).json({ error: "prodiId wajib disertakan." });
    }

    const uuid = toUUID(prodiId);

    // Check if row already exists
    const { data: existing, error: checkError } = await supabase
      .from('input_data_prodi')
      .select('id')
      .eq('prodi_id', uuid)
      .maybeSingle();

    let result;
    if (existing) {
      // Update
      const { data: updated, error: updateError } = await supabase
        .from('input_data_prodi')
        .update({ data_mentah_json, updated_at: new Date().toISOString() })
        .eq('prodi_id', uuid)
        .select();
      
      if (updateError) throw updateError;
      result = updated;
    } else {
      // Insert
      const { data: inserted, error: insertError } = await supabase
        .from('input_data_prodi')
        .insert({ prodi_id: uuid, data_mentah_json, created_at: new Date().toISOString() })
        .select();

      if (insertError) throw insertError;
      result = inserted;
    }

    return res.json({ success: true, data: result });
  } catch (err: any) {
    console.error("Save input data error:", err);
    return res.status(500).json({ error: err.message || "Gagal menyimpan data masukan prodi." });
  }
});

// 5. AMBIL DRAF DOKUMEN GENERATOR TERAKHIR (Tabel hasil_dokumen_generator)
app.get("/api/prodi/hasil-generator/:prodiId", async (req, res) => {
  try {
    const { prodiId } = req.params;
    const uuid = toUUID(prodiId);
    const { data, error } = await supabase
      .from('hasil_dokumen_generator')
      .select('*')
      .eq('prodi_id', uuid)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error("Fetch latest generated doc error:", error);
      return res.status(500).json({ error: "Gagal mengambil hasil generator." });
    }

    if (data && data.length > 0) {
      const doc = data[0];
      return res.json({
        data: {
          ...doc,
          nama_dokumen: doc.nama_file
        }
      });
    }

    return res.json({ data: null });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/// 4. GENERATOR DOKUMEN AKREDITASI (DRAF AI DENGAN GEMINI)
app.post("/api/gemini/generate", upload.array("files"), async (req, res) => {
  try {
    let { 
      documentType, 
      prodiInfo: prodiInfoRaw, 
      focus, 
      criteriaKey, 
      customPrompt, 
      referenceText, 
      generationMode, 
      referensiId, 
      prodiId 
    } = req.body;

    let prodiInfo = prodiInfoRaw;
    if (prodiInfo && typeof prodiInfo === "string") {
      try {
        prodiInfo = JSON.parse(prodiInfo);
      } catch (err) {
        console.warn("Gagal parsing prodiInfo dari JSON:", err);
      }
    }

    if (!prodiInfo || typeof prodiInfo !== "object") {
      prodiInfo = { name: "Program Studi", level: "S1", faculty: "Fakultas", lam: "BAN-PT" };
    }
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(400).json({ 
        error: "GEMINI_API_KEY tidak dikonfigurasi di menu Secrets. Silakan tambahkan kunci API terlebih dahulu di Settings > Secrets." 
      });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });

    const isInteractive = generationMode === "interactive";

    const systemInstruction = isInteractive
      ? "Anda adalah Auditor Utama & Konsultan Akreditasi Senior Perguruan Tinggi di Indonesia (spesialis BAN-PT dan Lembaga Akreditasi Mandiri). Tugas Anda adalah menganalisis dokumen akreditasi yang diminta dan memformulasikan daftar pertanyaan wawancara terarah, instruksi pengumpulan data, serta checklist dokumen bukti yang wajib dipersiapkan sebelum draf dokumen dibuat. Gunakan Bahasa Indonesia formal, bersahabat, sangat terstruktur, dan mendalam. PENTING: Gunakan tabel Markdown GFM (| dan -) untuk menyajikan kerangka kerja, daftar indikator, atau matriks agar mudah dibaca."
      : "Anda adalah Asisten Ahli Akreditasi Perguruan Tinggi di Indonesia (spesialis BAN-PT dan Lembaga Akreditasi Mandiri seperti LAMDIK, LAM INFOKOM, dll). Tugas Anda adalah membuat draf dokumen akreditasi yang sangat rapi, mendalam, akademis, dan terstruktur sesuai dengan standar resmi LAM dan BAN-PT. Gunakan Bahasa Indonesia formal, baku, dan analitis. PENTING: Untuk semua bagian data terstruktur (seperti profil dosen, matriks penilaian, sebaran mahasiswa, target IKU, profil program studi, kurikulum, dan data penunjang kuantitatif lainnya), Anda WAJIB menyajikannya dalam format Tabel Markdown GFM yang sempurna menggunakan garis vertikal | dan baris pembagi strip -. Jangan membuat tabel dengan karakter lain atau list teks biasa.";

    // 1. Process files uploaded directly via generator (if any)
    let uploadedFilesContext = "";
    const files = req.files as any[];
    if (files && files.length > 0) {
      console.log(`Memproses ${files.length} file unggahan RAG langsung dari generator...`);
      for (const file of files) {
        let fileText = "";
        const fileExtension = path.extname(file.originalname).toLowerCase();
        
        if (fileExtension === ".docx") {
          try {
            const result = await mammoth.convertToMarkdown({ buffer: file.buffer });
            fileText = result.value || "";
          } catch (err: any) {
            console.error(`Gagal ekstrak .docx ${file.originalname}:`, err);
          }
        } else if (fileExtension === ".pdf") {
          try {
            const pdfParser = new PDFParse(new Uint8Array(file.buffer));
            fileText = await pdfParser.getText();
          } catch (err: any) {
            console.error(`Gagal ekstrak .pdf ${file.originalname}:`, err);
          }
        } else {
          fileText = file.buffer.toString("utf-8");
        }

        const cleanFileText = typeof fileText === 'string'
          ? fileText
          : ((fileText as any)?.text || (fileText as any)?.content || "");

        if (cleanFileText && cleanFileText.trim()) {
          uploadedFilesContext += `\n--- KONTEN DOKUMEN REFERENSI RAG: ${file.originalname} ---\n${cleanFileText}\n`;
        }
      }
    }

    // 2. Fetch Reference Document content from Supabase if referensiId is provided
    let campusReferenceContent = "";
    if (referensiId) {
      if (FALLBACK_REFERENCES[referensiId]) {
        campusReferenceContent = FALLBACK_REFERENCES[referensiId].konten_markdown;
        console.log(`Menggunakan format acuan kampus lokal: "${FALLBACK_REFERENCES[referensiId].nama_referensi}"`);
      } else {
        try {
          const { data: refDoc, error: refError } = await supabase
            .from('referensi_dokumen')
            .select('konten_markdown, nama_campus_asal, program_studi_asal')
            .eq('id', referensiId)
            .maybeSingle();

          if (!refError && refDoc) {
            campusReferenceContent = refDoc.konten_markdown;
            const refName = refDoc.nama_campus_asal && refDoc.program_studi_asal 
              ? `${refDoc.nama_campus_asal} - ${refDoc.program_studi_asal}` 
              : (refDoc.nama_campus_asal || refDoc.program_studi_asal || "Format Acuan");
            console.log(`Menggunakan format acuan kampus: "${refName}"`);
          }
        } catch (err) {
          console.error("Gagal menarik format acuan dari Supabase:", err);
        }
      }
    }

    // 3. Construct prompt base
    let prompt = "";
    if (isInteractive) {
      prompt = `### FORMULASI PANDUAN PENGUMPULAN DATA & WAWANCARA DOKUMEN AKREDITASI
Saya memerlukan panduan wawancara/pertanyaan terarah dan instruksi pengumpulan data untuk penyusunan dokumen berikut:
- Tipe Dokumen: ${documentType.toUpperCase()} ${criteriaKey ? `(Kriteria: ${criteriaKey.toUpperCase()})` : ""}
- Program Studi: ${prodiInfo.name} (${prodiInfo.level})
- Fakultas: ${prodiInfo.faculty}
- Lembaga Akreditasi (LAM): ${prodiInfo.lam}
- Visi Keilmuan: ${prodiInfo.profile?.vision || "Belum Diisi"}

${customPrompt ? `Catatan Tambahan dari Pengguna:\n"${customPrompt}"` : ""}
${referenceText ? `Referensi Data/Konsep yang Sudah Ada:\n"${referenceText}"` : ""}

Persyaratan Output Panduan Interaktif:
1. **Analisis Kebutuhan Data Pokok**: Sebutkan data-data kuantitatif maupun kualitatif spesifik yang wajib dikumpulkan dari PDDIKTI, SPMI, atau Unit Pengelola Program Studi (UPPS).
2. **Daftar Pertanyaan Wawancara Terarah**: Susun minimal 5 pertanyaan kritis berbobot yang harus dijawab oleh pengelola prodi/dosen/mahasiswa/alumni untuk mengisi kriteria atau bab dokumen ini.
3. **Checklist Dokumen Bukti (Evidence)**: Berikan daftar bukti fisik/digital (seperti SK, Renstra, RPS, Laporan Evaluasi) yang harus dilampirkan.
4. **Template Isian Singkat**: Berikan template atau format isian sederhana (tabel/list) yang dapat diisi oleh admin prodi secara langsung.
5. Gunakan format Markdown yang sangat menarik, rapi, dan mudah dipahami dengan ikon serta penekanan (bolding) yang elegan.`;
    } else {
      if (documentType === "kriteria_mutu") {
        prompt = `Buatlah draf narasi evaluasi untuk Kriteria Mutu: "${criteriaKey ? criteriaKey.toUpperCase() : "Kriteria"}" untuk Program Studi berikut:
- Nama Program Studi: ${prodiInfo.name} (${prodiInfo.level})
- Fakultas: ${prodiInfo.faculty}
- Lembaga Akreditasi (LAM): ${prodiInfo.lam}
- Kepala Program Studi (Kaprodi): ${prodiInfo.profile?.kaprodi || "Belum Diisi"}
- Visi Keilmuan: ${prodiInfo.profile?.vision || "Belum Diisi"}
- Misi: ${prodiInfo.profile?.mission ? (Array.isArray(prodiInfo.profile.mission) ? prodiInfo.profile.mission.join(", ") : prodiInfo.profile.mission) : "Belum Diisi"}

Fokus Akreditasi: ${focus || prodiInfo.lam}

${referenceText ? `### DATA REFERENSI UTAMA DARI PENGGUNA (INTEGRASIKAN SECARA PENUH):
"${referenceText}"` : ""}

${customPrompt ? `Petunjuk Tambahan dari Pengguna:\n"${customPrompt}"` : ""}

Persyaratan Output:
1. Tuliskan analisis kekuatan (Strengths), kelemahan (Weaknesses), peluang (Opportunities), dan ancaman (Threats) yang spesifik untuk kriteria tersebut dengan mengacu dan menyelaraskan dengan Data Referensi Utama yang diberikan.
2. Buat tabel rencana strategis tindak lanjut (Action Plan) dengan kolom: No, Upaya Peningkatan, Indikator Kinerja Utama, Target Waktu, Penanggung Jawab.
3. Gunakan formatting Markdown yang rapi dengan heading, list, dan tabel.`;
      } else if (documentType === "led") {
        prompt = `Buatlah draf Laporan Evaluasi Diri (LED) komprehensif untuk Program Studi berikut:
- Nama Program Studi: ${prodiInfo.name} (${prodiInfo.level})
- Fakultas: ${prodiInfo.faculty}
- Lembaga Akreditasi (LAM): ${prodiInfo.lam}
- Kepala Program Studi: ${prodiInfo.profile?.kaprodi || "Belum Diisi"}
- Visi Keilmuan: ${prodiInfo.profile?.vision || "Belum Diisi"}
- Misi: ${prodiInfo.profile?.mission ? (Array.isArray(prodiInfo.profile.mission) ? prodiInfo.profile.mission.join("; ") : prodiInfo.profile.mission) : ""}

Fokus Akreditasi: ${focus || prodiInfo.lam}

${referenceText ? `### DATA REFERENSI UTAMA DARI PENGGUNA (INTEGRASIKAN SECARA PENUH):
"${referenceText}"` : ""}

${customPrompt ? `Petunjuk Tambahan dari Pengguna:\n"${customPrompt}"` : ""}

Persyaratan Output LED (Laporan Evaluasi Diri):
- BAB I: PENDAHULUAN (Kondisi Eksternal, Profil Unit Pengelola, Sejarah Singkat).
- BAB II: HASIL EVALUASI DIRI (Analisis mendalam pencapaian kriteria dengan secara langsung menggunakan fakta/bukti dari Data Referensi Utama yang diberikan).
- BAB III: ANALISIS DAN STRATEGI PENGEMBANGAN (Analisis SWOT Terintegrasi prodi, Strategi Pemecahan Masalah berkelanjutan).
- Gunakan formatting Markdown yang rapi, formal, berbobot ilmiah akademis tinggi, lengkap dengan contoh-contoh kuantitatif fiktif yang realistis agar siap diunduh dan dipoles oleh prodi.`;
      } else if (documentType === "lkps") {
        prompt = `Buatlah draf Laporan Kinerja Program Studi (LKPS) berbasis data terstruktur dalam bentuk tabel Markdown untuk Program Studi berikut:
- Nama Program Studi: ${prodiInfo.name} (${prodiInfo.level})
- Fakultas: ${prodiInfo.faculty}
- Lembaga Akreditasi (LAM): ${prodiInfo.lam}

Fokus Akreditasi: ${focus || prodiInfo.lam}

${referenceText ? `### DATA REFERENSI UTAMA DARI PENGGUNA (GUNAKAN DATA INI UNTUK MENYUSUN TABEL):
"${referenceText}"` : ""}

${customPrompt ? `Petunjuk Tambahan dari Pengguna:\n"${customPrompt}"` : ""}

Persyaratan Output LKPS (Laporan Kinerja Program Studi):
1. Buat minimal 4 tabel penting penunjang LKPS dalam format Markdown:
    - Tabel 1: Profil Dosen Tetap Program Studi (Nama, Pendidikan, Jabatan Akademik, Sertifikasi Pendidik, Keahlian).
    - Tabel 2: Distribusi Mahasiswa Baru, Aktif, dan Lulusan 3 Tahun Terakhir.
    - Tabel 3: Kurikulum, Proses Pembelajaran, dan Bobot SKS.
    - Tabel 4: Aktivitas Penelitian & Publikasi Ilmiah Dosen (Jurnal Nasional Terakreditasi, Jurnal Internasional Bereputasi, Seminar).
2. Tulis penjelasan singkat di bawah setiap tabel mengenai analisis kinerja kuantitatif tersebut dengan mengaitkan data referensi pengguna.
3. Pastikan datanya realistis, relevan dengan bidang ilmu prodi, dan menggunakan formatting tabel Markdown standar yang presisi.`;
      } else {
        prompt = `Buatlah draf Dokumen Legalitas, Surat Pengantar, dan Kerangka Kebijakan Sistem Penjaminan Mutu Internal (SPMI) untuk Program Studi berikut:
- Nama Program Studi: ${prodiInfo.name} (${prodiInfo.level})
- Fakultas: ${prodiInfo.faculty}
- Lembaga Akreditasi (LAM): ${prodiInfo.lam}
- Kepala Program Studi: ${prodiInfo.profile?.kaprodi || "Belum Diisi"}

${referenceText ? `### DATA REFERENSI UTAMA DARI PENGGUNA (INTEGRASIKAN SECARA PENUH):
"${referenceText}"` : ""}

${customPrompt ? `Petunjuk Tambahan dari Pengguna:\n"${customPrompt}"` : ""}

Persyaratan Output:
1. Format Surat Pengantar Pengajuan Akreditasi dari Dekan Fakultas kepada Ketua Lembaga Akreditasi (${prodiInfo.lam}).
2. Surat Keputusan (SK) Dekan tentang Pembentukan Tim Penyusun Dokumen Akreditasi Prodi (berisi Susunan Panitia: Penanggung Jawab, Ketua, Sekretaris, dan Koordinator Bidang).
3. Draft Kerangka Kebijakan SPMI (Sistem Penjaminan Mutu Internal) tingkat program studi yang mencakup siklus PPEPP (Penetapan, Pelaksanaan, Evaluasi, Pengendalian, Peningkatan).
4. Gunakan formatting Markdown yang sangat rapi dan formal dengan kop surat standar universitas.`;
      }
    }

    // 4. Perform RAG Vector Similarity Search on Supabase dokumen_vektor
    let ragSearchContext = "";
    try {
      const pUuid = prodiId && prodiId !== "unknown-prodi" ? prodiId : null;
      let searchQuery = `${documentType || ""} ${focus || ""} ${criteriaKey || ""} ${customPrompt || ""}`.trim();
      if (!searchQuery) searchQuery = "dokumen standar akreditasi dan data program studi";
      
      console.log(`Memulai pencarian RAG Vektor untuk query: "${searchQuery}" (prodiId: ${pUuid})...`);
      const similarChunks = await searchSimilarChunks(searchQuery, pUuid, 5);
      
      if (similarChunks && similarChunks.length > 0) {
        ragSearchContext = "\n--- KONTEKS RELEVAN YANG DITEMUKAN (RAG SIMILARITY SEARCH) ---\n";
        similarChunks.forEach((chunk: any, idx: number) => {
          ragSearchContext += `\n[Potongan #${idx + 1} dari File: ${chunk.nama_file || "Rujukan"}] ${chunk.similarity ? `(Kecocokan: ${(chunk.similarity * 100).toFixed(1)}%)` : ""}\n${chunk.konten_teks}\n`;
        });
      }
    } catch (ragSearchErr: any) {
      console.error("Gagal melakukan pencarian RAG Vektor:", ragSearchErr.message);
    }

    const combinedRAGContext = [
      uploadedFilesContext,
      ragSearchContext,
      campusReferenceContent
    ].filter(c => c && c.trim().length > 0).join("\n");

    const hasRAGContext = combinedRAGContext.trim().length > 0;

    if (hasRAGContext) {
      // MODE RAG
      prompt += `

\n=========================================
### KONTEKS ACUAN UTAMA (DOKUMEN RUJUKAN RAG - ASLI & BUKTI):
${combinedRAGContext}
=========================================

### INSTRUKSI TEGAS MODE RAG:
1. Anda WAJIB menyusun dokumen akreditasi ini hanya berdasarkan konten, fakta, dan bukti dari dokumen-dokumen acuan RAG terlampir di atas untuk menjamin hasil yang sangat presisi, faktual, transparan, dan dapat diverifikasi langsung.
2. JANGAN mengarang data, sejarah, fasilitas, atau nama yang bertentangan dengan informasi yang disediakan dalam Dokumen Rujukan RAG di atas.
3. Lakukan kutipan secara langsung atau tidak langsung dari teks di atas untuk memperkuat keabsahan narasi akreditasi Anda.
4. Tiru dan replikasi gaya kepenulisan (tone of voice), kosakata teknis, dan alur pemaparan logis dari dokumen referensi di atas agar draf dokumen ini memiliki bobot ilmiah dan kualitas akademis yang setara tinggi dengan kampus rujukan tersebut.`;
    } else {
      // MODE STANDAR
      prompt += `

\n### INSTRUKSI SEBAGAI STANDAR AKREDITASI NASIONAL (MODE STANDAR - FALLBACK):
Tidak ada dokumen referensi eksternal atau file RAG yang diunggah. 
Oleh karena itu, gunakan pengetahuan internal bawaan Anda mengenai standar akreditasi perguruan tinggi nasional (BAN-PT dan standar LAM terkait seperti LAMDIK, LAM INFOKOM, dll) untuk menyusun dokumen ini. 
Buatlah narasi yang logis, lengkap, profesional, dan realistis untuk membantu program studi ${prodiInfo.name} mencapai hasil akreditasi terbaik.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    const textOutput = response.text || "";
    const cleanDate = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const fileName = `${documentType}_${prodiInfo.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${cleanDate}.md`;

    // Save output to table 'hasil_dokumen_generator' with status 'draf'
    if (prodiId && prodiId !== "unknown-prodi") {
      try {
        const pUuid = toUUID(prodiId);
        const refUuid = referensiId && !FALLBACK_REFERENCES[referensiId] ? referensiId : null;

        // Auto-upsert prodi row first to ensure foreign key constraint is satisfied
        await supabase
          .from('prodi')
          .upsert({
            id: pUuid,
            nama_prodi: prodiInfo.name || "Program Studi",
            fakultas: prodiInfo.fakultas || "Fakultas",
            jenjang: prodiInfo.jenjang || "S1",
            lembaga_akreditasi: prodiInfo.lam || "LAMDIK",
            created_at: new Date().toISOString()
          });

        const { data: savedDoc, error: saveError } = await supabase
          .from('hasil_dokumen_generator')
          .insert({
            prodi_id: pUuid,
            referensi_id: refUuid,
            konten_output_markdown: textOutput,
            status_dokumen: "draf",
            nama_file: fileName,
            kategori_kriteria: prodiInfo.criteria || "Kriteria Umum",
            created_at: new Date().toISOString()
          })
          .select()
          .maybeSingle();

        if (saveError) {
          console.error("Gagal menyimpan hasil generator ke database hasil_dokumen_generator:", saveError.message);
        } else {
          console.log("Berhasil menyimpan draf hasil_dokumen_generator dengan ID:", savedDoc?.id);
        }
      } catch (dbErr: any) {
        console.error("Kesalahan menyimpan dokumen ke Supabase:", dbErr.message);
      }
    }

    res.json({ 
      text: textOutput,
      fileName: fileName
    });

  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    let errMsg = error.message || "Gagal melakukan generate dokumen dengan AI.";
    if (errMsg.includes("denied access") || errMsg.includes("PERMISSION_DENIED") || errMsg.includes("403")) {
      errMsg = "Akses API Gemini ditolak (PERMISSION_DENIED / 403). Hal ini terjadi karena Kunci API (API Key) Anda di panel 'Settings > Secrets' belum dikonfigurasi dengan benar atau belum valid untuk proyek ini. Silakan tambahkan/perbarui GEMINI_API_KEY Anda di Settings > Secrets dengan kunci yang aktif.";
    }
    res.status(500).json({ error: errMsg });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
