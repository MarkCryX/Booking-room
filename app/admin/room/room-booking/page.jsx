import BookingDetail from "@/app/components/admin/rooms/BookingDetail";
import Sidebar from "@/app/components/Sidebar";

function OrderPage() {
  return (
    <div className="h-screen flex bg-white">
      <Sidebar />
      <div className="flex-1 p-10">
        <BookingDetail />
      </div>
    </div>
  );
}
export default OrderPage;
