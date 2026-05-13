# Commit Standard - Conventional Commits

Dokumen ini mendefinisikan standar penulisan pesan commit yang harus diikuti dalam proyek **Orbit S3**. Kita menggunakan spesifikasi **Conventional Commits** untuk memastikan riwayat commit yang bersih, terstruktur, dan mudah dibaca secara otomatis.

## Ringkasan (Summary)

Spesifikasi Conventional Commits adalah konvensi ringan di atas pesan commit. Ini menyediakan seperangkat aturan mudah untuk membuat riwayat commit yang eksplisit; yang memudahkan penulisan alat otomatis di atasnya. Konvensi ini sejalan dengan SemVer, dengan mendeskripsikan fitur (features), perbaikan (fixes), dan perubahan mendasar (breaking changes) yang dibuat dalam pesan commit.

## Struktur Pesan Commit

Pesan commit harus terstruktur sebagai berikut:

```text
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

Pesan commit mengandung elemen struktural berikut untuk mengomunikasikan maksud kepada pengguna:

- **fix**: Commit tipe `fix` menambal (patch) bug di codebase Anda (ini berkorelasi dengan **PATCH** dalam semantic versioning).
- **feat**: Commit tipe `feat` memperkenalkan fitur baru ke codebase (ini berkorelasi dengan **MINOR** dalam semantic versioning).
- **BREAKING CHANGE**: Commit yang memiliki teks `BREAKING CHANGE:` di awal bagian body atau footer opsionalnya memperkenalkan perubahan API yang merusak (berkorelasi dengan **MAJOR** dalam semantic versioning). BREAKING CHANGE dapat menjadi bagian dari commit tipe apa pun.
- **Lainnya**: Tipe commit selain `fix:` dan `feat:` diizinkan, misalnya `chore:`, `docs:`, `style:`, `refactor:`, `perf:`, `test:`, dan lainnya.
- **improvement**: Kami juga merekomendasikan `improvement` untuk commit yang meningkatkan implementasi saat ini tanpa menambah fitur baru atau memperbaiki bug.

Perhatikan bahwa tipe-tipe ini tidak diamanatkan oleh spesifikasi conventional commits, dan tidak memiliki efek implisit dalam semantic versioning (kecuali jika menyertakan BREAKING CHANGE). Scope dapat diberikan pada tipe commit untuk memberikan informasi kontekstual tambahan dan terkandung dalam tanda kurung, misalnya `feat(parser): add ability to parse arrays`.

---

## Contoh (Examples)

### Pesan commit dengan deskripsi dan breaking change di body
```text
feat: allow provided config object to extend other configs

BREAKING CHANGE: `extends` key in config file is now used for extending other config files
```

### Pesan commit dengan opsi ! untuk menarik perhatian ke breaking change
```text
chore!: drop Node 6 from testing matrix

BREAKING CHANGE: dropping Node 6 which hits end of life in April
```

### Pesan commit tanpa body
```text
docs: correct spelling of CHANGELOG
```

### Pesan commit dengan scope
```text
feat(lang): add polish language
```

### Pesan commit untuk perbaikan menggunakan nomor issue (opsional)
```text
fix: correct minor typos in code

see the issue for details on the typos fixed

closes issue #12
```

---

## Spesifikasi (Specification)

Kata kunci "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "MAY", dan "OPTIONAL" dalam dokumen ini harus diinterpretasikan seperti yang dijelaskan dalam RFC 2119.

1. Commit **MUST** diawali dengan tipe, yang terdiri dari kata benda, `feat`, `fix`, dll., diikuti oleh scope **OPTIONAL**, dan titik dua serta spasi **REQUIRED**.
2. Tipe `feat` **MUST** digunakan ketika commit menambahkan fitur baru ke aplikasi atau pustaka Anda.
3. Tipe `fix` **MUST** digunakan ketika commit mewakili perbaikan bug untuk aplikasi Anda.
4. Scope **MAY** disediakan setelah tipe. Scope **MUST** terdiri dari kata benda yang mendeskripsikan bagian dari basis kode yang dikelilingi oleh tanda kurung, misal, `fix(parser):`.
5. Deskripsi **MUST** segera menyusul spasi setelah awalan tipe/scope. Deskripsi adalah ringkasan singkat dari perubahan kode, misal, `fix: array parsing issue when multiple spaces were contained in string`.
6. Body commit yang lebih panjang **MAY** disediakan setelah deskripsi singkat, memberikan informasi kontekstual tambahan tentang perubahan kode. Body **MUST** dimulai satu baris kosong setelah deskripsi.
7. Footer satu atau lebih baris **MAY** disediakan satu baris kosong setelah body. Footer **MUST** berisi meta-informasi tentang commit, misal, pull-request terkait, peninjau, breaking changes, dengan satu bagian meta-informasi per baris.
8. Breaking changes **MUST** ditunjukkan di bagian paling awal dari bagian body, atau di awal baris di bagian footer. Breaking change **MUST** terdiri dari teks huruf besar `BREAKING CHANGE`, diikuti oleh titik dua dan spasi.
9. Deskripsi **MUST** disediakan setelah `BREAKING CHANGE:`, mendeskripsikan apa yang telah berubah tentang API, misal, `BREAKING CHANGE: environment variables now take precedence over config files`.
10. Tipe selain `feat` dan `fix` **MAY** digunakan dalam pesan commit Anda.
11. Unit informasi yang membentuk conventional commits **MUST NOT** diperlakukan sebagai peka huruf besar-kecil oleh implementor, dengan pengecualian `BREAKING CHANGE` yang **MUST** huruf besar.
12. Tanda seru `!` **MAY** ditambahkan sebelum titik dua `:` dalam awalan tipe/scope, untuk lebih menarik perhatian pada breaking changes. Deskripsi `BREAKING CHANGE:` juga **MUST** disertakan dalam body atau footer jika ada tanda `!` di prefix.
