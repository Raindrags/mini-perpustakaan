import { db } from "@/DB";
import { anak } from "@/DB/schema";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await db.select().from(anak);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error fetching anak:", error); 
    return NextResponse.json(
      { message: "Gagal mengambil data anak" }, 
      { status: 500 }
    );
  }
}
