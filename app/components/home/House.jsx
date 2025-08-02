"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function House() {
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchRooms = async () => {
    try {
      const response = await fetch("/api/rooms");
      const data = await response.json();
      if (response.ok) {
        setRooms(data.rooms);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError("เกิดข้อผิดพลาดในการดึงข้อมูลห้อง");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const getStatusText = (status) => {
    switch (status) {
      case "พร้อมให้บริการ":
        return { text: "พร้อมให้บริการ", color: "text-green-500" };
      case "ถูกจองแล้ว":
        return { text: "ถูกจองแล้ว", color: "text-yellow-500" };
      default:
        return { text: "อยู่ระหว่างการซ่อมแซม", color: "text-red-500" };
    }
  };

  if (loading) {
    return (
      <section id="house" className="py-16 bg-[#6a8f71]">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          <p className="mt-4 text-white">กำลังโหลดข้อมูลห้องพัก...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="house" className="py-16 bg-[#6a8f71]">
        <div className="container mx-auto px-4 text-center text-white">
          <p>เกิดข้อผิดพลาด: {error}</p>
          <button 
            onClick={fetchRooms}
            className="mt-4 bg-white text-[#6a8f71] px-4 py-2 rounded-md"
          >
            ลองอีกครั้ง
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="house" className="py-16 bg-[#6a8f71]">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
          ห้องพักของเรา
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map((room) => {
            const { text, color } = getStatusText(room.status);
            return (
              <div key={room._id} className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <div className="relative h-64 w-full">
                  <Image
                    src={room.images[0]}
                    alt={room.roomName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-center mb-2">
                    {room.roomName}
                  </h3>
                  <p className={`text-sm mb-4 ${color}`}>สถานะ: {text}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-semibold">รายละเอียด:</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {room.description.split(",").map((item, i) => (
                          <li key={i} className="text-sm">{item.trim()}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold">สิ่งอำนวยความสะดวก:</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {room.amenities.split(",").map((item, i) => (
                          <li key={i} className="text-sm">{item.trim()}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mb-4">
                    <p>ผู้ใหญ่: {room.price} บาท</p>
                    <p>เด็ก: {room.pricechild} บาท</p>
                  </div>
                  
                  <button
                    onClick={() => router.push(`/room/${room._id}`)}
                    className="w-full bg-[#104b0e] hover:bg-[#0d3a0b] text-white py-2 px-4 rounded-md transition-colors"
                  >
                    จองตอนนี้
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default House;