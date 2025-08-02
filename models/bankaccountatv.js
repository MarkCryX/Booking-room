const mongoose = require("mongoose");


const bankAccountAtvSchema = new mongoose.Schema({
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
  isActive: { type: Boolean, default: false },
});

const BankAccountAtv = mongoose.models.BankAccountAtv || mongoose.model("BankAccountAtv", bankAccountAtvSchema);
export default BankAccountAtv;