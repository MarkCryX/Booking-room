import { connectMongoDB } from "@/lib/mongodb";
import ATVBooking from "@/models/atvBooking"
import { NextResponse } from "next/server";




export async function PATCH(req, { params }) {
  try {
    await connectMongoDB();
    const { id } = params;
    const { action } = await req.json(); // รับ action จาก body

    const atvbooking = await ATVBooking.findById(id);
    if (!atvbooking) {
      return NextResponse.json(
        { error: "ไม่พบการจอง" },
        { status: 404 }
      );
    }

    if (action === "ยืนยัน") {
      // ยืนยันการจอง
      if (atvbooking.status !== "รอยืนยัน") {
        return NextResponse.json(
          { message: "ไม่สามารถยืนยันการจองได้ในสถานะนี้" },
          { status: 400 }
        );
      }
      atvbooking.status = "ยืนยันเรียบร้อย";
    } else if (action === "ปิดออเดอร์") {
      // ปิดออเดอร์
      if (atvbooking.status !== "ยืนยันเรียบร้อย" || atvbooking.isOrder) {
        return NextResponse.json(
          { message: "ไม่สามารถปิดออเดอร์ได้ในสถานะนี้" },
          { status: 400 }
        );
      }
      atvbooking.status = "ปิดออเดอร์";
      atvbooking.isOrder = true; // ปรับ isOrder เป็น true เมื่อปิดออเดอร์
    }

    await atvbooking.save();
    return NextResponse.json(
      { message: "สถานะการจองได้รับการอัปเดต", atvbooking },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}



  
export async function DELETE(req, { params }) {
    try {
      // เชื่อมต่อกับ MongoDB
      await connectMongoDB();
  
      // ดึง bookingId จาก URL params
      const { id } = params;
  
      // ค้นหาการจองจาก MongoDB โดยใช้ bookingId
      const atvbooking = await ATVBooking.findById(id);
  
      if (!atvbooking) {
        return NextResponse.json(
          { error: "ไม่พบการจอง" },
          { status: 404 }
        );
      }
  
      // ลบการจองจาก MongoDB
      await ATVBooking.findByIdAndDelete(id);
  
      // ส่งข้อความตอบกลับหลังจากลบสำเร็จ
      return NextResponse.json(
        { message: "การจองถูกลบออกจากระบบ" },
        { status: 200 }
      );
    } catch (error) {
      // จัดการข้อผิดพลาด
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
  }
    