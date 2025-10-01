"use client";

import { useState } from "react";
import Image from "next/image";
import Sidebar from "../../Sidebar";
import { useRouter } from "next/navigation";

const CreateRooms = () => {
  const [room, setRoom] = useState({
    roomName: "",
    price: "",
    pricechild: "",
    maxGuests: 1,
    description: "",
    amenities: "",
    images: [],
    status: "พร้อมให้บริการ",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  const cloudinaryUploadUrl = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_URL;

  const handleImageChange = async (e) => {
    const files = e.target.files;
    const newImages = [];
    setIsUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "ml_default");

      try {
        const response = await fetch(cloudinaryUploadUrl, {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        if (data.secure_url) {
          newImages.push(data.secure_url);
        } else {
          alert("ไม่สามารถอัปโหลดรูปภาพได้");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
      }
    }
    setRoom((prevState) => ({
      ...prevState,
      images: [...prevState.images, ...newImages],
    }));
    setIsUploading(false);
  };

  const handleRemoveImage = async (imageToRemove) => {
    try {
      const publicId = imageToRemove.split("/").pop().split(".")[0];

      const response = await fetch("/api/upload", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          publicIds: [publicId],
        }),
      });

      const deleteResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          deleteResponse.error || "ไม่สามารถลบรูปภาพจาก Cloudinary ได้"
        );
      }

      setRoom((prevState) => ({
        ...prevState,
        images: prevState.images.filter((img) => img !== imageToRemove),
      }));
      alert("รูปภาพถูกลบเรียบร้อยแล้ว");
    } catch (error) {
      console.error("Error removing image:", error);
      alert("เกิดข้อผิดพลาดในการลบรูปภาพ");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (room.maxGuests <= 0) {
      alert("จำนวนผู้เข้าพักสูงสุดต้องมากกว่า 0");
      return;
    }

    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...room,
          price: Number(room.price),
          pricechild: Number(room.pricechild),
          maxGuests: Number(room.maxGuests),
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("ห้องถูกสร้างเรียบร้อยแล้ว");
        setRoom({
          roomName: "",
          price: "",
          pricechild: "",
          maxGuests: 1,
          description: "",
          amenities: "",
          images: [],
          status: "พร้อมให้บริการ",
        });
        router.push("/admin/room/edit-delete-room");
      } else {
        alert(data.error || "ไม่สามารถสร้างห้องได้");
      }
    } catch (error) {
      console.error("Error creating room:", error);
      alert("เกิดข้อผิดพลาดในการสร้างห้อง");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-0" : "ml-0"
        }`}
      >
        <div className="p-6 md:p-8 max-w-6xl mx-auto">
          {/* Header with toggle button */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              สร้างห้องพักใหม่
            </h1>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-xl shadow-md"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label
                  htmlFor="roomName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  ชื่อห้อง
                </label>
                <input
                  type="text"
                  id="roomName"
                  value={room.roomName}
                  onChange={(e) =>
                    setRoom({ ...room, roomName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="maxGuests"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  จำนวนผู้เข้าพักสูงสุด
                </label>
                <input
                  type="number"
                  id="maxGuests"
                  value={room.maxGuests}
                  onChange={(e) =>
                    setRoom({ ...room, maxGuests: e.target.value })
                  }
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  ราคาผู้ใหญ่ (ต่อคืน)
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">฿</span>
                  </div>
                  <input
                    type="number"
                    id="price"
                    value={room.price}
                    onChange={(e) =>
                      setRoom({ ...room, price: e.target.value })
                    }
                    className="block w-full pl-7 pr-12 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">บาท</span>
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="pricechild"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  ราคาเด็ก (ต่อคืน)
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">฿</span>
                  </div>
                  <input
                    type="number"
                    id="pricechild"
                    value={room.pricechild}
                    onChange={(e) =>
                      setRoom({ ...room, pricechild: e.target.value })
                    }
                    className="block w-full pl-7 pr-12 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">บาท</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                รายละเอียดเพิ่มเติม
              </label>
              <textarea
                id="description"
                value={room.description}
                onChange={(e) =>
                  setRoom({ ...room, description: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="amenities"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                สิ่งอำนวยความสะดวก (คั่นด้วยคอมม่า)
              </label>
              <input
                type="text"
                id="amenities"
                value={room.amenities}
                onChange={(e) =>
                  setRoom({ ...room, amenities: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="เช่น WiFi, แอร์, โทรทัศน์"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                รูปภาพห้อง
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>อัปโหลดไฟล์</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        multiple
                        onChange={handleImageChange}
                        accept="image/*"
                      />
                    </label>
                    <p className="pl-1">หรือลากและวาง</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF สูงสุด 10MB
                  </p>
                </div>
              </div>
              {isUploading && (
                <div className="text-center mt-2 text-blue-600">
                  กำลังอัปโหลดรูปภาพ...
                </div>
              )}
              {room.images && room.images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {room.images.map((img, index) => (
                    <div key={index} className="relative aspect-square">
                      <Image
                        src={img}
                        alt={`Room image ${index}`}
                        fill
                        className="rounded-md object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(img)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs"
                        aria-label="Remove image"
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-medium"
              >
                สร้างห้อง
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRooms;
