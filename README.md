# Booking Room & ATV 🛏️🏍️

ระบบจองห้องพักและ ATV ออนไลน์ รองรับทั้งลูกค้าและผู้ดูแลระบบ  
มีระบบแสดงสถานะการจอง พร้อมฟีเจอร์จัดการข้อมูล

## 🔗 Live Demo
👉 [https://booking-room.vercel.app](https://booking-room-sigma.vercel.app/)3

## 🖼️ Screenshot
![หน้าจอหลัก Booking Room&ATV](https://res.cloudinary.com/dim59skus/image/upload/v1753266921/Screenshot_2025-07-23_173451_jfg1ue.png)
*หน้าแรก - Landing Page ของระบบ*

![หน้าจอง ATV](https://res.cloudinary.com/dim59skus/image/upload/v1753519804/Screenshot_2025-07-26_154748_bouakv.png)
*หน้าจองATV - สำหรับลูกค้า*

![หน้าจองห้องพัก](https://res.cloudinary.com/dim59skus/image/upload/v1753519883/Screenshot_2025-07-26_155052_bsxtov.png)
*หน้าจองห้องพัก - สำหรับลูกค้า*

![หน้ารายการจอง](https://res.cloudinary.com/dim59skus/image/upload/v1753519804/Screenshot_2025-07-26_154901_ykkjl5.png)
*หน้ารายการจอง - สำหรับลูกค้า*

![หน้าจัดการสำหรับแอดมิน](https://res.cloudinary.com/dim59skus/image/upload/v1753519430/Screenshot_2025-07-26_154222_qfxtmt.png)
*หน้าจัดการต่างๆ - สำหรับแอดมิน*


## 🛠 Tech Stack
- Next.js
- Tailwind CSS
- MongoDB
- Auth0 (Authentication)
- Cloudinary (Image Hosting)


## 👤 Customer Features
- 🔐 Secure login/signup ด้วย Auth0
- 📊 แสดงสถานะการจองห้องพักและ ATV อัพเดททุกๆ 10 วินาที
- 🏦 ระบบชำระเงินแบบโอนเงิน พร้อมอัปโหลดสลิปเพื่อยืนยันคำสั่งซื้อ

## 🛠 Admin Features
- 🔐 Admin login ผ่าน Auth0
- 🧾 ระบบ CRUD สำหรับจัดการข้อมูล ATV และห้องพัก
- 👥 แดชบอร์ดสำหรับจัดการบัญชีพนักงาน
- 📦 ระบบจัดการคำสั่งซื้อทั้งหมด
- 📈 Dashboard แสดงรายได้รายวัน รายเดือน และรายปี แบบ interactive



## 🚀 วิธีติดตั้ง

```bash
git clone https://github.com/MarkCryX/Booking-room.git
cd Booking-room
npm install
npm run dev
```

---
## 🔐 Environment Variables (`.env.local`)
---
ก่อนเริ่มรันโปรเจกต์ ให้สร้างไฟล์ `.env.local` ที่ root directory แล้วใส่ค่าต่อไปนี้:

```env
# === Auth0 (ใช้สำหรับการ Login และจัดการผู้ใช้) ===
AUTH0_SECRET=                
AUTH0_BASE_URL=http://localhost:3000   
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com  
AUTH0_CLIENT_ID=            
AUTH0_CLIENT_SECRET=         

# === MongoDB ===
MONGODB_URI=          

# === App Base URL (สำหรับ redirect หรือ API calls ฝั่ง client) ===
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# === Cloudinary (ใช้สำหรับอัปโหลด/จัดการรูปภาพต่างๆและสลิปการโอน) ===
CLOUDINARY_CLOUD_NAME=       
CLOUDINARY_API_KEY=          
CLOUDINARY_API_SECRET=      

# === Auth0 Management API (ใช้สำหรับจัดการ user roles หรือดึงข้อมูล user ฝั่ง admin) ===
AUTH0_MANAGEMENT_TOKEN=            
AUTH0_MANAGEMENT_CLIENT_ID=        
AUTH0_MANAGEMENT_CLIENT_SECRET=   
AUTH0_AUDIENCE=https://your-tenant.auth0.com/api/v2/

# === Custom Endpoint สำหรับการ Register ฝั่ง Admin ===
AUTH_REGISTER=https://your-tenant.auth0.us.auth0.com/api/v2/users
