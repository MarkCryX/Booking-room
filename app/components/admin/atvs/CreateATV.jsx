"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import Image from "next/image";
import {
  FiPlus,
  FiTrash2,
  FiUploadCloud,
  FiClock,
  FiDollarSign,
  FiInfo,
} from "react-icons/fi";

const CreateATV = () => {
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [priceSmall, setPriceSmall] = useState("");
  const [priceLarge, setPriceLarge] = useState("");
  const [numATVSmall, setNumATVSmall] = useState(0);
  const [numATVLarge, setNumATVLarge] = useState(0);
  const [numATVPerRound, setNumATVPerRound] = useState(1);
  const [roundTimes, setRoundTimes] = useState([""]);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  const cloudinaryUploadUrl = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_URL;

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);
    setImages(files);
  };

  const uploadImagesToCloudinary = async () => {
    const uploadedImageUrls = [];
    for (let file of images) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "ml_default");

      const response = await fetch(cloudinaryUploadUrl, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      uploadedImageUrls.push(data.secure_url);
    }
    return uploadedImageUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (
      images.length === 0 ||
      !priceSmall ||
      !priceLarge ||
      !roundTimes.length ||
      !description ||
      (numATVSmall <= 0 && numATVLarge <= 0) ||
      numATVPerRound <= 0
    ) {
      setError(
        "กรุณากรอกข้อมูลให้ครบถ้วนและระบุจำนวนรถ ATV ทั้งหมดและจำนวนที่จองได้ต่อรอบอย่างถูกต้อง"
      );
      setLoading(false);
      return;
    }

    if (numATVPerRound > numATVSmall + numATVLarge) {
      setError("จำนวน ATV ที่จองได้ต่อรอบ ต้องไม่เกินจำนวน ATV ทั้งหมดที่มี");
      setLoading(false);
      return;
    }

    try {
      const uploadedImageUrls = await uploadImagesToCloudinary();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/atvs`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            images: uploadedImageUrls,
            priceSmall,
            priceLarge,
            numATVSmall,
            numATVLarge,
            numATVPerRound,
            roundTimes,
            description,
          }),
        }
      );

      if (response.ok) {
        setSuccess(true);
        setImages([]);
        setPreviewImages([]);
        setPriceSmall("");
        setPriceLarge("");
        setNumATVSmall(0);
        setNumATVLarge(0);
        setNumATVPerRound(1);
        setRoundTimes([""]);
        setDescription("");
        router.push("/admin/reserveatv/editreserveatv");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "ไม่สามารถสร้าง ATV ได้");
      }
    } catch (error) {
      setError("เกิดข้อผิดพลาดในการสร้าง ATV");
    } finally {
      setLoading(false);
    }
  };

  const addRoundTime = () => {
    setRoundTimes([...roundTimes, ""]);
  };

  const removeRoundTime = (index) => {
    setRoundTimes(roundTimes.filter((_, i) => i !== index));
  };

  const handleRoundTimeChange = (index, value) => {
    const updatedRoundTimes = [...roundTimes];
    updatedRoundTimes[index] = value;
    setRoundTimes(updatedRoundTimes);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-0" : "ml-0"
        }`}
      >
        <div className="p-6 md:p-8 max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                สร้าง ATV ใหม่
              </h1>
            </div>
          </div>

          {/* Alerts */}
          {success && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="font-medium">สร้าง ATV สำเร็จ!</p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-xl shadow-lg space-y-6"
          >
            {/* Images Upload */}
            <div className="space-y-4">
              <label className=" text-lg font-medium text-gray-700 flex items-center gap-2">
                <FiUploadCloud className="text-blue-500" />
                รูปภาพ ATV
              </label>

              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-5 w-5 text-gray-400"
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
                        onChange={handleFileChange}
                        multiple
                        accept="image/*"
                        required
                      />
                    </label>
                    <p className="pl-1">หรือลากและวาง</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF สูงสุด 10MB
                  </p>
                </div>
              </div>

              {previewImages.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {previewImages.map((src, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden border border-gray-200"
                    >
                      <Image
                        src={src}
                        alt={`Preview ${index}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Price Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className=" text-lg font-medium text-gray-700 flex items-center gap-2">
                  <FiDollarSign className="text-green-500" />
                  ราคาคันเล็ก
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">฿</span>
                  </div>
                  <input
                    type="number"
                    value={priceSmall}
                    onChange={(e) => setPriceSmall(e.target.value)}
                    className="block w-full pl-7 pr-12 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">บาท</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className=" text-lg font-medium text-gray-700 flex items-center gap-2">
                  <FiDollarSign className="text-green-500" />
                  ราคาคันใหญ่
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">฿</span>
                  </div>
                  <input
                    type="number"
                    value={priceLarge}
                    onChange={(e) => setPriceLarge(e.target.value)}
                    className="block w-full pl-7 pr-12 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">บาท</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ATV Quantity Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-lg font-medium text-gray-700">
                  จำนวน ATV คันเล็กทั้งหมดที่มี
                </label>
                <input
                  type="number"
                  value={numATVSmall}
                  onChange={(e) =>
                    setNumATVSmall(parseInt(e.target.value) || 0)
                  }
                  className="block w-full py-3 px-4 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-lg font-medium text-gray-700">
                  จำนวน ATV คันใหญ่ทั้งหมดที่มี
                </label>
                <input
                  type="number"
                  value={numATVLarge}
                  onChange={(e) =>
                    setNumATVLarge(parseInt(e.target.value) || 0)
                  }
                  className="block w-full py-3 px-4 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  required
                />
              </div>
            </div>

            {/* ATV Per Round */}
            <div className="space-y-2">
              <label className="block text-lg font-medium text-gray-700">
                จำนวน ATV ที่จองได้สูงสุดต่อรอบ (รวมคันเล็กและคันใหญ่)
              </label>
              <input
                type="number"
                value={numATVPerRound}
                onChange={(e) =>
                  setNumATVPerRound(parseInt(e.target.value) || 0)
                }
                className="block w-full py-3 px-4 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                min="1"
                required
              />
            </div>

            {/* Round Times */}
            <div className="space-y-4">
              <label className=" text-lg font-medium text-gray-700 flex items-center gap-2">
                <FiClock className="text-purple-500" />
                เวลาในแต่ละรอบ
              </label>

              <div className="space-y-3">
                {roundTimes.map((roundTime, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="time"
                      value={roundTime}
                      onChange={(e) =>
                        handleRoundTimeChange(index, e.target.value)
                      }
                      className="block w-full py-3 px-4 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                    {roundTimes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRoundTime(index)}
                        className="flex items-center gap-1 px-3 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                      >
                        <FiTrash2 />
                        <span className="hidden sm:inline">ลบ</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addRoundTime}
                className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors"
              >
                <FiPlus />
                เพิ่มรอบเวลา
              </button>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-lg font-medium text-gray-700 flex items-center gap-2">
                <FiInfo className="text-yellow-500" />
                รายละเอียดเพิ่มเติม
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="block w-full py-3 px-4 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="กรอกรายละเอียดเพิ่มเติม"
                required
              />
            </div>

            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
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
                    <p className="font-medium">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex justify-center items-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
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
                    กำลังสร้าง...
                  </>
                ) : (
                  "สร้าง ATV"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateATV;
