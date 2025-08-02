// app/user/DetailPage.js
"use client";

import { useState, useEffect, Suspense } from "react"; // เพิ่ม Suspense
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "../components/Navbar"; // ตรวจสอบเส้นทางให้ถูกต้อง
import DetailATV from "../components/user/atvs/DetailATV";
import DetailBooking from "../components/user/rooms/DetailBooking";
import { useUser } from "@auth0/nextjs-auth0/client";

// Component แยกออกมาเพื่อใช้ useSearchParams
function DetailPageContent() {
  const { user, error, isLoading } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [selectedTab, setSelectedTab] = useState("atv");

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');

    if (tabFromUrl === 'atv' || tabFromUrl === 'booking') {
      setSelectedTab(tabFromUrl);
    } else {
      setSelectedTab('atv');
      if (router) {
        router.replace('/user?tab=atv', undefined, { shallow: true });
      }
    }
  }, [searchParams, router]);

  const handleTabChange = (tabName) => {
    if (router) {
      router.push(`/user?tab=${tabName}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-xl text-blue-800 font-medium">กำลังโหลดข้อมูลการจอง...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-700 mb-2">เกิดข้อผิดพลาด</h2>
          <p className="text-gray-700 mb-6">{error.message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            ลองอีกครั้ง
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-yellow-50 to-amber-100">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="text-yellow-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-yellow-700 mb-4">กรุณาล็อกอิน</h2>
          <p className="text-gray-700 mb-6">คุณต้องล็อกอินก่อนจึงจะดูหน้านี้ได้</p>
          <a
            href="/api/auth/login"
            className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors inline-block"
          >
            ไปหน้าล็อกอิน
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-500 to-blue-300 min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-24 lg:pt-32 flex-1 p-4 md:p-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
          {/* เมนูเลือกประเภท */}
          <div className="w-full md:w-1/4 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
            <h3 className="font-bold text-2xl text-gray-800 mb-6 border-b pb-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              เลือกประเภทการจอง
            </h3>
            <button
              onClick={() => handleTabChange("atv")}
              className={` w-full mb-4 py-3 text-lg text-center rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center
                ${selectedTab === "atv"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:from-blue-700 hover:to-indigo-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              รายการ ATV
            </button>
            <button
              onClick={() => handleTabChange("booking")}
              className={`w-full py-3 text-lg text-center rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center
                ${selectedTab === "booking"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:from-blue-700 hover:to-indigo-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              รายการบ้านพัก
            </button>
          </div>

          {/* ส่วนที่แสดงข้อมูลตามประเภทที่เลือก */}
          <div className="w-full md:w-3/4 bg-white rounded-xl shadow-lg p-6 min-h-[calc(100vh-200px)] overflow-y-auto border border-gray-100">
            {selectedTab === "atv" ? (
              <DetailATV user={user} />
            ) : (
              <DetailBooking user={user} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


export default function DetailPage() {
  return (
    // ห่อหุ้ม DetailPageContent ด้วย Suspense
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-xl text-blue-800 font-medium">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    }>
      <DetailPageContent />
    </Suspense>
  );
}