// api/get-roleuser/route.js
import axios from "axios";
import axiosRetry from "axios-retry";
import { NextResponse } from "next/server";
import { getAccessToken } from "@/lib/auth";

const BASE_URL = process.env.AUTH_REGISTER;

axiosRetry(axios, {
  retries: 10, // จำนวนการ retry
  retryDelay: axiosRetry.exponentialDelay, // กำหนดระยะเวลา delay ระหว่างการ retry (ใช้ exponential backoff)
  retryCondition: (error) => error.response?.status === 429, // ตรวจสอบหากเกิด Rate Limit
});

// ฟังก์ชันดึงข้อมูล roles ของผู้ใช้
async function getUserRoles(userId) {
  const accessToken = await getAccessToken();
  try {
    const response = await axios.get(`${BASE_URL}/${userId}/roles`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch user roles:", error);
    throw new Error("Failed to fetch user roles");
  }
}

// ฟังก์ชันเพิ่ม role ให้กับผู้ใช้
async function addRoleToUser(userId, roleId) {
  const accessToken = await getAccessToken();

  try {
    const response = await axios.post(
      `${BASE_URL}/${userId}/roles`,
      {
        roles: [roleId],
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to add role:", error);
    throw new Error("Failed to add role");
  }
}

async function removeRoleFromUser(userId, roleId) {
  const accessToken = await getAccessToken();

  try {
    const response = await axios.delete(`${BASE_URL}/${userId}/roles`, {
      data: { roles: [roleId] }, // ส่ง role ที่ต้องการลบ
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to remove role:", error);
    throw new Error("Failed to remove role");
  }
}

// ฟังก์ชัน GET สำหรับ API
export async function GET(req) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { message: "User ID is required" },
      { status: 400 }
    );
  }

  try {
    const roles = await getUserRoles(userId);
    return NextResponse.json(roles, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch user roles" },
      { status: 500 }
    );
  }
}

// ฟังก์ชัน POST สำหรับ API
// ฟังก์ชัน POST สำหรับ API
export async function POST(req) {
  const { userId, oldRoleId, newRoleId } = await req.json();

  if (!userId || !newRoleId) {
    return NextResponse.json(
      { message: "User ID and New Role ID are required" },
      { status: 400 }
    );
  }

  try {
    // ดึง roles ปัจจุบันของ user
    const currentRoles = await getUserRoles(userId);

    // เช็คว่า role ใหม่ที่ต้องการเพิ่ม มีอยู่ใน role ปัจจุบันไหม
    const existingRole = currentRoles.find((role) => role.id === newRoleId);

    if (existingRole) {
      return NextResponse.json(
        { message: "User already has this role" },
        { status: 400 }
      );
    }

    // ลบ role เดิมทั้งหมดก่อนเพิ่ม role ใหม่ (ไม่สนใจ oldRoleId ที่ส่งมา)
    if (currentRoles.length > 0) {
      await Promise.all(
        currentRoles.map((role) => removeRoleFromUser(userId, role.id))
      );
    }

    // เพิ่ม role ใหม่ให้ user
    await addRoleToUser(userId, newRoleId);

    return NextResponse.json(
      { message: "Role updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating role:", error);
    return NextResponse.json(
      { message: "Failed to update user role" },
      { status: 500 }
    );
  }
}
