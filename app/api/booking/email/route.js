// api/booking/email/route.js
import { connectMongoDB } from "@/lib/mongodb";
import Booking from "@/models/booking";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectMongoDB();
    const { searchParams } = new URL(req.url);
    const emailuser = searchParams.get("email"); // ใช้ emailuser ในการค้นหาข้อมูล

    if (!emailuser) {
      return NextResponse.json(
        { error: "ต้องระบุ email" },
        { status: 400 }
      );
    }

    // ค้นหาการจองจาก MongoDB โดยกรองตาม emailuser และ isOrder เป็น false
    const bookings = await Booking.find({
      emailuser: emailuser, // ใช้ emailuser แทน email
      isOrder: false,
    });

    if (bookings.length === 0) {
      return NextResponse.json(
        { message: "ไม่พบการจองสำหรับอีเมลนี้" },
        { status: 404 }
      );
    }

    return NextResponse.json({ bookings }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
