// app/api/rooms/[id]/route.js
import { connectMongoDB } from "@/lib/mongodb"; // เชื่อมต่อ MongoDB
import Room from "@/models/room"; // สมมุติว่า Room คือ model สำหรับข้อมูลห้อง
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { id } = params; // ดึง id จาก params (URL)

  try {
    // เชื่อมต่อกับ MongoDB
    await connectMongoDB();

    // ค้นหาห้องในฐานข้อมูลตาม id
    const room = await Room.findById(id);

    // หากพบห้อง
    if (room) {
      return NextResponse.json({ room }, { status: 200 });
    } else {
      return NextResponse.json(
        { error: "ห้องไม่พบ" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error fetching room data:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูลห้อง" },
      { status: 500 }
    );
  }
}
