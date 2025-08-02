// api/atvs/route.js
import { connectMongoDB } from "@/lib/mongodb";
import ATV from "@/models/atv";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectMongoDB();

    const { images, priceSmall, priceLarge, numATVSmall, numATVLarge, numATVPerRound, roundTimes, description } =
      await req.json();

    if (!images || !priceSmall || !priceLarge || !roundTimes || !description) {
      return NextResponse.json(
        { error: "กรุณากรอกข้อมูลให้ครบถ้วน" },
        { status: 400 }
      );
    }

    // ตรวจสอบว่ามีจำนวนรถ ATV รวมกันอย่างน้อย 1 คัน
    if (numATVSmall < 0 || numATVLarge < 0 || (numATVSmall === 0 && numATVLarge === 0)) {
        return NextResponse.json(
            { error: "ต้องระบุจำนวน ATV คันเล็กหรือคันใหญ่อย่างน้อย 1 คัน" },
            { status: 400 }
        );
    }

    // ตรวจสอบ numATVPerRound
    if (numATVPerRound <= 0) {
      return NextResponse.json(
          { error: "จำนวน ATV ที่จองได้สูงสุดต่อรอบต้องเป็นตัวเลขมากกว่า 0" },
          { status: 400 }
      );
    }

    // ตรวจสอบว่าจำนวน ATV ต่อรอบต้องไม่เกินจำนวน ATV รวมทั้งหมด
    if (numATVPerRound > (numATVSmall + numATVLarge)) {
      return NextResponse.json(
          { error: "จำนวน ATV ที่จองได้ต่อรอบต้องไม่เกินจำนวน ATV ทั้งหมดที่มี" },
          { status: 400 }
      );
    }

    const newATV = new ATV({
      images,
      priceSmall,
      priceLarge,
      numATVSmall,
      numATVLarge,
      numATVPerRound, // เพิ่มกลับมา
      roundTimes,
      description,
    });

    await newATV.save();

    return NextResponse.json(
      { message: "สร้าง ATV สำเร็จ", atv: newATV },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/atvs:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await connectMongoDB();

    const atvData = await ATV.find({});
    
    if (Array.isArray(atvData)) {
      return NextResponse.json({ message: "ข้อมูล ATV", atvData });
    } else {
      return NextResponse.json(
        { error: "ข้อมูล ATV ไม่ถูกต้อง" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error in GET /api/atvs:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectMongoDB();
    const { atvId } = await req.json();
    
    if (!atvId) {
      return NextResponse.json({ error: "ไม่พบ atvId" }, { status: 400 });
    }

    const deletedATV = await ATV.findByIdAndDelete(atvId);

    if (!deletedATV) {
      return NextResponse.json(
        { error: "ไม่พบ ATV ที่ต้องการลบ" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "ลบ ATV สำเร็จ" }, { status: 200 });
  } catch (error) {
    console.error("Error in DELETE /api/atvs:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const { atvId, updatedData } = await req.json();

    await connectMongoDB();

    const atv = await ATV.findById(atvId);

    if (!atv) {
      return NextResponse.json({ error: "ATV not found" }, { status: 404 });
    }

    atv.priceSmall = updatedData.priceSmall !== undefined ? updatedData.priceSmall : atv.priceSmall;
    atv.priceLarge = updatedData.priceLarge !== undefined ? updatedData.priceLarge : atv.priceLarge;
    atv.numATVSmall = updatedData.numATVSmall !== undefined ? updatedData.numATVSmall : atv.numATVSmall;
    atv.numATVLarge = updatedData.numATVLarge !== undefined ? updatedData.numATVLarge : atv.numATVLarge;
    atv.numATVPerRound = updatedData.numATVPerRound !== undefined ? updatedData.numATVPerRound : atv.numATVPerRound; // อัปเดตค่า
    atv.description = updatedData.description !== undefined ? updatedData.description : atv.description;
    atv.roundTimes = updatedData.roundTimes !== undefined ? updatedData.roundTimes : atv.roundTimes;

    if (updatedData.images && updatedData.images.length > 0) {
      atv.images = updatedData.images;
    }

    await atv.save();

    return NextResponse.json({
      message: "ATV updated successfully",
      atv: atv,
    });
  } catch (error) {
    console.error("Error updating ATV:", error);
    return NextResponse.json(
      { error: "Failed to update ATV" },
      { status: 500 }
    );
  }
}