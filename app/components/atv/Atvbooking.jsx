"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import DatePicker from "react-datepicker";
import { useUser } from "@auth0/nextjs-auth0/client";
import "react-datepicker/dist/react-datepicker.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/thumbs";
import { useRouter } from "next/navigation";

function DetailAtv() {
  const [atvData, setAtvData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // ฟิลด์ฟอร์มการจอง
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedRound, setSelectedRound] = useState("");
  const [numSmallATV, setNumSmallATV] = useState(0); // ตั้งค่าเริ่มต้นเป็น 0
  const [numLargeATV, setNumLargeATV] = useState(0); // ตั้งค่าเริ่มต้นเป็น 0
  const { user } = useUser();
  const [loadingBooking, setLoadingBooking] = useState(false);

  // ข้อมูลการจองที่ "ยังไม่ได้รับการสั่งซื้อ" ทั้งหมด
  const [allPendingBookings, setAllPendingBookings] = useState([]);

  // สำหรับ thumbnail swiper
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  // --- Fetch Data ---
  useEffect(() => {
    const fetchATVs = async () => {
      try {
        const response = await fetch("/api/atvs");
        if (!response.ok) {
          throw new Error("Failed to fetch ATV data");
        }
        const data = await response.json();
        // เนื่องจากเราต้องการข้อมูล ATV ชิ้นเดียว (ตัวหลัก)
        // อาจจะต้องกำหนด ID หรือเลือกตัวแรก ถ้ามี ATV หลายตัว
        // ในที่นี้สมมติว่าดึงมาแล้วได้ atvData ตัวเดียวตามที่คาดหวัง
        setAtvData(data.atvData[0]);
      } catch (error) {
        setError("Error fetching ATV data: " + error.message);
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    const fetchPendingBookings = async () => {
      try {
        const response = await fetch("/api/atvbooking"); // ดึงข้อมูลการจองทั้งหมด
        if (!response.ok) {
          throw new Error("Failed to fetch ATV booking data");
        }
        const data = await response.json();
        // กรองเฉพาะการจองที่ isOrder เป็น false (ยังไม่ได้รับการยืนยัน/ดำเนินการ)
        const filteredBookings = data.atvbooking.filter(
          (booking) => !booking.isOrder
        );
        setAllPendingBookings(filteredBookings);
      } catch (error) {
        console.error("Error fetching ATV booking data:", error);
        // ไม่ต้องตั้ง error เพราะอาจไม่ใช่ blocking issue สำหรับหน้าจอ
      }
    };

    fetchATVs();
    fetchPendingBookings();
  }, []);

  // --- Utility Functions ---

  // ฟังก์ชันคำนวณจำนวน ATV ที่ถูกจองไปแล้วในรอบและวันที่เลือก
  const getBookedATVCounts = () => {
    if (!selectedDate || !selectedRound || !allPendingBookings) {
      return { bookedSmall: 0, bookedLarge: 0, bookedTotal: 0 };
    }

    // *** แก้ไข: ใช้ toLocaleDateString เพื่อให้ได้วันที่แบบ YYYY-MM-DD ที่ไม่ขึ้นกับ Time Zone
    const formattedSelectedDate = selectedDate.toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' });

    let bookedSmall = 0;
    let bookedLarge = 0;

    allPendingBookings.forEach(booking => {
      // *** แก้ไข: ใช้ toLocaleDateString เพื่อให้ได้วันที่แบบ YYYY-MM-DD ที่ไม่ขึ้นกับ Time Zone
      const bookingDate = new Date(booking.selectedDate).toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' });
      if (bookingDate === formattedSelectedDate && booking.selectedRound === selectedRound) {
        bookedSmall += booking.numSmallATV || 0;
        bookedLarge += booking.numLargeATV || 0;
      }
    });

    return { bookedSmall, bookedLarge, bookedTotal: bookedSmall + bookedLarge };
  };

  const { bookedSmall, bookedLarge, bookedTotal } = getBookedATVCounts();

  // คำนวณจำนวน ATV ที่เหลือ
  const availableSmallATV = atvData ? Math.max(0, atvData.numATVSmall - bookedSmall) : 0;
  const availableLargeATV = atvData ? Math.max(0, atvData.numATVLarge - bookedLarge) : 0;
  const availableTotalPerRound = atvData ? Math.max(0, atvData.numATVPerRound - bookedTotal) : 0;

  // ตรวจสอบว่ารอบนั้นเต็มหรือไม่
  const isRoundFull = (roundTime) => {
    if (!selectedDate || !atvData) return false;

    // *** แก้ไข: ใช้ toLocaleDateString เพื่อให้ได้วันที่แบบ YYYY-MM-DD ที่ไม่ขึ้นกับ Time Zone
    const formattedSelectedDate = selectedDate.toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' });
    let currentRoundBookings = 0;

    allPendingBookings.forEach(booking => {
      const bookingDate = new Date(booking.selectedDate).toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' });
      if (bookingDate === formattedSelectedDate && booking.selectedRound === roundTime) {
        currentRoundBookings += (booking.numSmallATV || 0) + (booking.numLargeATV || 0);
      }
    });

    return currentRoundBookings >= atvData.numATVPerRound;
  };

  // คำนวณราคารวม
  const calculateTotalPrice = () => {
    const total = (numSmallATV || 0) * atvData.priceSmall + (numLargeATV || 0) * atvData.priceLarge;
    return total;
  };

  // --- Render Loading/Error States ---
  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center text-lg">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex justify-center items-center text-lg text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (!atvData) {
    return (
      <div className="h-screen flex justify-center items-center text-lg text-red-500">
        <p>No ATV data available. Please check the API response or add ATV data from Admin panel.</p>
      </div>
    );
  }

  // --- Booking Handler ---
  const handleBooking = async (e) => {
    e.preventDefault();
    setLoadingBooking(true);

    // ตรวจสอบเงื่อนไขการจองก่อนส่งข้อมูล
    const totalRequestedATV = (numSmallATV || 0) + (numLargeATV || 0);
    if (totalRequestedATV === 0) {
      alert("กรุณาเลือกจำนวนรถ ATV อย่างน้อย 1 คัน");
      setLoadingBooking(false);
      return;
    }
    if (phone.length !== 10) {
      alert("กรุณากรอกเบอร์โทรศัพท์ให้ครบ 10 หลัก");
      setLoadingBooking(false);
      return;
    }
    if (!selectedDate || !selectedRound) {
      alert("กรุณาเลือกวันที่และรอบเวลา");
      setLoadingBooking(false);
      return;
    }

    // ตรวจสอบจำนวนที่เหลืออีกครั้งก่อนจอง (Double check)
    const { bookedSmall: currentBookedSmall, bookedLarge: currentBookedLarge, bookedTotal: currentBookedTotal } = getBookedATVCounts();
    const currentAvailableSmall = atvData.numATVSmall - currentBookedSmall;
    const currentAvailableLarge = atvData.numATVLarge - currentBookedLarge;
    const currentAvailableTotalPerRound = atvData.numATVPerRound - currentBookedTotal;

    if ((numSmallATV || 0) > currentAvailableSmall) {
      alert(`จำนวน ATV คันเล็กที่ขอเกินจำนวนที่มีอยู่ (${currentAvailableSmall} คัน)`);
      setLoadingBooking(false);
      return;
    }
    if ((numLargeATV || 0) > currentAvailableLarge) {
      alert(`จำนวน ATV คันใหญ่ที่ขอเกินจำนวนที่มีอยู่ (${currentAvailableLarge} คัน)`);
      setLoadingBooking(false);
      return;
    }
    if (totalRequestedATV > currentAvailableTotalPerRound) {
      alert(`จำนวน ATV ที่ขอรวมกันเกินจำนวนที่ว่างในรอบนี้ (${currentAvailableTotalPerRound} คัน)`);
      setLoadingBooking(false);
      return;
    }

    const bookingPayload = {
      emailuser: user?.email,
      name,
      phone,
      // *** แก้ไข: ส่งวันที่เป็น YYYY-MM-DD เพื่อหลีกเลี่ยงปัญหา Time Zone
      selectedDate: selectedDate.toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }),
      selectedRound,
      numSmallATV: numSmallATV || 0,
      numLargeATV: numLargeATV || 0,
      totalPrice: calculateTotalPrice(),
      atvId: atvData._id, // เพิ่ม atvId เข้าไปในการจอง เพื่อใช้อ้างอิง
    };

    try {
      const response = await fetch("/api/atvbooking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingPayload),
      });

      const data = await response.json();

      if (response.ok) {
        alert("จองสำเร็จ!");
        setName("");
        setPhone("");
        setSelectedDate(null);
        setSelectedRound("");
        setNumSmallATV(0);
        setNumLargeATV(0);
        // รีเฟรชข้อมูลการจองเพื่อให้แสดงจำนวนที่เหลือที่ถูกต้องทันที
        const updatedBookingsResponse = await fetch("/api/atvbooking");
        if (updatedBookingsResponse.ok) {
          const updatedBookingsData = await updatedBookingsResponse.json();
          setAllPendingBookings(updatedBookingsData.atvbooking.filter(b => !b.isOrder));
        }
        router.push("/user"); // หรือเปลี่ยนเส้นทางไปหน้าอื่น
      } else {
        alert(`เกิดข้อผิดพลาด: ${data.error}`);
      }
    } catch (error) {
      console.error("Booking failed:", error);
      alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ หรือเกิดข้อผิดพลาดในการจอง");
    } finally {
      setLoadingBooking(false);
    }
  };

  return (
    <div className="h-auto">
      {/* Hero Section */}
      <div className="w-full h-[45rem] overflow-hidden relative">
        <Image
          src={atvData.images[0]}
          alt="ATV"
          fill
          style={{ objectFit: "cover", objectPosition: "center" }}
        />
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <div className="absolute inset-0 flex justify-center items-center text-white text-6xl font-bold">
          <h1>ATV Booking</h1>
        </div>
      </div>

      {/* Content */}
      <div className="h-full p-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ซ้าย: รูปภาพและ Swiper */}
          <div>
            {/* Swiper หลักสำหรับแสดงรูปภาพใหญ่ */}
            <Swiper
              spaceBetween={10}
              navigation={true}
              pagination={{ clickable: true }}
              thumbs={{ swiper: thumbsSwiper }}
              modules={[Navigation, Pagination, Thumbs]}
              className="mainSwiper"
            >
              {atvData.images.map((image, index) => (
                <SwiperSlide key={index}>
                  <div className="relative w-full h-[30rem] rounded-lg shadow-md cursor-pointer">
                    <Image
                      src={image}
                      alt={`ATV Image ${index + 1}`}
                      fill
                      style={{ objectFit: "contain" }}
                      sizes="100vw"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Thumbnail Swiper */}
            <Swiper
              onSwiper={setThumbsSwiper}
              spaceBetween={10}
              slidesPerView={4}
              freeMode={true}
              watchSlidesProgress={true}
              modules={[Thumbs]}
              className="thumbsSwiper mt-4"
            >
              {atvData.images.map((image, index) => (
                <SwiperSlide key={index}>
                  <div className="relative w-full h-32 rounded-lg cursor-pointer">
                    <Image
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      style={{ objectFit: "cover" }}
                      sizes="100vw"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* ข้อมูลรายละเอียด ATV */}
            <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-xl font-bold mb-4">รายละเอียด ATV</h3>
              <p className="text-lg text-gray-700 mb-2">
                **ราคาคันเล็ก:** {atvData.priceSmall.toLocaleString()} บาท
              </p>
              <p className="text-lg text-gray-700 mb-2">
                **ราคาคันใหญ่:** {atvData.priceLarge.toLocaleString()} บาท
              </p>
              <p className="text-lg text-gray-700 mb-2">
                **จำนวน ATV คันเล็กทั้งหมด:** {atvData.numATVSmall} คัน
              </p>
              <p className="text-lg text-gray-700 mb-2">
                **จำนวน ATV คันใหญ่ทั้งหมด:** {atvData.numATVLarge} คัน
              </p>
              <p className="text-lg text-gray-700 mb-2">
                **จำนวน ATV สูงสุดที่จองได้ต่อรอบ:** {atvData.numATVPerRound} คัน
              </p>
              <p className="text-gray-600 mt-4">
                **รายละเอียดเพิ่มเติม:** {atvData.description}
              </p>
            </div>
          </div>

          {/* ขวา: ฟอร์มจอง */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-center">แบบฟอร์มจอง</h2>
            <form onSubmit={handleBooking} className="space-y-4">
              <div>
                <p className="mb-2">เลือกวันจอง</p>
                <DatePicker
                  selected={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  minDate={new Date()}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="เลือกวันที่จอง"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <p className="mb-2">เลือกรอบเวลา</p>
                <select
                  value={selectedRound}
                  onChange={(e) => setSelectedRound(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">เลือกรอบเวลา</option>
                  {atvData.roundTimes.map((time, index) => {
                    const isFull = isRoundFull(time);
                    const isSelectedRound = selectedRound === time;

                    let roundAvailableText = "";
                    if (selectedDate && isSelectedRound) {
                      roundAvailableText = ` (เหลือ ${availableTotalPerRound} คัน)`;
                    } else if (isFull) {
                      roundAvailableText = " (เต็ม)";
                    }

                    return (
                      <option
                        key={index}
                        value={time}
                        disabled={isFull}
                        className={isFull ? "text-red-500 italic" : ""}
                      >
                        {time}{roundAvailableText}
                      </option>
                    );
                  })}
                </select>
                {selectedDate && selectedRound && (
                  <div className="mt-2 text-sm text-gray-600">
                    <p>ATV คันเล็กที่ว่าง: {availableSmallATV} คัน</p>
                    <p>ATV คันใหญ่ที่ว่าง: {availableLargeATV} คัน</p>
                    <p>ATV รวมที่ว่างในรอบนี้: {availableTotalPerRound} คัน</p>
                  </div>
                )}
              </div>

              <input
                type="text"
                placeholder="ชื่อ-นามสกุล"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />

              <input
                type="tel" // เปลี่ยนเป็น tel เพื่อรองรับเบอร์โทร
                placeholder="เบอร์โทรศัพท์ (10 หลัก)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                maxLength={10}
                pattern="[0-9]{10}" // เพิ่ม pattern เพื่อบังคับตัวเลข 10 หลัก
                title="กรุณากรอกเบอร์โทรศัพท์ 10 หลัก"
              />

              {/* จำนวนรถ ATV คันเล็ก */}
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-md border border-gray-200">
                <label htmlFor="smallATV" className="text-gray-700 font-medium">
                  จำนวนรถ ATV คันเล็ก
                </label>
                <input
                  type="number"
                  id="smallATV"
                  value={numSmallATV}
                  onChange={(e) => setNumSmallATV(Number(e.target.value))}
                  min="0"
                  max={selectedDate && selectedRound ? availableSmallATV : atvData.numATVSmall} // จำกัด max ตามที่เหลือ
                  className="w-24 p-2 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* จำนวนรถ ATV คันใหญ่ */}
              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-md border border-gray-200">
                <label htmlFor="largeATV" className="text-gray-700 font-medium">
                  จำนวนรถ ATV คันใหญ่
                </label>
                <input
                  type="number"
                  id="largeATV"
                  value={numLargeATV}
                  onChange={(e) => setNumLargeATV(Number(e.target.value))}
                  min="0"
                  max={selectedDate && selectedRound ? availableLargeATV : atvData.numATVLarge} // จำกัด max ตามที่เหลือ
                  className="w-24 p-2 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mt-4 text-right">
                <p className="font-bold text-2xl text-green-700">
                  ราคารวม {calculateTotalPrice().toLocaleString()} บาท
                </p>
              </div>

              <button
                type="submit"
                disabled={loadingBooking || !selectedDate || !selectedRound || isRoundFull(selectedRound) || ((numSmallATV + numLargeATV) > availableTotalPerRound)} // ปิดปุ่มถ้าเต็ม
                className={`w-full py-3 rounded-md mt-4 text-white font-semibold ${
                  loadingBooking || !selectedDate || !selectedRound || isRoundFull(selectedRound) || ((numSmallATV + numLargeATV) > availableTotalPerRound)
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                }`}
              >
                {loadingBooking ? "กำลังจอง..." : isRoundFull(selectedRound) ? "รอบนี้เต็มแล้ว" : "ยืนยันการจอง"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailAtv;