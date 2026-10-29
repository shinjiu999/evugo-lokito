# Perbaikan & Peningkatan Terpadu Studio Formasi (Tactical Formation Adjuster & HD Poster Studio)

Pembaruan ini memperbaiki berbagai kendala teknis pada sistem pengaturan formasi dan perenderan poster sekaligus menghadirkan **Studio Formasi Terpadu** berdesain *Soft Sporty Tosca* yang menggabungkan kemudahan kontrol 1-klik dengan pengaturan taktis tingkat lanjut (*Garis Pertahanan*, *Lebar Tim*, *Kerapatan Lini*, *Auto-Fit Role*, *Gaya Taktis*, dan *Template Formasi Kustom*).

## User Review & Critical Decisions

> [!IMPORTANT]
> Rencana ini disusun berdasarkan seluruh pilihan fitur yang telah Anda konfirmasi pada tahap klarifikasi sebelumnya. Silakan tinjau arsitektur dan alur pengalaman pengguna di bawah ini sebelum kita mulai menerapkan perubahan kode.

- **Cakupan Perbaikan & Peningkatan Terkonfirmasi**: Memperbaiki dan meningkatkan **keduanya** secara menyeluruh — baik **Pengatur Formasi Lapangan** (taktik, posisi lini, dan role pemain) maupun **Studio Poster Formasi HD** (visualisasi grafis dan ekspor gambar).
- **Fitur Pengaturan Simpel & Advance Terkonfirmasi**:
  1. **Slider Taktis Real-Time**: Pengatur *Garis Pertahanan (Defensive Line)*, *Lebar Tim (Team Width)*, dan *Kerapatan Lini (Compactness)* yang langsung menggerakkan struktur formasi di lapangan secara proporsional.
  2. **Penyesuaian Role Otomatis (*Auto-Fit Posisi*)**: Saat berganti formasi (misal dari `4-3-3` ke `3-5-2` atau `4-2-3-1`), role pemain (`GK`, `DEF`, `MID`, `FWD`) dan urutan penempatannya otomatis disesuaikan agar tidak ada bek yang salah ditempatkan menjadi penyerang.
  3. **Preset Gaya Taktis 1-Klik**: Tombol instan untuk menerapkan *High Press*, *Mid Block*, *Low Block Parkir Bus*, dan *Tiki-Taka Possession* lengkap dengan perubahan struktur tinggi/lebar lini.
  4. **Editor & Penyimpanan Formasi Kustom**: Kemampuan menyimpan posisi rakitan sendiri di lapangan sebagai *Template Formasi Kustom* yang dapat dipanggil kembali kapan saja.
- **Tata Letak Antarmuka Terkonfirmasi**: **Panel Terpadu di Atas/Samping Lapangan plus Modal Studio Interaktif** dengan estetika *Soft Sporty Tosca* yang bersih dan responsif di mode Android maupun PC.

---

## 1. Overview & Core Concept

- **Apa yang Diperbaiki (Bug & Error Fixes)**:
  1. **Bug Dekompresi Koordinat Ganda (*Double Y-Uncompression*) pada Mode Lawan**: Sebelumnya, saat Mode Lawan (*Enemy Mode*) aktif, koordinat vertikal pemain didekompresi dua kali (sekali di komponen studio dan sekali lagi di mesin kanvas poster), menyebabkan posisi pemain di poster formasi melompat keluar lapangan atau menumpuk di atas.
  2. **Bug Pergantian Formasi Saat Simulasi Aktif**: Sebelumnya, mengganti formasi saat sedang berada di fasa simulasi (*Corner Kick* atau *Tactical Drill*) tidak mereset fasa simulasi secara bersih dan menggunakan `setTimeout` asinkron yang rawan mengalami kondisi balapan (*race condition*).
  3. **Ketidaksinkronan Role Pemain Saat Ganti Formasi**: Mengubah formasi sebelumnya hanya memindahkan titik `(x, y)` berdasarkan urutan array tanpa menyelaraskan atribut `role` pemain dengan kebutuhan formasi baru.
  4. **Menu Formasi Terpotong & Daftar Formasi Tidak Lengkap**: Menu popup formasi di pojok kiri bawah lapangan sebelumnya membuka ke arah bawah sehingga terpotong oleh area bangku cadangan (*bench*), serta beberapa formasi (`5-4-1`, `4-1-2-1-2`, `4-1-4-1`, `3-2-4-1`) belum muncul di daftar pemilih cepat.
  5. **Tab AI Imagen & Studio Poster yang Belum Terhubung Penuh**: Menambahkan tema poster baru **Sporty Tosca Arena** serta menyatukan mode *Instant Vector HD* dan *AI Artwork* di dalam modal Studio Poster Formasi beserta kontrol penyesuaian langsung.
