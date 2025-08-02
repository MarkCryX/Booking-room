import { NextResponse } from "next/server";
import {
  withMiddlewareAuthRequired,
  getSession,
} from "@auth0/nextjs-auth0/edge";
import { jwtDecode } from "jwt-decode";

export default withMiddlewareAuthRequired(async (req) => {
  const res = NextResponse.next();

  // ดึง session ของผู้ใช้จาก Auth0
  const user = await getSession(req, res);

  // หากไม่มี session ให้ทำการ redirect ไปที่หน้า login
  if (!user) {
    return NextResponse.redirect(
      new URL("/api/auth/login", req.url).toString()
    );
  }

  try {
    // ถอดรหัส JWT
    const userPermission = jwtDecode(user.accessToken);

    if (req.nextUrl.pathname === "/admin/booking") {
      // ถ้าผู้ใช้ไม่มี permission "edit:alladmin"
      if (
        !userPermission.permissions ||
        (!userPermission.permissions.includes("admin") &&
          !userPermission.permissions.includes("superadmin"))
      ) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}`);
      }
    }

    if (req.nextUrl.pathname === "/admin/createroom") {
      // ถ้าผู้ใช้ไม่มี permission "edit:alladmin"
      if (
        !userPermission.permissions ||
        !userPermission.permissions.includes("superadmin")
      ) {
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_BASE_URL}/admin/booking`
        );
      }
    }

    if (req.nextUrl.pathname === "/admin/edit&deleteroom") {
      // ถ้าผู้ใช้ไม่มี permission "edit:alladmin"
      if (
        !userPermission.permissions ||
        !userPermission.permissions.includes("superadmin")
      ) {
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_BASE_URL}/admin/booking`
        );
      }
    }

    if (req.nextUrl.pathname === "/admin/reserveatv") {
      // ถ้าผู้ใช้ไม่มี permission "edit:alladmin"
      if (
        !userPermission.permissions ||
        !userPermission.permissions.includes("superadmin")
      ) {
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_BASE_URL}/admin/booking`
        );
      }
    }

    if (req.nextUrl.pathname === "/admin/reserveatv/editreserveatv") {
      // ถ้าผู้ใช้ไม่มี permission "edit:alladmin"
      if (
        !userPermission.permissions ||
        !userPermission.permissions.includes("superadmin")
      ) {
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_BASE_URL}/admin/booking`
        );
      }
    }

    if (req.nextUrl.pathname === "/admin/dashboard") {
      // ถ้าผู้ใช้ไม่มี permission "edit:alladmin"
      if (
        !userPermission.permissions ||
        (!userPermission.permissions.includes("admin") &&
          !userPermission.permissions.includes("superadmin"))
      ) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}`);
      }
    }
  } catch (error) {
    // หากเกิดข้อผิดพลาดในการถอดรหัส JWT
    console.error("Error decoding JWT:", error);
    const redirectUrl = new URL("/", req.url).toString();
    return NextResponse.redirect(redirectUrl);
  }

  return res;
});

export const config = {
  matcher: ["/profile", "/admin/:path*", "/room/:path*", "/atv"], // กำหนดให้ middleware ทำงานกับเส้นทางที่เกี่ยวข้อง
};
