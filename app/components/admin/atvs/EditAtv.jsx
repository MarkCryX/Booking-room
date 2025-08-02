"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/app/components/Sidebar";
import Image from "next/image";
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiClock,
  FiDollarSign,
  FiInfo,
  FiUploadCloud,
  FiX,
} from "react-icons/fi";

function EditAtv() {
  const [atvData, setAtvData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedATV, setSelectedATV] = useState(null);
  const [updatedData, setUpdatedData] = useState({
    priceSmall: "",
    priceLarge: "",
    numATVSmall: 0,
    numATVLarge: 0,
    numATVPerRound: 1,
    roundTimes: [],
    description: "",
    images: [],
  });
  const [errorMessage, setErrorMessage] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const cloudinaryUploadUrl = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_URL;

  useEffect(() => {
    const fetchATVs = async () => {
      try {
        const response = await fetch("/api/atvs");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (Array.isArray(data.atvData)) {
          setAtvData(data.atvData);
        } else {
          console.error("API did not return an array for atvData:", data);
          setAtvData([]);
        }
      } catch (error) {
        console.error("Error fetching ATV data:", error);
        setErrorMessage("ไม่สามารถโหลดข้อมูล ATV ได้");
      } finally {
        setLoading(false);
      }
    };

    fetchATVs();
  }, []);

  const openEditModal = (atv) => {
    setSelectedATV(atv);
    setUpdatedData({
      priceSmall: atv.priceSmall,
      priceLarge: atv.priceLarge,
      numATVSmall: atv.numATVSmall,
      numATVLarge: atv.numATVLarge,
      numATVPerRound: atv.numATVPerRound,
      roundTimes: [...atv.roundTimes],
      description: atv.description,
      images: [...atv.images],
    });
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedATV(null);
    setErrorMessage(null);
  };

  const handleRoundTimeChange = (index, value) => {
    const newTimes = [...updatedData.roundTimes];
    newTimes[index] = value;
    setUpdatedData({ ...updatedData, roundTimes: newTimes });
  };

  const addRoundTime = () => {
    setUpdatedData({
      ...updatedData,
      roundTimes: [...updatedData.roundTimes, ""],
    });
  };

  const removeRoundTime = (index) => {
    setUpdatedData({
      ...updatedData,
      roundTimes: updatedData.roundTimes.filter((_, i) => i !== index),
    });
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    const newImages = [];

    if (files.length === 0) return;

    for (let file of files) {
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
          console.error("Cloudinary upload failed:", data);
          setErrorMessage(`ไม่สามารถอัปโหลดรูปภาพ ${file.name} ได้`);
          return;
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        setErrorMessage("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
        return;
      }
    }

    setUpdatedData((prevData) => ({
      ...prevData,
      images: [...prevData.images, ...newImages],
    }));
  };

  const handleRemoveImage = async (imageToRemove) => {
    const confirmRemove = window.confirm(
      "คุณแน่ใจหรือไม่ว่าต้องการลบรูปภาพนี้?"
    );
    if (!confirmRemove) return;

    try {
      const parts = imageToRemove.split("/");
      const publicIdWithExtension = parts[parts.length - 1];
      const publicId = publicIdWithExtension.split(".")[0];

      const response = await fetch("/api/upload", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ publicIds: [publicId] }),
      });

      const deleteResponse = await response.json();
      if (!response.ok && response.status !== 404) {
        throw new Error(
          deleteResponse.error || "ไม่สามารถลบรูปภาพจาก Cloudinary ได้"
        );
      }

      const updatedImages = updatedData.images.filter(
        (img) => img !== imageToRemove
      );
      const dataToUpdateInDb = { ...updatedData, images: updatedImages };

      if (dataToUpdateInDb.numATV !== undefined) {
        delete dataToUpdateInDb.numATV;
      }

      const updateResponse = await fetch("/api/atvs", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          atvId: selectedATV._id,
          updatedData: dataToUpdateInDb,
        }),
      });

      const updateData = await updateResponse.json();
      if (!updateResponse.ok) {
        throw new Error(updateData.error || "ไม่สามารถอัปเดตข้อมูลใน MongoDB");
      }

      setUpdatedData((prevData) => ({
        ...prevData,
        images: updatedImages,
      }));

      setAtvData(
        atvData.map((atv) =>
          atv._id === selectedATV._id ? { ...atv, images: updatedImages } : atv
        )
      );
    } catch (error) {
      console.error("Error removing image:", error);
      setErrorMessage("เกิดข้อผิดพลาดในการลบรูปภาพ: " + error.message);
    }
  };

  const handleUpdateAtv = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (
      updatedData.images.length === 0 ||
      !updatedData.priceSmall ||
      !updatedData.priceLarge ||
      updatedData.roundTimes.length === 0 ||
      !updatedData.description ||
      (updatedData.numATVSmall <= 0 && updatedData.numATVLarge <= 0) ||
      updatedData.numATVPerRound <= 0
    ) {
      setErrorMessage(
        "กรุณากรอกข้อมูลให้ครบถ้วนและระบุจำนวนรถ ATV ทั้งหมดและจำนวนที่จองได้ต่อรอบอย่างถูกต้อง"
      );
      return;
    }
    if (
      updatedData.numATVPerRound >
      parseInt(updatedData.numATVSmall) + parseInt(updatedData.numATVLarge)
    ) {
      setErrorMessage(
        "จำนวน ATV ที่จองได้ต่อรอบ ต้องไม่เกินจำนวน ATV ทั้งหมดที่มี"
      );
      return;
    }

    try {
      const response = await fetch("/api/atvs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          atvId: selectedATV._id,
          updatedData: {
            priceSmall: updatedData.priceSmall,
            priceLarge: updatedData.priceLarge,
            numATVSmall: parseInt(updatedData.numATVSmall),
            numATVLarge: parseInt(updatedData.numATVLarge),
            numATVPerRound: parseInt(updatedData.numATVPerRound),
            roundTimes: updatedData.roundTimes,
            description: updatedData.description,
            images: updatedData.images,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "ไม่สามารถอัปเดตข้อมูลได้");
      }

      setAtvData(
        atvData.map((atv) =>
          atv._id === selectedATV._id ? { ...atv, ...updatedData } : atv
        )
      );
      closeModal();
    } catch (error) {
      setErrorMessage("เกิดข้อผิดพลาดในการอัปเดตข้อมูล: " + error.message);
    }
  };

  const handleDelete = async (atvId) => {
    const confirmDelete = window.confirm(
      "คุณแน่ใจหรือไม่ว่าต้องการลบ ATV นี้?"
    );
    if (!confirmDelete) return;

    try {
      const atvToDelete = atvData.find((atv) => atv._id === atvId);

      if (atvToDelete?.images?.length > 0) {
        const publicIdsToDelete = atvToDelete.images.map((imageUrl) => {
          const parts = imageUrl.split("/");
          const publicIdWithExtension = parts[parts.length - 1];
          return publicIdWithExtension.split(".")[0];
        });

        const response = await fetch("/api/upload", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ publicIds: publicIdsToDelete }),
        });

        const deleteImageResponse = await response.json();
        if (!response.ok && response.status !== 404) {
          console.error(
            "Error deleting images from Cloudinary:",
            deleteImageResponse.error
          );
        }
      }

      const deleteAtvResponse = await fetch("/api/atvs", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ atvId }),
      });

      const deleteAtvData = await deleteAtvResponse.json();
      if (deleteAtvResponse.ok) {
        setAtvData(atvData.filter((atv) => atv._id !== atvId));
      } else {
        throw new Error(deleteAtvData.error || "ไม่สามารถลบ ATV ได้");
      }
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการลบ ATV");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-0" : "ml-0"
        }`}
      >
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                จัดการ ATV
              </h1>
              <p className="text-gray-500 mt-1">
                แก้ไขหรือลบข้อมูล ATV ที่มีอยู่
              </p>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {atvData.map((atv) => (
                <div
                  key={atv._id}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* ATV Image */}
                  <div className="relative w-full h-48">
                    <Image
                      src={atv.images[0] || "/placeholder-atv.jpg"}
                      alt="ATV"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>

                  {/* ATV Info */}
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div>
                        <p className="text-sm text-gray-500">คันเล็ก</p>
                        <p className="font-medium">{atv.priceSmall} บาท</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">คันใหญ่</p>
                        <p className="font-medium">{atv.priceLarge} บาท</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">จำนวนคันเล็ก</p>
                        <p className="font-medium">{atv.numATVSmall} คัน</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">จำนวนคันใหญ่</p>
                        <p className="font-medium">{atv.numATVLarge} คัน</p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-500 mb-1">รอบที่เปิดจอง:</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {atv.roundTimes.map((time, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                        >
                          {time}
                        </span>
                      ))}
                    </div>

                    <p className="text-sm text-gray-500 mb-1">รายละเอียด:</p>
                    <p className="text-sm text-gray-700 line-clamp-2 mb-4">
                      {atv.description}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex justify-between">
                      <button
                        onClick={() => openEditModal(atv)}
                        className="flex items-center gap-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        <FiEdit2 size={16} />
                        <span>แก้ไข</span>
                      </button>
                      <button
                        onClick={() => handleDelete(atv._id)}
                        className="flex items-center gap-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <FiTrash2 size={16} />
                        <span>ลบ</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  แก้ไขข้อมูล ATV
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX size={24} />
                </button>
              </div>

              {errorMessage && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="font-medium">เกิดข้อผิดพลาด</p>
                      <p className="text-sm">{errorMessage}</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleUpdateAtv} className="space-y-6">
                {/* Price Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <FiDollarSign className="text-green-500" />
                      ราคาคันเล็ก
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">฿</span>
                      </div>
                      <input
                        type="number"
                        value={updatedData.priceSmall}
                        onChange={(e) =>
                          setUpdatedData({
                            ...updatedData,
                            priceSmall: e.target.value,
                          })
                        }
                        className="block w-full pl-7 pr-12 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">บาท</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className=" text-sm font-medium text-gray-700 flex items-center gap-2">
                      <FiDollarSign className="text-green-500" />
                      ราคาคันใหญ่
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">฿</span>
                      </div>
                      <input
                        type="number"
                        value={updatedData.priceLarge}
                        onChange={(e) =>
                          setUpdatedData({
                            ...updatedData,
                            priceLarge: e.target.value,
                          })
                        }
                        className="block w-full pl-7 pr-12 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">บาท</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ATV Quantity Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      จำนวนคันเล็กทั้งหมด
                    </label>
                    <input
                      type="number"
                      value={updatedData.numATVSmall}
                      onChange={(e) =>
                        setUpdatedData({
                          ...updatedData,
                          numATVSmall: parseInt(e.target.value) || 0,
                        })
                      }
                      className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      จำนวนคันใหญ่ทั้งหมด
                    </label>
                    <input
                      type="number"
                      value={updatedData.numATVLarge}
                      onChange={(e) =>
                        setUpdatedData({
                          ...updatedData,
                          numATVLarge: parseInt(e.target.value) || 0,
                        })
                      }
                      className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      จำนวนสูงสุดต่อรอบ
                    </label>
                    <input
                      type="number"
                      value={updatedData.numATVPerRound}
                      onChange={(e) =>
                        setUpdatedData({
                          ...updatedData,
                          numATVPerRound: parseInt(e.target.value) || 0,
                        })
                      }
                      className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                      required
                    />
                  </div>
                </div>

                {/* Round Times */}
                <div className="space-y-4">
                  <label className=" text-sm font-medium text-gray-700 flex items-center gap-2">
                    <FiClock className="text-purple-500" />
                    เวลาในแต่ละรอบ
                  </label>

                  <div className="space-y-2">
                    {updatedData.roundTimes.map((time, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="time"
                          value={time}
                          onChange={(e) =>
                            handleRoundTimeChange(index, e.target.value)
                          }
                          className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => removeRoundTime(index)}
                          className="p-2 text-red-500 hover:text-red-700"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addRoundTime}
                      className="flex items-center gap-1 text-blue-500 hover:text-blue-700 text-sm"
                    >
                      <FiPlus />
                      เพิ่มรอบเวลา
                    </button>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <FiInfo className="text-yellow-500" />
                    รายละเอียดเพิ่มเติม
                  </label>
                  <textarea
                    value={updatedData.description}
                    onChange={(e) =>
                      setUpdatedData({
                        ...updatedData,
                        description: e.target.value,
                      })
                    }
                    rows={4}
                    className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Images */}
                <div className="space-y-4">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <FiUploadCloud className="text-blue-500" />
                    รูปภาพ ATV
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
                      <div className="flex text-sm text-gray-600 justify-center">
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
                            onChange={handleImageChange}
                            multiple
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

                  {updatedData.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                      {updatedData.images.map((image, index) => (
                        <div
                          key={index}
                          className="relative aspect-square rounded-lg overflow-hidden border border-gray-200"
                        >
                          <Image
                            src={image}
                            alt={`ATV Image ${index}`}
                            fill
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(image)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs"
                          >
                            ✖
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
}

export default EditAtv;
