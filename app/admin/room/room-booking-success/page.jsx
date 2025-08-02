import SuccessBooking from "@/app/components/admin/rooms/SuccessBooking"
import Sidebar from "@/app/components/Sidebar"



function page() {
  return (
    <div className=" flex bg-gray-50">
    <Sidebar />
    <div className="flex-1  p-10"> {/* เพิ่ม ml-64 เพื่อเลื่อนเนื้อหาหลักไปขวาให้พ้น Sidebar */}
          <SuccessBooking/>
    </div>
  </div>
  )
}
export default page