// api/upload/route.js
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('images'); // รับรูปหลายรูป

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }

    const imageUrls = [];

    for (const file of files) {
      const buffer = await file.arrayBuffer();
      const base64Image = Buffer.from(buffer).toString('base64');
      const dataUri = `data:${file.type};base64,${base64Image}`;

      const uploadResponse = await cloudinary.uploader.upload(dataUri, {
        folder: 'your_folder_name',
      });

      imageUrls.push(uploadResponse.secure_url);
    }

    return NextResponse.json({ imageUrls }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


export async function DELETE(req) {
  try {
    const { publicIds } = await req.json(); // รับ publicId ของรูปที่จะลบจาก request

    if (!publicIds || publicIds.length === 0) {
      return NextResponse.json({ error: 'No public IDs provided' }, { status: 400 });
    }

    const deletePromises = publicIds.map((publicId) =>
      cloudinary.uploader.destroy(publicId)
    );

    await Promise.all(deletePromises); // ลบรูปทั้งหมดที่ได้รับ

    return NextResponse.json({ message: 'Images deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}