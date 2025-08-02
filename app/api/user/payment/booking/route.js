// api/user/payment-qrcode/route.js
import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Booking from "@/models/booking";

export async function PATCH(req) {
  try {
    await connectMongoDB();
    const { _id, imagepayment, paymentStatus } = await req.json();

    // ค้นหาเอกสารที่ตรงกับ _id ที่ส่งมา
    const booking = await Booking.findById(_id);

    if (!booking) {
      return NextResponse.json({ error: "ไม่พบการจอง" }, { status: 404 });
    }
    
    // อัปเดตข้อมูลการชำระเงิน
    booking.imagepayment = imagepayment;
    booking.paymentStatus = paymentStatus;
    await booking.save();
    return NextResponse.json(
      { message: "อัปเดตการชำระเงินสำเร็จ" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating payment:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการอัปเดตการชำระเงิน" },
      { status: 500 }
    );
  }
}