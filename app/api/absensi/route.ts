import { NextResponse } from "next/server";
import { db } from "@/DB";
import { absensi } from "@/DB/schema";
import { z } from "zod";
import { and, eq } from "drizzle-orm";

// Schema untuk array input
const absensiCreateSchema = z.array(
  z.object({
    id: z.number().int().positive(), // karena kamu kirim { id: number }
  })
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = absensiCreateSchema.parse(body);

    // Waktu Indonesia (format DB friendly)
    const now = new Date();
    const today = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const time = now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Transaction biar atomic
    const inserted = await db.transaction(async (tx) => {
      const results = [];
      for (const a of data) {
        // Cek existing absensi
        const existing = await tx
          .select()
          .from(absensi)
          .where(and(eq(absensi.anakId, a.id), eq(absensi.tanggal, today)));

        if (existing.length > 0) continue;

        // Insert absensi baru
        const [newAbsensi] = await tx
          .insert(absensi)
          .values({
            anakId: a.id,
            tanggal: today,
            waktu: time,
          })
          .returning();

        results.push(newAbsensi);
      }
      return results;
    });

    if (inserted.length === 0) {
      return NextResponse.json(
        { message: "Tidak ada absensi baru" },
        { status: 409 }
      );
    }

    return NextResponse.json(inserted, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validasi gagal", errors: error.issues },
        { status: 400 }
      );
    }

    console.error("Error insert absensi:", error);
    return NextResponse.json(
      { message: "Gagal menyimpan absensi" },
      { status: 500 }
    );
  }
}
