"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import Image from "next/image";
import Navbar from "../components/Navbar";

export default function ProfileClient() {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  return (
    user && (
      <div className="bg-[#6a8f71] h-screen">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-full text-center space-y-4"> {/* เพิ่มการจัดตำแหน่งในแนวตั้ง */}
          <Image
            className="rounded-full"
            src={user.picture}
            alt={user.name}
            width={100} // เพิ่มขนาดรูปภาพให้ใหญ่ขึ้น
            height={100}
          />
          <h2 className="text-3xl text-white font-semibold">{user.name}</h2>
          <p className="text-lg text-white">{user.email}</p>
        </div>
      </div>
    )
  );
}
