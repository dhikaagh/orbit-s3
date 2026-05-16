# 📂 Rencana Proyek: S3 Explorer (Next.js + AWS SDK)

Proyek ini bertujuan untuk membangun antarmuka web (GUI) yang ramah pengguna untuk mengelola **AWS S3 Object Storage**. Aplikasi ini mendukung koneksi dinamis menggunakan kredensial yang dimasukkan langsung oleh pengguna.

---

## 🏗️ Arsitektur Teknologi (Tech Stack)

| Komponen | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Framework** | Next.js 15+ (App Router) | Menggunakan versi terbaru untuk performa optimal. |
| **Bahasa** | TypeScript | Type-safety untuk integrasi AWS SDK yang lebih aman. |
| **Styling** | Tailwind CSS + Shadcn/UI | Untuk UI yang modern, responsif, dan premium. |
| **Backend/SDK** | @aws-sdk/client-s3 | AWS SDK v3 untuk interaksi dengan S3. |
| **State Management** | Zustand | Menyimpan kredensial sesi di RAM (volatile). |
| **Data Fetching** | TanStack Query | Manajemen fetching, caching, dan sinkronisasi data. |
| **Notifications** | Sonner | Toast notification yang cantik dan intuitif. |
| **Upload Handling** | react-dropzone | Mendukung fitur Drag & Drop file. |

---

## 🔐 Manajemen Koneksi Dinamis

Aplikasi tidak menggunakan satu set kredensial tetap di `.env`, melainkan membiarkan pengguna memasukkan kredensial mereka sendiri melalui UI:

- **Halaman Koneksi**: Form input untuk *Access Key ID*, *Secret Access Key*, dan *Region*.
- **Validasi Real-time**: Menjalankan perintah `ListBucketsCommand` saat tombol **Connect** diklik untuk verifikasi kredensial.
- **Keamanan Sesi**: Kredensial disimpan di dalam *Zustand store*. Data akan hilang jika halaman di-refresh atau tab ditutup, memastikan tidak ada data sensitif yang tersimpan permanen di browser.

---

## 🛠️ Struktur Modular Folder

```text
/src
 ├── app/               # Routing: Login, Dashboard, dan Bucket View
 ├── components/        
 │    ├── auth/         # ConnectionForm.tsx, AuthGuard.tsx
 │    ├── layout/       # Sidebar.tsx, UserNav.tsx, Breadcrumbs.tsx
 │    ├── bucket/       # BucketList.tsx, CreateBucketModal.tsx
 │    ├── objects/      # FileTable.tsx, DropzoneUpload.tsx (Drag & Drop)
 │    └── ui/           # Komponen reusable (Button, Input, Progress bar)
 ├── hooks/             # Custom hooks: useS3Client.ts, useUpload.ts
 ├── lib/               # Konfigurasi utility dan skema validasi (Zod)
 ├── store/             # useAuthStore.ts (Zustand)
 └── services/          # Server Actions untuk operasi S3 (Bucket & Object)
```

---

## 📝 Roadmap Pengembangan

### 1. Fase 0: Autentikasi & Setup Koneksi (Detailed)
- [x] **Validasi Skema & Tipe Data**:
    - Implementasi `connectionSchema` menggunakan Zod di `src/lib/schema.ts`.
    - Mendukung *Custom Endpoint* untuk kompatibilitas dengan Cloudflare R2 atau MinIO.
- [x] **State Management (Zustand)**:
    - Setup `useAuthStore` di `src/store/auth-store.ts` untuk penyimpanan kredensial di RAM.
    - Menambahkan fungsi `clearCredentials` untuk fitur *Disconnect*.
- [x] **Server-Side Verification**:
    - Implementasi Server Action `verifyConnection` di `src/services/auth.ts`.
    - Menggunakan perintah `ListBucketsCommand` sebagai *health check* kredensial.
- [x] **UI Connection Form**:
    - Membangun form interaktif di `src/components/auth/connection-form.tsx`.
    - Integrasi `react-hook-form` dengan `zodResolver`.
    - Feedback visual menggunakan `Sonner` (toast) dan loading spinner.
- [ ] **Auth Guard & Proteksi Route**:
    - Membuat komponen `AuthGuard.tsx` untuk memproteksi halaman `/dashboard`.
    - Implementasi logic redirect otomatis jika state `isConnected` bernilai false.

### 2. Fase 1: Explorer & Bucket Management
- [ ] Halaman Dashboard: Menampilkan daftar bucket dalam bentuk kartu atau tabel.
- [ ] Fitur *Create Bucket* dan *Delete Bucket* dengan dialog konfirmasi.
- [ ] Notifikasi sukses/error menggunakan Sonner.

### 3. Fase 2: Manajemen File & Drag & Drop 🚀
- [ ] Implementasi `react-dropzone` untuk area drop file.
- [ ] **Visual Progress Bar**: Menampilkan status unggahan (0-100%) untuk setiap file.
- [ ] Dukungan *Multi-file Upload* (unggah banyak file sekaligus).
- [ ] Feedback visual (overlay) saat file ditarik ke dalam area browser.

### 4. Fase 3: Operasi Objek & File
- [ ] **Download**: Mengenerate *Presigned URL* untuk unduhan aman.
- [ ] **Delete Object**: Fitur hapus satu file atau hapus masal (*bulk delete*).
- [ ] **Metadata View**: Melihat informasi ukuran file, tipe MIME, dan tanggal modifikasi.

---

## 💡 Saran & Strategi Keamanan

1.  **Server-Side Proxy**: Selalu gunakan *Server Actions* untuk berinteraksi dengan AWS SDK. Jangan biarkan browser memanggil AWS secara langsung untuk menghindari eksposur kredensial di tab Network.
2.  **Breadcrumb Navigation**: Implementasikan navigasi hirarkis (Contoh: `Home > my-bucket > folder-A`) karena S3 menggunakan sistem prefix.
3.  **Error Handling**: Tangkap error spesifik dari AWS (seperti `AccessDenied` atau `NoSuchBucket`) dan tampilkan dalam bahasa yang mudah dipahami.
4.  **Fitur Disconnect**: Sediakan tombol logout yang akan melakukan `clearStore()` di Zustand untuk menghapus jejak kredensial.

---

## 🚀 Perintah Instalasi Utama

Gunakan perintah berikut untuk menginstal dependensi menggunakan **pnpm**:

```bash
# AWS SDK
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# State & UI Logic
pnpm add zustand sonner react-dropzone lucide-react

# TanStack Query & Validation
pnpm add @tanstack/react-query zod
```
