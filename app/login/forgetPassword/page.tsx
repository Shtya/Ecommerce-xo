"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgetPasswordPage() {
  const [email, setEmail] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // OTP state (6 digits)
  const [otpDigits, setOtpDigits] = useState(Array(6).fill(""));

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // إرسال الكود
  const handleSendCode = async () => {
    if (!email.trim()) {
      setMessage("من فضلك أدخل بريدك الإلكتروني");
      return;
    }
    try {
      setLoading(true);
      setMessage("");

      const res = await fetch(`${API_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("تم إرسال كود التحقق إلى بريدك الإلكتروني");
        setCodeSent(true);
      } else {
        setMessage(data.message || "حدث خطأ أثناء الإرسال");
      }
    } catch (err) {
      setMessage("فشل الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  // تأكيد الكود
  const handleConfirmCode = async () => {
    const finalCode = otpDigits.join(""); // دمج الخانات

    if (finalCode.length !== 6) {
      setMessage("الرجاء إدخال الكود المكون من 6 أرقام");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await fetch(`${API_URL}/auth/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: finalCode }),
      });

      const data = await res.json();

      setMessage("تم التحقق بنجاح، جاري الانتقال لإعادة تعيين كلمة المرور...");

      router.push(
        `/login/resetpassword?email=${encodeURIComponent(email)}&code=${encodeURIComponent(
          finalCode
        )}`
      );

    } catch (err) {
      setMessage("فشل الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center bg-gray-50 px-4 py-10 min-h-screen">
      <div className="bg-white shadow-md rounded-2xl p-8 w-full max-w-md text-center">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">
          نسيت كلمة المرور
        </h1>
        <p className="text-gray-500 mb-6 text-sm">
          أدخل بريدك الإلكتروني لإرسال كود التحقق
        </p>

        {!codeSent ? (
          // =============================
          //          EMAIL INPUT
          // =============================
          <div className="flex flex-col gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="البريد الإلكتروني"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleSendCode}
              disabled={loading}
              className="bg-blue-950 text-white py-2 rounded-lg hover:bg-blue-900 transition disabled:opacity-70"
            >
              {loading ? "جاري الإرسال..." : "إرسال كود"}
            </button>
          </div>
        ) : (
          // =============================
          //          OTP INPUT
          // =============================
          <div className="flex flex-col gap-4">
            <p className="text-gray-600">تم إرسال الكود إلى بريدك الإلكتروني</p>

            {/* OTP 6 DIGITS */}
            <div className="flex justify-center gap-2">
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/, ""); 
                    const newOtp = [...otpDigits];
                    newOtp[index] = value;
                    setOtpDigits(newOtp);

                    if (value && index < 5) {
                      const next = document.getElementById(`otp-${index + 1}`);
                      next?.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
                      const prev = document.getElementById(`otp-${index - 1}`);
                      prev?.focus();
                    }
                  }}
                  className="w-12 h-12 text-center text-lg font-semibold 
                            border border-gray-300 rounded-lg 
                            focus:border-blue-600 focus:outline-none transition-all"
                />
              ))}
            </div>

            <button
              onClick={handleConfirmCode}
              disabled={loading}
              className="bg-blue-950 text-white py-2 rounded-lg hover:bg-blue-900 transition disabled:opacity-70"
            >
              {loading ? "جاري التحقق..." : "تأكيد الكود"}
            </button>
          </div>
        )}

        {/* رسائل */}
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
