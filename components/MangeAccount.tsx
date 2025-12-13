"use client";
import React, { useState, useEffect } from "react";
import ChangePassword from "./ChangePassword";
import { motion, AnimatePresence } from "framer-motion";
import { AiOutlineCloseCircle } from "react-icons/ai";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function MangeAccount() {
  const [showModal, setShowModal] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const router = useRouter();

  // -------------------------------
  // تعريف الدالة fetchUserData
  // -------------------------------
  const fetchUserData = async (token: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!data.status) {
        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: data.message || "حدث خطأ أثناء تحميل البيانات",
        });
        return;
      }

      const fullName = data?.data?.name || "";
      const nameParts = fullName.split(" ");

      setFirstName(nameParts[0] || "");
      setLastName(nameParts[1] || "");
      setEmail(data?.data?.email || "");

    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "خطأ في الاتصال",
        text: "تعذر الاتصال بالسيرفر",
      });
    }
  };

  // -------------------------------
  // useEffect مع async داخلي لتجنب تحذير React
  // -------------------------------
  useEffect(() => {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      Swal.fire({
        icon: "warning",
        title: "يجب تسجيل الدخول",
        text: "فضلاً قم بتسجيل الدخول أولاً",
      });
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      await fetchUserData(token);
    };

    fetchData();
  }, []);

  return (
    <div className="mt-0">
      {/* myAccount */}
      <div className="border border-gray-200 rounded-xl p-4 mb-5">
        <h2 className="text-2xl font-semibold text-pro mb-6">حسابي</h2>
        <hr className="bg-gray-50 text-gray-300 mb-5" />

        <form className="grid md:grid-cols-2 gap-6 my-5">
          <div className="flex flex-col">
            <label className="mb-1 font-medium">الإسم الأول</label>
            <input
              type="text"
              placeholder="أدخل الاسم الأول"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-pro focus:ring-1 focus:ring-pro"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium">الإسم الأخير</label>
            <input
              type="text"
              placeholder="أدخل الاسم الأخير"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-pro focus:ring-1 focus:ring-pro"
            />
          </div>
        </form>
      </div>

      {/* privacy */}
      <div className="border border-gray-200 rounded-xl p-4 my-5">
        <h2 className="text-2xl font-semibold text-pro mb-6">الحماية</h2>
        <hr className="bg-gray-50 text-gray-300 mb-5" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <h3 className="text-lg font-medium text-gray-800">كلمة المرور</h3>
            <div className="flex items-center justify-between py-2 my-1 bg-gray-100 rounded px-2">
              <p className="text-gray-500 text-lg p-0.5 rounded ">********</p>

              <button
                aria-label="change password"
                onClick={() => setShowModal(true)}
                className="text-pro font-medium hover:underline cursor-pointer"
              >
                تغيير
              </button>

              <AnimatePresence>
                {showModal && (
                  <motion.div
                    className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowModal(false)}
                  >
                    <motion.div
                      className="p-6 bg-black/25 max-w-md w-full relative"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        className="absolute cursor-pointer top-3 right-3 text-gray-800 hover:text-gray-700 text-xl font-bold"
                        onClick={() => setShowModal(false)}
                      >
                        <AiOutlineCloseCircle size={29} />
                      </button>

                      <ChangePassword />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-800">البريد الألكتروني</h3>
            <div className="bg-gray-100 py-2 my-1 rounded">
              <p className="text-gray-500 text-lg p-0.5 rounded ">{email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
