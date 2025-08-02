// api/rooms/route.js
import { connectMongoDB } from "@/lib/mongodb"; // เชื่อมต่อ MongoDB
import Room from "@/models/room"; // ตรวจสอบให้แน่ใจว่าได้อัปเดต models/room.js แล้ว
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectMongoDB();
    const {
      roomName,
      images,
      status,
      price,
      pricechild,
      maxGuests, // <-- เพิ่มเข้ามา: รับค่า maxGuests
      description,
      amenities,
    } = await req.json();

    // ตรวจสอบข้อมูลที่จำเป็นทั้งหมด รวมถึง maxGuests
    if (
      !roomName ||
      !images ||
      images.length === 0 ||
      !price ||
      !description ||
      maxGuests === undefined || // <-- เพิ่มเข้ามา: ตรวจสอบ maxGuests
      maxGuests <= 0 // <-- เพิ่มเข้ามา: ตรวจสอบว่า maxGuests ต้องมากกว่า 0
    ) {
      return NextResponse.json(
        { error: "กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง (รวมถึงจำนวนผู้เข้าพักสูงสุด)" },
        { status: 400 }
      );
    }

    const newRoom = new Room({
      roomName,
      images,
      status,
      price,
      pricechild,
      maxGuests: Number(maxGuests), // <-- เพิ่มเข้ามา: บันทึกค่า maxGuests (แปลงเป็น Number เสมอ)
      description,
      amenities,
    });

    await newRoom.save();

    return NextResponse.json(
      { message: "สร้างห้องสำเร็จ", room: newRoom },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.roomName) {
      // กรณีชื่อห้องซ้ำ (หาก roomName ถูกตั้งเป็น unique ใน Schema)
      return NextResponse.json({ error: "ชื่อห้องนี้มีอยู่แล้ว โปรดระบุชื่ออื่น" }, { status: 409 });
    }
    console.error("Error creating room:", error); // สำหรับ debugging
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการสร้างห้อง" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectMongoDB();
    const rooms = await Room.find({});
    return NextResponse.json({ rooms });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return NextResponse.json(
      { error: "Failed to fetch rooms" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  const { roomId } = await request.json();

  try {
    await connectMongoDB();
    const deletedRoom = await Room.findByIdAndDelete(roomId);

    if (!deletedRoom) {
      return NextResponse.json({ error: "ไม่พบห้องที่จะลบ" }, { status: 404 });
    }

    return NextResponse.json({ message: "ลบห้องสำเร็จ" });
  } catch (error) {
    console.error("Error deleting room:", error);
    return NextResponse.json(
      { error: "Failed to delete room" },
      { status: 500 }
    );
  }
}

// ฟังก์ชัน PUT สำหรับการอัปเดตห้อง
export async function PUT(req) {
  try {
    const { roomId, updatedRoom } = await req.json(); // รับ roomId และข้อมูลที่อัปเดต

    // เชื่อมต่อ MongoDB
    await connectMongoDB();

    // ค้นหาห้องที่ต้องการอัปเดต
    const room = await Room.findById(roomId);

    if (!room) {
      return NextResponse.json({ error: "ไม่พบห้องที่จะอัปเดต" }, { status: 404 });
    }

    // อัปเดตข้อมูลห้อง
    room.roomName = updatedRoom.roomName !== undefined ? updatedRoom.roomName : room.roomName;
    room.status = updatedRoom.status !== undefined ? updatedRoom.status : room.status;
    room.price = updatedRoom.price !== undefined ? updatedRoom.price : room.price;
    room.pricechild = updatedRoom.pricechild !== undefined ? updatedRoom.pricechild : room.pricechild;
    room.maxGuests = updatedRoom.maxGuests !== undefined ? Number(updatedRoom.maxGuests) : room.maxGuests; // <-- เพิ่มเข้ามา: อัปเดต maxGuests
    room.description = updatedRoom.description !== undefined ? updatedRoom.description : room.description;
    room.amenities = updatedRoom.amenities !== undefined ? updatedRoom.amenities : room.amenities;


    // ตรวจสอบว่า images มีค่าหรือไม่แล้วอัปเดตไปที่ room.images
    if (updatedRoom.images && updatedRoom.images.length > 0) {
      room.images = updatedRoom.images; // เพิ่ม URL ของภาพที่อัปโหลดจาก Cloudinary
    }

    // เพิ่มการตรวจสอบสำหรับ maxGuests เมื่อมีการอัปเดต (ถ้าจำเป็น)
    if (room.maxGuests <= 0) {
        return NextResponse.json({ error: "จำนวนผู้เข้าพักสูงสุดต้องมากกว่า 0" }, { status: 400 });
    }

    await room.save(); // บันทึกข้อมูลห้องที่อัปเดต

    return NextResponse.json({
      message: "Room updated successfully",
      room: room, // ส่งห้องที่อัปเดตแล้วกลับไป
    });
  } catch (error) {
    console.error("Error updating room:", error); // สำหรับ debugging
    return NextResponse.json(
      { error: "Failed to update room" },
      { status: 500 }
    );
  }
}