const mongoose = require("mongoose");

const bankAccountRoomSchema = new mongoose.Schema({
  accountname: {
    type: String,
    required: true,
  },
  accountnumber: {
    type: String,
    required: true,
  },
  bankname: {
    type: String,
    required: true,
  },
  qrcodeImage: {
    type: String,
  },
  createdAt: { type: Date, default: Date.now }, // วันที่สร้าง
  updatedAt: { type: Date, default: Date.now }, // วันที่แก้ไขล่าสุด
  isActive: { type: Boolean, default: true },
});

const BankAccountRoom = mongoose.models.BankAccountRoom || mongoose.model("BankAccountRoom", bankAccountRoomSchema);
export default BankAccountRoom;
