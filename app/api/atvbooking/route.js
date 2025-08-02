// api/atvbooking/route.js
import { connectMongoDB } from "@/lib/mongodb";
import ATVBooking from "@/models/atvBooking"
import { NextResponse } from "next/server";

// ฟังก์ชันในการจัดการคำขอ API POST สำหรับการจอง ATV
export async function POST(request) {
  try {
    const {emailuser, name, phone, selectedDate, selectedRound, numSmallATV, numLargeATV, isOrder = false,paymentStatus = "ยังไม่ชำระ", totalPrice } = await request.json();

    // เชื่อมต่อกับ MongoDB
    await connectMongoDB();

    // สร้างเอกสารใหม่ใน MongoDB สำหรับการจอง ATV
    const newBooking = new ATVBooking({
      emailuser,
      name,
      phone,
      selectedDate,
      selectedRound,
      numSmallATV,
      numLargeATV,
      totalPrice,
      isOrder,
      status: 'รอยืนยัน',
      paymentStatus
    });

    // บันทึกการจองลง MongoDB
    await newBooking.save();

    // ส่งการตอบกลับเมื่อสำเร็จ
    return NextResponse.json({ message: "Booking successful!" }, { status: 200 });
  } catch (error) {
    // หากเกิดข้อผิดพลาด ส่งข้อผิดพลาดกลับ
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


export async function GET(req) {
  try {
    // เชื่อมต่อกับ MongoDB
    await connectMongoDB();

    // ดึงข้อมูลการจองทั้งหมดจากฐานข้อมูล
    const atvbooking = await ATVBooking.find({});  // หรือคุณสามารถใส่เงื่อนไขในการค้นหาที่นี่ได้

    // ส่งข้อมูลการจองกลับใน response
    return NextResponse.json(
      { message: "ข้อมูลการจองทั้งหมด", atvbooking },
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