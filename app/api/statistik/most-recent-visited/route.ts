// app/api/statistik/most-recent-visited/route.ts
import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/DB";
import { absensi, anak } from "@/DB/schema";

export async function GET() {
  try {
    // ambil data kunjungan terakhir per anak
    const data = await db
      .select({
        id: anak.id,
        nama: anak.nama,
        kelas: anak.kelas,
        tanggal: absensi.tanggal,
      })
      .from(absensi)
      .innerJoin(anak, eq(absensi.anakId, anak.id))
      .orderBy(desc(absensi.tanggal))
      .limit(10);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("❌ Error fetching most recent visited:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data kunjungan terbaru" },
      { status: 500 }
    );
  }
}
