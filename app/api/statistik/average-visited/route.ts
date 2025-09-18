import { NextResponse } from "next/server";
import { db } from "@/DB";
import { anak, absensi } from "@/DB/schema";
import { sql, avg, count } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope") || "global";
    const kelasParam = searchParams.get("kelas");
    const tingkatanParam = searchParams.get("tingkatan");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const bulan = searchParams.get("bulan");
    const tahun = searchParams.get("tahun");

    // Build kondisi tanggal
    let dateCondition = sql`1 = 1`;

    if (bulan) {
      const startOfMonth = `${bulan}-01`;
      const endOfMonth = `${bulan}-31`;
      dateCondition = sql`${absensi.tanggal} BETWEEN ${startOfMonth} AND ${endOfMonth}`;
    } else if (tahun) {
      const startOfYear = `${tahun}-01-01`;
      const endOfYear = `${tahun}-12-31`;
      dateCondition = sql`${absensi.tanggal} BETWEEN ${startOfYear} AND ${endOfYear}`;
    } else if (startDate && endDate) {
      dateCondition = sql`${absensi.tanggal} BETWEEN ${startDate} AND ${endDate}`;
    } else if (startDate) {
      dateCondition = sql`${absensi.tanggal} >= ${startDate}`;
    } else if (endDate) {
      dateCondition = sql`${absensi.tanggal} <= ${endDate}`;
    }

    let query;

    switch (scope) {
      case "kelas":
        if (!kelasParam) {
          return NextResponse.json(
            { message: "Parameter kelas diperlukan untuk scope kelas" },
            { status: 400 }
          );
        }
        query = db
          .select({
            kelas: anak.kelas,
            rataRataKunjungan: sql`ROUND(AVG(kunjungan_count), 2)`.as(
              "rataRataKunjungan"
            ),
            totalSiswa: count(anak.id).as("totalSiswa"),
            periode: sql`CASE 
              WHEN ${bulan} IS NOT NULL THEN CONCAT('Bulan ', ${bulan})
              WHEN ${tahun} IS NOT NULL THEN CONCAT('Tahun ', ${tahun})
              WHEN ${startDate} IS NOT NULL AND ${endDate} IS NOT NULL THEN CONCAT(${startDate}, ' sampai ', ${endDate})
              ELSE 'Semua Waktu'
            END`.as("periode"),
          })
          .from(
            db
              .select({
                id: anak.id,
                kelas: anak.kelas,
                kunjungan_count: count(absensi.id).as("kunjungan_count"),
              })
              .from(anak)
              .leftJoin(
                absensi,
                sql`${anak.id} = ${absensi.anakId} AND ${dateCondition}`
              )
              .where(sql`${anak.kelas} = ${kelasParam}`)
              .groupBy(anak.id, anak.kelas)
              .as("subquery")
          )
          .groupBy(anak.kelas);
        break;

      case "tingkatan":
        if (!tingkatanParam) {
          return NextResponse.json(
            { message: "Parameter tingkatan diperlukan untuk scope tingkatan" },
            { status: 400 }
          );
        }
        query = db
          .select({
            tingkatan: anak.tingkatan,
            rataRataKunjungan: sql`ROUND(AVG(kunjungan_count), 2)`.as(
              "rataRataKunjungan"
            ),
            totalSiswa: count(anak.id).as("totalSiswa"),
            periode: sql`CASE 
              WHEN ${bulan} IS NOT NULL THEN CONCAT('Bulan ', ${bulan})
              WHEN ${tahun} IS NOT NULL THEN CONCAT('Tahun ', ${tahun})
              WHEN ${startDate} IS NOT NULL AND ${endDate} IS NOT NULL THEN CONCAT(${startDate}, ' sampai ', ${endDate})
              ELSE 'Semua Waktu'
            END`.as("periode"),
          })
          .from(
            db
              .select({
                id: anak.id,
                tingkatan: anak.tingkatan,
                kunjungan_count: count(absensi.id).as("kunjungan_count"),
              })
              .from(anak)
              .leftJoin(
                absensi,
                sql`${anak.id} = ${absensi.anakId} AND ${dateCondition}`
              )
              .where(sql`${anak.tingkatan} = ${tingkatanParam}`)
              .groupBy(anak.id, anak.tingkatan)
              .as("subquery")
          )
          .groupBy(anak.tingkatan);
        break;

      case "global":
      default:
        query = db
          .select({
            rataRataKunjungan: sql`ROUND(AVG(kunjungan_count), 2)`.as(
              "rataRataKunjungan"
            ),
            totalSiswa: count(anak.id).as("totalSiswa"),
            periode: sql`CASE 
              WHEN ${bulan} IS NOT NULL THEN CONCAT('Bulan ', ${bulan})
              WHEN ${tahun} IS NOT NULL THEN CONCAT('Tahun ', ${tahun})
              WHEN ${startDate} IS NOT NULL AND ${endDate} IS NOT NULL THEN CONCAT(${startDate}, ' sampai ', ${endDate})
              ELSE 'Semua Waktu'
            END`.as("periode"),
          })
          .from(
            db
              .select({
                id: anak.id,
                kunjungan_count: count(absensi.id).as("kunjungan_count"),
              })
              .from(anak)
              .leftJoin(
                absensi,
                sql`${anak.id} = ${absensi.anakId} AND ${dateCondition}`
              )
              .groupBy(anak.id)
              .as("subquery")
          );
        break;
    }

    const result = await query;
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching rata-rata kunjungan:", error);
    return NextResponse.json(
      { message: "Gagal mengambil rata-rata kunjungan" },
      { status: 500 }
    );
  }
}