- **Target Pengguna**: Pelatih, analis taktik, dan pemain yang membutuhkan papan strategi yang instan digunakan dalam hitungan detik namun memiliki kedalaman pengaturan taktis layaknya perangkat lunak analisis profesional.
- **Nilai Utama**: Mengubah pengaturan formasi yang tadinya statis menjadi **dinamis dan bebas error**, di mana pengguna dapat mengatur bentuk dasar (`4-3-3`, `3-5-2`, dll.), menggeser slider *Line Height / Width / Compactness*, melihat hasilnya secara *live* di lapangan maupun di poster HD, dan menyimpan formasi favorit mereka.

---

## 2. User Experience & Visual Design

### Alur Pengguna Utama (Key User Flows)
1. **Pengaturan Formasi Cepat (Simpel - 1 Klik)**:
   - Di panel Studio Formasi atau bar kontrol lapangan, pengguna memilih mode olahraga (*Sepakbola 11v11*, *Mini Soccer 7v7*, *Futsal 5v5*, atau *Kustom*) lalu menekan chip formasi (termasuk seluruh 11 formasi standar sepakbola + formasi kustom tersimpan).
   - Sistem langsung mereset fasa simulasi yang menggantung, mengurutkan serta menyelaraskan *role* pemain secara pintar (*Auto-Fit Role*), dan menempatkan pemain dengan transisi mulus.
2. **Penyesuaian Taktis Lanjutan (Advance - Slider & Gaya Taktis)**:
   - Pengguna memilih salah satu **Preset Gaya Taktis 1-Klik** (*High Press*, *Mid Block*, *Low Block*, *Tiki-Taka*, *Wing Overload*) atau menggeser 3 slider presisi:
     - **Garis Pertahanan (Defensive Line)**: `0%` (Dalam) hingga `100%` (Garis Tinggi).
     - **Lebar Tim (Team Width)**: `0%` (Sempit/Terpusat) hingga `100%` (Melebar ke Sayap).
     - **Kerapatan Lini (Compactness)**: Mengatur jarak vertikal antara lini belakang, tengah, dan depan.
   - Setiap perubahan slider langsung memperbarui posisi pemain di lapangan utama dan indikator metrik taktis secara *real-time*.
3. **Simpan Template Formasi Kustom**:
   - Setelah menggeser pemain secara manual di lapangan atau menyesuaikan slider taktis, pengguna cukup mengetik nama formasi (contoh: `"4-3-3 False 9 Garuda"`) dan menekan **Simpan Formasi**. Template tersebut langsung muncul sebagai chip formasi yang bisa dipakai kapan saja atau dihapus jika tidak diperlukan.
4. **Modal Studio Formasi & Poster HD Interaktif**:
   - Saat membuka **Studio Formasi Lengkap**, pengguna disuguhkan tampilan 2-kolom berimbang:
     - ** Sisi Kiri**: Pratinjau Kanvas Poster HD interaktif (mendukung tema baru *Tosca Sporty Arena*, *Champions Neon*, *Gold Prestige*, *Matchday TV*, *Studio Swiss*, dan *Calcio 90s*) lengkap dengan tombol perata cepat (*Rapikan Lini*, *Auto-Fit Role*, *Flip Attack Direction*).
     - **Sisi Kanan**: Tab navigasi bersih antara **Pengatur Taktik & Bentuk Formasi**, **Gaya & Teks Poster HD**, dan **AI Stadium Art**, lengkap dengan tombol Unduh PNG HD dan Salin ke Clipboard.

