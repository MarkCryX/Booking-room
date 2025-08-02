import { connectMongoDB } from "@/lib/mongodb";
import Booking from "@/models/booking";
import { NextResponse } from "next/server";

// Function to normalize date to start of day UTC
// This ensures all date comparisons are based on the same point in time (00:00:00 UTC)
const normalizeDateToUTC = (date) => {
    if (!date) return null;
    const newDate = new Date(date);
    newDate.setUTCHours(0, 0, 0, 0); // Normalize to start of the day UTC
    return newDate;
};

// Function to check if a new date range overlaps with existing booked dates
// Uses the standard interval overlap logic: [start1, end1) and [start2, end2) overlap if start1 < end2 AND start2 < end1
const checkOverlapBackend = async (roomId, newCheckIn, newCheckOut) => {
    const newStart = normalizeDateToUTC(newCheckIn);
    const newEnd = normalizeDateToUTC(newCheckOut);

    // console.log("Backend Overlap Check - New Booking:", newStart.toISOString(), "to", newEnd.toISOString());

    const existingBookings = await Booking.find({
        roomId: roomId,
        $and: [
            // Existing booking's checkOutDate must be after new booking's checkInDate
            { checkOutDate: { $gt: newStart } },
            // Existing booking's checkInDate must be before new booking's checkOutDate
            { checkInDate: { $lt: newEnd } }
        ]
    });

    // console.log("Existing bookings found for room", roomId, ":", existingBookings.length);
    // existingBookings.forEach(b => console.log("  Existing:", b.checkInDate.toISOString(), "to", b.checkOutDate.toISOString()));
    // console.log("Overlap result:", existingBookings.length > 0);

    return existingBookings.length > 0;
};


export async function POST(req) {
    try {
        await connectMongoDB();

        const {
            checkInDate, // Comes as ISO String (UTC)
            checkOutDate, // Comes as ISO String (UTC)
            email,
            emailuser,
            name,
            numAdults,
            numChildren,
            phone,
            roomId, // Receive roomId from Frontend
            roomName,
            isOrder = false,
            totalPrice,
        } = await req.json();

        if (
            !checkInDate ||
            !checkOutDate ||
            !email ||
            !name ||
            numAdults === undefined ||
            !roomName ||
            !roomId ||
            !totalPrice
        ) {
            return NextResponse.json(
                { error: "กรุณากรอกข้อมูลให้ครบถ้วน" },
                { status: 400 }
            );
        }

        const parsedCheckInDate = normalizeDateToUTC(new Date(checkInDate));
        const parsedCheckOutDate = normalizeDateToUTC(new Date(checkOutDate));

        // Ensure check-out date is strictly after check-in date
        if (parsedCheckOutDate.getTime() <= parsedCheckInDate.getTime()) {
            return NextResponse.json(
                { error: "วันที่เช็คเอาท์ต้องหลังวันที่เช็คอินอย่างน้อย 1 วัน" },
                { status: 400 }
            );
        }

        // *** Check for overlap on the Backend before saving ***
        const isOverlapping = await checkOverlapBackend(
            roomId, // Pass roomId to the overlap checker
            parsedCheckInDate,
            parsedCheckOutDate
        );

        if (isOverlapping) {
            return NextResponse.json(
                { error: "วันที่เลือกมีการจองไปแล้วสำหรับห้องนี้ กรุณาเลือกวันใหม่" },
                { status: 409 } // Conflict
            );
        }

        // Create new booking document
        const newBooking = new Booking({
            checkInDate: parsedCheckInDate, // Save as UTC directly (e.g., 2025-06-05T00:00:00.000Z)
            checkOutDate: parsedCheckOutDate, // Save as UTC directly (e.g., 2025-06-08T00:00:00.000Z)
            email,
            emailuser,
            name,
            numAdults,
            numChildren,
            phone,
            roomId: roomId,
            roomName,
            totalPrice,
            isOrder,
            status: "รอยืนยัน",
            paymentStatus: "ยังไม่ชำระ",
        });

        // Save the booking to MongoDB
        await newBooking.save();

        return NextResponse.json(
            { message: "การจองสำเร็จ", booking: newBooking },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error in POST /api/booking:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        await connectMongoDB();

        const url = new URL(req.url);
        const roomId = url.searchParams.get("roomId"); // Get roomId from query string
        const isOrder = url.searchParams.get("isOrder");

        let query = {};
        if (roomId) {
            query.roomId = roomId; // Query by roomId
        }
        if (isOrder !== null) {
            query.isOrder = isOrder === "true";
        }

        const bookings = await Booking.find(query);

        return NextResponse.json(
            { message: "ข้อมูลการจองทั้งหมด", bookings },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error in GET /api/booking:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}