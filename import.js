require('dotenv').config();
const fs = require('fs');
const csv = require('csv-parser');
const { Client } = require('pg');

// Konfigurasi koneksi ke Neon Database
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Penting untuk Neon DB
  }
});

// Sesuaikan dengan nama tabel Anda di database
const TABEL_NAMA = 'absensi'; 

async function importCSV() {
  const results = [];

  // 1. Membaca file CSV
  fs.createReadStream('data.csv')
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      console.log(`Membaca ${results.length} baris dari CSV. Mulai mengimpor ke database...`);
      
      try {
        // 2. Konek ke Database
        await client.connect();
        console.log('✅ Berhasil terhubung ke Neon Database.');

        // 3. Looping data dan masukkan ke database
        let successCount = 0;
        let errorCount = 0;

        for (const row of results) {
          const query = `
            INSERT INTO ${TABEL_NAMA} (anak_id, tanggal, waktu, created_at)
            VALUES ($1, $2, $3, $4)
          `;
          
          // Pastikan nama properti row.* sesuai dengan header di file CSV Anda
          const values = [
            parseInt(row.anak_id), 
            row.tanggal, 
            row.waktu, 
            row.created_at
          ];

          try {
            await client.query(query, values);
            successCount++;
          } catch (insertError) {
            console.error(`❌ Gagal insert data untuk anak_id ${row.anak_id}:`, insertError.message);
            errorCount++;
          }
        }

        console.log('\n=== Laporan Import ===');
        console.log(`Berhasil: ${successCount} baris`);
        console.log(`Gagal: ${errorCount} baris`);
        
      } catch (dbError) {
        console.error('Koneksi database gagal:', dbError.message);
      } finally {
        // 4. Tutup koneksi setelah selesai
        await client.end();
        console.log('Koneksi database ditutup.');
      }
    });
}

// Jalankan fungsi
importCSV();