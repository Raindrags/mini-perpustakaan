// app/api/statistik/top-visitors/route.ts
import { NextResponse } from "next/server";
import { db } from "@/DB";
import { anak, absensi } from "@/DB/schema";
import { sql, count, desc } from "drizzle-orm";

export async function GET() {
  try {
    const topVisitors = await db
      .select({
        id: anak.id,
        nama: anak.nama,
        kelas: anak.kelas,
        tingkatan: anak.tingkatan,
        jumlahKunjungan: sql<number>`COALESCE(${count(absensi.id)}, 0)`.as(
          "jumlahKunjungan"
        ),
      })
      .from(anak)
      .leftJoin(absensi, sql`${anak.id} = ${absensi.anakId}`)
      .groupBy(anak.id, anak.nama, anak.kelas, anak.tingkatan)
      .orderBy(desc(sql`COALESCE(${count(absensi.id)}, 0)`))
      .limit(10);

    return NextResponse.json({ data: topVisitors }, { status: 200 });
  } catch (error) {
    console.error("Error fetching top visitors:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data pengunjung teraktif" },
      { status: 500 }
    );
  }
}
