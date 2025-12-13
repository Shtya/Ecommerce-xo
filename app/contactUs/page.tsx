"use client";

import ContactForm from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <section className="px-5 lg:px-[18%] py-16 bg-gray-50 text-gray-800">
      {/* العنوان */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-pro mb-3">اتصل بنا</h2>
        <p className="text-gray-600 text-[15px] max-w-2xl mx-auto">
          للتواصل معنا، يرجى استخدام أي من الوسائل التالية أو إرسال رسالة من خلال الفورم.
        </p>
      </div>

      {/* معلومات التواصل */}
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <div className="bg-white rounded-2xl shadow p-6 text-center">
          <h3 className="font-semibold text-lg text-pro mb-2">الخط الساخن</h3>
          <p className="text-gray-700 text-[15px]">15829</p>
        </div>
  
        <div className="bg-white rounded-2xl shadow p-6 text-center">
          <h3 className="font-semibold text-lg text-pro mb-2">البريد الإلكتروني</h3>
          <p className="text-gray-700 text-[15px]">hello@codexx.com</p>
        </div>
      </div>

      <ContactForm/>

   
    </section>
  );
}
