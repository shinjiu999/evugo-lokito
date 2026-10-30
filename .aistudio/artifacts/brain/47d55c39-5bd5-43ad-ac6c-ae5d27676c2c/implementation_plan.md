# Integrasi Studio Poster HD di Zona Lapangan Utama dengan Tombol Switch

Memindahkan **Studio Poster Lineup HD** sepenuhnya ke **Zona Lapangan Tengah** (`Pitch Zone`) dan menghadirkannya melalui **Tombol Switch** di bar kontrol atas luar lapangan, sehingga ukuran kanvas poster tampil maksimal setara dimensi lapangan taktis dengan bar pengaturan ringkas di atas dan bawah poster.

### User Review & Critical Decisions

> [!IMPORTANT]
> Keputusan tata letak dan interaksi berikut telah dikonfirmasi dan siap diimplementasikan:

- **Keputusan Terkonfirmasi 1 (Posisi Tombol Switch)**: Tombol switch pergantian mode antara **Lapangan Taktis** dan **Studio Poster HD** ditempatkan di **Bar Kontrol Atas Luar Lapangan** (`#pitch-top-control-bar`), memudahkan pengguna beralih mode kapan saja tanpa menutupi area rumput maupun poster.
- **Keputusan Terkonfirmasi 2 (Tata Letak Pengaturan Poster HD)**: Saat mode **Studio Poster HD** aktif di zona lapangan, pengaturan tema visual, rasio ukuran (`4:3`, `1:1`, `9:16`), judul pertandingan, layer atribut, serta tombol unduh/salin disusun dalam **Bar Ringkas di Atas dan Bawah Poster** agar area tengah 100% didedikasikan untuk ukuran kanvas poster yang maksimal seperti lapangan.
- **Keputusan Terkonfirmasi 3 (Pemisahan Fungsi Panel Kiri)**: Kartu Studio Poster HD dihapus dari sidebar/kolom kiri sehingga kolom kiri khusus menampilkan **Studio Formasi & Lini Taktis**, sedangkan seluruh fungsi pembuatan dan ekspor **Poster Lineup HD** terpusat di zona lapangan utama.

---

### 1. Overview & Core Concept

- **Apa yang Dilakukan**: Mengubah zona lapangan tengah menjadi kanvas dwi-mode (**Lapangan Taktis Interaktif** ↔ **Studio Poster Lineup HD**). Ketika pengguna mengaktifkan switch **Poster HD**, area lapangan tengah langsung bertransformasi menjadi ruang kerja poster resolusi tinggi dengan skala penuh.
- **Target Pengguna**: Pelatih, analis taktik, dan manajer tim yang ingin menyusun formasi di lapangan lalu langsung melihat dan mengunduh hasil Poster Lineup HD dalam ukuran besar yang proporsional tanpa terhimpit di kolom samping.
- **Nilai Utama**:
  - **Ukuran Kanvas Maksimal**: Pratinjau poster mendapatkan lebar dan tinggi penuh setara panggung lapangan utama (`max-w-[580px]` pada mode standar dan skala penuh pada mode layar penuh).
  - **Pemisahan Konteks yang Jelas**: Kolom kiri fokus pada rekayasa taktik lini (**Studio Formasi & Lini**), sementara zona tengah dapat di-switch secara instan antara simulasi lapangan dan produksi poster pertandingan.

---

### 2. User Experience & Visual Design

