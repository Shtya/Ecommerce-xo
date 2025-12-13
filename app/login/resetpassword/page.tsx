"use client";
import { useSearchParams , useRouter  } from "next/navigation";
import { useState } from "react";
import { BiSolidHide, BiSolidShow } from "react-icons/bi";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const otp = searchParams.get("code") || ""; // ← مهم
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const router = useRouter();
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setErrors({});

    const newErrors: { [key: string]: string } = {};

    if (!password.trim()) newErrors.password = "كلمة المرور مطلوبة";
    else if (password.length < 8)
      newErrors.password = "كلمة المرور يجب أن تكون 8 أحرف على الأقل";

    if (confirmPassword !== password)
      newErrors.confirmPassword = "كلمة المرور غير متطابقة";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return; // ← كان ناقص return
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          otp, 
          password,
          password_confirmation: confirmPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("تم إعادة تعيين كلمة المرور بنجاح");
        setPassword("");
        setConfirmPassword("");
           setTimeout(() => {
          router.push("/");
        }, 1000);
      } else {
        setMessage(data.message || "حدث خطأ أثناء إعادة التعيين");
      }
    } catch (err) {
      console.error(err);
      setMessage("فشل الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  // ----------------- UI -----------------
  const inputClasses = (hasError: boolean) =>
    `peer w-full border rounded-lg px-3 pt-4 pb-4 text-gray-800 placeholder-transparent focus:outline-none transition-all ${
      hasError ? "border-red-500" : "focus:border-orange-500 border-gray-300"
    }`;

  const labelClasses = (hasError: boolean) =>
    `absolute right-3 text-base bg-white px-1 text-gray-500 transition-all duration-200
     pointer-events-none
     peer-placeholder-shown:top-1/2 mb-2 peer-placeholder-shown:-translate-y-1/2
     peer-placeholder-shown:text-gray-400
     peer-focus:-top-2 peer-focus:text-sm peer-focus:text-orange-500
     ${hasError ? "text-red-500" : ""}`;

  return (
    <div className="flex flex-col items-center bg-gray-50 px-4 py-10 min-h-screen">
      <div className="bg-white shadow-md rounded-2xl p-8 w-full max-w-md text-center flex flex-col gap-5">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6">
          إعادة تعيين كلمة المرور
        </h1>

        {/* كلمة المرور */}
        <div className="relative w-full">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClasses(!!errors.password)}
            placeholder="كلمة المرور الجديدة"
          />
          <label className={labelClasses(!!errors.password)}>
            كلمة المرور الجديدة
          </label>

          <div
            onClick={() => setShowPassword(!showPassword)}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-700 cursor-pointer"
          >
            {showPassword ? <BiSolidShow size={25} /> : <BiSolidHide size={25} />}
          </div>

          {errors.password && (
            <p className="text-red-500 text-sm text-right mt-1">
              {errors.password}
            </p>
          )}
        </div>

        {/* تأكيد كلمة المرور */}
        <div className="relative w-full">
          <input
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={inputClasses(!!errors.confirmPassword)}
            placeholder="تأكيد كلمة المرور"
          />
          <label className={labelClasses(!!errors.confirmPassword)}>
            تأكيد كلمة المرور
          </label>

          <div
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-700 cursor-pointer"
          >
            {showConfirm ? <BiSolidShow size={25} /> : <BiSolidHide size={25} />}
          </div>

          {errors.confirmPassword && (
            <p className="text-red-500 text-sm text-right mt-1">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        {/* زر */}
        <button
          onClick={handleResetPassword}
          disabled={loading}
          className="bg-blue-950 text-white py-2 rounded-lg hover:bg-blue-900 transition disabled:opacity-70 w-full"
        >
          {loading ? "جاري إعادة التعيين..." : "إعادة تعيين كلمة المرور"}
        </button>

        {/* رسالة */}
        {message && (
          <p
            className={`mt-3 font-semibold ${
              message.includes("نجاح") ? "text-green-600" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
