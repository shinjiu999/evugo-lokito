# LEMBAR DATA TEKNIS (DATASHEET) - TACTIGEN PRO (V2.0)

Tactigen Pro adalah aplikasi papan taktik taktis multipatran, multimedia, dan bertenaga AI generasi terbaru (Next-Generation AI Tactical Playbook Platform) yang dirancang untuk pelatih, analis taktis, dan penggemar olahraga sepak bola. Platform ini menggabungkan visualisasi lapangan olahraga 2.5D/3D interaktif, mesin coretan papan tulis (*digital chalkboard*), generator media sosial, dan kecerdasan buatan (*AI Coach Analytics Hub*) dalam satu antarmuka berbasis web beresolusi tinggi.

---

## 🛠️ INFORMASI PRODUK & SPESIFIKASI UMUM

| Parameter | Spesifikasi |
| :--- | :--- |
| **Nama Aplikasi** | Tactigen Pro (Next-Gen Tactical Playbook) |
| **Versi Rilis** | v2.0-Live (Agustus 2026) |
| **Teknologi Utama** | React 18, Vite, Tailwind CSS, Motion (Framer Motion), TypeScript, Express (Node.js) |
| **Mesin AI Utama** | Google Gemini API (via Google GenAI SDK `@google/genai`) |
| **Sistem Integrasi** | Model Context Protocol (MCP) untuk fasa kepanduan kustom lokal |
| **Penyimpanan Data** | Offline-First (Local Browser Storage / `localStorage`) & Sesi Terenkripsi |
| **Format Ekspor Media** | PNG Resolusi Tinggi (1080x1080px untuk Instagram Grid, Live Pitch Capture) |
| **Bahasa Antarmuka** | Bahasa Indonesia & English (Dual-Language Toggle) |

---

## 🏗️ ARSITEKTUR SISTEM & ENGINES

### 1. Engine Visual Lapangan (Pitch Stage Generator)
* **Visualisasi Adaptif**: Rendisi lapangan hijau presisi tinggi yang mendukung fasa warna kustom, grid panduan taktis, dan rendering interaktif.
* **Manajer Atlet (Starting XI & Sideline Bench)**: Mendukung gerakan *drag-and-drop* lancar dengan penyeimbang koordinat real-time `(X: 0-100, Y: 0-100)`.
* **Peralatan Tambahan**: Pemasangan bola tak terbatas dan cone latihan taktis untuk mendemonstrasikan pola latihan bola mati (*set piece*).

### 2. Digital Chalkboard & Drawing Engine
* **Bebas Hambatan**: Menggunakan elemen Canvas HTML5 untuk fasa coretan presisi tinggi.
* **Pilihan Sikat (Brush Engine)**:
  * Pengatur ukuran ketebalan sikat (Brush Thickness).
  * Palet warna taktis kontras tinggi (Merah, Biru, Kuning, Putih, Hijau).
  * Mode penghapus objek tunggal atau hapus papan secara menyeluruh (*Clear Drawing*).

### 3. AI Coach Scout & Video Analytics Engine
* **Model AI**: Terintegrasi langsung dengan model tercanggih Google Gemini.
* **Fungsi Utama**:
  * **Analisis Skuad**: Membaca susunan pemain aktif, performa, role, dan taktik tim saat ini untuk merumuskan analisis SWOT, laporan kepanduan fasa transisi, dan rekomendasi solusi taktis.
  * **Analisis Video YouTube**: Mengekstrak transkrip atau menganalisis URL video sepak bola taktis menggunakan API Google AI Studio kustom pengguna untuk merumuskan resume instruksi taktis mendalam.
* **Fallback Mandiri**: Dilengkapi dengan mesin cadangan lokal (*local simulation engine*) jika kuota kunci API kustom habis.

### 4. Model Context Protocol (MCP) Gateway
* **Standar Terbuka**: Memungkinkan aplikasi terhubung dengan aman ke server MCP lokal pengguna sendiri (misal: `http://localhost:3015/mcp`).
* **Kebutuhan**: Berguna untuk menarik data analisis kustom, playbook rahasia, atau instruksi internal tim secara langsung dari sistem eksternal tanpa mengekspos data sensitif keluar.

---

## 💾 SKEMA PENYIMPANAN LOKAL (LOCALSTORAGE SPECIFICATION)

Aplikasi beroperasi secara *offline-first* demi menjaga privasi penuh playbook Anda. Berikut adalah variabel kunci yang disimpan di dalam `localStorage` penjelajah web Anda:

1. `tactigen_custom_key`: Menyimpan Google Gemini API Key kustom Anda secara aman (tidak pernah dikirim ke pihak ketiga).
2. `tactigen_mcp_enabled`: Boolean (`true`/`false`) untuk mengaktifkan integrasi Model Context Protocol.
3. `tactigen_mcp_url`: URL server endpoint MCP lokal Anda (default: `http://localhost:3015/mcp`).
4. `tactigen_mcp_tool`: Nama fungsionalitas tool MCP eksternal yang dipanggil (default: `pitch-scout-analyzer`).
5. `tactigen_saved_playbooks`: JSON array berisi koleksi slot formasi taktis, susunan koordinat pemain, dan data klub yang disimpan pengguna.
6. `tactigen_custom_background`: Gambar lapangan latar belakang kustom yang diunggah pengguna.

---

## 🔒 KEAMANAN & PRIVASI DATA

* **Zero Cloud Storage for Tactics**: Semua formasi, coretan taktis, nama atlet, dan kunci rahasia disimpan **hanya** di memori lokal peramban Anda.
* **Transparansi Kunci API**: Kunci API Google AI Studio Anda dikomunikasikan dari sisi klien ke server Express kami secara terenkripsi hanya selama sesi aktif untuk memanggil API resmi Google Gemini. Tidak ada pencatatan (*logging*) atau penyimpanan kunci API di sisi server.