- **Alur Pengguna Utama (Key User Flows)**:
  1. **Switch Mode di Bar Atas Luar Lapangan**: Pada bar kontrol atas luar lapangan, pengguna melihat tombol switch bergaya *segmented toggle* berlogo ikon dengan tooltip hover (**Lapangan** ↔ **Poster HD**).
  2. **Mode Lapangan Taktis (Default)**: Menampilkan bar kontrol atas, *Telemetry HUD*, papan rumput interaktif (`Pitch`), toolbar alat gambar vertikal di sisi kanan, dan bar kontrol bawah luar lapangan.
  3. **Mode Studio Poster HD (Saat Switch Aktif)**:
     - **Bar Ringkas Atas Poster**: Menampilkan pemilih **Tema Poster** (Tosca Sporty, Champions Neon, Gold Prestige, Matchday TV, Studio Swiss, Calcio 90s), pemilih **Rasio Kanvas** (`4:3`, `1:1`, `9:16`), dan tab mode render (**Kanvas Vektor Instan** vs **AI Stadium Artwork**).
     - **Panggung Utama Kanvas Poster (Ukuran Maksimal)**: Menampilkan kanvas poster HD secara utuh dengan ukuran setara lapangan utama, mendukung klik untuk zoom/layar penuh dan pembaruan *real-time* setiap kali formasi atau pemain diubah.
     - **Bar Ringkas Bawah Poster**: Menampilkan input cepat info laga (Judul Laga, Nama Lawan, Stadion), tombol *toggle* elemen visual (Garis Lini, Zona Taktis, Cadangan, Pelatih), serta tombol aksi utama **Unduh PNG HD** dan **Salin Gambar**.
  4. **Akses Cepat dari Tombol Poster Lainnya**: Mengklik ikon **Poster HD** di panel identitas klub atau bar bawah secara otomatis mengalihkan switch zona lapangan ke mode **Studio Poster HD**.

- **Identitas Visual & Tema**:
  - *Aesthetic Direction*: **Soft Sporty Tosca Broadcast Studio** — memadukan estetika papan taktik olahraga modern dengan ruang desain grafis siaran televisi.
  - *Color Palette & Mood*:
    - Kanvas Utama (`60%`): Deep Ocean Slate (`#061318`) dan Dark Pitch Container (`#041014`).
    - Permukaan Struktural (`30%`): Frosted Tosca Glass (`#071c22/95`) dengan garis tepi halus `border-teal-400/25`.
    - Aksen Utama (`10%`): Sporty Teal (`#2dd4bf`) & Emerald (`#10b981`) untuk indikator switch aktif dan tombol unduh utama.
  - *Typography & Hierarchy*:
    - Display / Header: `Outfit` / `Plus Jakarta Sans` tegas untuk label mode dan judul poster.
    - Body & Controls: `Plus Jakarta Sans` ukuran kompak (`11px`–`12px`) dengan keterbacaan tinggi dan `whitespace-nowrap`.
    - Data & Rasio: `JetBrains Mono` (`tabular-nums`) untuk indikator formasi (`4-3-3`) dan rasio (`4:3`, `1:1`, `9:16`).

- **Feedback Interaktif & Motion**:
  - Transisi halus ($\le 180\text{ms}$) saat beralih antara **Lapangan Taktis** dan **Studio Poster HD**.
  - Indikator salin ke clipboard (`Disalin!`) dan *loading state* yang jelas saat merender latar AI Stadium.

---

### 3. Key Product Decisions & Trade-Offs

- **Keputusan 1: Menyatukan Studio Poster HD ke Panggung Zona Lapangan (Menggantikan Kartu Kecil di Sidebar)**
  - *Pendekatan Terpilih*: Menyediakan state mode tampilan zona lapangan (`pitchViewMode: "pitch" | "poster"`) yang dikendalikan oleh tombol switch di bar kontrol atas luar lapangan.
  - *Alasan*: Pratinjau poster di kolom samping terlalu sempit untuk mengecek detail nama pemain, foto, dan tata letak bangku cadangan. Menempatkannya di zona lapangan memberikan ukuran visual maksimal tanpa harus membuka modal pop-up yang menutupi seluruh layar kerja.
  - *Alternatif yang Dipertimbangkan*: Tetap menampilkan kartu kecil di kolom kiri atau selalu membuka modal penuh — ditolak karena memenuhi ruang kolom kiri dan tidak sesuai dengan permintaan pengguna agar ditempatkan di zona lapangan dengan tombol switch.

