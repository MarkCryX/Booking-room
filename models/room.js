// models/room.js
const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema(
  {
    roomName: { type: String, required: true, unique: true },
    images: { type: [String], required: true },
    roomType: {
      type: String,
      enum: ["single", "double", "suite"], // ตัวอย่างประเภทห้อง
      default: "single",
    },
    status: {
      type: String,
      enum: ["พร้อมให้บริการ", "ถูกจองแล้ว", "อยู่ระหว่างการซ่อมแซม"],
      default: "พร้อมให้บริการ",
    },
    price: { type: Number, required: true },
    pricechild: { type: Number, required: true },
    maxGuests: { type: Number, required: true, default: 1 }, // **เพิ่มฟิลด์นี้**
    description: { type: String, required: true },
    amenities: { type: String }, // อาจเป็น String หรือ Array of Strings ก็ได้
  },
  { timestamps: true }
);

const Room = mongoose.models.Room || mongoose.model("Room", roomSchema);

module.exports = Room;