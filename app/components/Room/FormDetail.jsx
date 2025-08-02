"use client";
import { useState, useEffect, useCallback } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter } from "next/navigation";

function FormDetail({ Room }) {
    const room = Room;
    const { user } = useUser();
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [numAdults, setNumAdults] = useState(1);
    const [numChildren, setNumChildren] = useState(0);
    const [checkInDate, setCheckInDate] = useState(null);
    const [checkOutDate, setCheckOutDate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [bookedDates, setBookedDates] = useState([]);
    const router = useRouter();

    useEffect(() => {
        if (room && room.maxGuests) {
            // Logic for maxGuests can go here if needed
        }
    }, [room]);

    // Function to normalize date to start of day UTC
    // This ensures all date comparisons are based on the same point in time (00:00:00 UTC)
    const normalizeDateToUTC = (date) => {
        if (!date) return null;
        // Create a new Date object from the provided date, then set its UTC hours to 00:00:00.000
        // This effectively gets the date without time components, in UTC.
        return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    };

    // Function to check if a new date range overlaps with existing booked dates
    // Uses the standard interval overlap logic: [start1, end1) and [start2, end2) overlap if start1 < end2 AND start2 < end1
    const isDateRangeOverlapping = useCallback((newBookingCheckIn, newBookingCheckOut) => {
        if (!newBookingCheckIn || !newBookingCheckOut) return false;

        const newStart = normalizeDateToUTC(newBookingCheckIn);
        const newEnd = normalizeDateToUTC(newBookingCheckOut);

        return bookedDates.some((existingBooking) => {
            const existingStart = normalizeDateToUTC(existingBooking.checkIn);
            const existingEnd = normalizeDateToUTC(existingBooking.checkOut);

            // console.log("--- Overlap Check ---");
            // console.log("New: ", newStart.toISOString(), "to", newEnd.toISOString());
            // console.log("Existing: ", existingStart.toISOString(), "to", existingEnd.toISOString());

            // Overlap condition: (new_start < existing_end) AND (existing_start < new_end)
            const overlap = newStart.getTime() < existingEnd.getTime() &&
                            existingStart.getTime() < newEnd.getTime();
            // console.log("Overlap result:", overlap);
            return overlap;
        });
    }, [bookedDates]);

    // Fetch existing bookings
    const fetchBookings = useCallback(async () => {
        if (!room?._id) return;

        try {
            const response = await fetch(`/api/booking?roomId=${room._id}`);
            if (!response.ok) {
                throw new Error("Failed to fetch bookings");
            }
            const data = await response.json();
            const dates = data.bookings.map((booking) => ({
                // Create Date object from ISO string which is UTC
                checkIn: new Date(booking.checkInDate),
                checkOut: new Date(booking.checkOutDate),
            }));
            setBookedDates(dates);
        } catch (error) {
            console.error("ไม่สามารถดึงข้อมูลการจองได้:", error);
        }
    }, [room?._id]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    // Filter possible check-in dates for DatePicker
    const filterCheckInDates = (date) => {
        const today = normalizeDateToUTC(new Date()); // Normalize today to UTC 00:00
        if (normalizeDateToUTC(date).getTime() < today.getTime()) return false; // Cannot select past dates

        // For check-in date filtering, we check if starting a booking on 'date' for at least one night
        // (i.e., 'date' to 'date + 1 day') would overlap with any existing booking.
        const potentialCheckOutAfterOneNight = new Date(date);
        potentialCheckOutAfterOneNight.setUTCDate(potentialCheckOutAfterOneNight.getUTCDate() + 1);
        const normalizedPotentialCheckOut = normalizeDateToUTC(potentialCheckOutAfterOneNight);
        
        return !isDateRangeOverlapping(date, normalizedPotentialCheckOut);
    };

    // Filter possible check-out dates for DatePicker
    const filterCheckOutDates = (date) => {
        const today = normalizeDateToUTC(new Date());
        if (normalizeDateToUTC(date).getTime() < today.getTime()) return false;
        if (!checkInDate) return false;

        // Check-out date must be strictly after check-in date (at least one full day)
        const checkInUTC = normalizeDateToUTC(checkInDate);
        const dateUTC = normalizeDateToUTC(date);
        if (dateUTC.getTime() <= checkInUTC.getTime()) return false;

        // Check if the chosen range (checkInDate to 'date') overlaps with any existing booking.
        return !isDateRangeOverlapping(checkInDate, date);
    };

    const calculateDaysDifference = () => {
        if (!checkInDate || !checkOutDate) return 0;
        // Calculate difference based on UTC timestamps to get full days
        const timeDifference = normalizeDateToUTC(checkOutDate).getTime() - normalizeDateToUTC(checkInDate).getTime();
        return timeDifference > 0
            ? Math.round(timeDifference / (1000 * 3600 * 24)) // Use Math.round for robustness, or Math.floor if strictly full days
            : 0;
    };

    const calculateTotalPrice = () => {
        const adultPrice = room?.price || 0;
        const childPrice = room?.pricechild || 0;
        const numDays = calculateDaysDifference();

        const totalPrice =
            numDays > 0
                ? numAdults * adultPrice * numDays + numChildren * childPrice * numDays
                : 0;

        return totalPrice;
    };

    const handlePhoneChange = (e) => {
        const value = e.target.value;
        const numericValue = value.replace(/\D/g, "");
        setPhone(numericValue.slice(0, 10));
    };

    const isPhoneValid = () => {
        return phone.length === 10;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const totalGuests = numAdults + numChildren;
        if (room && totalGuests > room.maxGuests) {
            alert(
                `จำนวนผู้เข้าพัก (${totalGuests} คน) เกินจำนวนสูงสุดที่ห้องพักรับได้ (${room.maxGuests} คน)`
            );
            setLoading(false);
            return;
        }
        if (numAdults === 0 && numChildren === 0) {
            alert("กรุณาระบุจำนวนผู้เข้าพัก (ผู้ใหญ่หรือเด็กอย่างน้อย 1 คน)");
            setLoading(false);
            return;
        }
        if (numAdults < 1) {
            alert("กรุณาระบุจำนวนผู้ใหญ่เป็นอย่างน้อย 1 คน");
            setLoading(false);
            return;
        }

        if (!isPhoneValid()) {
            alert("กรุณาใส่เบอร์โทรศัพท์ให้ถูกต้อง (ตัวเลข 10 หลัก)");
            setLoading(false);
            return;
        }

        // Essential: Check for valid dates before processing
        if (!checkInDate || !checkOutDate || calculateDaysDifference() <= 0) {
            alert("กรุณาเลือกวันที่เช็คอินและเช็คเอาท์ให้ถูกต้อง");
            setLoading(false);
            return;
        }

        // Check for overlap before submitting
        if (isDateRangeOverlapping(checkInDate, checkOutDate)) {
            alert("วันที่เลือกมีการทับซ้อนกับการจองอื่น กรุณาเลือกวันใหม่");
            setLoading(false);
            return;
        }

        const bookingData = {
            emailuser: user?.email,
            name,
            phone,
            email,
            roomId: room._id,
            roomName: room.roomName,
            numAdults,
            numChildren,
            totalPrice: calculateTotalPrice(),
            // Send normalized Date objects as ISO string (UTC 00:00:00) to Backend
            checkInDate: normalizeDateToUTC(checkInDate).toISOString(),
            checkOutDate: normalizeDateToUTC(checkOutDate).toISOString(),
        };

        try {
            const response = await fetch("/api/booking", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(bookingData),
            });

            const data = await response.json();

            if (response.ok) {
                alert("การจองสำเร็จ!");
                await fetchBookings(); // Fetch latest bookings after successful booking
                setName("");
                setPhone("");
                setEmail("");
                setNumAdults(1);
                setNumChildren(0);
                setCheckInDate(null);
                setCheckOutDate(null);
                router.push("/user?tab=booking");
            } else {
                alert(`เกิดข้อผิดพลาด: ${data.error}`);
            }
        } catch (error) {
            console.error("Submission error:", error);
            alert("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-10">
            <p className="text-xl font-semibold mb-4">ข้อมูลการจอง</p>
            {room && (
                <p className="text-lg text-gray-700 mb-6">
                    ห้องนี้พักได้สูงสุด:{" "}
                    <span className="font-bold text-blue-600">{room.maxGuests}</span> คน
                </p>
            )}
            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-lg shadow-lg space-y-6 text-left"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label
                            htmlFor="checkInDate"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            วันที่เช็คอิน*
                        </label>
                        <DatePicker
                            id="checkInDate"
                            selected={checkInDate}
                            onChange={(date) => {
                                if (date) {
                                    setCheckInDate(normalizeDateToUTC(date));
                                    // Reset checkOutDate if checkInDate changes to ensure valid range
                                    if (checkOutDate && normalizeDateToUTC(date).getTime() >= normalizeDateToUTC(checkOutDate).getTime()) {
                                        setCheckOutDate(null);
                                    }
                                } else {
                                    setCheckInDate(null);
                                    setCheckOutDate(null); // Also clear checkout if checkin is cleared
                                }
                            }}
                            minDate={new Date()}
                            filterDate={filterCheckInDates}
                            dateFormat="dd/MM/yyyy"
                            className="mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 w-full"
                            required
                        />
                        <p className="text-sm text-gray-500 mt-1">เช็คอินเวลา 14:00 น.</p>
                    </div>

                    <div>
                        <label
                            htmlFor="checkOutDate"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            วันที่เช็คเอาท์*
                        </label>
                        <DatePicker
                            id="checkOutDate"
                            selected={checkOutDate}
                            onChange={(date) => {
                                if (date) {
                                    setCheckOutDate(normalizeDateToUTC(date));
                                } else {
                                    setCheckOutDate(null);
                                }
                            }}
                            minDate={
                                checkInDate
                                    ? new Date(normalizeDateToUTC(checkInDate).getTime() + 24 * 60 * 60 * 1000) // Checkout must be at least 1 day after check-in
                                    : new Date()
                            }
                            filterDate={filterCheckOutDates}
                            dateFormat="dd/MM/yyyy"
                            className="mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 w-full"
                            required
                            disabled={!checkInDate}
                        />
                        <p className="text-sm text-gray-500 mt-1">เช็คเอาท์เวลา 12:00 น.</p>
                    </div>
                </div>

                <div>
                    <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        ชื่อ-นามสกุล*
                    </label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 w-full"
                        placeholder="ใส่ชื่อ-นามสกุล"
                        required
                    />
                </div>

                <div>
                    <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        เบอร์โทรศัพท์*
                    </label>
                    <input
                        id="phone"
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]{10}"
                        maxLength="10"
                        value={phone}
                        onChange={handlePhoneChange}
                        className="mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 w-full"
                        placeholder="เบอร์โทรศัพท์ (10 หลัก)"
                        required
                    />
                    {!isPhoneValid() && phone.length > 0 && (
                        <p className="text-red-500 text-sm mt-1">
                            กรุณาใส่เบอร์โทรศัพท์ให้ครบ 10 หลัก
                        </p>
                    )}
                </div>

                <div>
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                    >
                        อีเมล*
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 w-full"
                        placeholder="อีเมล"
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <div className="flex gap-2 items-center mb-1">
                            <label
                                htmlFor="numAdults"
                                className="block text-sm font-medium text-gray-700"
                            >
                                ผู้ใหญ่*
                            </label>
                            <p className="text-xs text-gray-500">
                                (ราคา {room?.price || 0} บาท ต่อคืน)
                            </p>
                        </div>
                        <input
                            id="numAdults"
                            type="number"
                            min="1"
                            value={numAdults}
                            onChange={(e) => setNumAdults(Number(e.target.value))}
                            className="mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 w-full"
                            placeholder="จำนวนผู้ใหญ่"
                            required
                        />
                    </div>

                    <div>
                        <div className="flex gap-2 items-center mb-1">
                            <label
                                htmlFor="numChildren"
                                className="block text-sm font-medium text-gray-700"
                            >
                                เด็ก{" "}
                            </label>
                            <p className="text-xs text-gray-500">
                                (ราคา {room?.pricechild || 0} บาท ต่อคืน)
                            </p>
                            <span className="text-red-500 text-sm">
                                *ต่ำกว่า 6 ขวบ พักฟรีและไม่ต้องกรอก
                            </span>
                        </div>
                        <input
                            id="numChildren"
                            type="number"
                            min="0"
                            value={numChildren}
                            onChange={(e) => setNumChildren(Number(e.target.value))}
                            className="mt-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 w-full"
                            placeholder="จำนวนเด็ก"
                        />
                    </div>
                </div>

                <div className="mt-4">
                    <p className="font-bold text-lg text-gray-800">
                        ราคาทั้งหมด: {calculateTotalPrice().toLocaleString()} บาท
                    </p>
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={
                            loading ||
                            numAdults + numChildren > (room?.maxGuests || 0) ||
                            numAdults < 1 ||
                            !checkInDate ||
                            !checkOutDate ||
                            calculateDaysDifference() <= 0 || // Added this check
                            !isPhoneValid()
                        }
                        className={`w-full py-3 rounded-md mt-4 font-semibold text-lg ${
                            loading ||
                            numAdults + numChildren > (room?.maxGuests || 0) ||
                            numAdults < 1 ||
                            !checkInDate ||
                            !checkOutDate ||
                            calculateDaysDifference() <= 0 || // Added this check
                            !isPhoneValid()
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-green-500 hover:bg-green-600"
                        } text-white focus:outline-none focus:ring-2 focus:ring-green-500`}
                    >
                        {loading ? "กำลังยืนยัน..." : "ยืนยันการจอง"}
                    </button>
                    {numAdults + numChildren > (room?.maxGuests || 0) && (
                        <p className="text-red-500 text-sm mt-2">
                            จำนวนผู้เข้าพักรวม ({numAdults + numChildren} คน)
                            เกินจำนวนสูงสุดที่ห้องพักรับได้ ({room?.maxGuests || 0} คน)
                        </p>
                    )}
                    {numAdults < 1 && (
                        <p className="text-red-500 text-sm mt-2">
                            กรุณาระบุจำนวนผู้ใหญ่เป็นอย่างน้อย 1 คน
                        </p>
                    )}
                    {(!checkInDate || !checkOutDate || calculateDaysDifference() <= 0) && (
                        <p className="text-red-500 text-sm mt-2">
                            กรุณาเลือกวันที่เช็คอินและเช็คเอาท์ให้ถูกต้อง
                        </p>
                    )}
                </div>
            </form>
        </div>
    );
}

export default FormDetail;