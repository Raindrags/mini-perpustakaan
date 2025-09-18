import { NextResponse } from "next/server";
import { db } from "@/DB";
import { anak, absensi } from "@/DB/schema";
import { desc, sql, count, between, gte, lte } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get("scope") || "global";
    const kelasParam = searchParams.get("kelas");
    const tingkatanParam = searchParams.get("tingkatan");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const bulan = searchParams.get("bulan"); // Format: YYYY-MM
    const tahun = searchParams.get("tahun"); // Format: YYYY

    // Build kondisi tanggal
    let dateCondition = sql`1 = 1`; // Default: semua tanggal

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
            id: anak.id,
            nama: anak.nama,
            kelas: anak.kelas,
            tingkatan: anak.tingkatan,
            jumlahKunjungan: count(absensi.id).as("jumlahKunjungan"),
          })
          .from(anak)
          .leftJoin(
            absensi,
            sql`${anak.id} = ${absensi.anakId} AND ${dateCondition}`
          )
          .where(sql`${anak.kelas} = ${kelasParam}`)
          .groupBy(anak.id)
          .orderBy(desc(count(absensi.id)));
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
            id: anak.id,
            nama: anak.nama,
            kelas: anak.kelas,
            tingkatan: anak.tingkatan,
            jumlahKunjungan: count(absensi.id).as("jumlahKunjungan"),
          })
          .from(anak)
          .leftJoin(
            absensi,
            sql`${anak.id} = ${absensi.anakId} AND ${dateCondition}`
          )
          .where(sql`${anak.tingkatan} = ${tingkatanParam}`)
          .groupBy(anak.id)
          .orderBy(desc(count(absensi.id)));
        break;

      case "global":
      default:
        query = db
          .select({
            id: anak.id,
            nama: anak.nama,
            kelas: anak.kelas,
            tingkatan: anak.tingkatan,
            jumlahKunjungan: count(absensi.id).as("jumlahKunjungan"),
          })
          .from(anak)
          .leftJoin(
            absensi,
            sql`${anak.id} = ${absensi.anakId} AND ${dateCondition}`
          )
          .groupBy(anak.id)
          .orderBy(desc(count(absensi.id)));
        break;
    }

    const result = await query;
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching statistik kunjungan:", error);
    return NextResponse.json(
      { message: "Gagal mengambil statistik kunjungan" },
      { status: 500 }
    );
  }
}
