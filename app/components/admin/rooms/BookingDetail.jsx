"use client";
import { useState, useEffect } from "react";
import Sidebar from "../../Sidebar";
import { 
  FiRefreshCw, 
  FiCheck, 
  FiX, 
  FiClock, 
  FiDollarSign, 
  FiUser, 
  FiHome, 
  FiCalendar 
} from "react-icons/fi";
import { FaMoneyBillWave } from "react-icons/fa";

function BookingDetail() {
  const [booking, setBooking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // ปิด sidebar เริ่มต้นบนมือถือ
  const [refreshing, setRefreshing] = useState(false);
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [currentSlipImage, setCurrentSlipImage] = useState("");

  const fetchBooking = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/booking`
      );
      const data = await response.json();
      if (response.ok) {
        const filteredBookings = data.bookings.filter(
          (booking) => booking.isOrder === false
        );
        setBooking(filteredBookings);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError("เกิดข้อผิดพลาดในการดึงข้อมูลห้อง");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const openSlipModal = (imagepayment) => {
    let fullBase64Image = imagepayment;
    
    if (imagepayment && !imagepayment.startsWith('data:image/')) {
      fullBase64Image = `${imagepayment}`;
    }
    setCurrentSlipImage(fullBase64Image);
    setShowSlipModal(true);
  };

  const closeSlipModal = () => {
    setShowSlipModal(false);
    setCurrentSlipImage("");
  };

  useEffect(() => {
    fetchBooking();
    const intervalId = setInterval(() => {
      setRefreshing(true);
      fetchBooking();
    }, 12000);
    return () => clearInterval(intervalId);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBooking();
  };

  const updateBooking = async (bookingId, action) => {
     if (!confirm("คุณเช็คสลิปการชำระเงินลูกค้าแล้วใช่หรือไม่?")) {
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/booking/${bookingId}`,
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
        setBooking((prevBooking) =>
          prevBooking.map((item) =>
            item._id === bookingId
              ? {
                  ...item,
                  status:
                    action === "ยืนยัน" ? "ยืนยันเรียบร้อย" : "ปิดออเดอร์",
                  isOrder: action === "ปิดออเดอร์" ? true : item.isOrder,
                }
              : item
          )
        );
      } else {
        setError(data.error || "ไม่สามารถอัปเดตสถานะได้");
      }
    } catch (error) {
      setError("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
    }
    fetchBooking();
  };

  const cancelBooking = async (bookingId) => {
     if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการจองนี้?")) {
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/booking/${bookingId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (response.ok) {
        setBooking((prevBooking) =>
          prevBooking.filter((item) => item._id !== bookingId)
        );
      } else {
        setError(data.error || "ไม่สามารถยกเลิกการจองได้");
      }
    } catch (error) {
      setError("เกิดข้อผิดพลาดในการยกเลิกการจอง");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "รอยืนยัน":
        return "bg-yellow-100 text-yellow-800";
      case "ยืนยันเรียบร้อย":
        return "bg-green-100 text-green-800";
      case "ปิดออเดอร์":
        return "bg-gray-100 text-gray-800";
      case "ยกเลิก":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getPaymentColor = (status) => {
    return status === "ยังไม่ชำระ" 
      ? "bg-red-100 text-red-800" 
      : "bg-green-100 text-green-800";
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - แสดงบนแท็บเล็ตและเดสก์ท็อปเท่านั้น */}
      <div className={`hidden md:block ${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300`}>
        {/* <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} /> */}
      </div>
      
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'md:ml-0' : 'md:ml-0'}`}>
        <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-3 md:gap-4">
            <div>
              <div className="flex items-center justify-between md:block">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
                  การจองห้องทั้งหมด
                </h1>
                {/* ปุ่มเมนูสำหรับมือถือ */}

              </div>
              <p className="text-sm md:text-base text-gray-500 mt-1">
                {new Date().toLocaleDateString('th-TH', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={handleRefresh}
                className={`flex items-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-sm sm:text-base ${refreshing ? 'animate-spin' : ''}`}
                disabled={refreshing}
              >
                <FiRefreshCw className={`${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">รีเฟรช</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 md:mb-8">
            <div className="bg-white p-3 sm:p-4 rounded-lg shadow border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">การจองทั้งหมด</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold">{booking.length}</p>
                </div>
                <div className="p-2 sm:p-3 rounded-full bg-blue-50 text-blue-500">
                  <FiCalendar className="text-sm sm:text-base md:text-lg" />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-3 sm:p-4 rounded-lg shadow border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">รอยืนยัน</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold">
                    {booking.filter(b => b.status === "รอยืนยัน").length}
                  </p>
                </div>
                <div className="p-2 sm:p-3 rounded-full bg-yellow-50 text-yellow-500">
                  <FiClock className="text-sm sm:text-base md:text-lg" />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-3 sm:p-4 rounded-lg shadow border-l-4 border-green-500 col-span-2 md:col-span-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">ยืนยันแล้ว</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold">
                    {booking.filter(b => b.status === "ยืนยันเรียบร้อย").length}
                  </p>
                </div>
                <div className="p-2 sm:p-3 rounded-full bg-green-50 text-green-500">
                  <FiCheck className="text-sm sm:text-base md:text-lg" />
                </div>
              </div>
            </div>

            
          </div>

          {/* Booking List */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiX className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          ) : booking.length === 0 ? (
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
                <FiHome className="h-5 w-5 text-gray-400" />
              </div>
              <h3 className="mt-3 text-lg font-medium text-gray-900">ไม่มีการจองในขณะนี้</h3>
              <p className="mt-1 text-sm text-gray-500">เมื่อมีการจองใหม่จะแสดงที่นี่</p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {booking.map((Booking) => (
                <div
                  key={Booking._id}
                  className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-500 relative overflow-hidden"
                >
                  {/* Status Ribbon */}
                  <div className={`absolute top-0 right-0 px-2 py-0.5 sm:px-3 sm:py-1 text-xs font-semibold rounded-bl-lg ${getStatusColor(Booking.status)}`}>
                    {Booking.status}
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
                    {/* Customer Info */}
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 rounded-full bg-blue-50 text-blue-500">
                          <FiUser className="text-sm sm:text-base" />
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                            {Booking.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500">{Booking.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 rounded-full bg-purple-50 text-purple-500">
                          <FiHome className="text-sm sm:text-base" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600">บ้าน: {Booking.roomName}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Booking Details */}
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 rounded-full bg-green-50 text-green-500 mt-0.5">
                          <FiCalendar className="text-sm sm:text-base" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600">
                            เช็คอิน:{" "}
                            {Booking.checkInDate
                              ? new Date(Booking.checkInDate).toLocaleDateString("th-TH", {
                                  timeZone: "UTC",
                                })
                              : "ไม่พบข้อมูล"}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600">
                            เช็คเอาท์:{" "}
                            {Booking.checkOutDate
                              ? new Date(Booking.checkOutDate).toLocaleDateString("th-TH", {
                                  timeZone: "UTC",
                                })
                              : "ไม่พบข้อมูล"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 rounded-full bg-yellow-50 text-yellow-500">
                          <FiUser className="text-sm sm:text-base" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600">ผู้ใหญ่: {Booking.numAdults} คน</p>
                          <p className="text-xs sm:text-sm text-gray-600">เด็ก: {Booking.numChildren} คน</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Payment and Actions */}
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 rounded-full bg-blue-50 text-blue-500 mt-0.5">
                          <FiDollarSign className="text-sm sm:text-base" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-gray-600">
                            ราคารวม: <span className="text-blue-600">{Booking.totalPrice.toLocaleString()} บาท</span>
                          </p>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${getPaymentColor(Booking.paymentStatus)}`}>
                            {Booking.paymentStatus}
                          </span>
                          {/* ปุ่มดูสลิปการชำระเงิน */}
                          {Booking.paymentStatus === "ชำระเสร็จสิ้น" && Booking.imagepayment && (
                            <button
                              onClick={() => openSlipModal(Booking.imagepayment)}
                              className="text-blue-600 hover:underline flex items-center text-xs sm:text-sm mt-1"
                            >
                              <FaMoneyBillWave className="mr-1 text-xs sm:text-sm" />
                              ดูสลิปการชำระเงิน
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 sm:gap-2 justify-end">
                        {Booking.status === "รอยืนยัน" && Booking.paymentStatus === "ชำระเสร็จสิ้น" && (
                          <button
                            onClick={() => updateBooking(Booking._id, "ยืนยัน")}
                            className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 bg-blue-500 text-white rounded-md sm:rounded-lg hover:bg-blue-600 transition-colors text-xs sm:text-sm"
                          >
                            <FiCheck className="text-xs sm:text-sm md:text-base" />
                            <span>ยืนยันการจอง</span>
                          </button>
                        )}
                        {Booking.status === "ยืนยันเรียบร้อย" && !Booking.isOrder &&  (
                          <button
                            onClick={() => updateBooking(Booking._id, "ปิดออเดอร์")}
                            className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 bg-green-500 text-white rounded-md sm:rounded-lg hover:bg-green-600 transition-colors text-xs sm:text-sm"
                          >
                            <FiCheck className="text-xs sm:text-sm md:text-base" />
                            <span>ปิดการจอง</span>
                          </button>
                        )}
                        {Booking.status !== "ยืนยันเรียบร้อย" &&
                          Booking.status !== "ปิดออเดอร์" &&
                          // Booking.paymentStatus !== "ชำระเสร็จสิ้น" &&
                          Booking.status !== "ยกเลิก" && (
                            <button
                              onClick={() => cancelBooking(Booking._id)}
                              className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 bg-red-500 text-white rounded-md sm:rounded-lg hover:bg-red-600 transition-colors text-xs sm:text-sm"
                            >
                              <FiX className="text-xs sm:text-sm md:text-base" />
                              <span>ยกเลิกการจอง</span>
                            </button>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Slip Image Modal */}
      {showSlipModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-full w-full sm:max-w-2xl p-4 sm:p-6 relative">
            <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-900">สลิปการชำระเงิน</h3>
            <div className="max-h-[70vh] sm:max-h-[80vh] overflow-y-auto">
              {currentSlipImage ? (
                <img 
                  src={currentSlipImage} 
                  alt="Payment Slip" 
                  className="w-full h-auto object-contain rounded-md border border-gray-200" 
                />
              ) : (
                <p className="text-gray-600 text-center py-4">ไม่พบรูปภาพสลิป.</p>
              )}
            </div>
            <button
              onClick={closeSlipModal}
              className="absolute top-2 right-2 sm:top-3 sm:right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="Close modal"
            >
              <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <button
              onClick={closeSlipModal}
              className="mt-4 sm:mt-6 w-full bg-blue-600 text-white py-2 sm:py-3 rounded-md sm:rounded-lg hover:bg-blue-700 transition-colors duration-300 font-medium sm:font-semibold text-sm sm:text-base"
            >
              ปิด
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingDetail;