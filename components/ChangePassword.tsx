"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // التحقق من الحقول
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("جميع الحقول مطلوبة");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("كلمة السر الجديدة يجب أن تكون 8 أحرف على الأقل");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("كلمة السر الجديدة وتأكيدها غير متطابقين");
      return;
    }

    if (oldPassword === newPassword) {
      toast.error("كلمة السر الجديدة يجب أن تكون مختلفة عن القديمة");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("auth_token"); 
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
          new_password_confirmation: confirmPassword,
        }),
      });

      const data = await res.json();

      if (res.ok && data.status) {
        toast.success(data.message || "تم تغيير كلمة السر بنجاح");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.message || "فشل تغيير كلمة السر");
      }
    } catch (err) {
      console.error(err);
      toast.error("خطأ في الاتصال، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
        تغيير كلمة السر
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* كلمة السر القديمة */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            كلمة السر القديمة
          </label>
          <input
            type={showOld ? "text" : "password"}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pro focus:border-pro outline-none transition"
            placeholder="أدخل كلمة السر الحالية"
            required
          />
          <button
            type="button"
            onClick={() => setShowOld(!showOld)}
            className="absolute left-3 top-11 text-gray-500 hover:text-gray-700"
          >
            {showOld ? <FiEyeOff size={22} /> : <FiEye size={22} />}
          </button>
        </div>

        {/* كلمة السر الجديدة */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            كلمة السر الجديدة
          </label>
          <input
            type={showNew ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pro focus:border-pro outline-none transition"
            placeholder="أدخل كلمة سر جديدة (8 أحرف على الأقل)"
            required
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute left-3 top-11 text-gray-500 hover:text-gray-700"
          >
            {showNew ? <FiEyeOff size={22} /> : <FiEye size={22} />}
          </button>
        </div>

        {/* تأكيد كلمة السر */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            تأكيد كلمة السر الجديدة
          </label>
          <input
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pro focus:border-pro outline-none transition"
            placeholder="أعد كتابة كلمة السر الجديدة"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute left-3 top-11 text-gray-500 hover:text-gray-700"
          >
            {showConfirm ? <FiEyeOff size={22} /> : <FiEye size={22} />}
          </button>
        </div>

        {/* زر الإرسال */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full  cursor-pointer py-4 rounded-lg font-bold text-white transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-pro hover:bg-pro-max active:scale-95"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
              جاري التغيير...
            </span>
          ) : (
            "تغيير كلمة السر"
          )}
        </button>
      </form>

      <p className="text-xs text-gray-500 text-center mt-6">
        يجب أن تحتوي كلمة السر الجديدة على 8 أحرف على الأقل
      </p>
    </div>
  );
}
