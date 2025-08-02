import Image from "next/image";
import Navbar from "./components/Navbar";
import About from "./components/home/About";
import Camp from "./components/home/Camp";
import Atv from "./components/home/Atv";
import Contact from "./components/home/Contact";
import House from "./components/home/House";
import { Suspense } from "react";

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      <Suspense
        fallback={
          <div className="fixed top-0 left-0 right-0 h-20 bg-gray-200 animate-pulse flex justify-center items-center text-gray-600">
            Loading Navigation...
          </div>
        }
      >
        <Navbar />
      </Suspense>
      {/* Hero Section */}
      <div className="w-full h-screen min-h-[600px] max-h-[900px] overflow-hidden relative">
        <Image
          src="/images/pok.jpg"
          alt="Rai Hin Poo Home Stay"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4 text-white">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 drop-shadow-lg">
            RAI HIN POO HOME STAY
          </h1>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-8 drop-shadow-lg">
            ไร่หินปูโฮมสเตย์
          </h2>
          <div className="flex gap-4">
            <a
              href="#atv"
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-3 rounded-md transition-colors"
            >
              จอง ATV
            </a>
            <a
              href="#house"
              className="bg-white hover:bg-gray-100 text-gray-800 font-semibold px-6 py-3 rounded-md transition-colors"
            >
              จองที่พัก
            </a>
          </div>
        </div>
      </div>

      <About />
      <Atv />
      <Camp />
      <House />
      <Contact />
    </main>
  );
}
