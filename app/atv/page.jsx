import Atvbooking from "../components/atv/Atvbooking";
import Navbar from "../components/Navbar";
import { Suspense } from "react";

function page() {
  return (
    <div>
      <Suspense
        fallback={
          <div className="fixed top-0 left-0 right-0 h-20 bg-gray-200 animate-pulse flex justify-center items-center text-gray-600">
            Loading Navigation...
          </div>
        }
      >
        <Navbar />
      </Suspense>

      <Suspense
        fallback={
          // Fallback UI สำหรับ Atvbooking (เช่น skeleton loader หรือข้อความกำลังโหลด)
          <div className="flex justify-center items-center min-h-[calc(100vh-80px)] text-xl text-gray-500">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="ml-4">กำลังโหลดข้อมูล ATV...</p>
          </div>
        }
      >
        <Atvbooking />
      </Suspense>
    </div>
  );
}
export default page;
