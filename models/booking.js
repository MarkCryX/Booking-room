// models/booking.js
import mongoose, { Schema } from "mongoose";

const bookingSchema = new Schema(
  {
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    email: { type: String, required: true },
    emailuser: { type: String, required: true },
    name: { type: String, required: true },
    numAdults: { type: Number, required: true },
    numChildren: { type: Number, default: 0 },
    phone: { type: String, required: true },
    roomId: { type: Schema.Types.ObjectId, ref: "Room", required: true }, // Using roomId to reference Room model
    roomName: { type: String, required: true },
    totalPrice: { type: Number, required: true },
    isOrder: { type: Boolean, default: false },
    status: { type: String, default: "รอยืนยัน" },
    imagepayment: {
      type: String,
      default: null,
    },
    paymentStatus: { type: String, default: "ยังไม่ชำระ" },
  },
  { timestamps: true }
);

const Booking =
  mongoose.models.Booking || mongoose.model("Booking", bookingSchema);

export default Booking;
