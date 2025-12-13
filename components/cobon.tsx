"use client";
import { useState } from "react";
import toast from "react-hot-toast";

export default function CoBon() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false); 
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  const handleApply = async () => {
    if (!code.trim()) {
      toast.error("من فضلك أدخل كود الكوبون", { position: "top-left" });
      return;
    }

    setLoading(true); 

    try {
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${baseUrl}/coupon/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          coupon_code: code,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "تم تطبيق الكود بنجاح", {
          position: "top-left",
        });
      } else {
        toast.error(data.message || "الكود غير صحيح", {
          position: "top-left",
        });
      }

      setCode("");
    } catch (error) {
      toast.error("حدث خطأ أثناء الاتصال بالسيرفر", {
        position: "top-left",
      });
      console.error(error);
    }

    setLoading(false); 
  };

  return (
    <div>
      <p className="text-md p-2 text-pro">كوبون كود</p>

      <div className="flex text-sm items-center border border-gray-300 rounded overflow-hidden w-full max-w-sm">

        <input
          type="text"
          value={code}
          placeholder="ادخل الكود"
          onChange={(e) => setCode(e.target.value)}
          disabled={loading}
          className="flex-1 px-4 py-2 text-gray-800 focus:outline-none disabled:bg-gray-100"
        />

        <button 
          onClick={handleApply}
          disabled={loading} 
          aria-label="copon"
          className="bg-gray-200 cursor-pointer text-md text-gray-800 px-5 py-2 hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "جاري..." : "تطبيق"} 
        </button>

      </div>
    </div>
  );
}
