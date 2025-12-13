"use client";

import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { signOut as nextAuthSignOut, useSession } from "next-auth/react";
import {
  FaAngleDown,
  FaHeart,
  FaQuestionCircle,
} from "react-icons/fa";
import {
  FaArrowRightFromBracket,
  FaClipboardCheck,
  FaMapLocationDot,
  FaUser,
} from "react-icons/fa6";
import Swal from "sweetalert2";
import { useAuth } from "@/src/context/AuthContext";
import Image from "next/image";
// import toast from "react-hot-toast";

export default function DropdownUser() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { fullName, userImage, logout } = useAuth();
  const { data: session } = useSession();

  const displayName = fullName || session?.user?.name || "مستخدم";
  const displayImage =
    userImage || session?.user?.image || "/images/de_user.webp";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!displayName) return null;

  const handleLinkClick = () => setOpen(false);

  const handleLogout = async () => {
  try {
    logout?.();
    await nextAuthSignOut({ redirect: false });
    localStorage.removeItem("favorites");

    Swal.fire({
      icon: "success",
      title: "تم تسجيل الخروج",
      text: "تم تسجيل الخروج بنجاح!",
      timer: 1800,
      showConfirmButton: false,
    });

    setTimeout(() => {
      window.location.href = "/login";
    }, 1800);
  } catch (err) {
    console.error("Logout error:", err);
    Swal.fire({
      icon: "error",
      title: "خطأ",
      text: "فشل تسجيل الخروج، حاول مرة أخرى",
      confirmButtonText: "حسنًا",
    });
  }
};

  return (
    <div className="relative" ref={menuRef}>
      <div
        className="flex items-center md:gap-3 bg-gray-100 text-gray-700 cursor-pointer md:p-2 rounded"
        onClick={() => setOpen(!open)}
      >
        <Image
          src={displayImage}
          alt="User"
          width={32}
          height={32}
          className="rounded-full"
        />
        <div className="md:flex flex-col hidden">
          <p>
            أهلاً , <span className="capitalize">{displayName}</span>
          </p>
        </div>
        <FaAngleDown/>
      </div>

      {/* Dropdown */}
      <div
        className={`absolute top-[4.1rem] end-0 bg-white shadow-2xl rounded-xl p-2 z-50 w-48 flex flex-col transition-all duration-300 ${
          open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-3 pointer-events-none"
        }`}
      >
        <Link href="/myAccount" onClick={handleLinkClick}>
          <div className="flex items-center gap-3 hover:bg-blue-100 cursor-pointer p-2 rounded">
            <FaUser size={18} />
            <p>حسابي</p>
          </div>
        </Link>

        <Link href="/myAccount/orders" onClick={handleLinkClick}>
          <div className="flex items-center gap-3 hover:bg-blue-100 cursor-pointer p-2 rounded">
            <FaClipboardCheck size={18} />
            <p>طلباتي</p>
          </div>
        </Link>

        <Link href="/myAccount/favorites" onClick={handleLinkClick}>
          <div className="flex items-center gap-3 hover:bg-blue-100 cursor-pointer p-2 rounded">
            <FaHeart size={18} />
            <p>منتجاتي المفضلة</p>
          </div>
        </Link>

        <Link href="/myAccount/addresses" onClick={handleLinkClick}>
          <div className="flex items-center gap-3 hover:bg-blue-100 cursor-pointer p-2 rounded">
            <FaMapLocationDot size={18} />
            <p>إدارة العناوين</p>
          </div>
        </Link>

        <Link href="/myAccount/help" onClick={handleLinkClick}>
          <div className="flex items-center gap-3 hover:bg-blue-100 cursor-pointer p-2 rounded">
            <FaQuestionCircle size={18} />
            <p>مركز المساعدة</p>
          </div>
        </Link>

        <div
          onClick={handleLogout}
          className="flex items-center gap-3 hover:bg-blue-100 cursor-pointer text-gray-400 p-2 rounded"
        >
          <FaArrowRightFromBracket size={18} />
          <p>تسجيل الخروج</p>
        </div>
      </div>
    </div>
  );
}
