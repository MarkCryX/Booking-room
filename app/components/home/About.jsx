import Image from "next/image";

function About() {
  return (
    <div id="about" className="flex justify-center items-start   bg-[#e0dfd6]">
      <div className=" mt-4  text-center ">
        <h1 className="text-[#2c4c41] text-2xl font-bold mb-2">About</h1>
        <div className="text-black text-3xl font-bold text-center">
          <h5>ยินดีต้อนรับสู่</h5>
          <h5>ไร่หินปูโฮมสเตย์</h5>
        </div>
        <div className="text-black text-xl sm:text-lg text-center px-10 sm:px-10 md:px-10 lg:px-[20vh]">
          <p className="mt-4">
            บ้านพักในธรรมชาติที่เงียบสงบและมีบรรยากาศสบายๆ
            ตั้งอยู่ในพื้นที่ที่เงียบสงบและเต็มไปด้วยธรรมชาติที่คุณสามารถสัมผัสได้ทุกมุมของที่พัก
            เรามีห้องพักหลากหลายประเภทที่เหมาะสมกับทั้งการเดินทางคนเดียวและกลุ่มเพื่อนหรือครอบครัว
            พร้อมสิ่งอำนวยความสะดวกต่างๆ เช่น
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 justify-center items-center  mt-10 px-10">
          <div className="flex flex-col items-center gap-3">
            <i className="fas fa-wifi text-4xl text-[#2c4c41] "></i>
            <p> ฟรี WI-Fi</p>
          </div>

          <div className="flex flex-col items-center gap-3">
            <i className="fas fa-car text-4xl text-[#2c4c41] "></i>
            <p>ที่จอดรถฟรี</p>
          </div>

          <div className="flex flex-col items-center gap-3">
            <i className="fas fa-utensils text-4xl text-[#2c4c41] "></i>
            <p>อาหารเช้าฟรี</p>
          </div>

          <div className="flex flex-col items-center gap-3">
            <i className="fas fa-fire text-4xl text-[#2c4c41] "></i>
            <p>อุปกรณ์ปิ้งย่างฟรี</p>
          </div>
        </div>

        {/* รูปภาพกิจกรรม */}
        <div className="flex justify-center items-center gap-14 mt-20 mb-10 flex-wrap">
          <div className="flex flex-col items-center">
            <div className="w-[450px] h-[300px] relative rounded-lg overflow-hidden">
              <Image
                src="/images/atv.jpg"
                alt="ATV"
                fill
                style={{
                  objectFit: "cover",
                  objectPosition: "bottom",
                }}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="text-center mt-4">
              <h1 className="text-lg font-semibold">ATV Adventure</h1>
              <p className="text-gray-600 break-words max-w-[350px]">
                สนุกสนานไปกับการขับ ATV
                ที่พร้อมจะพาคุณไปลุยสนุกๆด้วยความมันส์เป็นเวลากว่า 3 ชม
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-[450px] h-[300px] relative rounded-lg overflow-hidden">
              <Image
                src="/images/camps.jpg"
                alt="Camp"
                fill
                style={{
                  objectFit: "cover",
                  objectPosition: "center",
                }}
                 sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="text-center mt-4">
              <h1 className="text-lg font-semibold">Camping</h1>
              <p className="text-gray-600 break-words max-w-[350px]">
                มาสนุกกับการตั้งแคมป์ชมบรรยากาศธรรมชาติและเพลิดเพลินกับเนื้อย่างบนเตาถ่านแผนหิน
                พร้อมชมวิวแม่น้ำและแสงไฟแคมป์กลางคืน
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-[450px] h-[300px] relative rounded-lg overflow-hidden">
              <Image
                src="/images/home.jpg"
                alt="Home"
                fill
                style={{
                  objectFit: "cover",
                  objectPosition: "center",
                }}
                 sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="text-center mt-4">
              <h1 className="text-lg font-semibold">House</h1>
              <p className="text-gray-600 break-words max-w-[350px]">
                ห้องพักโฮมสเตย์คุณได้สูดอากาศบริสุทธิ์และพักผ่อนอย่างแท้จริง
                ด้วยห้องพักหลากหลายสไตล์<br/>
                ที่ออกแบบให้กลมกลืนกับธรรมชาติรอบตัว
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default About;
