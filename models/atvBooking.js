// models/atvBooking.js
const mongoose = require("mongoose");

const atvBookingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  emailuser: {
    type: String,
    required: true,
  },
  selectedDate: {
    type: Date,
    required: true,
  },
  selectedRound: {
    type: String,
    required: true,
  },
  numSmallATV: {
    type: Number,
    required: true,
    default: 0,
  },
  numLargeATV: {
    type: Number,
    required: true,
    default: 0,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  isOrder: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ["รอยืนยัน", "ยืนยันเรียบร้อย","ปิดออเดอร์","ยกเลิกออเดอร์"], // ค่าที่สามารถเลือกได้
    default: "รอยืนยัน", // ค่าเริ่มต้น
  },
  imagepayment: {
    type: String,
    default: null
  },
  paymentStatus: {
    type: String,
    enum: ["ยังไม่ชำระ","ชำระเสร็จสิ้น"],
    default: "ยังไม่ชำระ"
  }
});

const ATVBooking = mongoose.models.ATVBooking || mongoose.model("ATVBooking", atvBookingSchema);

module.exports = ATVBooking;
