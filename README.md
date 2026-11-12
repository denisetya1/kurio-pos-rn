# Kurio POS

Aplikasi POS React Native baru untuk Android, iOS, dan web. Fondasi proyek ini menggunakan Expo SDK 58, Zustand, TanStack React Query, SQLite, serta antrean sinkronisasi agar transaksi lokal tetap dapat dipakai ketika koneksi terputus.

## Identitas aplikasi

- Nama: Kurio POS
- Android package: `com.kurio.pos`
- iOS bundle identifier: `com.kurio.pos`
- Android target SDK: 36

## Menjalankan proyek

1. Salin `.env.example` menjadi `.env.local` dan isi alamat API Kurio.
2. Pasang dependency dengan `npm install`.
3. Jalankan `npx expo start`.

## Pemeriksaan

```bash
npm run lint
npm run typecheck
npm run doctor
```

## Fondasi offline

- SQLite menyimpan katalog dan antrean sinkronisasi di perangkat.
- Cache React Query dipersist ke penyimpanan lokal.
- Zustand menyimpan keranjang, member terpilih, dan transaksi hold.
- Status jaringan mengatur kapan antrean perubahan lokal dikirim ulang.

Implementasi login, payment, member, dan printer akan dilanjutkan pada tahap fitur berikutnya di atas fondasi ini.
