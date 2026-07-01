# PANDUAN PENGGUNA (TUTORIAL) - TACTIGEN PRO (V2.0)

Selamat datang di **Tactigen Pro**, platform visualisasi taktis dan asisten AI sepak bola berlisensi profesional milik Anda! Panduan ini dirancang untuk membantu Anda menguasai setiap fungsi aplikasi dari fasa pembuatan taktik hingga ekspor poster media sosial.

---

## 🚀 DAFTAR ISI
1. [Langkah 1: Setup Identitas Klub & Jersey](#langkah-1-setup-identitas-klub--jersey)
2. [Langkah 2: Mengelola Pemain & Pergantian (Starting XI & Bench)](#langkah-2-mengelola-pemain--pergantian-starting-xi--bench)
3. [Langkah 3: Menggunakan Chalkboard & Coretan Taktis](#langkah-3-menggunakan-chalkboard--coretan-taktis)
4. [Langkah 4: Setup API Key Google Gemini & MCP (Pengaturan Kredensial)](#langkah-4-setup-api-key-google-gemini--mcp-pengaturan-kredensial)
5. [Langkah 5: Mengaktifkan Asisten AI (Analyze Squad & YouTube Video Analyzer)](#langkah-5-mengaktifkan-asisten-ai-analyze-squad--youtube-video-analyzer)
6. [Langkah 6: Mode Presentasi TV & Ekspor Poster Instagram](#langkah-6-mode-presentasi-tv--ekspor-poster-instagram)

---

## 🛡️ LANGKAH 1: SETUP IDENTITAS KLUB & JERSEY

Langkah awal untuk memulai adalah mendesain identitas klub Anda:
1. **Nama Klub**: Ketikkan nama klub Anda pada kolom input di panel kontrol kiri atas (misal: "Garuda FC").
2. **Unggah Logo**: Klik tombol unggah logo untuk memasang logo transparan PNG klub kesayangan Anda. Logo ini otomatis akan menempel di tengah stadion dan poster ekspor.
3. **Atur Warna Jersey**: 
   * Pilih warna jersey utama pemain (*Home Kit*) menggunakan pemilih warna (*color picker*).
   * Atur warna jersey penjaga gawang (*GK Kit*).
   * Pilih warna teks nomor punggung agar tetap kontras dan mudah dibaca.

---

## 🏃 LANGKAH 2: MENGELOLA PEMAIN & PERGANTIAN (STARTING XI & BENCH)

Aplikasi ini menggunakan sistem grid interaktif 2.5D untuk memposisikan pemain:
1. **Memilih Formasi**: Klik tombol formasi cepat seperti `4-3-3`, `4-4-2`, `3-5-2`, atau `4-2-3-1` untuk mengatur posisi pemain secara otomatis dalam sekejap.
2. **Menggeser Pemain (Drag & Drop)**: Klik dan tahan badge nomor punggung pemain di lapangan, lalu geser ke posisi taktis yang Anda inginkan.
3. **Pergantian Pemain (Subs)**:
   * Tarik pemain utama dari lapangan ke kotak **Sideline Bench** di bawah untuk menjadikannya cadangan.
   * Tarik pemain dari daftar cadangan (*Bench*) ke area lapangan untuk memasukkannya ke susunan Starting XI.
4. **Edit Detail Pemain**: Klik ganda (*double-click*) pada lingkaran jersey pemain untuk membuka modal penyuntingan kustom. Anda bisa mengubah nama, nomor punggung, peran fungsional (GK, DEF, MID, FWD), serta statistik performanya.

---

## 🖌️ LANGKAH 3: MENGGUNAKAN CHALKBOARD & CORETAN TAKTIS

Gambarkan instruksi taktis Anda secara visual langsung di atas lapangan:
1. **Aktifkan Coretan**: Klik ikon sikat sikat/pena untuk masuk ke fasa **Draw Mode**.
2. **Memilih Warna & Ketebalan**: Pilih warna sikat kontras tinggi (Merah untuk serangan, Biru untuk pertahanan, atau Kuning untuk pergerakan bola mati) dan atur ketebalan sikat menggunakan *slider* yang tersedia.
3. **Menggambar Garis & Panah**: Tarik garis lurus untuk instruksi lari tanpa bola, atau buat penanda panah tebal di ujung garis untuk memperlihatkan operan akhir yang mematikan.
4. **Hapus / Reset**: 
   * Gunakan tombol penghapus untuk membersihkan area tertentu.
   * Klik **Reset Chalkboard** untuk menghapus seluruh coretan secara instan tanpa mengganggu posisi pemain.

---

## 🔐 LANGKAH 4: SETUP API KEY GOOGLE GEMINI & MCP (PENGATURAN KREDENSIAL)

Demi keamanan kuota global dan performa taktis premium, Anda dapat memasukkan kredensial pribadi:
1. Klik ikon **Pengaturan (Settings)** dengan ikon gerigi yang berputar di bar navigasi atas.
2. **Kunci API Google Gemini**:
   * Masuk ke tab **Google Gemini API Key**.
   * Dapatkan kunci API gratis Anda di [Google AI Studio](https://aistudio.google.com/).
   * Tempelkan (*paste*) kunci yang berawalan `AIzaSy...` di kolom yang disediakan.
   * Klik **Simpan Pengaturan**. Kunci akan disimpan aman secara lokal di penjelajah Anda.
3. **Model Context Protocol (MCP)**:
   * Jika Anda memiliki server penganalisis internal kustom, aktifkan sakelar MCP.
   * Masukkan URL endpoint server (default: `http://localhost:3015/mcp`) dan nama fungsi yang diinginkan.
   * Ini memfungsikan AI untuk menggunakan basis data taktis lokal Anda sendiri.

---

## 🧠 LANGKAH 5: MENGAKTIFKAN ASISTEN AI (ANALYZE SQUAD & YOUTUBE VIDEO ANALYZER)

Gunakan kekuatan AI untuk menimbang blueprint tim Anda:
1. **Analisis Skuad (Squad AI Report)**:
   * Klik tombol **Analisis Skuad** di bagian bawah panel kontrol.
   * AI akan membaca formasi, koordinat pemain, dan role yang sedang aktif.
   * Laporan interaktif akan tersusun rapi berisi fasa transisi, skor kohesi playbook, peta SWOT, dan solusi perbaikan instan.
2. **Analisis Video Taktis YouTube**:
   * Buka panel **AI Coach** / **Video Scanner** di kanan bawah.
   * Masukkan URL video YouTube sepak bola (misal: analisis pertandingan UCL).
   * Klik tombol **Mulai Analisis Video**.
   * AI (atau server MCP) akan memproses transkrip taktis dan menyajikan ringkasan taktis yang dipadukan dengan susunan formasi Anda saat ini.

---

## 📲 LANGKAH 6: MODE PRESENTASI TV & EKSPOR POSTER INSTAGRAM

Bagikan maha karya taktis Anda ke khalayak luas:
1. **TV Presentation Mode**:
   * Klik ikon **TV Preview** di bar atas.
   * Antarmuka akan berubah menjadi layar penuh bergaya siaran olahraga TV profesional (*Sports Broadcast TV*) yang bersih, lengkap dengan jam pertandingan, skor, serta visualisasi papan tulis super lebar.
2. **Instagram Poster Grid Generator**:
   * Klik tombol **Panduan (Help)** di bar navigasi atas untuk membuka Studio Panduan.
   * Alihkan ke tab **📲 Creator Poster Instagram**.
   * Sesuaikan nama Anda sebagai kepala pelatih (Coach Name), masukkan nama turnamen (Match Title), dan pilih salah satu dari 3 tema estetika stadion (Cyber Stadium, Legend Grass, atau Dark Velvet).
   * Klik **Unduh Poster Instagram PNG** untuk menyimpan gambar resolusi tinggi 1080x1080px yang siap diunggah ke feed Instagram atau media sosial Anda!
