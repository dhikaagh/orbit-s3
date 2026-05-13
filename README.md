# Orbit S3

**Orbit S3** adalah solusi manajemen penyimpanan objek (Object Storage) modern yang dibangun dengan Next.js dan TypeScript. Platform ini dirancang untuk memberikan interface yang intuitif dan aman dalam mengelola aset digital di berbagai provider yang mendukung protokol S3.

A user-friendly S3 bucket manager built with Next.js and AWS SDK v3. Simplify file uploads, downloads, and bucket management with a clean interface.

## 🚀 Fitur Utama

- **Multi-Provider Support**: Kompatibel dengan AWS S3, Cloudflare R2, MinIO, dan lainnya.
- **Secure Handling**: Manajemen Pre-signed URL untuk akses file yang aman.
- **Metadata Management**: Pengelolaan metadata tambahan untuk setiap aset.
- **Performance Optimized**: Mendukung streaming untuk file berukuran besar.

## 📖 Dokumentasi

Kami menjaga standar kualitas tinggi melalui dokumentasi yang terstruktur:

- [Konsep Proyek](docs/KONSEP.md) - Visi dan arsitektur sistem.
- [Coding Standard](docs/coding-standard.md) - Standar penulisan kode (SOLID, DRY, KISS).
- [Commit Standard](docs/commit-standard.md) - Aturan penulisan pesan commit (Conventional Commits).
- [Testing Standard](docs/unit-testing-standard.md) - Panduan dan metodologi unit testing.

## 🛠️ Memulai (Getting Started)

### Persyaratan
- Node.js 20+
- pnpm / npm / bun

### Instalasi
```bash
pnpm install
```

### Pengembangan
Jalankan server pengembangan:
```bash
pnpm dev
```

Buka [http://localhost:3000](http://localhost:3000) untuk melihat hasilnya.

## 🧪 Testing

Jalankan rangkaian pengujian:
```bash
pnpm test
```

Untuk melihat cakupan kode (code coverage):
```bash
pnpm test:coverage
```

## 🏗️ Struktur Proyek

- `app/`: Layer interface pengguna (Next.js App Router).
- `src/`: Logika bisnis inti dan layanan.
- `docs/`: Dokumentasi teknis dan standar proyek.
- `public/`: Aset statis.

---
Dikembangkan dengan ❤️ untuk efisiensi manajemen storage.