- **Keputusan 2: Bar Kontrol Ringkas di Atas & Bawah Poster**
  - *Pendekatan Terpilih*: Mengikuti pola struktur bar atas dan bawah luar lapangan yang sudah akrab bagi pengguna, di mana bar atas mengatur gaya visual/rasio dan bar bawah mengatur metadata pertandingan serta tombol unduh.
  - *Alasan*: Menjaga konsistensi spasial saat pengguna menekan tombol switch; posisi bar atas dan bawah tetap stabil sedangkan area tengah berganti mulus antara rumput lapangan dan kanvas poster HD.

---

### 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Diagram Arsitektur & Hirarki Komponen**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                 App Workspace                               │
├──────────────────────┬───────────────────────────────────┬──────────────────┤
│   Kolom Kiri (3 Col) │     Zona Lapangan Tengah (6 Col)  │ Kolom Kanan(3Col)│
│                      │                                   │                  │
│ ┌──────────────────┐ │ ┌───────────────────────────────┐ │ ┌──────────────┐ │
│ │  Identitas Klub  │ │ │ Bar Kontrol Atas Luar Lapangan│ │ │ Simulasi     │ │
│ └──────────────────┘ │ │  [Tema] [Switch: Lap | Poster]│ │ │ Sepak Pojok  │ │
│ ┌──────────────────┐ │ └───────────────┬───────────────┘ │ │ / Animasi /  │ │
│ │ Studio Formasi & │ │                 │                 │ │ AI Coach     │ │
│ │   Lini Taktis    │ │        ┌────────┴────────┐        │ └──────────────┘ │
│ │ (Khusus Taktik)  │ │        ▼                 ▼        │                  │
│ └──────────────────┘ │ ┌──────────────┐ ┌──────────────┐ │                  │
│ ┌──────────────────┐ │ │ Mode: PITCH  │ │ Mode: POSTER │ │                  │
│ │  Daftar Skuad &  │ │ │              │ │              │ │                  │
│ │ Bangku Cadangan  │ │ │ [HUD Taktis] │ │ [Bar Atas    │ │                  │
│ └──────────────────┘ │ │ [Kanvas      │ │  Tema&Rasio] │ │                  │
│                      │ │  Rumput &    │ │ [Kanvas      │ │                  │
│                      │ │  Pemain]     │ │  Poster HD   │ │                  │
│                      │ │ [Bar Bawah   │ │  Ukuran Maks]│ │                  │
│                      │ │  Kontrol]    │ │ [Bar Bawah   │ │                  │
│                      │ └──────────────┘ │  Info&Unduh] │ │                  │
│                      │                  └──────────────┘ │                  │
└──────────────────────┴───────────────────────────────────┴──────────────────┘
```

- **Model Data & State**:
  - `pitchZoneMode: "pitch" | "poster"` di state utama aplikasi untuk mengatur tampilan aktif di zona lapangan tengah.
  - Komponen `AIFormationImageGenerator` mendukung pemisahan mode render (`viewMode?: "formation-only" | "poster-stage"`):
    - `formation-only`: Digunakan di kolom kiri untuk merender kartu **Studio Formasi & Lini** beserta modal pengaturan struktur lini.
    - `poster-stage`: Digunakan di dalam **Zona Lapangan Tengah** saat switch berada pada posisi **Poster HD**, merender bar ringkas atas (tema, rasio, tab AI), panggung kanvas poster ukuran penuh (mendukung rasio `4:3`, `1:1`, `9:16` serta mode layar penuh), dan bar ringkas bawah (input teks pertandingan, toggle layer, tombol Unduh PNG & Salin Gambar).

- **Pemetaan Interaksi & State**:
  - Mengubah formasi, menggeser slider garis pertahanan/lebar tim di **Studio Formasi & Lini** (kolom kiri), atau mengganti pemain starter langsung memperbarui kanvas **Studio Poster HD** secara reaktif jika mode Poster HD sedang aktif di zona lapangan.
  - Tombol **Mode Layar Penuh** di bar atas luar lapangan tetap berfungsi baik saat pengguna berada di mode **Lapangan Taktis** maupun **Studio Poster HD**.
