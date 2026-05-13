# Coding Standard - Orbit S3

Dokumen ini mendefinisikan standar pengkodean, prinsip desain, dan praktik terbaik yang harus diikuti dalam pengembangan proyek **Orbit S3**. Tujuannya adalah untuk memastikan kode yang dihasilkan konsisten, mudah dipelihara (maintainable), dan memiliki kualitas tinggi.

## 1. Prinsip SOLID

Penerapan prinsip SOLID adalah wajib untuk memastikan arsitektur yang fleksibel dan modular.

### S - Single Responsibility Principle (SRP)
Setiap class, modul, atau fungsi harus memiliki **satu alasan untuk berubah**.
- **Controller**: Hanya bertanggung jawab untuk menangani request HTTP dan mengirim response.
- **Service**: Hanya bertanggung jawab untuk logika bisnis inti.
- **Schema**: Hanya bertanggung jawab untuk definisi validasi data.

### O - Open/Closed Principle (OCP)
Entitas software harus **terbuka untuk ekstensi, tetapi tertutup untuk modifikasi**.
- Gunakan Interface atau Abstrak class untuk mendefinisikan kontrak (misalnya: `MessagingProvider`).
- Jika ingin menambah provider baru (misalnya: Slack), buat implementasi baru tanpa mengubah kode provider yang sudah ada.

### L - Liskov Substitution Principle (LSP)
Objek dari superclass harus dapat digantikan oleh objek dari subclass tanpa mengganggu fungsionalitas aplikasi.
- Semua driver messaging (Telegram, WhatsApp, Email) harus mengikuti kontrak yang sama sehingga dapat digunakan secara bergantian jika diperlukan.

### I - Interface Segregation Principle (ISP)
Klien tidak boleh dipaksa untuk bergantung pada interface yang tidak mereka gunakan.
- Pecah interface yang besar menjadi interface yang lebih spesifik jika diperlukan.

### D - Dependency Inversion Principle (DIP)
Bergantunglah pada abstraksi, bukan pada implementasi konkret.
- Gunakan Dependency Injection (DI) untuk memasukkan dependensi ke dalam service atau controller.

---

## 2. Prinsip Pemrograman Dasar

- **DRY (Don't Repeat Yourself)**: Hindari duplikasi logika. Gunakan utilitas di `src/common` untuk fungsi yang sering digunakan.
- **KISS (Keep It Simple, Stupid)**: Tulis kode yang sederhana dan mudah dibaca. Hindari optimasi prematur yang membuat kode menjadi kompleks.
- **YAGNI (You Ain't Gonna Need It)**: Jangan menulis fitur atau kode yang belum diperlukan saat ini.

---

## 3. Konvensi Penamaan (Naming Conventions)

- **PascalCase**: Gunakan untuk nama Class, Interface, Type, dan Enum.
  - Contoh: `TelegramService`, `UserResponse`.
- **camelCase**: Gunakan untuk nama Variabel, Properti, dan Fungsi.
  - Contoh: `sendMessage()`, `isAuthorized`.
- **kebab-case**: Gunakan untuk nama File dan Direktori.
  - Contoh: `telegram.controller.ts`, `auth-middleware.ts`.
- **UPPER_SNAKE_CASE**: Gunakan untuk Konstanta global dan variabel lingkungan (Env).
  - Contoh: `MAX_RETRY_ATTEMPTS`, `PORT`.

---

## 4. Standar TypeScript

- **Strict Type Safety**: Hindari penggunaan `any`. Selalu definisikan tipe data secara eksplisit atau biarkan TypeScript melakukan *inference* jika sudah jelas.
- **Interfaces vs Types**: Gunakan `interface` untuk definisi objek yang bisa di-extend, dan `type` untuk union atau alias yang sederhana.
- **Readonly**: Gunakan `readonly` untuk properti yang tidak boleh diubah setelah inisialisasi.
- **Zod for Validation**: Gunakan Zod untuk validasi input di layer controller.

---

## 5. Arsitektur Proyek

Proyek ini mengikuti struktur modular:
```text
src/
├── common/        # Kode yang digunakan bersama (utils, constants, errors)
├── modules/       # Fitur aplikasi dibagi per modul (email, telegram, whatsapp)
│   └── [module]/
│       ├── [module].controller.ts
│       ├── [module].service.ts
│       ├── [module].schema.ts
│       └── [module].interface.ts
└── index.ts       # Entry point aplikasi
```

### Layer Separation:
1. **Controller Layer**: Menggunakan Hono Router, memanggil Service, dan menangani validasi menggunakan Zod.
2. **Service Layer**: Tempat logika bisnis berada. Tidak boleh tahu tentang HTTP request/response.
3. **Infrastructure/Provider Layer**: Berinteraksi dengan library eksternal (seperti Baileys untuk WhatsApp atau Telegraf untuk Telegram).

---

## 6. Standar API (JSend Pattern)

Semua response API harus mengikuti format **JSend**:

### Success Response
```json
{
  "status": "success",
  "message": "Pesan deskriptif",
  "data": { ... }
}
```

### Fail Response (Kesalahan Klien/Validasi)
```json
{
  "status": "fail",
  "message": "Validation failed",
  "data": { "field": "email", "message": "Invalid email format" }
}
```

### Error Response (Kesalahan Server)
```json
{
  "status": "error",
  "message": "Internal server error"
}
```

---

## 7. Penanganan Error (Error Handling)

- Gunakan class Error kustom yang mewarisi dari class `BaseError` (jika ada).
- Lempar error di level Service, dan tangkap di Middleware global atau Controller.
- Jangan mengembalikan *stack trace* ke klien di lingkungan produksi.

---

## 8. Testing

Setiap fitur baru harus menyertakan unit test.
- **Unit Test**: Fokus pada logika bisnis di Service.
- **Integration Test**: Fokus pada alur API dari Controller hingga response.
- Gunakan library testing yang sudah disepakati (misalnya Vitest atau Bun Test).

---

## 9. Dokumentasi

- Gunakan komentar JSDoc untuk fungsi yang kompleks.
- Perbarui `README.md` jika ada perubahan pada cara menjalankan atau mengonfigurasi proyek.
- Gunakan `@openapi` dekorator atau komentar jika kita menggunakan Swagger/OpenAPI.
