"use client";

import { useState } from "react";
import Swal from "sweetalert2";

interface FormData {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  message: string;
  company: string;
}

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [form, setForm] = useState<FormData>({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    message: "",
    company: "",
  });

  const base_url = "https://ecommecekhaled.renix4tech.com/api/v1/contact-us";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });

    // Remove error when typing
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!form.first_name) newErrors.first_name = "هذا الحقل مطلوب";
    if (!form.last_name) newErrors.last_name = "هذا الحقل مطلوب";
    if (!form.phone) newErrors.phone = "هذا الحقل مطلوب";

    // Email validation
    if (!form.email) {
      newErrors.email = "هذا الحقل مطلوب";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "صيغة البريد الإلكتروني غير صحيحة";
    }

    if (!form.message) newErrors.message = "هذا الحقل مطلوب";
    if (!form.company) newErrors.company = "هذا الحقل مطلوب";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      const res = await fetch(base_url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.status) {
        Swal.fire({
          icon: "success",
          title: "تم الإرسال بنجاح",
          text: "سنتواصل معك قريبًا.",
          confirmButtonText: "موافق",
        });

        // Clear form
        setForm({
          first_name: "",
          last_name: "",
          phone: "",
          email: "",
          message: "",
          company: "",
        });

        setErrors({});
      } else {
        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: "حدث خطأ أثناء الإرسال",
        });
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "خطأ في الاتصال",
        text: "تعذر الاتصال بالسيرفر",
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: string) =>
    `border rounded px-3 py-2 transition duration-200
   ${errors[field] ? "border-red-500" : "border-gray-300"}
   focus:border-orange-400 focus:ring-0 focus:outline-none`;

  return (
    <div className="bg-white rounded-2xl shadow p-8 md:p-12 mb-16">
      <h3 className="text-2xl font-semibold text-pro mb-6">أرسل لنا رسالة</h3>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
        {/* first name */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium">الإسم الأول</label>
          <input
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            className={inputClass("first_name")}
            placeholder="أدخل الاسم الأول"
          />
          {errors.first_name && (
            <span className="text-red-500 text-sm">{errors.first_name}</span>
          )}
        </div>

        {/* last name */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium">الإسم الأخير</label>
          <input
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            className={inputClass("last_name")}
            placeholder="أدخل الاسم الأخير"
          />
          {errors.last_name && (
            <span className="text-red-500 text-sm">{errors.last_name}</span>
          )}
        </div>

        {/* phone */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium">رقم الهاتف</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className={inputClass("phone")}
            placeholder="أدخل رقم الهاتف"
          />
          {errors.phone && (
            <span className="text-red-500 text-sm">{errors.phone}</span>
          )}
        </div>

        {/* email */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium">البريد الإلكتروني</label>
          <input
            name="email"
            type="text" // نص وليس email
            value={form.email}
            onChange={handleChange}
            className={inputClass("email")}
            placeholder="أدخل بريدك الإلكتروني"
          />
          {errors.email && (
            <span className="text-red-500 text-sm">{errors.email}</span>
          )}
        </div>

        {/* message */}
        <div className="flex flex-col md:col-span-2">
          <label className="mb-1 font-medium">رسالة</label>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            rows={5}
            className={inputClass("message")}
            placeholder="فضلاً أدخل رسالتك"
          ></textarea>
          {errors.message && (
            <span className="text-red-500 text-sm">{errors.message}</span>
          )}
        </div>

        {/* company */}
        <div className="flex flex-col md:col-span-2">
          <label className="mb-1 font-medium">الشركة</label>
          <input
            name="company"
            value={form.company}
            onChange={handleChange}
            className={inputClass("company")}
            placeholder="اسم الشركة"
          />
          {errors.company && (
            <span className="text-red-500 text-sm">{errors.company}</span>
          )}
        </div>

        <button
          type="submit"
          aria-label="submit form"
          disabled={loading}
          className="bg-pro text-white py-3 rounded-xl mt-4 md:col-span-2 hover:bg-pro-max transition"
        >
          {loading ? "جاري الإرسال..." : "إرسال"}
        </button>
      </form>
    </div>
  );
}
