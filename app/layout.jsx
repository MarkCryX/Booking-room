import { Kanit } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@auth0/nextjs-auth0/client";

const kanit = Kanit({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata = {
  title: "Raihinpoo Homestay",
  description: "Book a room, book an ATV",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* เพิ่มลิงก์ Font Awesome */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
        />
      </head>
      <UserProvider>
        <body className={kanit.className}>{children}</body>
      </UserProvider>
    </html>
  );
}
