"use client";
import Sidebar from "@/app/components/Sidebar"; // Assuming Sidebar component exists
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  format,
  parseISO,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  addDays,
  addMonths,
  addYears,
  isValid,
} from "date-fns";
import {
  FiTrendingUp,
  FiDollarSign,
  FiCalendar,
  FiAward,
  FiBarChart2,
  FiUsers,
  FiClock,
  FiFilter,
  FiPieChart,
  FiAlertCircle,
  FiLoader,
  FiActivity,
  FiThumbsUp,
} from "react-icons/fi";

const DashBoard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("all");
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [dashboardData, setDashboardData] = useState({
    roomBookings: [],
    atvBookings: [],
    allRoomBookings: [],
    allAtvBookings: [],
  });

  const COLORS = [
    "#4F46E5",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#0EA5E9",
    "#EAB308",
    "#8B5CF6",
    "#EC4899",
    "#6EE7B7",
    "#FACC15",
  ];

  const filterData = (data, dateKey = "createdAt") => {
    if (!Array.isArray(data)) return [];
    if (timeRange === "all") return data;

    let startDate, endDate;
    const validSelectedDate = isValid(selectedDate) ? selectedDate : new Date();

    switch (timeRange) {
      case "day":
        startDate = startOfDay(validSelectedDate);
        endDate = endOfDay(validSelectedDate);
        break;
      case "month":
        startDate = startOfMonth(validSelectedDate);
        endDate = endOfMonth(validSelectedDate);
        break;
      case "year":
        startDate = startOfYear(validSelectedDate);
        endDate = endOfYear(validSelectedDate);
        break;
      default:
        return data;
    }

    return data.filter((item) => {
      if (!item || !item[dateKey]) return false;
      const itemDate = parseISO(item[dateKey]);
      return isValid(itemDate) && itemDate >= startDate && itemDate <= endDate;
    });
  };

  const aggregateData = (inputData, dateKey, range) => {
    if (!Array.isArray(inputData) || inputData.length === 0) return [];
    const aggregated = {};

    inputData.forEach((item) => {
      if (!item || !item[dateKey]) return;
      const itemDate = parseISO(item[dateKey]);
      if (!isValid(itemDate)) return;

      let key;
      switch (range) {
        case "day":
          key = format(itemDate, "yyyy-MM-dd");
          break;
        case "month":
          key = format(itemDate, "yyyy-MM-dd");
          break;
        case "year":
          key = format(itemDate, "yyyy-MM");
          break;
        default: // "all"
          key = format(itemDate, "yyyy-MM-dd");
          break;
      }

      if (!aggregated[key]) {
        aggregated[key] = { date: key, totalPrice: 0, count: 0 };
      }
      aggregated[key].totalPrice += item.totalPrice || 0;
      aggregated[key].count += 1;
    });

    const sortedData = Object.values(aggregated).sort((a, b) => {
      const dateA =
        range === "year" ? parseISO(a.date + "-01") : parseISO(a.date);
      const dateB =
        range === "year" ? parseISO(b.date + "-01") : parseISO(b.date);
      if (!isValid(dateA) || !isValid(dateB)) return 0;
      return dateA - dateB;
    });

    const filledData = [];
    if (sortedData.length > 0) {
      let loopStartDate, loopEndDate;
      const validSelectedDate = isValid(selectedDate)
        ? selectedDate
        : new Date();
      const firstDataEntryDateStr = sortedData[0].date;
      const lastDataEntryDateStr = sortedData[sortedData.length - 1].date;
      const firstDataDate =
        range === "year"
          ? parseISO(firstDataEntryDateStr + "-01")
          : parseISO(firstDataEntryDateStr);
      const lastDataDate =
        range === "year"
          ? endOfMonth(parseISO(lastDataEntryDateStr + "-01"))
          : parseISO(lastDataEntryDateStr);

      if (range === "day") {
        loopStartDate = startOfDay(validSelectedDate);
        loopEndDate = endOfDay(validSelectedDate);
      } else if (range === "month") {
        loopStartDate = startOfMonth(validSelectedDate);
        loopEndDate = endOfMonth(validSelectedDate);
      } else if (range === "year") {
        loopStartDate = startOfYear(validSelectedDate);
        loopEndDate = endOfYear(validSelectedDate);
      } else {
        // "all"
        loopStartDate = isValid(firstDataDate)
          ? firstDataDate
          : startOfDay(new Date());
        loopEndDate = isValid(lastDataDate)
          ? lastDataDate
          : endOfDay(new Date());
      }

      if (range !== "all") {
        if (isValid(firstDataDate) && firstDataDate > loopStartDate)
          loopStartDate = firstDataDate;
        if (isValid(lastDataDate) && lastDataDate < loopEndDate)
          loopEndDate = lastDataDate;
      }

      let currentDate = loopStartDate;
      let dataIndex = 0;
      while (currentDate <= loopEndDate) {
        let formattedKey;
        if (range === "year") {
          formattedKey = format(currentDate, "yyyy-MM");
        } else {
          formattedKey = format(currentDate, "yyyy-MM-dd");
        }

        if (
          dataIndex < sortedData.length &&
          sortedData[dataIndex].date === formattedKey
        ) {
          filledData.push(sortedData[dataIndex]);
          dataIndex++;
        } else {
          filledData.push({ date: formattedKey, totalPrice: 0, count: 0 });
        }

        if (range === "year") {
          currentDate = addMonths(currentDate, 1);
        } else {
          currentDate = addDays(currentDate, 1);
        }
        if (filledData.length > 7000 && range === "all") break; // Safety break for very large 'all' datasets (approx 19 years of daily data)
      }
    }
    return filledData;
  };

  const fetchBooking = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/booking`
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const filteredBookings = (data.bookings || []).filter(
        (booking) => booking.isOrder === true
      );
      setDashboardData((prev) => ({
        ...prev,
        roomBookings: filteredBookings,
        allRoomBookings: filteredBookings,
      }));
    } catch (error) {
      console.error("Fetch room bookings error:", error);
      setError(`เกิดข้อผิดพลาดในการดึงข้อมูลห้อง: ${error.message}`);
    }
  };

  const fetchATVbooking = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/atvbooking`
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const filteredATV = (data.atvbooking || []).filter(
        (booking) => booking.isOrder === true
      );
      setDashboardData((prev) => ({
        ...prev,
        atvBookings: filteredATV,
        allAtvBookings: filteredATV,
      }));
    } catch (error) {
      console.error("Fetch ATV bookings error:", error);
      setError(`เกิดข้อผิดพลาดในการดึงข้อมูลATV: ${error.message}`);
    }
  };

  useEffect(() => {
    setDashboardData((prev) => ({
      ...prev,
      roomBookings: filterData(prev.allRoomBookings, "createdAt"),
      atvBookings: filterData(prev.allAtvBookings, "selectedDate"),
    }));
  }, [
    timeRange,
    selectedDate,
    dashboardData.allRoomBookings,
    dashboardData.allAtvBookings,
  ]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([fetchBooking(), fetchATVbooking()]);
      } catch (err) {
        console.error("Overall fetch error:", err);
        setError(err.message || "เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalpriceroom = dashboardData.roomBookings.reduce(
    (acc, item) => acc + (item.totalPrice || 0),
    0
  );
  const ChartDataBooking = aggregateData(
    dashboardData.roomBookings,
    "createdAt",
    timeRange
  );
  const totalRoomOrders = dashboardData.roomBookings.length;

  const calculateMostBookedRoom = () => {
    if (dashboardData.roomBookings.length === 0) return "N/A";
    const roomCounts = dashboardData.roomBookings.reduce((acc, booking) => {
      if (booking.roomName) {
        acc[booking.roomName] = (acc[booking.roomName] || 0) + 1;
      }
      return acc;
    }, {});
    if (Object.keys(roomCounts).length === 0) return "N/A";
    const mostBooked = Object.entries(roomCounts).reduce(
      (max, [room, count]) => (count > max.count ? { room, count } : max),
      { room: "", count: 0 }
    );
    return mostBooked.room || "N/A";
  };
  const mostBookedRoomName = calculateMostBookedRoom();

  const calculateAverageStayDuration = () => {
    if (dashboardData.roomBookings.length === 0) return 0;
    const totalNights = dashboardData.roomBookings.reduce((acc, booking) => {
      if (!booking.checkInDate || !booking.checkOutDate) return acc;
      const checkIn = parseISO(booking.checkInDate);
      const checkOut = parseISO(booking.checkOutDate);
      if (!isValid(checkIn) || !isValid(checkOut)) return acc;
      const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return acc + diffDays;
    }, 0);
    if (dashboardData.roomBookings.length === 0) return 0; // Should not be reachable if first check passes
    const average = totalNights / dashboardData.roomBookings.length;
    return Math.round(average);
  };

  const totalpriceatv = dashboardData.atvBookings.reduce(
    (acc, item) => acc + (item.totalPrice || 0),
    0
  );
  const ChartDataATV = aggregateData(
    dashboardData.atvBookings,
    "selectedDate",
    timeRange
  );
  const totalAtvOrders = dashboardData.atvBookings.length;
  const atvsmall = dashboardData.atvBookings.reduce(
    (acc, item) => acc + (item.numSmallATV || 0),
    0
  );
  const atvlarge = dashboardData.atvBookings.reduce(
    (acc, item) => acc + (item.numLargeATV || 0),
    0
  );

  const findPopularTimeSlot = () => {
    if (dashboardData.atvBookings.length === 0) return "N/A";
    const timeSlots = dashboardData.atvBookings.reduce((acc, booking) => {
      if (booking.selectedRound) {
        acc[booking.selectedRound] = (acc[booking.selectedRound] || 0) + 1;
      }
      return acc;
    }, {});
    if (Object.keys(timeSlots).length === 0) return "N/A";
    const popularSlot = Object.entries(timeSlots).reduce(
      (max, [time, count]) => (count > max.count ? { time, count } : max),
      { time: "", count: 0 }
    );
    return popularSlot.time || "N/A";
  };

  const calculateAverageGroupSize = () => {
    if (dashboardData.atvBookings.length === 0) return 0;
    const totalPeople = dashboardData.atvBookings.reduce((acc, booking) => {
      return (
        acc + (booking.numSmallATV || 0) * 1 + (booking.numLargeATV || 0) * 2
      );
    }, 0);
    if (dashboardData.atvBookings.length === 0) return 0;
    return Math.round(totalPeople / dashboardData.atvBookings.length);
  };

  const calculateRoomTypeDistribution = () => {
    if (dashboardData.roomBookings.length === 0)
      return [{ name: "ไม่มีข้อมูล", value: 1 }];
    const roomTypes = dashboardData.roomBookings.reduce((acc, booking) => {
      if (booking.roomName) {
        acc[booking.roomName] = (acc[booking.roomName] || 0) + 1;
      }
      return acc;
    }, {});

    if (Object.keys(roomTypes).length === 0)
      return [{ name: "ไม่มีข้อมูล", value: 1 }];

    let data = Object.entries(roomTypes).map(([name, value]) => ({
      name,
      value,
    }));
    data.sort((a, b) => b.value - a.value);
    const MAX_PIE_SLICES = 6;
    if (data.length > MAX_PIE_SLICES) {
      const topSlices = data.slice(0, MAX_PIE_SLICES - 1);
      const otherValue = data
        .slice(MAX_PIE_SLICES - 1)
        .reduce((sum, item) => sum + item.value, 0);
      data = [...topSlices, { name: "อื่นๆ", value: otherValue }];
    }
    return data;
  };

  const calculateATVTypeDistribution = () => {
    if (totalAtvOrders === 0) return [{ name: "ไม่มีข้อมูล", value: 1 }];
    const data = [];
    if (atvsmall > 0)
      data.push({ name: `ATV เล็ก (${atvsmall} คัน)`, value: atvsmall });
    if (atvlarge > 0)
      data.push({ name: `ATV ใหญ่ (${atvlarge} คัน)`, value: atvlarge });
    if (data.length === 0) return [{ name: "ไม่มีข้อมูล ATV", value: 1 }]; // More specific message
    return data;
  };

  const combinedTotalSales = totalpriceroom + totalpriceatv;
  const totalOrders = totalRoomOrders + totalAtvOrders;

  const getDateRangeText = () => {
    const validSelectedDate = isValid(selectedDate) ? selectedDate : new Date();
    switch (timeRange) {
      case "day":
        return format(validSelectedDate, "d MMMM yy"); // Added yy for clarity
      case "month":
        return format(validSelectedDate, "MMMM yyyy"); // Added yyyy
      case "year":
        return format(validSelectedDate, "yyyy");
      default:
        return "ทั้งหมด (ข้อมูลรายวัน)";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col md:flex-row">
      <Sidebar />
      <div className="flex-1 p-4 md:p-8 md:ml-6">
        {loading ? (
          <div className="flex justify-center items-center h-screen">
            <FiLoader className="animate-spin text-blue-500 text-5xl" />
            <p className="ml-3 text-xl text-gray-700">กำลังโหลดข้อมูล...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-md max-w-lg mx-auto flex items-center space-x-3">
            <FiAlertCircle className="text-red-500 text-3xl" />
            <div>
              <p className="font-bold text-xl">เกิดข้อผิดพลาด!</p>
              <p className="text-base mt-1">{error}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
                ภาพรวม Dashboard
              </h1>
              <p className="text-gray-600 text-lg">
                ข้อมูลสรุปการจองห้องพักและกิจกรรม ATV
              </p>
              <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center bg-white rounded-xl shadow-sm border border-gray-200 p-3">
                  <FiFilter className="text-gray-500 mr-3 text-xl" />
                  <select
                    className="bg-transparent border-none outline-none text-gray-700 text-base font-medium appearance-none cursor-pointer"
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                  >
                    <option value="all">ทั้งหมด</option>
                    <option value="day">รายวัน</option>
                    <option value="month">รายเดือน</option>
                    <option value="year">รายปี</option>
                  </select>
                </div>
                {timeRange !== "all" && (
                  <div className="flex items-center bg-white rounded-xl shadow-sm border border-gray-200 p-3">
                    <FiCalendar className="text-gray-500 mr-3 text-xl" />
                    <input
                      type={
                        timeRange === "day"
                          ? "date"
                          : timeRange === "month"
                          ? "month"
                          : "number"
                      }
                      placeholder={timeRange === "year" ? "YYYY" : ""}
                      className="bg-transparent border-none outline-none text-gray-700 text-base font-medium cursor-pointer w-auto" // Ensure width is appropriate
                      value={
                        isValid(selectedDate)
                          ? timeRange === "day"
                            ? format(selectedDate, "yyyy-MM-dd")
                            : timeRange === "month"
                            ? format(selectedDate, "yyyy-MM")
                            : format(selectedDate, "yyyy")
                          : ""
                      }
                      onChange={(e) => {
                        let dateToSet;
                        const val = e.target.value;
                        if (timeRange === "year") {
                          if (
                            val.length === 4 &&
                            !isNaN(parseInt(val)) &&
                            parseInt(val) >= 1900 &&
                            parseInt(val) <= 2100
                          ) {
                            // Basic year validation
                            dateToSet = new Date(parseInt(val), 0, 1); // Jan 1st of the year
                          } else if (val === "") {
                            dateToSet = new Date(
                              new Date().getFullYear(),
                              0,
                              1
                            );
                          } else {
                            return;
                          }
                        } else {
                          dateToSet = parseISO(val);
                        }
                        if (isValid(dateToSet)) {
                          setSelectedDate(dateToSet);
                        } else {
                          console.warn("Invalid date selected:", val);
                        }
                      }}
                      min={timeRange === "year" ? "1900" : undefined}
                      max={
                        timeRange === "year"
                          ? "2100" // Allow future years for planning
                          : timeRange === "date" && isValid(selectedDate)
                          ? format(new Date(), "yyyy-MM-dd")
                          : undefined
                      }
                    />
                  </div>
                )}
                <div className="text-gray-600 text-base sm:text-lg font-medium">
                  กำลังแสดงข้อมูล:{" "}
                  <span className="font-semibold text-gray-800">
                    {getDateRangeText()}
                  </span>
                </div>
              </div>
            </div>

            {/* Overall Summary Section */}
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <div className="w-2 h-8 bg-purple-500 rounded-full mr-3"></div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  สรุปภาพรวมธุรกิจ
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
                <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300 border border-purple-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 font-medium text-sm sm:text-base">
                        ยอดขายรวมทั้งหมด
                      </p>
                      <h3 className="text-2xl sm:text-3xl font-bold mt-2 text-gray-800">
                        {combinedTotalSales.toLocaleString()} ฿
                      </h3>
                    </div>
                    <div className="p-4 rounded-full bg-purple-100 text-purple-600 shadow-md">
                      <FiDollarSign size={32} />
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-gray-500">
                    จากยอดจองทั้งหมด {totalOrders} รายการ
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300 border border-indigo-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 font-medium text-sm sm:text-base">
                        จำนวนการจองทั้งหมด
                      </p>
                      <h3 className="text-2xl sm:text-3xl font-bold mt-2 text-gray-800">
                        {totalOrders.toLocaleString()}
                      </h3>
                      <span className="text-sm text-gray-500">รายการ</span>
                    </div>
                    <div className="p-4 rounded-full bg-indigo-100 text-indigo-600 shadow-md">
                      <FiCalendar size={32} />
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-gray-500">
                    รวมทั้งห้องพักและกิจกรรม ATV
                  </p>
                </div>
              </div>
            </div>

            {/* Room Section */}
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <div className="w-2 h-8 bg-blue-500 rounded-full mr-3"></div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  สถิติห้องพัก
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300 border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 font-medium text-sm sm:text-base">
                        ยอดขายห้องพักรวม
                      </p>
                      <h3 className="text-2xl sm:text-3xl font-bold mt-2 text-gray-800">
                        {totalpriceroom.toLocaleString()} ฿
                      </h3>
                    </div>
                    <div className="p-4 rounded-full bg-blue-100 text-blue-600 shadow-md">
                      <FiDollarSign size={32} />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-green-600 font-medium">
                    <FiTrendingUp className="mr-1" />
                    <span>จาก {totalRoomOrders} รายการจอง</span>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300 border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 font-medium text-sm sm:text-base">
                        จำนวนการจองห้องพัก
                      </p>
                      <h3 className="text-2xl sm:text-3xl font-bold mt-2 text-gray-800">
                        {totalRoomOrders}
                      </h3>
                      <span className="text-sm text-gray-500">รายการ</span>
                    </div>
                    <div className="p-4 rounded-full bg-blue-100 text-blue-600 shadow-md">
                      <FiCalendar size={32} />
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-gray-500">
                    ข้อมูลอัปเดตล่าสุด
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300 border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 font-medium text-sm sm:text-base">
                        ห้องพักที่จองมากที่สุด
                      </p>
                      <h3
                        className="text-2xl sm:text-3xl font-bold mt-2 text-gray-800 truncate"
                        title={mostBookedRoomName}
                      >
                        {mostBookedRoomName}
                      </h3>
                    </div>
                    <div className="p-4 rounded-full bg-blue-100 text-blue-600 shadow-md">
                      <FiAward size={32} />
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-gray-500">
                    วิเคราะห์จากจำนวนครั้งที่ถูกจอง
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300 border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 font-medium text-sm sm:text-base">
                        ระยะเวลาพักโดยเฉลี่ย
                      </p>
                      <h3 className="text-2xl sm:text-3xl font-bold mt-2 text-gray-800">
                        {calculateAverageStayDuration()}{" "}
                        <span className="text-xl font-normal">คืน</span>
                      </h3>
                    </div>
                    <div className="p-4 rounded-full bg-blue-100 text-blue-600 shadow-md">
                      <FiClock size={32} />
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-gray-500">
                    จำนวนคืนเฉลี่ยที่ลูกค้าเข้าพัก
                  </p>
                </div>
              </div>

              <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-blue-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">
                    <FiBarChart2 className="inline mr-2 text-blue-500" />
                    แนวโน้มการจองห้องพัก
                  </h3>
                </div>
                <div className="h-64 sm:h-80 lg:h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={ChartDataBooking}
                      margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#E5E7EB"
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: "#6B7280", fontSize: 12 }}
                        axisLine={{ stroke: "#D1D5DB" }}
                        tickLine={false}
                        interval="preserveStartEnd"
                        tickFormatter={(tick) => {
                          try {
                            const dateObj =
                              timeRange === "year"
                                ? parseISO(tick + "-01")
                                : parseISO(tick);
                            if (!isValid(dateObj)) return tick;
                            switch (timeRange) {
                              case "day":
                                return format(dateObj, "HH:mm");
                              case "month":
                                return format(dateObj, "d");
                              case "year":
                                return format(dateObj, "MMM");
                              default:
                                return format(dateObj, "d MMM yy");
                            }
                          } catch (e) {
                            return tick;
                          }
                        }}
                        label={{
                          value:
                            timeRange === "day"
                              ? `วันที่ ${
                                  isValid(selectedDate)
                                    ? format(selectedDate, "d MMM yy")
                                    : ""
                                }`
                              : timeRange === "month"
                              ? isValid(selectedDate)
                                ? format(selectedDate, "MMMM yyyy")
                                : ""
                              : timeRange === "year"
                              ? `ปี ${
                                  isValid(selectedDate)
                                    ? format(selectedDate, "yyyy")
                                    : ""
                                }`
                              : "ภาพรวม (ข้อมูลรายวัน)",
                          position: "insideBottom",
                          offset: -20,
                          fill: "#6B7280",
                          fontSize: 14,
                        }}
                      />
                      <YAxis
                        tick={{ fill: "#6B7280", fontSize: 12 }}
                        axisLine={{ stroke: "#D1D5DB" }}
                        tickLine={false}
                        tickFormatter={(value) => `${value.toLocaleString()}฿`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          borderRadius: "0.75rem",
                          boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
                          border: "1px solid #E5E7EB",
                          padding: "1rem",
                        }}
                        formatter={(value, name, props) => [
                          `${
                            typeof value === "number"
                              ? value.toLocaleString()
                              : value
                          }฿ ( ${props.payload.count} รายการ )`,
                          "ยอดขาย",
                        ]}
                        labelFormatter={(label) => {
                          try {
                            const dateObj =
                              timeRange === "year"
                                ? parseISO(label + "-01")
                                : parseISO(label);
                            if (!isValid(dateObj)) return label;
                            if (timeRange === "year")
                              return format(dateObj, "MMMM yyyy");
                            return format(dateObj, "eeee, d MMMM yyyy");
                          } catch (e) {
                            return label;
                          }
                        }}
                        labelStyle={{
                          color: "#374151",
                          fontWeight: "bold",
                          marginBottom: "0.5rem",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="totalPrice"
                        name="ยอดขายห้องพัก"
                        stroke="#4F46E5"
                        strokeWidth={3}
                        dot={{ r: 4, fill: "#4F46E5" }}
                        activeDot={{
                          r: 6,
                          stroke: "#4F46E5",
                          strokeWidth: 2,
                          fill: "#fff",
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-blue-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">
                    <FiPieChart className="inline mr-2 text-blue-500" />
                    สัดส่วนการจองห้องพักตามประเภท
                  </h3>
                </div>
                <div className="h-64 sm:h-80 lg:h-96 flex items-center justify-center">
                  {calculateRoomTypeDistribution().length > 0 &&
                  calculateRoomTypeDistribution()[0].name !== "ไม่มีข้อมูล" ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={calculateRoomTypeDistribution()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius="80%"
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent, value }) => {
                            if (
                              calculateRoomTypeDistribution().length > 5 &&
                              percent < 0.05
                            )
                              return null;
                            return `${name}: ${(percent * 100).toFixed(
                              0
                            )}% (${value})`;
                          }}
                        >
                          {calculateRoomTypeDistribution().map(
                            (entry, index) => (
                              <Cell
                                key={`cell-room-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            )
                          )}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.95)",
                            borderRadius: "0.75rem",
                            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
                            border: "1px solid #E5E7EB",
                            padding: "1rem",
                          }}
                          formatter={(value, name) => [
                            `${value.toLocaleString()} ครั้ง`,
                            name,
                          ]}
                        />
                        <Legend
                          wrapperStyle={{
                            paddingTop: "20px",
                            fontSize: "14px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-500 text-lg">
                      ไม่มีข้อมูลการจองห้องพักในช่วงนี้
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ATV Section */}
            <div className="mb-12">
              <div className="flex items-center mb-6">
                <div className="w-2 h-8 bg-green-500 rounded-full mr-3"></div>
                <h2 className="text-2xl font-semibold text-gray-800">
                  สถิติกิจกรรม ATV
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300 border border-green-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 font-medium text-sm sm:text-base">
                        ยอดขาย ATV รวม
                      </p>
                      <h3 className="text-2xl sm:text-3xl font-bold mt-2 text-gray-800">
                        {totalpriceatv.toLocaleString()} ฿
                      </h3>
                    </div>
                    <div className="p-4 rounded-full bg-green-100 text-green-600 shadow-md">
                      <FiDollarSign size={32} />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm text-green-600 font-medium">
                    <FiTrendingUp className="mr-1" />
                    <span>จาก {totalAtvOrders} รายการจอง</span>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300 border border-green-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 font-medium text-sm sm:text-base">
                        จำนวนการจอง ATV
                      </p>
                      <h3 className="text-2xl sm:text-3xl font-bold mt-2 text-gray-800">
                        {totalAtvOrders}
                      </h3>
                      <span className="text-sm text-gray-500">รายการ</span>
                    </div>
                    <div className="p-4 rounded-full bg-green-100 text-green-600 shadow-md">
                      <FiCalendar size={32} />
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-gray-500">
                    ข้อมูลอัปเดตล่าสุด
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300 border border-green-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 font-medium text-sm sm:text-base">
                        จำนวน ATV ที่ถูกจอง
                      </p>
                      <h3 className="text-xl sm:text-2xl font-semibold mt-1 text-gray-800">
                        เล็ก: {atvsmall.toLocaleString()} คัน
                      </h3>
                      <h3 className="text-xl sm:text-2xl font-semibold mt-1 text-gray-800">
                        ใหญ่: {atvlarge.toLocaleString()} คัน
                      </h3>
                    </div>
                    <div className="p-4 rounded-full bg-green-100 text-green-600 shadow-md">
                      <FiActivity size={32} />
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-gray-500">
                    แบ่งตามขนาด ATV ที่เลือก
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300 border border-green-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 font-medium text-sm sm:text-base">
                        รอบ ATV ยอดนิยม
                      </p>
                      <h3
                        className="text-2xl sm:text-3xl font-bold mt-2 text-gray-800 truncate"
                        title={findPopularTimeSlot()}
                      >
                        {findPopularTimeSlot()}
                      </h3>
                    </div>
                    <div className="p-4 rounded-full bg-green-100 text-green-600 shadow-md">
                      <FiThumbsUp size={32} />
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-gray-500">
                    รอบเวลาที่ถูกเลือกมากที่สุด
                  </p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300 border border-green-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 font-medium text-sm sm:text-base">
                        ขนาดกลุ่มเฉลี่ย (ATV)
                      </p>
                      <h3 className="text-2xl sm:text-3xl font-bold mt-2 text-gray-800">
                        {calculateAverageGroupSize()}{" "}
                        <span className="text-xl font-normal">คน</span>
                      </h3>
                    </div>
                    <div className="p-4 rounded-full bg-green-100 text-green-600 shadow-md">
                      <FiUsers size={32} />
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-gray-500">
                    จำนวนคนเฉลี่ยต่อการจอง ATV
                  </p>
                </div>
              </div>
              <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-green-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">
                    <FiBarChart2 className="inline mr-2 text-green-500" />
                    แนวโน้มการจอง ATV
                  </h3>
                </div>
                <div className="h-64 sm:h-80 lg:h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={ChartDataATV}
                      margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#E5E7EB"
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: "#6B7280", fontSize: 12 }}
                        axisLine={{ stroke: "#D1D5DB" }}
                        tickLine={false}
                        interval="preserveStartEnd"
                        tickFormatter={(tick) => {
                          try {
                            const dateObj =
                              timeRange === "year"
                                ? parseISO(tick + "-01")
                                : parseISO(tick);
                            if (!isValid(dateObj)) return tick;
                            switch (timeRange) {
                              case "day":
                                return format(dateObj, "HH:mm");
                              case "month":
                                return format(dateObj, "d");
                              case "year":
                                return format(dateObj, "MMM");
                              default:
                                return format(dateObj, "d MMM yy");
                            }
                          } catch (e) {
                            return tick;
                          }
                        }}
                        label={{
                          value:
                            timeRange === "day"
                              ? `วันที่ ${
                                  isValid(selectedDate)
                                    ? format(selectedDate, "d MMM yy")
                                    : ""
                                }`
                              : timeRange === "month"
                              ? isValid(selectedDate)
                                ? format(selectedDate, "MMMM yyyy")
                                : ""
                              : timeRange === "year"
                              ? `ปี ${
                                  isValid(selectedDate)
                                    ? format(selectedDate, "yyyy")
                                    : ""
                                }`
                              : "ภาพรวม (ข้อมูลรายวัน)",
                          position: "insideBottom",
                          offset: -20,
                          fill: "#6B7280",
                          fontSize: 14,
                        }}
                      />
                      <YAxis
                        tick={{ fill: "#6B7280", fontSize: 12 }}
                        axisLine={{ stroke: "#D1D5DB" }}
                        tickLine={false}
                        tickFormatter={(value) => `${value.toLocaleString()}฿`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          borderRadius: "0.75rem",
                          boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
                          border: "1px solid #E5E7EB",
                          padding: "1rem",
                        }}
                        formatter={(value, name, props) => [
                          `${
                            typeof value === "number"
                              ? value.toLocaleString()
                              : value
                          }฿ ( ${props.payload.count} รายการ )`,
                          "ยอดขาย",
                        ]}
                        labelFormatter={(label) => {
                          try {
                            const dateObj =
                              timeRange === "year"
                                ? parseISO(label + "-01")
                                : parseISO(label);
                            if (!isValid(dateObj)) return label;
                            if (timeRange === "year")
                              return format(dateObj, "MMMM yyyy");
                            return format(dateObj, "eeee, d MMMM yyyy");
                          } catch (e) {
                            return label;
                          }
                        }}
                        labelStyle={{
                          color: "#374151",
                          fontWeight: "bold",
                          marginBottom: "0.5rem",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="totalPrice"
                        name="ยอดขาย ATV"
                        stroke={COLORS[1]}
                        strokeWidth={3}
                        dot={{ r: 4, fill: COLORS[1] }}
                        activeDot={{
                          r: 6,
                          stroke: COLORS[1],
                          strokeWidth: 2,
                          fill: "#fff",
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-green-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">
                    <FiPieChart className="inline mr-2 text-green-500" />
                    สัดส่วนประเภท ATV ที่ถูกจอง
                  </h3>
                </div>
                <div className="h-64 sm:h-80 lg:h-96 flex items-center justify-center">
                  {calculateATVTypeDistribution().length > 0 &&
                  calculateATVTypeDistribution()[0].name !==
                    "ไม่มีข้อมูล ATV" &&
                  calculateATVTypeDistribution()[0].name !== "ไม่มีข้อมูล" ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={calculateATVTypeDistribution()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius="80%"
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent, value }) =>
                            `${name.split("(")[0].trim()}: ${(
                              percent * 100
                            ).toFixed(0)}%`
                          }
                        >
                          {calculateATVTypeDistribution().map(
                            (entry, index) => (
                              <Cell
                                key={`cell-atv-${index}`}
                                fill={index === 0 ? COLORS[1] : COLORS[2]}
                              />
                            )
                          )}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(255, 255, 255, 0.95)",
                            borderRadius: "0.75rem",
                            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
                            border: "1px solid #E5E7EB",
                            padding: "1rem",
                          }}
                          formatter={(value, name) => [
                            `${value.toLocaleString()} คัน`,
                            name.split("(")[0].trim(),
                          ]}
                        />
                        <Legend
                          wrapperStyle={{
                            paddingTop: "20px",
                            fontSize: "14px",
                          }}
                          formatter={(value, entry) => entry.payload.name}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-500 text-lg">
                      ไม่มีข้อมูลการจอง ATV ในช่วงนี้
                    </p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashBoard;
