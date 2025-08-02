"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/app/components/Sidebar";
import axios from "axios";
import {
  FiEdit2,
  FiTrash2,
  FiUserPlus,
  FiCheck,
  FiX,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";

const UserList = () => {
  // State management (คงเดิมทั้งหมด)
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [roleAssigning, setRoleAssigning] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // States สำหรับฟอร์มสมัครสมาชิกใน modal
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);

  // State สำหรับแแก้ไขข้อมูลผู้ใช้
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // ฟังก์ชันต่างๆ (คงเดิมทั้งหมด)
  const getUsersFromAPI = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/users`
      );
      const fetchedUsers = response.data;
      setUsers(fetchedUsers);
      await fetchRolesForAllUsers(fetchedUsers);
      setLoading(false);
    } catch (error) {
      console.error("ไม่สามารถดึงข้อมูลผู้ใช้ได้:", error);
      setError("ไม่สามารถดึงข้อมูลผู้ใช้ได้.");
      setLoading(false);
    }
  };

  const fetchRolesForAllUsers = async (users) => {
    const updatedUsers = await Promise.all(
      users.map(async (user, index) => {
        if (index > 0)
          await new Promise((resolve) => setTimeout(resolve, 3000));
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/role?userId=${user.user_id}`
          );
          return { ...user, roles: response.data };
        } catch (error) {
          console.error(
            `ไม่สามารถดึงข้อมูลบทบาทสำหรับผู้ใช้ ${user.name}:`,
            error
          );
          return { ...user, roles: [] };
        }
      })
    );
    setUsers(updatedUsers);
  };

  const handleChangeRole = async () => {
    if (!selectedUser || !selectedRole) {
      alert("กรุณาเลือกผู้ใช้และบทบาท");
      return;
    }

    // ตรวจสอบว่ากำลังเปลี่ยน role ของ SuperAdmin หรือไม่
    const isSuperAdmin = selectedUser.roles?.some(
      (role) => role.name === "SuperAdmin"
    );

    if (isSuperAdmin && selectedRole === "rol_9emxSOFVn90peECT") {
      if (
        !confirm(
          "คุณกำลังเปลี่ยนบทบาทผู้ดูแลระบบเป็นปิดบัญชี\n\nคุณแน่ใจหรือไม่? การดำเนินการนี้จะทำให้ผู้ใช้ไม่สามารถเข้าถึงระบบได้"
        )
      ) {
        return;
      }
    }

    setRoleAssigning(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/role`,
        {
          userId: selectedUser.user_id,
          newRoleId: selectedRole,
        }
      );

      if (response.status === 200) {
        alert("เปลี่ยนบทบาทสำเร็จ!");
        getUsersFromAPI();
      }
    } catch (error) {
      console.error(
        "เกิดข้อผิดพลาดในการเปลี่ยนบทบาท:",
        error.response?.data || error.message
      );
      alert(
        error.response?.data?.message ||
          "เกิดข้อผิดพลาดในการเปลี่ยนบทบาท. กรุณาลองอีกครั้ง"
      );
    } finally {
      setRoleAssigning(false);
    }
  };

  const handleSignup = async () => {
    if (!name || !email || !password || !phone) {
      alert("กรุณากรอก Name, Email, Password และเบอร์โทร");
      return;
    }
    if (phone.length !== 10) {
      alert("กรุณากรอกเบอร์โทรให้ถูกต้อง (10 หลัก)");
      return;
    }
    setIsSigningUp(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/users`,
        {
          name: name,
          email: email,
          password: password,
          connection: "Username-Password-Authentication",
          user_metadata: {
            phone_number: phone,
          },
        }
      );
      if (response.status === 200 || response.status === 201) {
        alert("สมัครสมาชิกสำเร็จ!");
        setName("");
        setEmail("");
        setPassword("");
        setPhone("");
        setShowSignupModal(false);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        getUsersFromAPI();
      }
    } catch (error) {
      console.error(
        "เกิดข้อผิดพลาดในการสมัครสมาชิก:",
        error.response?.data || error.message
      );
      alert("สมัครสมาชิกล้มเหลว");
    } finally {
      setIsSigningUp(false);
    }
  };

  const handleEditUser = async () => {
    if (!editName || !editEmail || !editPhone) {
      alert("กรุณากรอกข้อมูลให้ครบ");
      return;
    }
    if (editPhone.length !== 10) {
      alert("กรุณากรอกเบอร์โทร 10 หลัก");
      return;
    }

    setIsUpdating(true);
    try {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/users`,
        {
          userId: selectedUser.user_id,
          name: editName,
          email: editEmail,
          user_metadata: {
            phone_number: editPhone,
          },
        }
      );

      if (response.status === 200) {
        alert("อัปเดตข้อมูลสำเร็จ");
        setEditMode(false);
        setSelectedUser(null);
        getUsersFromAPI();
      }
    } catch (error) {
      console.error(
        "Error updating user:",
        error.response?.data || error.message
      );
      alert("เกิดข้อผิดพลาดในการอัปเดตข้อมูล");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) {
      alert("กรุณาเลือกผู้ใช้ที่ต้องการลบ");
      return;
    }
    if (!confirm("คุณแน่ใจที่จะลบผู้ใช้นี้หรือไม่?")) {
      return;
    }
    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/users?userId=${selectedUser.user_id}`
      );
      if (response.status === 200) {
        alert("ลบผู้ใช้สำเร็จ!");
        setSelectedUser(null);
        getUsersFromAPI();
      }
    } catch (error) {
      console.error(
        "เกิดข้อผิดพลาดในการลบผู้ใช้:",
        error.response?.data || error.message
      );
      alert("เกิดข้อผิดพลาดในการลบผู้ใช้");
    }
  };

  // ใน UserList component
  // useEffect(() => {
  //   const fetchData = async () => {
  //     await getUsersFromAPI();
  //   };

  //   // ดึงข้อมูลทุก 10 วินาที
  //   const intervalId = setInterval(fetchData, 30000);

  //   // ดึงข้อมูลครั้งแรก
  //   fetchData();

  //   return () => clearInterval(intervalId);
  // }, []);

  useEffect(() => {
    getUsersFromAPI();
  }, []);

  return (
    <div className="flex flex-col md:flex-row bg-gray-50 min-h-screen">
      <Sidebar />

      <div className="flex-1 p-4 md:p-8 md:ml-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="ml-2">
            <h1 className="text-3xl font-bold text-gray-800">จัดการผู้ใช้</h1>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
            <button
              onClick={() => setShowSignupModal(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg shadow hover:shadow-lg transition-all duration-300"
            >
              <FiUserPlus size={18} />
              สมัครสมาชิกใหม่
            </button>

            {selectedUser && (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditMode(true);
                    setEditName(selectedUser.name || "");
                    setEditEmail(selectedUser.email || "");
                    setEditPhone(
                      selectedUser.user_metadata?.phone_number || ""
                    );
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-yellow-500 text-white font-medium rounded-lg shadow hover:bg-yellow-600 transition-all duration-300"
                >
                  <FiEdit2 size={16} />
                  แก้ไข
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white font-medium rounded-lg shadow hover:bg-red-600 transition-all duration-300"
                >
                  <FiTrash2 size={16} />
                  ลบ
                </button>
              </div>
            )}
          </div>
        </div>

        {/* User List Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              รายชื่อผู้ใช้
            </h2>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : users.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map((user) => (
                  <div
                    key={user.user_id}
                    className={`p-4 rounded-lg border transition-all duration-300 cursor-pointer ${
                      selectedUser?.user_id === user.user_id
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-blue-300 hover:shadow-sm"
                    }`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-800">
                          {user.name}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">
                          {user.email}
                        </p>
                        <p className="text-gray-500 text-sm mt-1">
                          เบอร์โทร:{" "}
                          {user.user_metadata?.phone_number || "ไม่ระบุ"}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.roles && user.roles.length > 0
                            ? user.roles[0].name === "SuperAdmin"
                              ? "bg-purple-100 text-purple-800"
                              : user.roles[0].name === "Admin"
                              ? "bg-blue-100 text-blue-800"
                              : user.roles[0].name === "Staff"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {user.roles && user.roles.length > 0
                          ? user.roles[0].name === "SuperAdmin"
                            ? "superadmin"
                            : user.roles[0].name === "Admin"
                            ? "admin"
                            // : user.roles[0].name === "Staff"
                            // ? "พนักงานเตรียมอาหาร"
                            : "user"
                          : "ไม่มีบทบาท"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FiX size={32} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-700">
                  ไม่พบผู้ใช้
                </h3>
                <p className="text-gray-500 mt-1">ยังไม่มีผู้ใช้ในระบบ</p>
              </div>
            )}
          </div>
        </div>

        {/* Role Management Section */}
        {selectedUser && (
          <div className="mt-8 bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                จัดการบทบาทสำหรับ:{" "}
                <span className="text-blue-600">{selectedUser.name}</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    เลือกบทบาท
                  </label>
                  <select
                    onChange={(e) => setSelectedRole(e.target.value)}
                    value={selectedRole}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-- เลือกบทบาท --</option>
                    <option value="rol_FvfQZjjmjckQXIlK">superadmin</option>
                    <option value="rol_fbXuD7gYAgHRC6L8">admin</option>
                    {/* <option value="rol_WKjbrdvrddGsTpMt">พนักงานเตรียมอาหาร</option> */}
                    <option value="rol_9emxSOFVn90peECT">user</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleChangeRole}
                    disabled={roleAssigning || !selectedRole}
                    className={`w-full px-6 py-3 rounded-lg font-medium text-white transition-all duration-300 ${
                      roleAssigning || !selectedRole
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-green-500 to-green-600 hover:shadow-lg"
                    }`}
                  >
                    {roleAssigning ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        กำลังดำเนินการ...
                      </span>
                    ) : (
                      "เปลี่ยนบทบาท"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Signup Modal */}
      {showSignupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowSignupModal(false)}
          ></div>
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  สมัครสมาชิกใหม่
                </h2>
                <button
                  onClick={() => setShowSignupModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ชื่อ
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="ชื่อ-นามสกุล"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    อีเมล
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="example@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    รหัสผ่าน
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 pr-10"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <FiEyeOff size={18} />
                      ) : (
                        <FiEye size={18} />
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-red-500">
                    รหัสผ่านต้องมีตัวอักษรเล็ก-ใหญ่และตัวเลข
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    เบอร์โทรศัพท์
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0123456789"
                    maxLength={10}
                  />
                </div>

                <div className="pt-4 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowSignupModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleSignup}
                    disabled={isSigningUp}
                    className={`px-6 py-2 rounded-lg font-medium text-white ${
                      isSigningUp
                        ? "bg-blue-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {isSigningUp ? "กำลังสมัคร..." : "สมัครสมาชิก"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setEditMode(false)}
          ></div>
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  แก้ไขข้อมูลผู้ใช้
                </h2>
                <button
                  onClick={() => setEditMode(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ชื่อ
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    อีเมล
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    เบอร์โทรศัพท์
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    maxLength={10}
                  />
                </div>

                <div className="pt-4 flex justify-end space-x-3">
                  <button
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleEditUser}
                    disabled={isUpdating}
                    className={`px-6 py-2 rounded-lg font-medium text-white ${
                      isUpdating
                        ? "bg-blue-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {isUpdating ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;
