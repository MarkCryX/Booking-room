import AtvBooking from "@/app/components/admin/atvs/AtvBooking"
import Sidebar from "@/app/components/Sidebar"



function page() {
  return (
    <div className="h-screen flex bg-gray-100">
    <Sidebar />
    <div className="flex-1  p-10">
      {/* <h1 className="text-3xl font-bold">Booking</h1> */}
      <AtvBooking/>
    </div>
  </div>
  )
}
export default page