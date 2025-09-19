import { db } from "@/DB";
import { anak } from "@/DB/schema";
import { NextResponse } from "next/server";

type Anak = typeof anak.$inferSelect;

export async function GET() {
  try {
    const result: Anak[] = await db.select().from(anak);
    return NextResponse.json<Anak[]>(result, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching anak:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data anak" },
      { status: 500 }
    );
  }
}
