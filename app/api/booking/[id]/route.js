// api/booking/[id]/route.js
import { connectMongoDB } from "@/lib/mongodb";
import Booking from "@/models/booking";
import { NextResponse } from "next/server";

export async function PATCH(req, { params }) {
  try {
    await connectMongoDB();
    const { id } = params;
    const { action } = await req.json(); // รับ action จาก body

    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json(
        { error: "ไม่พบการจอง" },
        { status: 404 }
      );
    }

    if (action === "ยืนยัน") {
      // ยืนยันการจอง
      if (booking.status !== "รอยืนยัน") {
        return NextResponse.json(
          { message: "ไม่สามารถยืนยันการจองได้ในสถานะนี้" },
          { status: 400 }
        );
      }
      booking.status = "ยืนยันเรียบร้อย";
    } else if (action === "ปิดออเดอร์") {
      // ปิดออเดอร์
      if (booking.status !== "ยืนยันเรียบร้อย" || booking.isOrder) {
        return NextResponse.json(
          { message: "ไม่สามารถปิดออเดอร์ได้ในสถานะนี้" },
          { status: 400 }
        );
      }
      booking.status = "ปิดออเดอร์";
      booking.isOrder = true; // ปรับ isOrder เป็น true เมื่อปิดออเดอร์
    }

    await booking.save();
    return NextResponse.json(
      { message: "สถานะการจองได้รับการอัปเดต", booking },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}



// สำหรับการยกเลิกการจอง (DELETE)
export async function DELETE(req, { params }) {
  try {
    // เชื่อมต่อ MongoDB
    await connectMongoDB();

    // ดึง bookingId จาก URL params
    const { id } = params;

    // ค้นหาการจองจาก MongoDB โดยใช้ bookingId
    const booking = await Booking.findById(id);

    if (!booking) {
      return NextResponse.json(
        { error: "ไม่พบการจอง" },
        { status: 404 }
      );
    }

    // ลบการจองจาก MongoDB
    await booking.deleteOne();

    // ส่งข้อความตอบกลับหลังจากการลบสำเร็จ
    return NextResponse.json(
      { message: "การจองถูกยกเลิกเรียบร้อยแล้ว" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
