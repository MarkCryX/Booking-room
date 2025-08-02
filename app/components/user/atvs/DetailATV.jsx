"use client";
import { useCallback, useEffect, useState } from "react";
import AtvBookingList from "./AtvBookingList";

function DetailATV({ user }) {
  const [booking, setBooking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const useremail = user?.email;

  const fetchBooking = useCallback(async () => {
    if (!useremail) {
      setError("ไม่มีอีเมลของผู้ใช้");
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/atvbooking?email=${useremail}`
      );
      const data = await response.json();
      if (response.ok) {
        const filteredBookings = data.atvbooking.filter(
          (booking) =>
            booking.isOrder === false && booking.emailuser === useremail
        );
        setBooking(filteredBookings);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError("เกิดข้อผิดพลาดในการดึงข้อมูลการจอง");
    } finally {
      setLoading(false);
    }
  }, [useremail]);

  useEffect(() => {
    if (useremail) {
      fetchBooking();
      const intervalId = setInterval(() => {
        fetchBooking();
      }, 10000);
      return () => clearInterval(intervalId);
    }
  }, [useremail, fetchBooking]);

  if (loading)
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-lg text-blue-600 font-medium">
          กำลังโหลดข้อมูลการจอง ATV...
        </p>
      </div>
    );

  if (error)
    return (
      <div className="bg-red-50 p-6 rounded-lg text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 mx-auto text-red-500 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h3 className="text-xl font-bold text-red-700 mb-2">เกิดข้อผิดพลาด</h3>
        <p className="text-gray-700">{error}</p>
        <button
          onClick={fetchBooking}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          ลองอีกครั้ง
        </button>
      </div>
    );

  return (
    <div className="p-4 sm:p-6">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-800 mb-3">
          รายการจอง ATV ของคุณ
        </h2>
      </div>
      <AtvBookingList bookings={booking} setBookings={setBooking} />
    </div>
  );
}

export default DetailATV;
