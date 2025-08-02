"use client";
import React, { useState } from "react";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true); // State to manage sidebar visibility

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 w-64 bg-gray-800 text-white p-4 h-full flex flex-col z-40
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <h1 className="text-2xl font-bold mb-4 text-center">Dashboard</h1>
        <div>
          <a
            href="/admin/room/create-room"
            className="w-full block py-2 px-4 hover:bg-gray-700 rounded"
          >
            สร้างห้อง
          </a>
          <a
            href="/admin/room/edit-delete-room"
            className="w-full block py-2 px-4 hover:bg-gray-700 rounded"
          >
            แก้ไข/ลบ ห้อง
          </a>
          <a
            href="/admin/room/room-booking"
            className="w-full block py-2 px-4 hover:bg-gray-700 rounded"
          >
            จัดการการจองห้อง
          </a>
          <a
            href="/admin/room/room-booking-success"
            className="w-full block py-2 px-4 hover:bg-gray-700 rounded"
          >
            การจองห้องที่สำเร็จแล้ว
          </a>
        </div>
        <hr className="my-4 border-gray-600" />
        <a
          href="/admin/dashboard"
          className="w-full block py-2 px-4 hover:bg-gray-700 rounded"
        >
          แดชบอร์ด
        </a>
        <a
          href="/admin/bankaccount/managebank"
          className="w-full block py-2 px-4 hover:bg-gray-700 rounded"
        >
          จัดการบัญชีธนาคาร
        </a>
        <a
          href="/admin/manageuser"
          className="w-full block py-2 px-4 hover:bg-gray-700 rounded"
        >
          จัดการผู้ใช้
        </a>

        <hr className="my-4 border-gray-600" />

        <div>
          <a
            href="/admin/atv/create-atv"
            className="w-full block py-2 px-4 hover:bg-gray-700 rounded"
          >
            สร้าง ATV
          </a>
          <a
            href="/admin/atv/edit-delete-atv"
            className="w-full block py-2 px-4 hover:bg-gray-700 rounded"
          >
            แก้ไข/ลบ ATV
          </a>
          <a
            href="/admin/atv/atv-booking"
            className="w-full block py-2 px-4 hover:bg-gray-700 rounded"
          >
            จัดการการจอง ATV
          </a>
          <a
            href="/admin/atv/atv-booking-success"
            className="w-full block py-2 px-4 hover:bg-gray-700 rounded"
          >
            การจอง ATV ที่สำเร็จแล้ว
          </a>
        </div>

        {/* Logout button at the bottom */}
        <div className="mt-auto">
          <a
            href="/api/auth/logout"
            className="w-full block py-2 px-4 bg-red-600 hover:bg-red-700 rounded text-center"
          >
            Logout
          </a>
        </div>
      </aside>

      {/* Toggle button for the sidebar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-gray-700 text-white rounded-md"
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        )}
      </button>

      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? "ml-64" : "ml-0"
        }`}
      >
        {/* เนื้อหาหลักของหน้า (Content) จะอยู่ที่นี่ */}
        {/* ตัวอย่าง: <p className="p-4">นี่คือเนื้อหาหลักของคุณ</p> */}
      </div>
    </>
  );
};

export default Sidebar;
