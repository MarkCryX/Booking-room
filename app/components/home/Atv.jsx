import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTree,
  faMotorcycle,
  faShieldHalved,
} from "@fortawesome/free-solid-svg-icons";

function Atv() {
  return (
    <div
      id="atv"
      className="bg-gradient-to-r from-[#448c50] to-[#295230] text-white h-[80vh] flex items-center justify-center px-5"
    >
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
        {/* Left Section: Text Content */}
        <div className="w-full md:w-1/2 space-y-6 flex flex-col">
          <h1 className="text-3xl mt-5 lg:text-6xl md:text-6xl font-bold ">
            โปรดเช่ารถ ATV ของเรา
          </h1>
          <p className="text-lg text-gray-300">
            สัมผัสประสบการณ์ขับขี่สุดเร้าใจ
          </p>
          <div className="flex space-x-4">
            <button
              className="bg-yellow-500 text-black px-6 py-3 font-semibold rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
              aria-label="เลือก ATV"
            >
              <a href="/atv">เช่ารถ ATV</a>
            </button>
          </div>

          {/* Icons Section */}
          <div className="grid grid-cols-3 pt-[10vh] mt-8 text-center">
            <div className="flex flex-row items-center justify-center">
              <FontAwesomeIcon
                icon={faTree}
                className="text-yellow-500 mb-2"
                style={{ transform: "scale(0.5)" }}
                aria-label="ธรรมชาติ"
              />
              <p className="text-sm w-full text-left">ธรรมชาติ</p>
            </div>
            <div className="flex flex-row items-center justify-center">
              <FontAwesomeIcon
                icon={faMotorcycle}
                className="text-yellow-500 mb-2"
                style={{ transform: "scale(0.5)" }}
                aria-label="ผจญภัย"
              />
              <p className="text-sm w-full text-left">ผจญภัย</p>
            </div>
            <div className="flex flex-row items-center justify-center">
              <FontAwesomeIcon
                icon={faShieldHalved}
                className="text-yellow-500 mb-2"
                style={{ transform: "scale(0.5)" }}
                aria-label="ปลอดภัย"
              />
              <p className="text-sm w-full text-left">ปลอดภัย</p>
            </div>
          </div>
        </div>

        {/* Right Section: ATV Image */}
        <div className="w-full md:w-1/2 flex justify-center md:justify-end relative mt-8 md:mt-0">
          <div className="relative md:left-9 w-full md:w-[700px] h-[300px] md:h-[500px]">
            <Image
              src="/images/showatv.png"
              alt="ATV รถขับขี่"
              fill
              style={{
                objectFit: "contain",
                objectPosition: "center",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Atv;
