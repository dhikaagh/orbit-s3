# orbit-s3 — Dokumen Konsep & Spesifikasi Teknis

> **Versi Dokumen:** 1.0.0
> **Terakhir Diperbarui:** 2025
> **Status:** In Development
> **Penulis:** Engineering Team

---

## Daftar Isi

1. [Project Overview](#1-project-overview)
2. [Detailed Architecture & Flow](#2-detailed-architecture--flow)
3. [Feature Specifications](#3-feature-specifications)
4. [Tech Stack & Libraries](#4-tech-stack--libraries)
5. [Struktur Direktori Proyek](#5-struktur-direktori-proyek)
6. [Roadmap Pengembangan](#6-roadmap-pengembangan)
7. [Strategi Keamanan](#7-strategi-keamanan)

---

## 1. Project Overview

### 1.1 Visi Produk

**orbit-s3** adalah aplikasi web _full-stack_ berbasis **Next.js 15** dan **TypeScript** yang berfungsi sebagai antarmuka grafis (GUI) untuk mengelola **AWS S3-compatible Object Storage**. Proyek ini dirancang untuk menghilangkan ketergantungan pengguna pada AWS Console atau CLI yang kompleks, dan menggantinya dengan pengalaman pengguna yang intuitif, modern, dan aman.

### 1.2 Problem Statement

Pengelolaan S3 bucket melalui AWS Console memiliki sejumlah hambatan:

- **Kurva belajar tinggi** — Console AWS memiliki ratusan layanan yang membingungkan pengguna baru.
- **Tidak fleksibel** — Tidak mendukung provider S3-compatible lain seperti **Cloudflare R2** dan **MinIO** secara langsung.
- **Keamanan multi-akun** — Sulit untuk berpindah antar akun atau credential set tanpa logout dan login ulang.
- **Pengalaman upload buruk** — Tidak ada fitur _drag & drop_ atau visual progress bar yang memadai.

### 1.3 Solusi yang Ditawarkan

orbit-s3 mengatasi masalah di atas melalui:

| Masalah | Solusi orbit-s3 |
| :--- | :--- |
| Console AWS terlalu kompleks | UI bersih yang berfokus pada operasi S3 saja |
| Tidak support R2/MinIO | Input *Custom Endpoint* pada form koneksi |
| Manajemen multi-akun sulit | Koneksi berbasis sesi (in-memory), mudah ganti akun |
| Upload pengalaman buruk | Drag & Drop dengan visual progress bar per-file |

### 1.4 Target Pengguna

- Developer dan DevOps yang mengelola beberapa S3 bucket sehari-hari.
- Tim yang menggunakan S3-compatible storage (R2, MinIO, Backblaze B2).
- Individu yang ingin alternatif ringan dari AWS Console untuk operasi S3 dasar.

### 1.5 Cakupan & Batasan

**Dalam cakupan (In-scope):**
- Manajemen Bucket (list, create, delete)
- Manajemen Object/File (upload, download, delete, metadata)
- Navigasi hirarkis berbasis prefix (simulasi folder)
- Koneksi dinamis dengan validasi real-time

**Di luar cakupan (Out-of-scope):**
- Manajemen IAM, policy bucket, atau konfigurasi CORS via UI
- Fitur kolaborasi multi-user / shared session
- Penyimpanan permanen kredensial (by design, demi keamanan)

---

## 2. Detailed Architecture & Flow

### 2.1 Arsitektur Sistem (High-Level)

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (Client)                        │
│                                                             │
│  ┌─────────────────┐    ┌──────────────────────────────┐   │
│  │  React UI Layer │    │      Zustand Store           │   │
│  │  (Next.js App   │◄──►│  (Credentials in RAM)        │   │
│  │   Router)       │    │  { accessKeyId,              │   │
│  └────────┬────────┘    │    secretAccessKey,          │   │
│           │             │    region, endpoint }        │   │
│           │             └──────────────────────────────┘   │
│           │ Server Action calls (via Next.js)              │
└───────────┼─────────────────────────────────────────────────┘
            │ HTTPS (encrypted)
            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Next.js Server (Node.js)                   │
│                                                             │
│  ┌─────────────────────────────────────────────────┐       │
│  │             Server Actions Layer                │       │
│  │  /src/services/                                 │       │
│  │  ├── auth.ts        (verifyConnection)          │       │
│  │  ├── buckets.ts     (CRUD Bucket)               │       │
│  │  └── objects.ts     (CRUD Object, Presign URL)  │       │
│  └───────────────────┬─────────────────────────────┘       │
│                      │ AWS SDK v3 calls                     │
└──────────────────────┼──────────────────────────────────────┘
                       │ HTTPS (AWS Signature V4)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│           S3-Compatible Object Storage Provider             │
│   (AWS S3 / Cloudflare R2 / MinIO / Backblaze B2 / etc.)   │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Alur Koneksi & Autentikasi

Berikut adalah alur lengkap dari saat pengguna membuka aplikasi hingga berhasil terhubung ke S3:

```
1. User membuka aplikasi
       │
       ▼
2. AuthGuard memeriksa state Zustand
       │
       ├─ [isConnected = false] ──► Redirect ke /  (Connection Page)
       │
       └─ [isConnected = true]  ──► Lanjut ke /dashboard

3. Di Connection Page:
       │
       ├─ User mengisi form: accessKeyId, secretAccessKey, region, endpoint (opsional)
       │
       ├─ react-hook-form + Zod memvalidasi input di sisi client
       │
       └─ Jika valid, klik tombol "Connect"
              │
              ▼
4. Server Action `verifyConnection()` dipanggil
       │
       ├─ Membuat S3Client baru dengan kredensial dari form
       │
       ├─ Menjalankan `ListBucketsCommand` sebagai health check
       │
       ├─ [Berhasil] ──► Return { success: true, buckets: [...] }
       │                        │
       │                        ▼
       │               5. Client menyimpan kredensial ke Zustand Store
       │                  → setCredentials({ accessKeyId, secretAccessKey, region, endpoint })
       │                  → isConnected = true
       │                        │
       │                        ▼
       │               6. Redirect otomatis ke /dashboard
       │
       └─ [Gagal] ──► Return { success: false, error: "InvalidAccessKeyId" }
                              │
                              ▼
                     Tampilkan toast error via Sonner
```

### 2.3 Alur Operasi File (Upload)

```
1. User membuka halaman bucket (mis. /dashboard/my-bucket)
       │
       ▼
2. User drag & drop file ke DropzoneUpload component
       │
       ▼
3. react-dropzone menangkap File[] dan melempar ke useUpload() hook
       │
       ▼
4. useUpload() hook:
       ├─ Mengambil kredensial dari Zustand Store
       ├─ Memanggil Server Action `uploadObject()` per file
       └─ Mengupdate state progress (0% → 100%) per file secara real-time
              │
              ▼
5. Server Action `uploadObject()`:
       ├─ Membuat S3Client dari kredensial yang diterima
       ├─ Menjalankan `PutObjectCommand` dengan stream data file
       └─ Return { success: true, key: "path/to/file.ext" }
              │
              ▼
6. UI diperbarui:
       ├─ Progress bar mencapai 100%
       ├─ Toast sukses via Sonner
       └─ TanStack Query invalidasi cache → daftar file di-refresh otomatis
```

### 2.4 Alur Download (Presigned URL)

```
1. User klik tombol "Download" pada sebuah file
       │
       ▼
2. Server Action `generatePresignedUrl()` dipanggil dengan key objek
       │
       ▼
3. Server membuat S3Client & menjalankan `getSignedUrl()` dengan
   `GetObjectCommand` + expiry time (default: 60 menit)
       │
       ▼
4. Server mengembalikan URL bertanda tangan (signed URL)
       │
       ▼
5. Browser membuka URL tersebut → download dimulai langsung dari S3
   (tidak melewati server Next.js, mengurangi beban bandwidth)
```

### 2.5 Navigasi Hierarki Prefix (Virtual Folder)

S3 tidak memiliki folder sungguhan — semua objek berada di level root dengan key berupa path (mis. `folder-a/sub-folder/file.txt`). orbit-s3 menyimulasikan navigasi folder dengan cara:

- Melakukan `ListObjectsV2Command` dengan parameter `prefix` (path saat ini) dan `delimiter: "/"`.
- Response S3 akan memisahkan `Contents` (file) dan `CommonPrefixes` (sub-folder).
- UI menampilkan keduanya secara terpisah, dan klik pada "folder" akan memperbarui `prefix` di state/URL.
- **Breadcrumb** dibangun secara dinamis dari nilai `prefix` yang aktif.

---

## 3. Feature Specifications

### 3.1 Fase 0 — Autentikasi & Manajemen Koneksi

#### 3.1.1 Connection Form

**Tujuan:** Titik masuk utama aplikasi. Memungkinkan pengguna memasukkan kredensial S3 mereka tanpa konfigurasi `.env`.

**Komponen:** `src/components/auth/connection-form.tsx`

**Fields Input:**

| Field | Tipe | Wajib | Keterangan |
| :--- | :--- | :---: | :--- |
| `accessKeyId` | `string` | ✅ | AWS Access Key ID atau equivalent |
| `secretAccessKey` | `string` | ✅ | AWS Secret Access Key (masked/password field) |
| `region` | `string` | ✅ | Region AWS (mis. `ap-southeast-1`) dengan dropdown |
| `endpoint` | `string (URL)` | ❌ | Custom endpoint untuk R2/MinIO (mis. `https://xxx.r2.cloudflarestorage.com`) |

**Workflow:**
1. Validasi skema menggunakan Zod (`connectionSchema`) saat input berubah.
2. Tombol "Connect" aktif hanya jika form valid.
3. Saat submit: tampilkan loading state → panggil Server Action `verifyConnection()`.
4. Berhasil → simpan ke Zustand → redirect ke `/dashboard`.
5. Gagal → tampilkan pesan error spesifik dari AWS (mis. "Kredensial tidak valid" untuk `InvalidAccessKeyId`).

**Validasi Zod (`src/lib/schema.ts`):**
```typescript
const connectionSchema = z.object({
  accessKeyId: z.string().min(16, "Access Key terlalu pendek").max(128),
  secretAccessKey: z.string().min(1, "Secret Key wajib diisi"),
  region: z.string().min(1, "Region wajib dipilih"),
  endpoint: z.string().url("Format URL tidak valid").optional().or(z.literal("")),
});
```

#### 3.1.2 Auth Guard

**Tujuan:** Melindungi semua route di bawah `/dashboard` dari akses tanpa autentikasi.

**Komponen:** `src/components/auth/auth-guard.tsx`

**Logic:**
- Membaca `isConnected` dari Zustand Store.
- Jika `false`, redirect ke halaman `/` (Connection Page).
- Jika `true`, render `children`.
- Diimplementasikan sebagai wrapper di layout `/dashboard/layout.tsx`.

#### 3.1.3 Disconnect / Session Clear

**Tujuan:** Memastikan tidak ada jejak kredensial tersisa di browser setelah pengguna selesai.

**Trigger:** Tombol "Disconnect" di navbar/sidebar.

**Aksi:** Memanggil `clearCredentials()` di Zustand Store → `isConnected = false` → redirect ke `/`.

---

### 3.2 Fase 1 — Explorer & Bucket Management

#### 3.2.1 Dashboard — Daftar Bucket

**Tujuan:** Halaman utama pasca-login. Menampilkan semua bucket yang dimiliki akun.

**Komponen:** `src/components/bucket/bucket-list.tsx`

**Data Source:** Server Action `listBuckets()` → `ListBucketsCommand`

**Informasi yang ditampilkan per bucket:**

| Field | Sumber |
| :--- | :--- |
| Nama Bucket | `bucket.Name` |
| Tanggal Dibuat | `bucket.CreationDate` |
| Region | Diperoleh via `GetBucketLocationCommand` |

**UX Notes:**
- Data di-cache oleh TanStack Query dengan `staleTime: 60_000` (60 detik).
- Tampilan kartu (grid) dengan hover effect, atau tabel dengan sorting.
- Loading state menggunakan skeleton component.

#### 3.2.2 Create Bucket

**Tujuan:** Membuat bucket baru langsung dari UI.

**Komponen:** `src/components/bucket/create-bucket-modal.tsx`

**Workflow:**
1. Klik tombol "+ New Bucket" → buka modal dialog.
2. Input nama bucket dengan validasi (hanya huruf kecil, angka, dan tanda hubung; 3–63 karakter).
3. Pilih region (default: region yang sama dengan koneksi aktif).
4. Konfirmasi → panggil Server Action `createBucket()` → `CreateBucketCommand`.
5. Berhasil → tutup modal → TanStack Query invalidasi cache bucket list → toast sukses.

#### 3.2.3 Delete Bucket

**Tujuan:** Menghapus bucket yang kosong.

**Workflow:**
1. Klik tombol "Delete" pada bucket → buka dialog konfirmasi.
2. Pengguna harus mengetik ulang nama bucket untuk konfirmasi (mencegah penghapusan tidak sengaja).
3. Konfirmasi → panggil `deleteBucket()` → `DeleteBucketCommand`.
4. Jika bucket tidak kosong, tampilkan error informatif.

---

### 3.3 Fase 2 — Manajemen File & Upload

#### 3.3.1 File Table (Object Explorer)

**Tujuan:** Menampilkan konten bucket (file dan folder virtual) pada prefix tertentu.

**Komponen:** `src/components/objects/file-table.tsx`

**Data Source:** Server Action `listObjects(bucket, prefix)` → `ListObjectsV2Command`

**Kolom Tabel:**

| Kolom | Sumber | Keterangan |
| :--- | :--- | :--- |
| Nama / Ikon | `key` (dipisah dari prefix) | Folder atau file |
| Ukuran | `object.Size` | Format: KB/MB/GB |
| Tipe | `object.ContentType` | MIME type (mis. `image/png`) |
| Terakhir Diubah | `object.LastModified` | Format: relatif (mis. "2 jam lalu") |
| Aksi | — | Download, Delete, Copy URL |

**UX Notes:**
- Klik baris folder → perbarui `prefix` state → query ulang dengan prefix baru.
- Breadcrumb diperbarui secara sinkron.
- Sorting per kolom didukung di sisi client (TanStack Table).

#### 3.3.2 Drag & Drop Upload

**Tujuan:** Memungkinkan upload file dengan cara yang intuitif.

**Komponen:** `src/components/objects/dropzone-upload.tsx`

**Library:** `react-dropzone`

**Fitur Detail:**
- Area drop terintegrasi di seluruh halaman bucket (fullscreen overlay saat file di-drag ke browser).
- Mendukung multi-file upload secara bersamaan.
- Setiap file memiliki progress bar individual (0–100%).
- File yang sedang upload ditampilkan dalam sebuah upload queue panel.
- Status per file: `pending` → `uploading` → `success` / `error`.
- File yang gagal dapat di-retry tanpa harus memilih ulang.

**Upload Queue State (dikelola `useUpload` hook):**
```typescript
interface UploadItem {
  id: string;           // UUID lokal
  file: File;
  key: string;          // S3 key (prefix + filename)
  progress: number;     // 0-100
  status: "pending" | "uploading" | "success" | "error";
  errorMessage?: string;
}
```

---

### 3.4 Fase 3 — Operasi Lanjutan pada Objek

#### 3.4.1 Download File

**Metode:** Presigned URL (via `@aws-sdk/s3-request-presigner`)

**Alur:** Klik "Download" → Server Action `generatePresignedUrl()` → buka URL di tab baru atau trigger download otomatis.

**Keuntungan:** File mengalir langsung dari S3 ke browser pengguna, tidak membebani server Next.js.

#### 3.4.2 Delete Object

**Fitur:**
- **Hapus Satu File:** Konfirmasi dialog sederhana → `DeleteObjectCommand`.
- **Bulk Delete:** Centang beberapa file → klik "Delete Selected" → konfirmasi → `DeleteObjectsCommand` (batch).

#### 3.4.3 Metadata View

**Tujuan:** Menampilkan informasi detail sebuah objek.

**Cara Akses:** Klik nama file → buka detail panel/drawer.

**Informasi yang Ditampilkan:**
- Key (path lengkap)
- Ukuran file
- MIME Type / Content-Type
- Tanggal dibuat & dimodifikasi
- ETag (hash MD5)
- Storage Class (STANDARD, INTELLIGENT_TIERING, dll.)

---

## 4. Tech Stack & Libraries

### 4.1 Core Framework

| Library | Versi | Fungsi Spesifik di Proyek |
| :--- | :--- | :--- |
| `next` | 15+ | App Router, Server Actions, file-based routing untuk halaman `/`, `/dashboard`, `/dashboard/[bucket]` |
| `react` | 19+ | UI layer, state management lokal komponen |
| `typescript` | 5+ | Type-safety untuk semua tipe AWS SDK response, Zod schema, dan store state |

### 4.2 AWS SDK & Storage

| Library | Fungsi Spesifik di Proyek |
| :--- | :--- |
+| `@aws-sdk/client-s3` | Semua interaksi dengan S3: `ListBucketsCommand`, `ListObjectsV2Command`, `PutObjectCommand`, `DeleteObjectCommand`, `GetObjectCommand`, `CreateBucketCommand`, `DeleteBucketCommand` |
+| `@aws-sdk/s3-request-presigner` | Membuat URL bertanda tangan (`getSignedUrl`) untuk download aman tanpa mengekspos kredensial ke browser |

**Catatan Penting:** S3Client dibuat di sisi server (Server Actions) pada setiap request menggunakan kredensial yang dikirim dari client. Ini memastikan AWS SDK **tidak pernah berjalan di browser**.

### 4.3 UI & Styling

| Library | Fungsi Spesifik di Proyek |
| :--- | :--- |
+| `tailwindcss` | Utility-first CSS untuk semua styling komponen |
+| `shadcn/ui` | Komponen siap pakai: `Dialog`, `Table`, `Button`, `Input`, `Toast`, `Breadcrumb`, `Progress`, `Skeleton`, `DropdownMenu` |
+| `lucide-react` | Ikon konsisten untuk aksi (upload, download, delete, folder, file) |

### 4.4 State Management & Data Fetching

| Library | Fungsi Spesifik di Proyek |
| :--- | :--- |
+| `zustand` | Menyimpan kredensial koneksi (`accessKeyId`, `secretAccessKey`, `region`, `endpoint`) di RAM. Data otomatis hilang saat page refresh. |
+| `@tanstack/react-query` | Caching & sinkronisasi data untuk daftar bucket dan daftar file. Menyediakan `invalidateQueries` untuk refresh otomatis pasca mutasi (upload, delete, create). |

### 4.5 Form & Validasi

| Library | Fungsi Spesifik di Proyek |
| :--- | :--- |
+| `react-hook-form` | Manajemen state form pada `ConnectionForm` dan `CreateBucketModal`. |
+| `zod` | Mendefinisikan `connectionSchema` dan `createBucketSchema`. Digunakan dengan `zodResolver` di react-hook-form. |
+| `@hookform/resolvers` | Adapter untuk menghubungkan Zod schema dengan react-hook-form. |

### 4.6 Upload & Notifications

| Library | Fungsi Spesifik di Proyek |
| :--- | :--- |
+| `react-dropzone` | Menangkap event drag & drop file, mengakses `File[]` dari pengguna, menampilkan overlay fullscreen saat file di-drag ke window. |
+| `sonner` | Toast notification untuk feedback sukses/error semua operasi (connect, upload, delete, create bucket). |

---

## 5. Struktur Direktori Proyek

```text
orbit-s3/
├── docs/
│   └── KONSEP.md              ← Dokumen ini
│
├── src/
│   ├── app/
│   │   ├── page.tsx           ← Halaman Connection (root "/")
│   │   ├── layout.tsx         ← Root layout (Sonner Toaster, TanStack Query Provider)
│   │   └── dashboard/
│   │       ├── layout.tsx     ← Layout dashboard (AuthGuard, Sidebar)
│   │       ├── page.tsx       ← Halaman daftar bucket
│   │       └── [bucket]/
│   │           └── page.tsx   ← Halaman file explorer per bucket
│   │
│   ├── components/
│   │   ├── auth/
│   │   │   ├── connection-form.tsx    ← Form input kredensial
│   │   │   └── auth-guard.tsx         ← Proteksi route dashboard
│   │   ├── layout/
│   │   │   ├── sidebar.tsx            ← Navigasi utama & tombol disconnect
│   │   │   ├── user-nav.tsx           ← Info koneksi aktif di navbar
│   │   │   └── breadcrumbs.tsx        ← Navigasi hirarkis prefix S3
│   │   ├── bucket/
│   │   │   ├── bucket-list.tsx        ← Grid/tabel daftar bucket
│   │   │   └── create-bucket-modal.tsx
│   │   ├── objects/
│   │   │   ├── file-table.tsx         ← Tabel file & folder virtual
│   │   │   └── dropzone-upload.tsx    ← Area drag & drop + upload queue
│   │   └── ui/                        ← Re-export shadcn/ui components
│   │
│   ├── hooks/
│   │   ├── use-s3-client.ts   ← Factory hook: membuat S3Client dari store (server-side only)
│   │   └── use-upload.ts      ← Manajemen upload queue & progress state
│   │
│   ├── lib/
│   │   ├── schema.ts          ← Zod schemas (connectionSchema, createBucketSchema)
│   │   └── utils.ts           ← Helper: formatBytes, formatDate, buildBreadcrumbs
│   │
│   ├── services/              ← Server Actions (hanya berjalan di server)
│   │   ├── auth.ts            ← verifyConnection()
│   │   ├── buckets.ts         ← listBuckets(), createBucket(), deleteBucket()
│   │   └── objects.ts         ← listObjects(), uploadObject(), deleteObject(),
│   │                              deleteObjects(), generatePresignedUrl()
│   │
│   └── store/
│       └── auth-store.ts      ← Zustand store: kredensial & isConnected flag
│
├── .env.example               ← (Kosong — tidak ada hardcoded credentials)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 6. Roadmap Pengembangan

### Fase 0 — Autentikasi & Koneksi *(Target: Sprint 1)*

- [x] Zod schema validasi form koneksi
- [x] Zustand store untuk kredensial sesi
- [x] Server Action `verifyConnection()` dengan `ListBucketsCommand`
- [x] UI `ConnectionForm` dengan react-hook-form + Zod
- [ ] `AuthGuard` component & proteksi route `/dashboard`
- [ ] Tombol Disconnect + `clearCredentials()`

### Fase 1 — Bucket Management *(Target: Sprint 2)*

- [ ] Halaman Dashboard: daftar bucket dengan kartu/tabel
- [ ] Server Actions: `listBuckets`, `createBucket`, `deleteBucket`
- [ ] Modal Create Bucket dengan validasi nama
- [ ] Dialog konfirmasi Delete Bucket (ketik ulang nama)
- [ ] TanStack Query integration + cache invalidation

### Fase 2 — File Explorer & Upload *(Target: Sprint 3)*

- [ ] Halaman `[bucket]`: File Table dengan prefix navigation
- [ ] Breadcrumb dinamis dari S3 prefix
- [ ] Server Action `listObjects()` dengan prefix & delimiter
- [ ] `DropzoneUpload` dengan fullscreen drag overlay
- [ ] Multi-file upload queue with progress bar per file
- [ ] Retry mekanisme untuk file yang gagal diupload

### Fase 3 — Operasi Lanjutan *(Target: Sprint 4)*

- [ ] Download via Presigned URL
- [ ] Delete single object dengan konfirmasi
- [ ] Bulk delete (checkbox multi-select)
- [ ] Metadata viewer panel/drawer
- [ ] Copy S3 URL / Presigned URL ke clipboard

### Fase 4 — Polish & QA *(Target: Sprint 5)*

- [ ] Error handling komprehensif (AWS error codes → pesan ramah pengguna)
- [ ] Responsive design (mobile & tablet)
- [ ] Loading skeleton untuk semua komponen data-heavy
- [ ] Empty state UI (bucket kosong, tidak ada file, dll.)
- [ ] End-to-end test dengan Playwright

---

## 7. Strategi Keamanan

### 7.1 Prinsip Server-Side Proxy

**Aturan utama:** AWS SDK **tidak boleh dijalankan di sisi browser (client-side).**

Semua interaksi dengan S3 harus melalui **Next.js Server Actions**. Hal ini mencegah:
- Eksposur `secretAccessKey` di tab Network browser.
- Credential theft melalui XSS attack.

```
❌ DILARANG:
Browser → AWS S3 (langsung, mengekspos credentials di Network tab)

✅ WAJIB:
Browser → Next.js Server Action → AWS S3
```

### 7.2 In-Memory Credential Storage

Kredensial disimpan di **Zustand Store** (JavaScript memory), **bukan** di:
- `localStorage` (persisten, rentan XSS)
- `sessionStorage` (persisten dalam satu tab)
- `cookies` (dikirim di setiap request, perlu HttpOnly)

Konsekuensi yang diinginkan (by design): **kredensial hilang saat page di-refresh.** Pengguna harus login ulang, yang merupakan perilaku yang aman untuk aplikasi ini.

### 7.3 Error Handling AWS

Petakan kode error AWS ke pesan yang informatif dan tidak terlalu teknis:

| AWS Error Code | Pesan untuk Pengguna |
| :--- | :--- |
| `InvalidAccessKeyId` | "Access Key ID tidak valid. Periksa kembali kredensial Anda." |
| `SignatureDoesNotMatch` | "Secret Access Key tidak cocok. Periksa kembali." |
| `AccessDenied` | "Akun Anda tidak memiliki izin untuk tindakan ini." |
| `NoSuchBucket` | "Bucket tidak ditemukan atau telah dihapus." |
| `BucketNotEmpty` | "Bucket tidak dapat dihapus karena masih berisi file." |
| `NetworkingError` | "Tidak dapat terhubung ke endpoint. Periksa URL dan koneksi internet Anda." |

### 7.4 Validasi Input

Semua input pengguna divalidasi di **dua lapisan**:
1. **Client-side:** Zod + react-hook-form (feedback instan, UX).
2. **Server-side:** Zod validation ulang di Server Action (keamanan, mencegah bypass).

---

## Perintah Instalasi

```bash
# Inisialisasi proyek (jika belum ada)
npx create-next-app@latest orbit-s3 --typescript --tailwind --app

# Masuk ke direktori
cd orbit-s3

# AWS SDK
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# State Management & Data Fetching
pnpm add zustand @tanstack/react-query

# Form & Validasi
pnpm add react-hook-form zod @hookform/resolvers

# UI Components & Icons
pnpm add sonner react-dropzone lucide-react

# shadcn/ui (inisialisasi)
npx shadcn@latest init
npx shadcn@latest add button input dialog table progress skeleton breadcrumb dropdown-menu
```

---

*Dokumen ini adalah living document. Perbarui setiap kali ada perubahan arsitektur, penambahan fitur, atau keputusan teknis yang signifikan.*
