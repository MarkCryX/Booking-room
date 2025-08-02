"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  FiSearch,
  FiCalendar,
  FiX,
  FiDollarSign,
  FiUser,
  FiHome,
  FiUsers,
  FiCheckCircle,
  FiClock,
  FiMail,
} from "react-icons/fi";

function SuccessBooking() {
  const [booking, setBooking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateSearch, setDateSearch] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // Display 9 orders per page

  const fetchBooking = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/booking`
      );
      const data = await response.json();
      if (response.ok) {
        const filteredBookings = data.bookings.filter(
          (booking) => booking.isOrder === true
        );
        setBooking(filteredBookings);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError("เกิดข้อผิดพลาดในการดึงข้อมูลห้อง");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleDateSearch = (event) => {
    setDateSearch(event.target.value);
    setCurrentPage(1); // Reset to first page on date search
  };

  const openImageModal = (imageBase64) => {
    setSelectedImage(imageBase64);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  useEffect(() => {
    fetchBooking();
  }, []);

  const filteredBookings = booking.filter((booking) => {
    const nameMatch = booking.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const dateMatch = dateSearch
      ? new Date(booking.checkInDate).toLocaleDateString("en-CA") ===
          dateSearch ||
        new Date(booking.checkOutDate).toLocaleDateString("en-CA") ===
          dateSearch
      : true;
    return nameMatch && dateMatch;
  });

  const clearDateSearch = () => {
    setDateSearch("");
    setCurrentPage(1); // Reset to first page when clearing date
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBookings = filteredBookings.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      {error && <p className="text-red-500 text-center">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="ค้นหาตามชื่อ"
            className="pl-10 pr-4 py-3 border rounded-lg w-full focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiCalendar className="text-gray-400" />
          </div>
          <input
            type="date"
            value={dateSearch}
            onChange={handleDateSearch}
            className="pl-10 pr-4 py-3 border rounded-lg w-full focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
          {dateSearch && (
            <button
              onClick={clearDateSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <FiX className="text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-gray-400 mb-4">
            <FiX className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            ไม่พบข้อมูลการจอง
          </h3>
          <p className="text-gray-500">
            ไม่มีออเดอร์ที่สำเร็จตามเงื่อนไขการค้นหาของคุณ
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentBookings.map((Booking) => (
              <div
                key={Booking._id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100"
              >
                <div className="bg-green-50 p-4 border-b">
                  <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                    <FiUser className="mr-2 text-green-600" />
                    {Booking.name}
                  </h3>
                </div>

                <div className="p-5">
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <FiMail className="mr-2 text-green-500" />
                      <span>{Booking.email}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FiHome className="mr-2 text-green-500" />
                      <span>{Booking.roomName}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FiUsers className="mr-2 text-green-500" />
                      <span>
                        ผู้ใหญ่: {Booking.numAdults} คน | เด็ก:{" "}
                        {Booking.numChildren} คน
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FiCalendar className="mr-2 text-green-500" />
                      <span>
                        เช็คอิน:{" "}
                        {new Date(Booking.checkInDate).toLocaleDateString(
                          "th-TH",
                          { day: "numeric", month: "long", year: "numeric" }
                        )}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FiCalendar className="mr-2 text-green-500" />
                      <span>
                        เช็คเอาท์:{" "}
                        {new Date(Booking.checkOutDate).toLocaleDateString(
                          "th-TH",
                          { day: "numeric", month: "long", year: "numeric" }
                        )}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <FiDollarSign className="mr-2 text-green-500" />
                      <span className="font-medium">
                        ราคารวม: {Booking.totalPrice.toLocaleString()} บาท
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        Booking.status === "รอยืนยัน"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {Booking.status === "รอยืนยัน" ? (
                        <FiClock className="mr-1" />
                      ) : (
                        <FiCheckCircle className="mr-1" />
                      )}
                      {Booking.status}
                    </div>
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium">
                      <FiClock className="mr-1 text-gray-500" />
                      {new Date(Booking.createdAt).toLocaleDateString("th-TH", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}{" "}
                      เวลา{" "}
                      {new Date(Booking.createdAt).toLocaleTimeString("th-TH", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                        Booking.paymentStatus === "ยังไม่ชำระ"
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {Booking.paymentStatus === "ยังไม่ชำระ"
                        ? "ยังไม่ชำระ"
                        : Booking.paymentStatus}
                    </div>
                  </div>

                  {Booking.imagepayment && (
                    <div className="mt-5">
                      <button
                        onClick={() => openImageModal(Booking.imagepayment)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center transition-colors"
                      >
                        <FiDollarSign className="mr-2" />
                        ดูสลิปการโอน
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ก่อนหน้า
              </button>
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => paginate(index + 1)}
                  className={`px-4 py-2 rounded-lg ${
                    currentPage === index + 1
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ถัดไป
              </button>
            </div>
          )}
        </>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 flex justify-between items-center border-b bg-gray-50">
              <h3 className="text-xl font-semibold flex items-center">
                <FiDollarSign className="mr-2 text-green-600" />
                สลิปการโอนเงิน
              </h3>
              <button
                onClick={closeImageModal}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4 flex justify-center bg-gray-100">
              <Image
                src={`${selectedImage}`}
                alt="Payment Slip"
                width={500}
                height={700}
                className="object-contain rounded-lg shadow-md"
              />
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <button
                onClick={closeImageModal}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center"
              >
                <FiX className="mr-2" />
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default SuccessBooking;
