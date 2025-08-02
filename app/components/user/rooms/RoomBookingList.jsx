"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faHouse,
  faCalendar,
  faCreditCard,
  faUser,
  faFaceSmile,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";

function RoomBookingList({ bookings, setBookings }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [showQrcodeModal, setShowQrcodeModal] = useState(false);
  const [bankAccount, setBankAccount] = useState([]); // For bank transfer details
  const [qrCodeData, setQrCodeData] = useState(null); // For QR code image and details (currently not used for display but good to have)
  const [imagePayment, setImagePayment] = useState(""); // For uploaded slip image (Base64)
  const [currentBookingId, setCurrentBookingId] = useState(null); // Store bookingId for payment
  const [totalPrice, setTotalPrice] = useState(0); // Store totalPrice for display in modals
  const [copiedAccount, setCopiedAccount] = useState(null); // State to track which account number was copied

  // Effect สำหรับจัดการการเลื่อนหน้าจอเมื่อ Modal เปิด/ปิด
  useEffect(() => {
    const isAnyModalOpen = modalOpen || showBankModal || showQrcodeModal;
    if (isAnyModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset"; // หรือ 'auto', 'scroll'
    }

    // Cleanup function: จะทำงานเมื่อคอมโพเนนต์ Unmount หรือเมื่อ dependencies เปลี่ยน
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [modalOpen, showBankModal, showQrcodeModal]); // Dependencies: ตรวจสอบเมื่อสถานะ Modal เปลี่ยน

  // Opens the main payment method selection modal
  const openPaymentModal = (bookingId, totalPrice) => {
    setModalOpen(true);
    setCurrentBookingId(bookingId);
    setTotalPrice(totalPrice);
  };

  // Handles file input for payment slip
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePayment(reader.result); // Stores Base64 of the image
      };
      reader.readAsDataURL(file);
    } else {
      setImagePayment("");
    }
  };

  // Opens the bank transfer modal
  const openBankModal = () => {
    setShowBankModal(true);
    setModalOpen(false); // Close the main payment selection modal
  };

  // Opens the QR code payment modal
  const openQrcodeModal = () => {
    setShowQrcodeModal(true);
    setModalOpen(false); // Close the main payment selection modal
  };

  // Function to copy text to clipboard
  const copyToClipboard = async (text, accountId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAccount(accountId); // Set the ID of the account that was copied
      setTimeout(() => setCopiedAccount(null), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy: ", err);
      alert("ไม่สามารถคัดลอกได้ กรุณาลองใหม่");
    }
  };

  // Submits the payment slip for bank transfer
  const handleSubmitBankPayment = async () => {
    if (!currentBookingId) {
      alert("ไม่พบ ID การจอง");
      return;
    }
    if (!imagePayment) {
      alert("กรุณาอัปโหลดสลิปการโอน");
      return;
    }

    try {
      const response = await fetch("/api/user/payment/booking", {
        // Use the existing API for bank transfers
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _id: currentBookingId,
          imagepayment: imagePayment,
          paymentStatus: "ชำระเสร็จสิ้น",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        setModalOpen(false);
        setShowBankModal(false);
        setImagePayment("");
        // Reload or update parent state if necessary to reflect payment status change
        window.location.reload();
      } else {
        alert(
          "เกิดข้อผิดพลาด: " + (data.error || "ไม่สามารถอัปเดตการชำระเงินได้")
        );
      }
    } catch (error) {
      console.error("Error submitting bank payment:", error);
      alert("เกิดข้อผิดพลาดในการส่งข้อมูลการชำระเงิน (โอนผ่านเลขบัญชี)");
    }
  };

  // Submits the payment slip for QR code
  const handleSubmitQrPayment = async () => {
    if (!currentBookingId) {
      alert("ไม่พบ ID การจอง");
      return;
    }
    if (!imagePayment) {
      alert("กรุณาอัปโหลดสลิปการโอน");
      return;
    }

    try {
      const response = await fetch("/api/user/payment/booking", {
        // Use the new API for QR code payment
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _id: currentBookingId,
          imagepayment: imagePayment,
          paymentStatus: "ชำระเสร็จสิ้น",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        setModalOpen(false);
        setShowQrcodeModal(false);
        setImagePayment("");
        // Reload or update parent state if necessary
        window.location.reload();
      } else {
        alert(
          "เกิดข้อผิดพลาด: " + (data.error || "ไม่สามารถอัปเดตการชำระเงินได้")
        );
      }
    } catch (error) {
      console.error("Error submitting QR payment:", error);
      alert("เกิดข้อผิดพลาดในการส่งข้อมูลการชำระเงิน (QR Code)");
    }
  };

  const handleDelete = async (bookingId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/booking/${bookingId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        alert("ลบการจองสำเร็จ");
        setBookings((prevBookings) =>
          prevBookings.filter((booking) => booking._id !== bookingId)
        );
      } else {
        alert("เกิดข้อผิดพลาดในการยกเลิกการจอง");
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาด", error);
      alert("เกิดข้อผิดพลาดในการยกเลิกการจอง");
    }
  };

  useEffect(() => {
    // Fetch bank account details
    const fetchBankAccount = async () => {
      try {
        const response = await fetch("/api/bankaccounts"); // Assuming a separate API for room bank accounts
        if (!response.ok) {
          throw new Error("ไม่สามารถดึงข้อมูลบัญชีธนาคารได้");
        }
        const data = await response.json();
        const activeBankAccounts = data.filter((account) => account.isActive);
        setBankAccount(activeBankAccounts);
      } catch (error) {
        console.error("Error fetching bank account:", error);
        // You might want to display an error message to the user
      }
    };

    fetchBankAccount();
  }, []);

  return (
    <div>
      {bookings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FontAwesomeIcon
            icon={faFaceSmile}
            className="h-16 w-16 mx-auto text-gray-400"
          />
          <h3 className="text-xl font-medium text-gray-600 mt-4">
            ไม่มีรายการจองห้องพัก
          </h3>
          <p className="text-gray-500 mt-1">
            คุณยังไม่มีรายการจองห้องพักในขณะนี้
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  {booking.name}
                </h3>
                <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                  บ้านพัก
                </span>
              </div>

              <div className="space-y-3 text-gray-700">
                <div className="flex items-center">
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="h-4 w-4 text-green-500 mr-2"
                  />
                  <span>{booking.email}</span>
                </div>
                <div className="flex items-center">
                  <FontAwesomeIcon
                    icon={faHouse}
                    className="h-4 w-4 text-green-500 mr-2"
                  />
                  <span>{booking.roomName}</span>
                </div>
                <div className="flex items-center">
                  <FontAwesomeIcon
                    icon={faUser}
                    className="h-4 w-4 text-green-500 mr-2"
                  />
                  <span>
                    ผู้ใหญ่: {booking.numAdults} คน | เด็ก:{" "}
                    {booking.numChildren} คน
                  </span>
                </div>
                <div className="flex items-center">
                  <FontAwesomeIcon
                    icon={faCalendar}
                    className="h-4 w-4 text-green-500 mr-2"
                  />
                  <span>
                    เช็คอิน:{" "}
                    {new Date(booking.checkInDate).toLocaleDateString("th-TH", {
                      timeZone: "UTC",
                    })}
                  </span>
                </div>
                <div className="flex items-center">
                  <FontAwesomeIcon
                    icon={faCalendar}
                    className="h-4 w-4 text-green-500 mr-2"
                  />
                  <span>
                    เช็คเอาท์:{" "}
                    {new Date(booking.checkOutDate).toLocaleDateString(
                      "th-TH",
                      { timeZone: "UTC" }
                    )}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">ราคารวม:</span>
                  <span className="text-xl font-bold text-green-600">
                    {booking.totalPrice.toLocaleString()} บาท
                  </span>
                </div>

                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">สถานะการจอง:</span>
                  <span
                    className={`font-semibold ${
                      booking.status === "รอยืนยัน"
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-600">สถานะการชำระเงิน:</span>
                  <span
                    className={`font-semibold ${
                      booking.paymentStatus === "ยังไม่ชำระ"
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {booking.paymentStatus || "ยังไม่ชำระ"}
                  </span>
                </div>
              </div>

              {booking.paymentStatus === "ยังไม่ชำระ" && (
                <div>
                  <button
                    className="w-full mt-4 bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 px-4 rounded-lg hover:from-green-700 hover:to-teal-700 transition-colors duration-300 ease-in-out font-semibold text-lg shadow-md flex items-center justify-center"
                    onClick={() =>
                      openPaymentModal(booking._id, booking.totalPrice)
                    }
                  >
                    <FontAwesomeIcon
                      icon={faCreditCard}
                      className="h-4 w-4  mr-2"
                    />
                    ชำระเงิน
                  </button>
                  <button
                    onClick={() => handleDelete(booking._id)}
                    className="w-full mt-4 bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 px-4 rounded-lg hover:from-red-700 hover:to-orange-700 transition-colors duration-300 ease-in-out font-semibold text-lg shadow-md flex items-center justify-center"
                  >
                    ยกเลิกการจอง
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Main Payment Method Selection Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">ชำระเงินสำหรับห้องพัก</h3>
            <p className="mb-4">กรุณาเลือกวิธีการชำระเงิน:</p>
            <button
              className="w-full mb-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
              onClick={openBankModal}
            >
              โอนผ่านเลขบัญชีธนาคาร
            </button>
            <button
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
              onClick={openQrcodeModal}
            >
              ชำระผ่าน QR Code
            </button>
            <button
              className="mt-4 w-full bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              onClick={() => setModalOpen(false)}
            >
              ยกเลิก
            </button>
          </div>
        </div>
      )}

      {/* Bank Transfer Modal */}
      {showBankModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <div className="flex items-center justify-between ">
              <h3 className="text-xl font-bold mb-4">บัญชีธนาคาร</h3>
              <p className="text-xl font-bold mb-4 bg-green-100 py-2 px-3 rounded-full">
                ราคา {totalPrice.toLocaleString()} บาท
              </p>
            </div>
            <ul className="space-y-4">
              {bankAccount.length > 0 ? (
                bankAccount.map((account) => (
                  <li key={account._id} className="border p-4 rounded-lg">
                    <p className="font-semibold">{account.bankname}</p>
                    <div className="flex items-center justify-between">
                      {" "}
                      {/* Added flex container */}
                      <p className="text-gray-700">
                        เลขบัญชี:{" "}
                        <span className="font-medium">
                          {account.accountnumber}
                        </span>
                      </p>
                      <button
                        onClick={() =>
                          copyToClipboard(account.accountnumber, account._id)
                        }
                        className="ml-2 p-1 rounded-full bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        title="คัดลอกเลขบัญชี"
                      >
                        {copiedAccount === account._id ? (
                          <FontAwesomeIcon
                            icon={faCheck}
                            className="h-5 w-5 text-green-500"
                          />
                        ) : (
                          <p className="text-xs">คัดลอก</p>
                        )}
                      </button>
                    </div>
                    <p>ชื่อบัญชี: {account.accountname}</p>
                  </li>
                ))
              ) : (
                <p className="text-gray-600">
                  ไม่พบข้อมูลบัญชีธนาคารที่ใช้งานอยู่.
                </p>
              )}
            </ul>
            <h1 className="text-base mt-5">กรุณาแนบสลิปการโอนของคุณ</h1>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
              <div className="space-y-1 text-center">
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload-bank"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                  >
                    <span>อัพโหลดสลิป</span>
                    <input
                      id="file-upload-bank"
                      name="file-upload-bank"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">แนบสลิปการโอน</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF ขนาดไม่เกิน 10MB
                </p>
              </div>
            </div>
            {imagePayment && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-2">สลิปที่อัปโหลด:</h4>
                <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-md p-2 bg-gray-50 flex justify-center items-center">
                  <Image
                    src={imagePayment}
                    alt="Payment Slip Preview"
                    className="max-w-full h-auto"
                    width={800}
                    height={600}
                    unoptimized={true}
                  />
                </div>
              </div>
            )}
            <button
              className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
              onClick={handleSubmitBankPayment}
            >
              ยืนยันการชำระเงิน
            </button>
            <button
              className="mt-2 w-full bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              onClick={() => {
                setShowBankModal(false);
                setImagePayment("");
              }}
            >
              ปิด
            </button>
          </div>
        </div>
      )}

      {/* QR Code Payment Modal (remains largely unchanged as copy is not applicable here) */}
      {showQrcodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold mb-4">ชำระเงินผ่าน QR Code</h3>
              <p className="text-xl font-bold mb-4 bg-green-100 py-2 px-3 rounded-full">
                ราคา {totalPrice.toLocaleString()} บาท
              </p>
            </div>
            <ul className="space-y-4">
              {bankAccount.length > 0 ? (
                bankAccount.map((account) => (
                  <li key={account._id} className="border p-4 rounded-lg">
                    <p className="font-semibold">{account.bankname}</p>
                    <p>ชื่อบัญชี: {account.accountname}</p>
                    {account.qrcodeImage ? (
                      <div className="mt-2 text-center">
                        <Image
                          src={account.qrcodeImage}
                          alt={`QR Code for ${account.bankname}`}
                          className="max-w-full h-auto rounded-md shadow-md mx-auto"
                          width={200}
                          height={300}
                          unoptimized={true}
                        />
                      </div>
                    ) : (
                      <p className="text-gray-500 mt-2">
                        ไม่มี QR Code สำหรับบัญชีนี้
                      </p>
                    )}
                  </li>
                ))
              ) : (
                <p className="text-gray-600">
                  ไม่พบข้อมูลบัญชีธนาคารที่ใช้งานอยู่.
                </p>
              )}
            </ul>
            <h1 className="text-base mt-5">กรุณาแนบสลิปการโอนของคุณ</h1>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
              <div className="space-y-1 text-center">
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload-qr"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                  >
                    <span>อัพโหลดสลิป</span>
                    <input
                      id="file-upload-qr"
                      name="file-upload-qr"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">แนบสลิปการโอน</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF ขนาดไม่เกิน 10MB
                </p>
              </div>
            </div>
            {imagePayment && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-2">สลิปที่อัปโหลด:</h4>
                <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-md p-2 bg-gray-50 flex justify-center items-center">
                  <Image
                    src={imagePayment}
                    alt="Payment Slip Preview"
                    className="max-w-full h-auto"
                    width={800}
                    height={600}
                    unoptimized={true}
                  />
                </div>
              </div>
            )}
            <button
              className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
              onClick={handleSubmitQrPayment}
            >
              ยืนยันการชำระเงิน
            </button>
            <button
              className="mt-2 w-full bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              onClick={() => {
                setShowQrcodeModal(false);
                setImagePayment("");
              }}
            >
              ปิด
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoomBookingList;
