"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const EditDeleteRoom = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [updatedRoom, setUpdatedRoom] = useState({
    roomName: "",
    price: "",
    pricechild: "",
    maxGuests: 1, // เพิ่ม State สำหรับจำนวนผู้เข้าพักสูงสุด
    description: "",
    amenities: "",
    images: [],
    status: "พร้อมให้บริการ",
  });
  const router = useRouter();
  const cloudinaryUploadUrl = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_URL;

  // Fetch rooms from the API
  const fetchRooms = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/rooms`
      );
      const data = await response.json();
      if (response.ok) {
        setRooms(data.rooms);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError("เกิดข้อผิดพลาดในการดึงข้อมูลห้อง");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (room) => {
    setSelectedRoom(room);
    setUpdatedRoom({
      roomName: room.roomName,
      price: room.price,
      pricechild: room.pricechild,
      maxGuests: room.maxGuests || 1, // กำหนดค่าเริ่มต้นเป็น 1 ถ้าไม่มีข้อมูล
      description: room.description,
      amenities: room.amenities,
      images: room.images || [], // ตรวจสอบให้แน่ใจว่าเป็น Array
      status: room.status || "พร้อมให้บริการ",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRoom(null);
  };

  const handleUpdateRoom = async (e) => {
    e.preventDefault();

    // เพิ่มการตรวจสอบ maxGuests
    if (updatedRoom.maxGuests <= 0) {
      alert("จำนวนผู้เข้าพักสูงสุดต้องมากกว่า 0");
      return;
    }

    try {
      const response = await fetch("/api/rooms", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId: selectedRoom._id,
          updatedRoom: {
            ...updatedRoom,
            maxGuests: Number(updatedRoom.maxGuests), // แปลงเป็นตัวเลขก่อนส่ง
          },
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("ห้องได้รับการอัปเดตเรียบร้อยแล้ว");
        closeModal();
        fetchRooms(); // ดึงข้อมูลห้องใหม่หลังจากอัปเดต
      } else {
        alert(data.error || "ไม่สามารถอัปเดตห้องได้");
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการอัปเดตห้อง");
    }
  };

  const deleteRoom = async (roomId) => {
    const confirmDelete = window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบห้องนี้?");
    if (confirmDelete) {
      try {
        const roomResponse = await fetch(`/api/rooms/${roomId}`);
        const roomData = await roomResponse.json();
        if (!roomResponse.ok) {
          throw new Error(roomData.error || "ไม่สามารถดึงข้อมูลห้องได้");
        }

        if (roomData.room && roomData.room.images) {
          const deleteImagePromises = roomData.room.images.map(
            async (imageUrl) => {
              const imageName = imageUrl.split("/").pop().split(".")[0];

              const response = await fetch("/api/upload", {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  publicIds: [imageName],
                }),
              });

              const deleteResponse = await response.json();
              if (!response.ok) {
                throw new Error(deleteResponse.error || "ไม่สามารถลบรูปภาพได้");
              }
            }
          );

          await Promise.all(deleteImagePromises);
        }

        const deleteRoomResponse = await fetch("/api/rooms", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ roomId }),
        });

        const deleteRoomData = await deleteRoomResponse.json();
        if (deleteRoomResponse.ok) {
          alert("ห้องถูกลบเรียบร้อยแล้ว");
          fetchRooms();
        } else {
          alert(deleteRoomData.error || "ไม่สามารถลบห้องได้");
        }
      } catch (error) {
        alert("เกิดข้อผิดพลาดในการลบห้อง");
        console.error(error);
      }
    }
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

      const updatedRoomImages = updatedRoom.images.filter(
        (img) => img !== imageToRemove
      );

      const updatedRoomResponse = await fetch("/api/rooms", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomId: selectedRoom._id,
          updatedRoom: {
            images: updatedRoomImages,
          },
        }),
      });

      const roomData = await updatedRoomResponse.json();

      if (!updatedRoomResponse.ok) {
        throw new Error(
          roomData.error || "ไม่สามารถอัปเดตข้อมูลห้องใน MongoDB"
        );
      }

      setUpdatedRoom((prevState) => ({
        ...prevState,
        images: updatedRoomImages,
      }));
      fetchRooms(); // Refetch rooms to update the main list
    } catch (error) {
      console.error("Error removing image:", error);
      alert("เกิดข้อผิดพลาดในการลบรูปภาพ");
    }
  };

  const handleImageChange = async (e) => {
    const files = e.target.files;
    const newImages = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "ml_default"); // Replace with your Cloudinary preset

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

    setUpdatedRoom((prevState) => ({
      ...prevState,
      images: [...prevState.images, ...newImages],
    }));
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  return (
    <div className="container mx-auto p-4 md:p-8">
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
          <p className="font-bold">เกิดข้อผิดพลาด</p>
          <p>{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {rooms.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              ไม่มีห้องให้บริการ
            </h3>
            <p className="mt-1 text-gray-500">ไม่พบข้อมูลห้องพักในระบบ</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div
                key={room._id}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                {room.images && room.images.length > 0 && (
                  <div className="h-48 relative">
                    <Image
                      src={room.images[0]}
                      alt={`${room.roomName} thumbnail`}
                      layout="fill"
                      objectFit="cover"
                      className="w-full h-full"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {room.roomName}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        room.status === "พร้อมให้บริการ"
                          ? "bg-green-100 text-green-800"
                          : room.status === "ถูกจองแล้ว"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {room.status === "พร้อมให้บริการ"
                        ? "พร้อมให้บริการ"
                        : room.status === "ถูกจองแล้ว"
                        ? "ถูกจองแล้ว"
                        : "อยู่ระหว่างการซ่อมแซม"}
                    </span>
                  </div>

                  <div className="mt-2 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">ราคาผู้ใหญ่:</span>{" "}
                      {room.price} บาท
                    </p>
                    <p>
                      <span className="font-medium">ราคาเด็ก:</span>{" "}
                      {room.pricechild} บาท
                    </p>
                    {/* แสดงจำนวนผู้เข้าพักสูงสุดในหน้ารายการห้อง */}
                    <p>
                      <span className="font-medium">
                        จำนวนผู้เข้าพักสูงสุด:
                      </span>{" "}
                      {room.maxGuests} คน
                    </p>
                  </div>

                  <p className="mt-3 text-gray-700 line-clamp-2">
                    {room.description}
                  </p>

                  {room.amenities && (
                    <div className="mt-3">
                      <h4 className="text-sm font-medium text-gray-800">
                        สิ่งอำนวยความสะดวก:
                      </h4>
                      <p className="text-sm text-gray-600">{room.amenities}</p>
                    </div>
                  )}

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={() => openEditModal(room)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      แก้ไข
                    </button>
                    <button
                      onClick={() => deleteRoom(room._id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      ลบ
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  แก้ไขห้องพัก
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
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
                </button>
              </div>

              <form onSubmit={handleUpdateRoom} className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ชื่อห้อง
                    </label>
                    <input
                      type="text"
                      value={updatedRoom.roomName}
                      onChange={(e) =>
                        setUpdatedRoom({
                          ...updatedRoom,
                          roomName: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      สถานะ
                    </label>
                    <select
                      value={updatedRoom.status}
                      onChange={(e) =>
                        setUpdatedRoom({
                          ...updatedRoom,
                          status: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="พร้อมให้บริการ">พร้อมให้บริการ</option>
                      <option value="ถูกจองแล้ว">ถูกจองแล้ว</option>
                      <option value="อยู่ระหว่างการซ่อมแซม">
                        อยู่ระหว่างการซ่อมแซม
                      </option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {" "}
                  {/* เปลี่ยนเป็น md:grid-cols-3 เพื่อให้มีช่องสำหรับ maxGuests */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ราคาผู้ใหญ่
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">฿</span>
                      </div>
                      <input
                        type="number"
                        value={updatedRoom.price}
                        onChange={(e) =>
                          setUpdatedRoom({
                            ...updatedRoom,
                            price: e.target.value,
                          })
                        }
                        className="block w-full pl-7 pr-12 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">บาท</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ราคาเด็ก
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">฿</span>
                      </div>
                      <input
                        type="number"
                        value={updatedRoom.pricechild}
                        onChange={(e) =>
                          setUpdatedRoom({
                            ...updatedRoom,
                            pricechild: e.target.value,
                          })
                        }
                        className="block w-full pl-7 pr-12 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0.00"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">บาท</span>
                      </div>
                    </div>
                  </div>
                  {/* เพิ่มช่องสำหรับ จำนวนผู้เข้าพักสูงสุด (Max Guests) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      จำนวนผู้เข้าพักสูงสุด
                    </label>
                    <input
                      type="number"
                      value={updatedRoom.maxGuests}
                      onChange={(e) =>
                        setUpdatedRoom({
                          ...updatedRoom,
                          maxGuests: e.target.value,
                        })
                      }
                      min="1" // กำหนดค่าขั้นต่ำเป็น 1
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="จำนวนคน"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    รายละเอียดเพิ่มเติม
                  </label>
                  <textarea
                    value={updatedRoom.description}
                    onChange={(e) =>
                      setUpdatedRoom({
                        ...updatedRoom,
                        description: e.target.value,
                      })
                    }
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    สิ่งอำนวยความสะดวก
                  </label>
                  <input
                    type="text"
                    value={updatedRoom.amenities}
                    onChange={(e) =>
                      setUpdatedRoom({
                        ...updatedRoom,
                        amenities: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="เช่น WiFi, แอร์, โทรทัศน์"
                  />
                </div>

                <div>
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
                  {updatedRoom.images && updatedRoom.images.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {updatedRoom.images.map((img, index) => (
                        <div key={index} className="relative w-full h-40">
                          <Image
                            src={img}
                            alt={`Room image ${index}`}
                            layout="fill"
                            objectFit="cover"
                            className="rounded-md"
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

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    บันทึกการเปลี่ยนแปลง
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditDeleteRoom;
