"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaPhone,
  FaEnvelope,
  FaMotorcycle,
  FaUser,
  FaChartBar,
} from "react-icons/fa";

function AtvBooking() {
  const [atvbooking, setAtvbooking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [currentSlipImage, setCurrentSlipImage] = useState("");
  const [bookingStats, setBookingStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    paid: 0,
    pendingPayment: 0,
  });

  const fetchATVbooking = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/atvbooking`
      );
      const data = await response.json();
      if (response.ok) {
        const filteredBookings = data.atvbooking.filter(
          (booking) => booking.isOrder === false
        );
        setAtvbooking(filteredBookings);

        // คำนวณสถิติการจอง
        calculateBookingStats(filteredBookings);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError("เกิดข้อผิดพลาดในการดึงข้อมูล ATV");
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันคำนวณสถิติการจอง
  const calculateBookingStats = (bookings) => {
    const stats = {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === "รอยืนยัน").length,
      confirmed: bookings.filter((b) => b.status === "ยืนยันเรียบร้อย").length,
      paid: bookings.filter((b) => b.paymentStatus === "ชำระเสร็จสิ้น").length,
      pendingPayment: bookings.filter((b) => b.paymentStatus === "ยังไม่ชำระ")
        .length,
    };
    setBookingStats(stats);
  };

  const updateBooking = async (bookingId, action) => {
    if (!confirm("คุณเช็คสลิปการชำระเงินลูกค้าแล้วใช่หรือไม่?")) {
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/atvbooking/${bookingId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setAtvbooking((prevBooking) =>
          prevBooking.map((item) =>
            item._id === bookingId
              ? {
                  ...item,
                  status: data.atvbooking.status,
                  isOrder: data.atvbooking.isOrder,
                }
              : item
          )
        );
      } else {
        setError(data.error || "ไม่สามารถอัปเดตการจองได้");
      }
    } catch (error) {
      setError("เกิดข้อผิดพลาดในการอัปเดต");
    }
  };

  const cancelBooking = async (bookingId) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการจองนี้?")) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/atvbooking/${bookingId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (response.ok) {
        setAtvbooking((prevBooking) =>
          prevBooking.filter((item) => item._id !== bookingId)
        );
      } else {
        setError(data.error || "ไม่สามารถยกเลิกการจองได้");
      }
    } catch (error) {
      setError("เกิดข้อผิดพลาดในการยกเลิกการจอง");
    }
  };

  // ฟังก์ชันสำหรับเปิด Modal แสดงสลิป
  const openSlipModal = (imagepayment) => {
    // ตรวจสอบว่า imagepayment มี prefix 'data:image' แล้วหรือยัง
    let fullBase64Image = imagepayment;

    if (imagepayment && !imagepayment.startsWith("data:image/")) {
      // ถ้าไม่มี ให้เดาว่าเป็น JPEG หรือ PNG และเพิ่ม prefix
      // (ในกรณีส่วนใหญ่รูปสลิปมักจะเป็น JPEG หรือ PNG)
      // คุณอาจจะต้องปรับเปลี่ยน 'jpeg' เป็น 'png' หรือ 'jpg' ตามประเภทไฟล์ที่คาดไว้
      // หรือถ้าข้อมูลจาก DB มีประเภทไฟล์ส่งมาด้วยจะดีที่สุด
      fullBase64Image = `${imagepayment}`;
      // หรือถ้าต้องการความแม่นยำ อาจจะต้องตรวจสอบ type ของไฟล์ก่อน หรือยอมรับว่าเป็น png/jpg
      // fullBase64Image = `data:image/png;base64,${imagepayment}`;
    }
    setCurrentSlipImage(fullBase64Image);
    setShowSlipModal(true);
  };

  // ฟังก์ชันสำหรับปิด Modal แสดงสลิป
  const closeSlipModal = () => {
    setShowSlipModal(false);
    setCurrentSlipImage(""); // ล้างรูปภาพเมื่อปิด Modal
  };

  useEffect(() => {
    fetchATVbooking();

    const intervalId = setInterval(() => {
      fetchATVbooking();
    }, 12000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            จัดการการจอง ATV
          </h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">
            {new Date().toLocaleDateString("th-TH", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* ส่วนแสดงสถิติการจอง */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <FaChartBar className="text-xl" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  การจองทั้งหมด
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {bookingStats.total}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                <FaChartBar className="text-xl" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">รอยืนยัน</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {bookingStats.pending}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <FaChartBar className="text-xl" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">ยืนยันแล้ว</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {bookingStats.confirmed}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <FaChartBar className="text-xl" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  ชำระเสร็จสิ้น
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {bookingStats.paid}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                <FaChartBar className="text-xl" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">รอชำระ</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {bookingStats.pendingPayment}
                </p>
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaTimesCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && atvbooking.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <FaMotorcycle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              ไม่มีการจอง ATV ในขณะนี้
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              ยังไม่มีรายการจอง ATV ที่ต้องจัดการ
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          {atvbooking.map((booking) => (
            <div
              key={booking._id}
              className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200"
            >
              <div className="px-4 py-5 sm:px-6 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                    <FaUser className="mr-2 text-blue-500" />
                    {booking.name}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      booking.status === "รอยืนยัน"
                        ? "bg-yellow-100 text-yellow-800"
                        : booking.status === "ยืนยันเรียบร้อย"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center mb-3">
                      <FaPhone className="text-gray-400 mr-2" />
                      <span className="text-gray-600">{booking.phone}</span>
                    </div>
                    <div className="flex items-center mb-3">
                      <FaEnvelope className="text-gray-400 mr-2" />
                      <span className="text-gray-600">{booking.emailuser}</span>
                    </div>
                    <div className="flex items-center mb-3">
                      <FaCalendarAlt className="text-gray-400 mr-2" />
                      <span className="text-gray-600">
                        {new Date(booking.selectedDate).toLocaleDateString(
                          "th-TH",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <FaMotorcycle className="text-gray-400 mr-2" />
                      <span className="text-gray-600">
                        รอบ {booking.selectedRound} น.
                      </span>
                    </div>
                    <div className="flex items-center mt-2">
                      <p
                        className={`mb-2 ${
                          booking.paymentStatus === "ยังไม่ชำระ"
                            ? "text-red-500"
                            : "text-green-500"
                        }`}
                      >
                        สถานะการชำระเงิน: {booking.paymentStatus}
                      </p>
                    </div>
                  </div>
                  <div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">
                        รายละเอียด ATV
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-sm text-gray-500">คันเล็ก</p>
                          <p className="font-medium">
                            {booking.numSmallATV} คัน
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">คันใหญ่</p>
                          <p className="font-medium">
                            {booking.numLargeATV} คัน
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 bg-blue-50 p-4 rounded-lg flex justify-between items-center">
                      {" "}
                      {/* เพิ่ม items-center เพื่อจัดกึ่งกลางแนวตั้ง */}
                      <div>
                        <h4 className="text-xl font-semibold text-blue-500 mb-2">
                          ราคา {booking.totalPrice.toLocaleString()} บาท
                        </h4>
                        {/* ปุ่มดูสลิปการชำระเงิน */}
                        {booking.paymentStatus === "ชำระเสร็จสิ้น" &&
                          booking.imagepayment && (
                            <button
                              onClick={() =>
                                openSlipModal(booking.imagepayment)
                              }
                              className="text-blue-600 hover:underline flex items-center text-sm"
                            >
                              <FaMoneyBillWave className="mr-1" />
                              ดูสลิปการชำระเงิน
                            </button>
                          )}
                        {/* กรณีไม่มีสลิป หรือยังไม่ชำระ */}
                        {(!booking.imagepayment ||
                          booking.paymentStatus !== "ชำระเสร็จสิ้น") && (
                          <p className="text-sm text-gray-500">
                            ไม่มีสลิปการชำระเงิน
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 py-4 sm:px-6 bg-gray-50 flex justify-between">
                <div>
                  {booking.status === "รอยืนยัน" && (
                    <button
                      onClick={() => updateBooking(booking._id, "ยืนยัน")}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <FaCheckCircle className="mr-2" />
                      ยืนยันการจอง
                    </button>
                  )}
                  {booking.status === "ยืนยันเรียบร้อย" && !booking.isOrder && (
                    <button
                      onClick={() => updateBooking(booking._id, "ปิดออเดอร์")}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <FaCheckCircle className="mr-2" />
                      ปิดการจอง
                    </button>
                  )}
                </div>
                <div>
                  {booking.status !== "ยืนยันเรียบร้อย" &&
                    booking.status !== "ปิดออเดอร์" &&
                    // booking.paymentStatus == "ยังไม่ชำระ" &&
                    booking.status !== "ยกเลิก" && (
                      <button
                        onClick={() => cancelBooking(booking._id)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <FaTimesCircle className="mr-2" />
                        ยกเลิกการจอง
                      </button>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slip Image Modal */}
      {showSlipModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 relative">
            <h3 className="text-2xl font-bold mb-4 text-gray-900">
              สลิปการชำระเงิน
            </h3>
            <div className="max-h-[80vh] overflow-y-auto">
              {currentSlipImage ? (
                <img
                  src={currentSlipImage}
                  alt="Payment Slip"
                  className="w-full h-auto object-contain rounded-md"
                />
              ) : (
                <p className="text-gray-600 text-center py-4">
                  ไม่พบรูปภาพสลิป.
                </p>
              )}
            </div>
            <button
              onClick={closeSlipModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="Close modal"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <button
              onClick={closeSlipModal}
              className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300 font-semibold"
            >
              ปิด
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AtvBooking;
