// lib/auth.js
import axios from 'axios';

let cachedAccessToken = null;
let tokenExpiry = null;

// ฟังก์ชันดึง access token
export async function getAccessToken() {
  // เช็คว่า Access Token ใน cache ยังใช้ได้ไหม (หมดอายุหรือยัง)
  if (cachedAccessToken && tokenExpiry > Date.now()) {
    return cachedAccessToken;
  }

  const url = process.env.AUTH0_MANAGEMENT_TOKEN;
  const clientId = process.env.AUTH0_MANAGEMENT_CLIENT_ID;
  const clientSecret = process.env.AUTH0_MANAGEMENT_CLIENT_SECRET;
  const audience = process.env.AUTH0_AUDIENCE;

  try {
    const response = await axios.post(url, {
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      audience: audience,
    });

    // เก็บ token และเวลาหมดอายุ
    cachedAccessToken = response.data.access_token;
    tokenExpiry = Date.now() + (response.data.expires_in * 1000); 

    return cachedAccessToken;
  } catch (error) {
    console.error("Failed to fetch access token:", error);
    throw new Error("Failed to fetch access token");
  }
}
