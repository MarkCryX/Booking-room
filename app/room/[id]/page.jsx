"use client"; // เพิ่ม use client ที่นี่

import Navbar from "@/app/components/Navbar";
import Image from "next/image";
import { useEffect, useState } from "react";
import DetailRoom from "@/app/components/Room/DetailRoom";

function RoomDetail({ params }) {
  const [room, setRoom] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // เพิ่ม state สำหรับการเช็คการโหลดข้อมูล

  // ตรวจสอบว่า router.query มีค่าแล้วหรือยัง ก่อนที่จะดึง id
  const { id } = params; // ป้องกันข้อผิดพลาด

  useEffect(() => {
    if (id) {
      setLoading(true); // ตั้งค่า loading เป็น true เมื่อเริ่มการโหลด
      const fetchRoomDetails = async () => {
        try {
          // console.log(`กำลังดึงข้อมูลห้องที่ ID: ${id}`);
          const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/rooms/${id}`);
          const data = await response.json();

          if (response.ok) {
            setRoom(data.room);
          } else {
            setError("ไม่พบข้อมูลห้อง");
          }
        } catch (error) {
          setError("เกิดข้อผิดพลาดในการดึงข้อมูลห้อง");
        } finally {
          setLoading(false); // ตั้งค่า loading เป็น false เมื่อการโหลดเสร็จสิ้น
        }
      };

      fetchRoomDetails();
    }
  }, [id]);

  // ถ้าเกิดข้อผิดพลาดแสดง error
  if (error) return <div className="flex items-center justify-center h-screen text-red-600 text-xl">{error}</div>;

  // ถ้ายังอยู่ในระหว่างการโหลดข้อมูล
  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      <p className="ml-4 text-lg text-gray-700">กำลังโหลดข้อมูลห้อง...</p>
    </div>
  );

  // ถ้าได้ข้อมูลห้องแล้ว
  return (
    <div className="min-h-screen flex flex-col"> {/* ใช้ min-h-screen และ flex-col เพื่อให้ content เต็มหน้าจอ */}
      <Navbar />
      <div className="relative w-full h-[30vh] md:h-[40vh] lg:h-[50vh] xl:h-[60vh] overflow-hidden"> {/* ปรับความสูงให้ Responsive */}
        {room.images && room.images.length > 0 && (
          <Image
            src={room.images[0]}
            alt={room.roomName || "Room Image"} // ใช้ roomName เป็น alt text เพื่อ SEO และ Accessibility
            priority={true} // เพิ่ม priority สำหรับภาพ Hero เพื่อการโหลดที่เร็วขึ้น
            fill // ให้ Image คอมโพเนนต์ครอบคลุมพื้นที่ทั้งหมดของ parent
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 100vw" // กำหนด sizes เพื่อประสิทธิภาพ
            style={{
              objectFit: "cover", // ใช้ cover เพื่อให้ภาพเต็มพื้นที่และรักษาสัดส่วน
              objectPosition: "center", // จัดตำแหน่งภาพให้อยู่ตรงกลาง
            }}
            className="transition-transform duration-300 hover:scale-105" // เพิ่ม animation เมื่อ hover
          />
        )}
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <div className="absolute inset-0 flex justify-center items-center text-white text-center p-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold drop-shadow-lg">
            {room.roomName}
          </h1>
        </div>
      </div>
      <DetailRoom room={room} />
    </div>
  );
}

export default RoomDetail;