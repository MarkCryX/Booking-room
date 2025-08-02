"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/thumbs";
import { useState } from "react";
import Image from "next/image";

function SlideImages({ Room }) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // สถานะเปิด/ปิด modal
  const [currentImage, setCurrentImage] = useState(null); // รูปภาพที่จะแสดงใน modal

  // ฟังก์ชันสำหรับเปิด modal และแสดงรูปภาพ
  const openModal = (image) => {
    setCurrentImage(image);
    setIsModalOpen(true);
  };

  // ฟังก์ชันสำหรับปิด modal
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentImage(null); // เคลียร์รูปภาพเมื่อปิด modal
  };

  return (
    <div className="p-10">
      {Room.images && Room.images.length > 0 && (
        <div className="p-2">
          {/* Swiper หลักสำหรับแสดงรูปภาพใหญ่ */}
          <Swiper
            spaceBetween={10}
            slidesPerView={1}
            navigation={true}
            pagination={{ clickable: true }}
            thumbs={{ swiper: thumbsSwiper }}
            modules={[Navigation, Pagination, Thumbs]}
            className="rounded-lg shadow-md"
          >
            {Room.images.map((image, index) => (
              <SwiperSlide key={index}>
                <div
                  className="relative w-full h-[20rem] sm:h-[25rem] md:h-[30rem] lg:h-[35rem] xl:h-[40rem] rounded-lg cursor-pointer"
                  onClick={() => openModal(image)}
                >
                  <Image
                    src={image}
                    alt={`Room image ${index + 1}`}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 50vw"
                    className="rounded-lg"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      {/* Modal สำหรับแสดงรูปภาพขนาดใหญ่ */}
      {isModalOpen && currentImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="relative bg-white p-2 rounded-lg" // เอา max-w/h ออกจากตรงนี้
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-white bg-gray-800 rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold z-10 hover:bg-gray-700 transition-colors"
              onClick={closeModal}
            >
              &times;
            </button>
           
            <div className="relative w-[90vw] h-[80vh] max-w-4xl max-h-[80vh]">
              <Image
                src={currentImage}
                alt="Enlarged room image"
                fill
                style={{ objectFit: "contain" }}
                // กำหนด sizes ให้เหมาะสมกับขนาดของ Modal
                sizes="(max-width: 768px) 90vw, (max-width: 1200px) 70vw, 600px"
                className="rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      <div className="p-2 mt-4">
        {/* Swiper รองสำหรับแสดงตัวอย่างรูปภาพด้านล่าง */}
        {Room.images && Room.images.length > 0 && (
          <Swiper
            onSwiper={setThumbsSwiper}
            spaceBetween={10}
            slidesPerView={2}
            breakpoints={{
              640: {
                slidesPerView: 3,
                spaceBetween: 10,
              },
              768: {
                slidesPerView: 4,
                spaceBetween: 10,
              },
              1024: {
                slidesPerView: 5,
                spaceBetween: 10,
              },
            }}
            freeMode={true}
            watchSlidesProgress={true}
            modules={[Thumbs]}
            className="mySwiperThumbs rounded-lg shadow-md"
          >
            {Room.images.map((image, index) => (
              <SwiperSlide key={index}>
                <div className="relative w-full h-24 sm:h-28 md:h-32 rounded-lg shadow-md cursor-pointer">
                  <Image
                    src={image}
                    alt={`Thumbnail image ${index + 1}`}
                    fill
                    style={{ objectFit: "cover" }}
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                    className="rounded-lg"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="mt-2">
          <p className="font-semibold text-lg mb-2">รายละเอียดเพิ่มเติม:</p>
          <ul className="list-inside text-left text-gray-700 space-y-1">
            {Room.description.split(",").map((item, index) => (
              <li key={index} className="text-base">
                • {item.trim()}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-2 text-left">
          <p className="font-semibold text-lg mb-2">สิ่งอำนวยความสะดวก:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            {Room.amenities.split(",").map((amenity, index) => (
              <li key={index} className="text-base">
                {amenity.trim()}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default SlideImages;
