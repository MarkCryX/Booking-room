// api/get-user/route.js
import axios from 'axios';
import { NextResponse } from 'next/server';
import { getAccessToken } from '@/lib/auth';


let cachedUsers = null;
let usersCacheTime = null;

// ฟังก์ชันดึงข้อมูลผู้ใช้
async function getUsers() {
  const accessToken = await getAccessToken();

  // เช็คว่า cache มีข้อมูลและไม่หมดอายุ
  if (cachedUsers && usersCacheTime > Date.now()) {
    return cachedUsers;
  }

  const url = process.env.AUTH_REGISTER;
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    cachedUsers = response.data; // เก็บข้อมูลผู้ใช้ใน cache
    usersCacheTime = Date.now() + 10 * 100; // 10 วินาที

    return cachedUsers;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    throw error;
  }
}

// ฟังก์ชัน GET สำหรับ API
export async function GET() {
  try {
    const users = await getUsers();
    return NextResponse.json(users, { status: 200 }); // ใช้ NextResponse.json แทน res.status
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}



export async function POST(request) {
  try {
    const { name, email, password, connection, user_metadata } = await request.json();
    const accessToken = await getAccessToken();

    const payload = {
      name,
      email,
      password,
      connection,
      user_metadata,
    };

    const url = process.env.AUTH_REGISTER;

    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    // เคลียร์ cache หลังจากสมัครสมาชิกสำเร็จ
    cachedUsers = null;
    usersCacheTime = null;

    // เพิ่ม delay 1 วินาที เพื่อให้ Auth0 อัปเดตข้อมูล
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error("Error signing up:", error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data || error.message },
      { status: error.response?.status || 500 }
    );
  }
}


// DELETE สำหรับลบผู้ใช้ที่เลือก
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const accessToken = await getAccessToken();
    const url = `${process.env.AUTH_REGISTER}/${userId}`;

    const response = await axios.delete(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // เคลียร์ cache หลังจากลบผู้ใช้สำเร็จ
    cachedUsers = null;
    usersCacheTime = null;

    // ถ้า response.status เป็น 204 (No Content) ให้ส่ง response ใหม่ที่มี body
    if (response.status === 204) {
      return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
    }

    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error("Error deleting user:", error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data || error.message },
      { status: error.response?.status || 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const { userId, user_metadata, name, email } = await request.json();
    const accessToken = await getAccessToken();

    const url = `${process.env.AUTH_REGISTER}/${userId}`;

    const payload = {
      name,
      email,
      user_metadata,
    };

    const response = await axios.patch(url, payload, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    // ล้าง cache หลังแก้ไข
    cachedUsers = null;
    usersCacheTime = null;

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    console.error("Error updating user:", error.response?.data || error.message);
    return NextResponse.json(
      { error: error.response?.data || error.message },
      { status: error.response?.status || 500 }
    );
  }
}




