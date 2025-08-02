import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTree,
  faMotorcycle,
  faShieldHalved,
  faCampground,
} from "@fortawesome/free-solid-svg-icons";

function Camp() {
  return (
    <div
      id="camp"
      className="flex justify-center items-center h-[100vh] bg-[#e0dfd6]"
    >
      <div
        className="container p-5 h-[100vh] items-center flex flex-col gap-7 
          md:flex md:flex-col md:justify-between md:items-center md:gap-[10%]
          lg:gap-[20%] lg:px-10 lg:flex-row-reverse lg:justify-between lg:items-center lg:space-x-10"
      >
        {/* Left Section: Text Content */}
        <div className="w-full md:w-1/2 space-y-6 flex flex-col">
          <h1 className="text-4xl md:text-6xl lg:7xl font-bold">
            Camping สุดชิล
          </h1>
          <p className="text-lg text-gray-800">พักผ่อนอย่างสบายใจ</p>

          {/* Icons Section */}
          <div className="grid grid-cols-3  md:pt-[2vh] lg:pt-[10vh] xl:pt-[10vh] mt-8 text-center">
            <div className="flex flex-row items-center justify-center">
              <FontAwesomeIcon
                icon={faTree}
                className="text-green-500 mb-2"
                style={{ transform: "scale(0.5)" }}
                aria-label="ธรรมชาติ"
              />
              <p className="text-sm w-full text-left">ธรรมชาติ</p>
            </div>
            <div className="flex flex-row items-center justify-center">
              <FontAwesomeIcon
                icon={faCampground}
                className="text-red-500 mb-2"
                style={{ transform: "scale(0.5)" }}
                aria-label="camping"
              />
              <p className="text-sm w-full text-left">แคมปิ้ง</p>
            </div>
            <div className="flex flex-row items-center justify-center">
              <FontAwesomeIcon
                icon={faShieldHalved}
                className="text-blue-500 mb-2"
                style={{ transform: "scale(0.5)" }}
                aria-label="ปลอดภัย"
              />
              <p className="text-sm w-full text-left">ปลอดภัย</p>
            </div>
          </div>
        </div>

        {/* Right Section: ATV Image */}
        <div className="relative w-full md:w-1/2 h-[500px]">
          {/* รูปที่ 1 */}
          <div
            className="absolute top-[-10%] left-[30%] w-[200px] h-[200px] 
                md:w-[200px] md:h-[200px] md:top-[-10%] md:left-[25%]
                lg:w-[300px] lg:h-[300px] lg:top-[-30%] lg:left-[0%]
                xl:w-[300px] xl:h-[300px] xl:top-[-30%] xl:left-[25%]
                overflow-hidden rounded-lg transform"
          >
            <Image
              src="/images/camps.jpg"
              alt="camp"
              fill
              className="object-cover object-center"
            />
          </div>

          {/* รูปที่ 2 */}
          <div
            className="absolute top-10 left-[50%] w-[200px] h-[200px] 
                md:w-[200px] md:h-[200px] md:top-[10%] md:left-[60%]
                lg:w-[300px] lg:h-[300px] lg:top-[10%] lg:left-[50%]
                xl:w-[300px] xl:h-[300px] xl:top-[10%] xl:left-[60%]
                overflow-hidden rounded-lg transform"
          >
            <Image
              src="/images/camp2.jpg"
              alt="camp2"
              fill
              className="object-cover object-center"
            />
          </div>

          {/* รูปที่ 3 */}
          <div
            className="absolute top-10 left-[10%] w-[200px] h-[200px] 
                md:w-[200px] md:h-[200px] md:top-[10%] md:left-[-10%]
                lg:w-[300px] lg:h-[300px] lg:top-[10%] lg:left-[-40%]
                xl:w-[300px] xl:h-[300px] xl:top-[10%] xl:left-[-10%]
                overflow-hidden rounded-lg transform"
          >
            <Image
              src="/images/camp3.jpg"
              alt="camp3"
              fill
              className="object-cover object-center"
            />
          </div>

          {/* รูปที่ 4 */}
          <div
            className="absolute top-[40%] left-[30%] w-[200px] h-[200px] 
                md:w-[200px] md:h-[200px] md:top-[40%] md:left-[25%]
                lg:w-[300px] lg:h-[300px] lg:top-[50%] lg:left-[0%]
                xl:w-[300px] xl:h-[300px] xl:top-[50%] xl:left-[25%]
                overflow-hidden rounded-lg transform"
          >
            <Image
              src="/images/camp4.jpg"
              alt="camp4"
              fill
              className="object-cover object-center"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Camp;
