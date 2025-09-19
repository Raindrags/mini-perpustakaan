// app/api/statistik/route.ts
import { NextResponse } from "next/server";
import { db } from "@/DB";
import { anak, absensi } from "@/DB/schema";
import { sql, count } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const bulan = searchParams.get("bulan");
    const tahun = searchParams.get("tahun");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const groupBy = searchParams.get("groupBy"); // kelas | tingkatan | null

    // ✅ kondisi filter tanggal
    const conditions: (ReturnType<typeof sql> | undefined)[] = [];
    if (tahun) {
      conditions.push(sql`EXTRACT(YEAR FROM ${absensi.tanggal}) = ${tahun}`);
    }
    if (bulan) {
      conditions.push(sql`EXTRACT(MONTH FROM ${absensi.tanggal}) = ${bulan}`);
    }
    if (startDate && endDate) {
      conditions.push(
        sql`${absensi.tanggal} BETWEEN ${startDate} AND ${endDate}`
      );
    }

    // Filter out undefined conditions
    const whereConditions = conditions.filter(Boolean) as ReturnType<
      typeof sql
    >[];

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
      .where(
        whereConditions.length > 0
          ? sql.join(whereConditions, sql` AND `)
          : undefined
      )
      .groupBy(anak.id, anak.kelas, anak.tingkatan)
      .as("sub");

    // query utama berdasarkan groupBy
    let query;
    if (groupBy === "kelas") {
      query = db
        .select({
          kelas: subquery.kelas,
          rataRataKunjungan:
            sql<number>`COALESCE(ROUND(AVG(${subquery.kunjungan_count}), 2), 0)`.as(
              "rataRataKunjungan"
            ),
          totalSiswa: count(subquery.anakId).as("totalSiswa"),
        })
        .from(subquery)
        .groupBy(subquery.kelas);
    } else if (groupBy === "tingkatan") {
      query = db
        .select({
          tingkatan: subquery.tingkatan,
          rataRataKunjungan:
            sql<number>`COALESCE(ROUND(AVG(${subquery.kunjungan_count}), 2), 0)`.as(
              "rataRataKunjungan"
            ),
          totalSiswa: count(subquery.anakId).as("totalSiswa"),
        })
        .from(subquery)
        .groupBy(subquery.tingkatan);
    } else {
      // Global stats
      query = db
        .select({
          rataRataKunjungan:
            sql<number>`COALESCE(ROUND(AVG(${subquery.kunjungan_count}), 2), 0)`.as(
              "rataRataKunjungan"
            ),
          totalSiswa: count(subquery.anakId).as("totalSiswa"),
        })
        .from(subquery);
    }

    const result = await query;
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching statistik:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data statistik" },
      { status: 500 }
    );
  }
}