### Identitas Visual & Tema
- **Aesthetic Direction**: *Soft Sporty Tosca Tactical Studio* — perpaduan presisi analitik olahraga modern dengan kenyamanan visual ruang kendali berpalet toska lembut.
- **Palet Warna (60-30-10 Discipline)**:
  - **60% Kanvas Dasar**: Deep Slate Teal (`#061318` dan `#051419`) yang tenang di mata.
  - **30% Permukaan Struktural**: Frosted Sporty Teal (`#091d24/90` dan `#071c22`) dengan garis tepi halus `border-teal-400/20`.
  - **10% Aksen Interaktif**: Soft Turquoise (`#2DD4BF` / `teal-400`) untuk kontrol aktif, Emerald (`#34D399`) untuk indikator kesiapan lini, dan Amber (`#FBBF24`) untuk highlight peringatan/transisi.
- **Tipografi & Hierarki**:
  - Header & Nama Formasi: `Outfit` (`font-display`) tegas dan sporty.
  - Label Kontrol & Instruksi: `Plus Jakarta Sans` (`font-sans`) yang bersih dan mudah dipindai.
  - Angka Statistik, Koordinat & Persentase Slider: `JetBrains Mono` dengan `tabular-nums` agar angka tidak bergoyang saat slider digeser.
- **Ergonomi Sentuh & Tata Letak**:
  - Seluruh tombol interaktif dan chip pemilih formasi memiliki tinggi sentuh memadai ($\ge 40\text{px}$ di desktop, $\ge 44\text{px}$ di mobile) dan satu baris teks (`whitespace-nowrap`).
  - Menu pemilih formasi di lapangan membuka ke arah atas (`bottom-full mb-2`) dengan batas tinggi terukur agar tidak pernah terpotong oleh area bangku cadangan.

---

## 3. Key Product Decisions & Trade-Offs

- **Keputusan 1: Transformasi Geometri Relatif dari Anchor Formasi Dasar**
  - *Pendekatan Terpilih*: Menyimpan koordinat dasar (*base formation anchor coordinates*) setiap kali formasi dipilih, lalu menerapkan transformasi matematis *Defensive Line*, *Team Width*, dan *Compactness* secara proporsional terhadap koordinat dasar tersebut (kecuali penjaga gawang `GK` yang tetap terjaga di area gawang).
  - *Alasan*: Jika slider memodifikasi koordinat mutlak secara berulang tanpa titik acuan dasar, menggeser slider ke kiri lalu ke kanan akan merusak bentuk asli formasi (*coordinate drift*). Dengan sistem *base anchor*, mengembalikan slider ke `50%` selalu mengembalikan formasi ke bentuk taktis murninya secara akurat.
- **Keputusan 2: Penyelarasan Role Pintar (*Smart Auto-Fit Role*)**
  - *Pendekatan Terpilih*: Saat pengguna mengganti formasi atau menekan tombol *Auto-Fit Role*, sistem mengurutkan pemain *starter* berdasarkan kecocokan role saat ini (`GK -> DEF -> MID -> FWD`) lalu memperbarui koordinat sekaligus menyelaraskan label role dengan slot formasi baru.
  - *Alasan*: Menghindari bug di mana pemain bertahan tetap berlabel `DEF` padahal ditempatkan di ujung tombak serangan pada formasi baru, sekaligus menjaga pemain tetap berada di zona posisi alaminya.
- **Keputusan 3: Sumber Tunggal Dekompresi Koordinat Poster (*Single-Pass Coordinate Normalization*)**
  - *Pendekatan Terpilih*: Menghapus duplikasi perhitungan dekompresi `isEnemyModeActive` sehingga normalisasi koordinat hanya dilakukan satu kali secara terpusat sebelum dirender ke kanvas poster.
  - *Alasan*: Memastikan posisi pemain di poster 100% identik dengan proporsi formasi utuh baik saat Mode Lawan aktif maupun nonaktif.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

### Diagram Arsitektur & Hirarki Komponen

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        Root Tactical State (App)                             │
│  • formation, sportMode, players[], items[], frames[]                        │
│  • formationShape: { lineHeight, teamWidth, compactness, tacticalStyle }     │
│  • customFormations[]: Saved user templates in localStorage                  │
└───────────────┬──────────────────────────────────────────────┬───────────────┘
                │                                              │
                ▼                                              ▼
