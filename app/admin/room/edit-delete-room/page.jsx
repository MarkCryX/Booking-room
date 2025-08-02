import EditDeleteRoom from "@/app/components/admin/rooms/EditDeleteRoom";
import Sidebar from "@/app/components/Sidebar";


const EditDelteRoom = () => {
  return (
    <div className="h-screen flex ">
      <Sidebar />
      <div className="flex-1 p-10 "> {/* เพิ่ม ml-64 เพื่อเลื่อนเนื้อหาหลักไปขวาให้พ้น Sidebar */}
        <h1 className="text-3xl font-bold ml-10">จัดการห้องพัก</h1>
            <EditDeleteRoom/>
      </div>
    </div>
  );
};

export default EditDelteRoom;
