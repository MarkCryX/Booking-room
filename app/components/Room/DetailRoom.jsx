


import SlideImages from "./SlideImages";
import FormDetail from "./FormDetail";

function RoomDetail({ room }) {
  const Room = room; //ข้อมูลห้อง
  

  
  
  return (
    <div className="h-full">
      <div className="grid grid-cols-1 text-center sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2  ">
        <SlideImages Room={Room}/>
        <FormDetail Room={Room}/>
      </div>
    </div>
  );
}

export default RoomDetail;
