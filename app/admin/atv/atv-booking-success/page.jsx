import SuccessAtvBooking from "@/app/components/admin/atvs/SuccessAtvBooking";
import Sidebar from "@/app/components/Sidebar";

function page() {
  return (
    <div className="flex bg-gray-50 ">
      <Sidebar />
      <div className="flex-1  p-10">
       
        {/* เพิ่ม ml-64 เลื่อนเนื้อหาหลักไปขวาให้พ้น Sidebar */}
        <SuccessAtvBooking />
      </div>
    </div>
  );
}
export default page;
