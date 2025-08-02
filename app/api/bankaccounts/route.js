import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import BankAccountAtv from "@/models/bankaccountatv";

export async function GET() {
  try {
    await connectMongoDB();
    const bankaccountatv = await BankAccountAtv.find({});

    return NextResponse.json(bankaccountatv, { status: 200 });
  } catch (error) {
    console.error("ไม่สามารถดึงข้อมูลบัญชีมาได้", error);
    return NextResponse.json(
      { error: "ไม่สามารถดึงข้อมูลบัญชีมาได้" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectMongoDB();
    const { accountname, accountnumber, bankname, qrcodeImage } =
      await request.json();

    if (!accountname || !accountnumber || !bankname) {
      return NextResponse.json(
        { error: "กรุณากรอกข้อมูลให้ครบถ้วน" },
        { status: 400 }
      );
    }

    const newBankAccount = new BankAccountAtv({
      accountname,
      accountnumber,
      bankname,
      qrcodeImage, // แปลงรูปภาพเป็น base64
    });

    await newBankAccount.save();

    return NextResponse.json(
      { message: "เพิ่มข้อมูลบัญชีสำเร็จ" },
      { status: 201 }
    );
  } catch (error) {
    console.error("ไม่สามารถเพิ่มข้อมูลบัญชีได้", error);
    return NextResponse.json(
      { error: "ไม่สามารถเพิ่มข้อมูลบัญชีได้" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await connectMongoDB();
    const { _id, accountname, accountnumber, bankname, qrcodeImage, isActive } =
      await request.json();

    if (!_id || !accountname || !accountnumber || !bankname) {
      return NextResponse.json(
        { message: "ข้อมูลไม่ครบ กรุณาตรวจสอบ" },
        { status: 400 }
      );
    }

    const updatedBankAccount = await BankAccountAtv.findByIdAndUpdate(
      _id,
      {
        accountname,
        accountnumber,
        bankname,
        qrcodeImage, // แปลงรูปภาพเป็น base64
        isActive: isActive,
        updatedAt: new Date(), // อัปเดตวันที่แก้ไขล่าสุด
      },
      { new: true } // คืนค่าข้อมูลที่ถูกอัปเดต
    );

    if (!updatedBankAccount) {
      return NextResponse.json(
        { error: "ไม่พบบัญชีที่ต้องการแก้ไข" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "แก้ไขข้อมูลบัญชีสำเร็จ", data: updatedBankAccount },
      { status: 200 }
    );
  } catch (error) {
    console.error("ไม่สามารถแก้ไขข้อมูลบัญชีได้", error);
    return NextResponse.json(
      { error: "ไม่สามารถแก้ไขข้อมูลบัญชีได้" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await connectMongoDB();
    const { _id } = await request.json();

    if (!_id) {
      return NextResponse.json(
        { error: "กรุณาระบุ ID ของบัญชีที่ต้องการลบ" },
        { status: 400 }
      );
    }

    const deletedBankAccount = await BankAccountAtv.findByIdAndDelete(_id);

    if (!deletedBankAccount) {
      return NextResponse.json(
        { error: "ไม่พบบัญชีที่ต้องการลบ" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "ลบบัญชีสำเร็จ" },
      { status: 200 }
    );
  } catch (error) {
    console.error("ไม่สามารถลบบัญชีได้", error);
    return NextResponse.json(
      { error: "ไม่สามารถลบบัญชีได้" },
      { status: 500 }
    );
  }
}
