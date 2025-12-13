"use client";

import Loading from "@/app/loading";
import { useEffect, useRef, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState(0);
  const base_url = "https://ecommecekhaled.renix4tech.com/api/v1";

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const res = await fetch(`${base_url}/faqs`);
        const data = await res.json();
        if (data.status) {
          setFaqs(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  if (loading) return <Loading />;
  if (faqs.length === 0) return <p>لا توجد أسئلة شائعة لعرضها</p>;

  return (
    <div className="mx-5 md:mx-[10%] lg:mx-[14%] py-6">
      <h1 className="text-2xl font-bold mb-6">الأسئلة الشائعة</h1>

      <div className="flex flex-col gap-5">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;

          return (
            <div
              key={faq.id}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* العنوان */}
              <button
              aria-label="open tabs"
                onClick={() => setOpenIndex(isOpen ? -1 : index)}
                className="w-full text-right p-4 cursor-pointer bg-orange-50 hover:bg-orange-100 font-semibold flex justify-between items-center"
              >
                <span>{faq.question}</span>

         
                <span
                  className={`transform transition-transform duration-300 ${
                    isOpen ? "rotate-180" : "rotate-0"
                  }`}
                >
                  <IoIosArrowDown />
                </span>
              </button>

           
              <div
                className={`transition-all duration-500 ease-in-out overflow-hidden ${
                  isOpen ? "max-h-[500px]" : "max-h-0"
                }`}
              >
                <div className="p-4 text-gray-700">
                  <p>{faq.answer}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
