import { NextRequest, NextResponse } from "next/server";
import { db } from "@/DB";
import { anak, absensi } from "@/DB/schema";
import { sql, eq, and, count, countDistinct } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bulan = searchParams.get("bulan");
    const tahun = searchParams.get("tahun");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const groupByParam = searchParams.get("groupBy");

    const tanggalCol = sql`CAST(${absensi.tanggal} AS DATE)`;
    const conditions: any[] = [];

    // --- 1. Filter Waktu ---
    if (bulan && tahun) {
      conditions.push(sql`EXTRACT(MONTH FROM ${tanggalCol}) = ${Number(bulan)}`);
      conditions.push(sql`EXTRACT(YEAR FROM ${tanggalCol}) = ${Number(tahun)}`);
    } else if (tahun) {
      conditions.push(sql`EXTRACT(YEAR FROM ${tanggalCol}) = ${Number(tahun)}`);
    }

    if (startDate && endDate) {
      conditions.push(sql`${tanggalCol} BETWEEN CAST(${startDate} AS DATE) AND CAST(${endDate} AS DATE)`);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // --- 2. Logika Grouping (Tingkatan / Kelas) ---
    if (groupByParam === "tingkatan" || groupByParam === "kelas") {
      const groupCol = groupByParam === "tingkatan" ? anak.tingkatan : anak.kelas;

      const result = await db
        .select({
          [groupByParam]: groupCol,
          // Total Siswa: Hanya menghitung siswa unik yang ada di tabel absensi (pernah datang)
          totalSiswa: countDistinct(absensi.anakId), 
          // Total Kunjungan: Menghitung semua baris absensi
          totalKunjungan: count(absensi.id),
          // Rata-rata: Total Kunjungan / Siswa yang datang
          rataRataKunjungan: sql`ROUND(
            COUNT(${absensi.id})::numeric / NULLIF(COUNT(DISTINCT ${absensi.anakId}), 0)::numeric, 1
          )`,
        })
        .from(absensi)
        .leftJoin(anak, eq(absensi.anakId, anak.id))
        .where(whereClause)
        .groupBy(groupCol);
      
      return NextResponse.json(result);
    }

    // --- 3. Logika Global (Default) ---
    const globalResult = await db
      .select({
        totalSiswa: countDistinct(absensi.anakId),
        totalKunjungan: count(absensi.id),
        rataRataKunjungan: sql`ROUND(
          COUNT(${absensi.id})::numeric / NULLIF(COUNT(DISTINCT ${absensi.anakId}), 0)::numeric, 1
        )`,
      })
      .from(absensi)
      .where(whereClause);

    const finalData = globalResult[0] || { totalSiswa: 0, totalKunjungan: 0, rataRataKunjungan: 0 };

    return NextResponse.json({
      totalSiswa: Number(finalData.totalSiswa || 0),
      totalKunjungan: Number(finalData.totalKunjungan || 0),
      rataRataKunjungan: finalData.rataRataKunjungan || "0.0",
    });

  } catch (error) {
    console.error("💥 Error Statistik API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}