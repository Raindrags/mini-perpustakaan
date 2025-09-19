import { NextResponse } from "next/server";
import { db } from "@/DB";
import { anak, absensi } from "@/DB/schema";
import { sql, count } from "drizzle-orm";

interface StatistikResult {
  rataRataKunjungan: number;
  totalSiswa: number;
  periode: string;
  kelas?: string;
  tingkatan?: string | number; // fix: sesuai tipe di schema
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const bulan = searchParams.get("bulan");
    const tahun = searchParams.get("tahun");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const groupBy = searchParams.get("groupBy"); // kelas | tingkatan | null

    // kondisi filter tanggal
    const conditions: any[] = [];
    if (tahun)
      conditions.push(sql`EXTRACT(YEAR FROM ${absensi.tanggal}) = ${tahun}`);
    if (bulan)
      conditions.push(sql`EXTRACT(MONTH FROM ${absensi.tanggal}) = ${bulan}`);
    if (startDate && endDate)
      conditions.push(
        sql`${absensi.tanggal} BETWEEN ${startDate} AND ${endDate}`
      );

    // subquery: hitung kunjungan per anak
    const subquery = db
      .select({
        anakId: anak.id,
        kelas: anak.kelas,
        tingkatan: anak.tingkatan,
        kunjungan_count: count(absensi.id).as("kunjungan_count"),
      })
      .from(anak)
      .leftJoin(absensi, sql`${anak.id} = ${absensi.anakId}`)
      .groupBy(anak.id, anak.kelas, anak.tingkatan)
      .as("sub");

    // query utama: hitung rata-rata dari subquery
    const query = db
      .select({
        rataRataKunjungan:
          sql<number>`ROUND(AVG(${subquery.kunjungan_count}), 2)`.as(
            "rataRataKunjungan"
          ),
        totalSiswa: count(subquery.anakId).as("totalSiswa"),
        periode: sql<string>`CASE 
          WHEN ${bulan} IS NOT NULL THEN CONCAT('Bulan ', ${bulan})
          WHEN ${tahun} IS NOT NULL THEN CONCAT('Tahun ', ${tahun})
          WHEN ${startDate} IS NOT NULL AND ${endDate} IS NOT NULL 
               THEN CONCAT(${startDate}, ' sampai ', ${endDate})
          ELSE 'Semua Waktu'
        END`.as("periode"),
        ...(groupBy === "kelas"
          ? { kelas: subquery.kelas }
          : groupBy === "tingkatan"
          ? { tingkatan: subquery.tingkatan }
          : {}),
      })
      .from(subquery);

    if (groupBy === "kelas") query.groupBy(subquery.kelas);
    if (groupBy === "tingkatan") query.groupBy(subquery.tingkatan);

    const result: StatistikResult[] = await query;

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching statistik:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data statistik" },
      { status: 500 }
    );
  }
}