┌─────────────────────────────────────────┐  ┌─────────────────────────────────┐
│      Pengatur Formasi & Lini Lapangan    │  │   Studio Formasi & Poster HD    │
│  • Pemilih Formasi Lengkap (11+ Preset) │  │  • Pratinjau Kanvas Real-time   │
│  • Preset Gaya Taktis 1-Klik            │  │  • Tema Baru: Tosca Sporty      │
│    (High Press / Mid / Low / Tiki-Taka) │  │  • Tab 1: Taktik & Shape Slider │
│  • 3 Slider Geometri Real-time:         │  │  • Tab 2: Desain & Teks Poster  │
│    - Garis Pertahanan (Line Height)     │  │  • Tab 3: AI Stadium Generator  │
│    - Lebar Tim (Team Width)             │  │  • Ekspor PNG HD & Clipboard    │
│    - Kerapatan Lini (Compactness)       │  └─────────────────┬───────────────┘
│  • Simpan / Hapus Formasi Kustom        │                    │
└───────────────┬─────────────────────────┘                    │
                │                                              ▼
                │                            ┌─────────────────────────────────┐
                │                            │    Engine Perender Kanvas 2D    │
                │                            │  • Single-pass coordinate map   │
                │                            │  • Perspektif 3D (4:3, 1:1,9:16)│
                └───────────────────────────►│  • Garis Tautan Lini & Zona     │
                                             └─────────────────────────────────┘
```

### Model Data & State
1. **Konfigurasi Geometri Formasi (`FormationShapeConfig`)**:
   - `lineHeight`: Angka `0`–`100` (default `50`) — menggeser titik pusat gravitasi vertikal pemain non-GK ke atas (menyerang/garis tinggi) atau ke bawah (bertahan dalam).
   - `teamWidth`: Angka `0`–`100` (default `50`) — merentangkan atau menyempitkan jarak horizontal pemain terhadap sumbu tengah lapangan (`x = 50`).
   - `compactness`: Angka `0`–`100` (default `50`) — merapatkan atau merenggangkan jarak vertikal antar lini (`DEF`, `MID`, `FWD`) terhadap titik tengah tim.
   - `activeStyle`: `"balanced" | "high-press" | "mid-block" | "low-block" | "tiki-taka" | "wing-overload" | "custom"`.
2. **Template Formasi Kustom (`CustomFormationTemplate`)**:
   - Disimpan secara persisten di `localStorage` (`tactigen_custom_formations_v1`).
   - Menyimpan `id`, `name`, `sportMode`, dan daftar koordinat `{ role, x, y }[]` dari para pemain *starting*.

### Pemetaan Interaksi Komponen & State
- **Pemilihan Formasi Preset / Kustom**:
  - Menghentikan simulasi multi-fasa yang sedang berjalan (`isInlineSimPlaying = false`), membersihkan lawan sementara dari simulasi corner (`enemy-ck-*`), menyelaraskan role pemain (*Auto-Fit Role* jika diaktifkan), menerapkan koordinat formasi, memperbarui *base anchor coordinates*, dan menyinkronkan `frames[0]` secara langsung tanpa `setTimeout`.
- **Perubahan Slider Geometri / Preset Gaya Taktis**:
  - Menghitung posisi `(x, y)` baru setiap pemain *starter* (selain `GK`) dari *base anchor* menggunakan rumus skala proporsional, membatasi nilai dalam batas aman lapangan (`x: 6..94`, `y: 10..84`), dan langsung memperbarui state `players` serta frame aktif sehingga papan lapangan dan kanvas poster bergerak secara serentak.
- **Penyimpanan & Penghapusan Formasi Kustom**:
  - Membaca posisi `(x, y)` dan `role` seluruh pemain *starter* saat ini (dinormalisasi jika sedang dalam Mode Lawan), menyimpannya ke daftar formasi kustom, dan menampilkannya baik di menu popup lapangan maupun di dalam Studio Formasi.
