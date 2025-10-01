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

    if (req.nextUrl.pathname === "/admin/room/create-room") {
      if (
        !userPermission.permissions ||
        !userPermission.permissions.includes("superadmin")
      ) {
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_BASE_URL}/admin/room/room-booking`
        );
      }
    }

    if (req.nextUrl.pathname === "/admin/room/edit-delete-room") {
      if (
        !userPermission.permissions ||
        !userPermission.permissions.includes("superadmin")
      ) {
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_BASE_URL}/admin/room/room-booking`
        );
      }
    }

    if (req.nextUrl.pathname === "/admin/room/room-booking") {
      if (
        !userPermission.permissions ||
        (!userPermission.permissions.includes("admin") &&
          !userPermission.permissions.includes("superadmin"))
      ) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}`);
      }
    }

    if (req.nextUrl.pathname === "/admin/room/room-booking-success") {
      if (
        !userPermission.permissions ||
        (!userPermission.permissions.includes("admin") &&
          !userPermission.permissions.includes("superadmin"))
      ) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}`);
      }
    }

    //////////////////////////////////////////////////////////////////////////////////////
    if (req.nextUrl.pathname === "/admin/dashboard") {
      if (
        !userPermission.permissions ||
        !userPermission.permissions.includes("superadmin")
      ) {
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_BASE_URL}/admin/room/room-booking`
        );
      }
    }

    if (req.nextUrl.pathname === "/admin/bankaccount/managebank") {
      if (
        !userPermission.permissions ||
        !userPermission.permissions.includes("superadmin")
      ) {
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_BASE_URL}/admin/room/room-booking`
        );
      }
    }

    if (req.nextUrl.pathname === "/admin/manageuser") {
      if (
        !userPermission.permissions ||
        !userPermission.permissions.includes("superadmin")
      ) {
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_BASE_URL}/admin/room/room-booking`
        );
      }
    }

    //////////////////////////////////////////////////////////////////////////////////////

    if (req.nextUrl.pathname === "/admin/atv/create-atv") {
      if (
        !userPermission.permissions ||
        !userPermission.permissions.includes("superadmin")
      ) {
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_BASE_URL}/admin/room/room-booking`
        );
      }
    }

    if (req.nextUrl.pathname === "/admin/atv/edit-delete-atv") {
      if (
        !userPermission.permissions ||
        !userPermission.permissions.includes("superadmin")
      ) {
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_BASE_URL}/admin/room/room-booking`
        );
      }
    }

    if (req.nextUrl.pathname === "/admin/atv/atv-booking") {
      if (
        !userPermission.permissions ||
        (!userPermission.permissions.includes("admin") &&
          !userPermission.permissions.includes("superadmin"))
      ) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}`);
      }
    }

    if (req.nextUrl.pathname === "/admin/atv/atv-booking-success") {
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
