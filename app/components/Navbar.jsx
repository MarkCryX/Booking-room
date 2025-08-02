"use client";
import { useUser } from "@auth0/nextjs-auth0/client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { CreditCard, LogOut, User, Menu, X, ChevronRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { user } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ตรวจสอบการ scroll เพื่อเปลี่ยนสไตล์ Navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ปิด Mobile Menu เมื่อเปลี่ยนหน้า
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname, searchParams]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div className={`flex justify-between items-center px-4 md:px-8 py-4 fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md text-black' : 'bg-transparent text-white'}`}>
      {/* Logo Section */}
      <div className="flex items-center">
        <Link href="/">
          <Image
            src="/images/logo.png"
            alt="logo"
            width={100}
            height={50}
            priority={true}
            className={isScrolled ? '' : 'invert'}
          />
        </Link>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-8 text-lg font-medium">
        <Link href="/#home" className={`hover:text-green-600 transition-colors ${isScrolled ? 'text-gray-800' : 'text-white'}`}>Home</Link>
        <Link href="/#about" className={`hover:text-green-600 transition-colors ${isScrolled ? 'text-gray-800' : 'text-white'}`}>About</Link>
        <Link href="/#atv" className={`hover:text-green-600 transition-colors ${isScrolled ? 'text-gray-800' : 'text-white'}`}>ATV</Link>
        <Link href="/#camp" className={`hover:text-green-600 transition-colors ${isScrolled ? 'text-gray-800' : 'text-white'}`}>Camp</Link>
        <Link href="/#house" className={`hover:text-green-600 transition-colors ${isScrolled ? 'text-gray-800' : 'text-white'}`}>House</Link>
        <Link href="/#contact" className={`hover:text-green-600 transition-colors ${isScrolled ? 'text-gray-800' : 'text-white'}`}>Contact</Link>
      </div>

      {/* Mobile Menu Button & User Profile/Login Section */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Toggle Button */}
        <button
          className={`md:hidden flex items-center text-3xl focus:outline-none ${isScrolled ? 'text-gray-800' : 'text-white'}`}
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? <X size={32} /> : <Menu size={32} />}
        </button>

        {/* User Profile / Login */}
        <div className="relative">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Image
                  className={`rounded-full cursor-pointer border-2 hover:border-gray-300 transition-colors ${isScrolled ? 'border-gray-300' : 'border-white'}`}
                  src={user.picture || "/images/default-avatar.png"}
                  alt={user.name || "User Avatar"}
                  width={40}
                  height={40}
                  sizes="40px"
                  priority={true}
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white text-gray-800 shadow-lg rounded-md mt-2">
                <DropdownMenuLabel className="font-semibold text-base px-3 py-2">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-200" />
                <DropdownMenuGroup>
                  <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer">
                    <User className="h-4 w-4" />
                    <Link href="/profile" className="w-full">Profile</Link>
                  </DropdownMenuItem>

                  {/* Nested Dropdown for Bookings */}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="flex items-center justify-between w-full px-3 py-2 hover:bg-gray-100 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        <span>รายการที่คุณจอง</span>
                      </div>

                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="w-48 bg-white text-gray-800 shadow-lg rounded-md">
                      <DropdownMenuItem asChild>
                        <Link href="/user?tab=atv" className="w-full px-3 py-2 hover:bg-gray-100">รายการจอง ATV</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/user?tab=booking" className="w-full px-3 py-2 hover:bg-gray-100">รายการจองห้องพัก</Link>
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-gray-200" />
                <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 hover:bg-red-100 text-red-600 cursor-pointer">
                  <LogOut className="h-4 w-4" />
                  <a href="/api/auth/logout" className="w-full">Logout</a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className={`p-2 rounded-md text-base font-medium hover:bg-white hover:text-green-600 transition-colors cursor-pointer ${isScrolled ? 'text-gray-800 border-gray-300 hover:border-gray-300' : 'text-white border-white'}`}>
              <Link href="/api/auth/login">Login</Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 z-40 md:hidden"
          onClick={toggleMobileMenu}
        ></div>
      )}

      {/* Mobile Menu Content */}
      {isMobileMenuOpen && (
        <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col p-6 space-y-6">
          <button
            className="self-end text-gray-800 text-3xl focus:outline-none"
            onClick={toggleMobileMenu}
            aria-label="Close menu"
          >
            <X size={32} />
          </button>
          <nav className="flex flex-col gap-4 text-lg font-medium text-gray-800">
            <Link href="/#home" className="hover:text-green-600 py-2" onClick={toggleMobileMenu}>Home</Link>
            <Link href="/#about" className="hover:text-green-600 py-2" onClick={toggleMobileMenu}>About</Link>
            <Link href="/#atv" className="hover:text-green-600 py-2" onClick={toggleMobileMenu}>ATV</Link>
            <Link href="/#camp" className="hover:text-green-600 py-2" onClick={toggleMobileMenu}>Camp</Link>
            <Link href="/#house" className="hover:text-green-600 py-2" onClick={toggleMobileMenu}>House</Link>
            <Link href="/#contact" className="hover:text-green-600 py-2" onClick={toggleMobileMenu}>Contact</Link>
            
            {user && (
              <>
                <div className="border-t border-gray-200 my-2"></div>
                <Link href="/profile" className="hover:text-green-600 py-2" onClick={toggleMobileMenu}>Profile</Link>
                <div className="pl-4 flex flex-col gap-2">
                  <Link href="/user?tab=atv" className="hover:text-green-600 py-1" onClick={toggleMobileMenu}>รายการจอง ATV</Link>
                  <Link href="/user?tab=booking" className="hover:text-green-600 py-1" onClick={toggleMobileMenu}>รายการจองห้องพัก</Link>
                </div>
                <div className="border-t border-gray-200 my-2"></div>
                <a href="/api/auth/logout" className="hover:text-red-600 py-2" onClick={toggleMobileMenu}>Logout</a>
              </>
            )}
            {!user && (
              <>
                <div className="border-t border-gray-200 my-2"></div>
                <Link href="/api/auth/login" className="hover:text-green-600 py-2" onClick={toggleMobileMenu}>Login</Link>
              </>
            )}
          </nav>
        </div>
      )}
    </div>
  );
};

export default Navbar;