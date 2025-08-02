// models/atv.js
const mongoose = require("mongoose");

const atvSchema = new mongoose.Schema(
  {
    images: [{ type: String }], // รูปภาพ ATV (บันทึก URL ของรูปภาพ)
    priceSmall: { type: Number, required: true }, // ราคาคันเล็ก
    priceLarge: { type: Number, required: true }, // ราคาคันใหญ่
    numATVSmall: { type: Number, required: true, default: 0 }, // จำนวน ATV คันเล็กทั้งหมดที่มี
    numATVLarge: { type: Number, required: true, default: 0 }, // จำนวน ATV คันใหญ่ทั้งหมดที่มี
    numATVPerRound: { type: Number, required: true, default: 1 }, // จำนวน ATV สูงสุดที่จองได้ต่อรอบ (รวมคันเล็กและคันใหญ่)
    roundTimes: [{ type: String, required: true }], // เวลาในแต่ละรอบ (สามารถเก็บเป็นสตริง หรือแบบ time)
    description: { type: String, required: true }, // รายละเอียดเพิ่มเติม
  },
  { timestamps: true } // บันทึกเวลาที่สร้างและแก้ไข
);

const ATV = mongoose.models.ATV || mongoose.model("ATV", atvSchema);

module.exports = ATV;