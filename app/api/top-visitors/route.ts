import { NextResponse } from "next/server";
import { db } from "@/DB";
import { anak, absensi } from "@/DB/schema";
import { sql, count, desc } from "drizzle-orm";

// 1. Tambahkan interface ini untuk menggantikan 'any'
interface VisitorRecord {
  id: string | number;
  nama: string | null;
  kelas: string | null;
  tingkatan: string | null;
  jumlahKunjungan: number;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const bulan = searchParams.get("bulan");
    const tahun = searchParams.get("tahun");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const groupByParam = searchParams.get("groupBy"); // "kelas" | "tingkatan" | null

    const conditions: (ReturnType<typeof sql> | undefined)[] = [];
    
    if (tahun) conditions.push(sql`EXTRACT(YEAR FROM ${absensi.tanggal}::date) = ${tahun}`);
    if (bulan) conditions.push(sql`EXTRACT(MONTH FROM ${absensi.tanggal}::date) = ${bulan}`);
    if (startDate && endDate) conditions.push(sql`${absensi.tanggal}::date BETWEEN ${startDate}::date AND ${endDate}::date`);

    const whereConditions = conditions.filter(Boolean) as ReturnType<typeof sql>[];

    const baseQuery = db
      .select({
        id: anak.id,
        nama: anak.nama,
        kelas: anak.kelas,
        tingkatan: anak.tingkatan,
        jumlahKunjungan: sql<number>`COALESCE(${count(absensi.id)}, 0)`.as("jumlahKunjungan"),
      })
      .from(anak)
      .innerJoin(absensi, sql`${anak.id} = ${absensi.anakId}`)
      .where(whereConditions.length > 0 ? sql.join(whereConditions, sql` AND `) : undefined)
      .groupBy(anak.id, anak.nama, anak.kelas, anak.tingkatan)
      .orderBy(desc(count(absensi.id)));

    if (!groupByParam || groupByParam === "global") {
      const topVisitors = await baseQuery.limit(3);
      return NextResponse.json({ data: topVisitors }, { status: 200 });
    }

    const allVisitors = await baseQuery;
    
    // 2. Gunakan interface VisitorRecord[] di sini (tidak pakai 'any' lagi)
    const groupedData: Record<string, VisitorRecord[]> = {};

    allVisitors.forEach((visitor) => {
      const key = groupByParam === "kelas" ? visitor.kelas : visitor.tingkatan;
      const groupKey = key || "Tidak Diketahui";

      if (!groupedData[groupKey]) {
        groupedData[groupKey] = [];
      }

      if (groupedData[groupKey].length < 3) {
        groupedData[groupKey].push(visitor);
      }
    });

    return NextResponse.json({ groupedData }, { status: 200 });

  } catch (error) {
    console.error("Error fetching top visitors:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data pengunjung teraktif" },
      { status: 500 }
    );
  }
}