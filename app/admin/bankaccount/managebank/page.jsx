"use client";
import Sidebar from "@/app/components/Sidebar";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FiEdit, FiTrash2, FiPlus, FiX, FiCheck, FiImage } from "react-icons/fi";

const ManageBankAccountATV = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [editFormData, setEditFormData] = useState({
    accountname: "",
    accountnumber: "",
    bankname: "",
    qrcodeImage: "",
    isActive: false,
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch("/api/bankaccounts");
        if (!response.ok) {
          throw new Error("ไม่สามารถดึงข้อมูลบัญชีได้");
        }
        const data = await response.json();
        setAccounts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  const handleDelete = async (id) => {
    if (confirm("คุณแน่ใจที่จะลบบัญชีนี้หรือไม่?")) {
      try {
        const response = await fetch("/api/bankaccounts", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ _id: id }),
        });

        if (!response.ok) {
          throw new Error("ไม่สามารถลบบัญชีได้");
        }

        alert("ลบบัญชีสำเร็จ");

        setAccounts(accounts.filter((account) => account._id !== id));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const openEditModal = (account) => {
    setCurrentAccount(account);
    setEditFormData({
      accountname: account.accountname,
      accountnumber: account.accountnumber,
      bankname: account.bankname,
      qrcodeImage: account.qrcodeImage || "",
      isActive: account.isActive,
    });
    setImagePreview(account.qrcodeImage || null);
    setModal(true);
  };

  const closeModal = () => {
    setModal(false);
    setCurrentAccount(null);
    setImagePreview(null);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditFormData((prev) => ({ ...prev, qrcodeImage: reader.result }));
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch("/api/bankaccounts", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...editFormData, _id: currentAccount._id }),
      });

      if (!response.ok) {
        throw new Error("ไม่สามารถแก้ไขบัญชีได้");
      }

      const updatedAccount = await response.json();

      setAccounts(
        accounts.map((account) =>
          account._id === currentAccount._id ? updatedAccount.data : account
        )
      );

      alert("แก้ไขบัญชีสำเร็จ");
      closeModal();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-md">
        <strong className="font-bold">เกิดข้อผิดพลาด: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row bg-gray-50 min-h-screen"> {/* Adjusted for responsive layout */}
      <Sidebar />
      <div className="flex-1 p-4 md:p-8 md:ml-6"> {/* Added p-4 for mobile padding and md:ml-64 for desktop */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">จัดการบัญชี</h1>
          <Link
            href="/admin/bankaccount/addbank"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-md hover:shadow-lg w-full md:w-auto justify-center" // Added w-full and justify-center for mobile button
          >
            <FiPlus className="text-lg" />
            <span>เพิ่มบัญชี</span>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto"> {/* Ensures table scrolls horizontally on small screens */}
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider md:px-6">ชื่อบัญชี</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider md:px-6">หมายเลขบัญชี</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider md:px-6">ธนาคาร</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider md:px-6">QR Code</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider md:px-6">สถานะการใช้งาน</th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider md:px-6">การกระทำ</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {accounts.length > 0 ? (
                  accounts.map((account) => (
                    <tr key={account._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900 md:px-6">{account.accountname}</td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 md:px-6">{account.accountnumber}</td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 md:px-6">{account.bankname}</td>
                      <td className="px-3 py-4 whitespace-nowrap md:px-6">
                        {account.qrcodeImage ? (
                          <img
                            src={account.qrcodeImage}
                            alt="QR Code"
                            className="h-10 w-10 object-contain border rounded-md md:h-12 md:w-12" // Adjusted image size for mobile
                          />
                        ) : (
                          <span className="text-gray-400 text-xs md:text-sm">ไม่มี QR Code</span>
                        )}
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap md:px-6">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          account.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {account.isActive ? "ใช้งาน" : "ปิดใช้งาน"}
                        </span>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium md:px-6">
                        <div className="flex flex-col md:flex-row justify-end space-y-2 md:space-y-0 md:space-x-2"> {/* Stack buttons on mobile */}
                          <button
                            onClick={() => openEditModal(account)}
                            className="flex items-center justify-center gap-1 text-yellow-600 hover:text-yellow-900 bg-yellow-50 hover:bg-yellow-100 px-3 py-1 rounded-md transition-colors text-sm" // Adjusted text-sm
                          >
                            <FiEdit className="text-base" /> {/* Adjusted icon size */}
                            <span>แก้ไข</span>
                          </button>
                          <button
                            onClick={() => handleDelete(account._id)}
                            className="flex items-center justify-center gap-1 text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors text-sm" // Adjusted text-sm
                          >
                            <FiTrash2 className="text-base" /> {/* Adjusted icon size */}
                            <span>ลบ</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      ไม่พบข้อมูลบัญชี
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Modal */}
        {modal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"> {/* Added max-h and overflow-y-auto for long forms on small screens */}
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">แก้ไขบัญชี ATV</h2>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <FiX className="text-xl" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อบัญชี</label>
                    <input
                      type="text"
                      name="accountname"
                      value={editFormData.accountname}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" // Added text-sm
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">หมายเลขบัญชี</label>
                    <input
                      type="text"
                      name="accountnumber"
                      value={editFormData.accountnumber}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" // Added text-sm
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ธนาคาร</label>
                    <input
                      type="text"
                      name="bankname"
                      value={editFormData.bankname}
                      onChange={handleEditChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" // Added text-sm
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">QR Code</label>
                    <div className="flex flex-col sm:flex-row items-center gap-4"> {/* Changed to flex-col on small screens, then row on sm */}
                      <label className="flex flex-col items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <FiImage className="text-2xl text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">คลิกเพื่ออัปโหลด</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                      {imagePreview && (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-16 w-16 object-contain border rounded-md sm:h-20 sm:w-20" // Adjusted image size for mobile
                        />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="flex items-center h-5">
                      <input
                        id="isActive"
                        name="isActive"
                        type="checkbox"
                        checked={editFormData.isActive}
                        onChange={handleEditChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                      สถานะการใช้งาน
                    </label>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3"> {/* Stack buttons on mobile */}
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto" // Full width on mobile
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleUpdate}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto" // Full width on mobile, center content
                  >
                    <FiCheck />
                    <span>บันทึกการเปลี่ยนแปลง</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageBankAccountATV;