"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { FaTruckFast } from "react-icons/fa6";
import { GoChecklist } from "react-icons/go";
import { IoWalletOutline } from "react-icons/io5";
import { SlLocationPin } from "react-icons/sl";
import OrderProgress from "./OrderProgress";
import Loading from "@/app/loading";
import { ProductI } from "@/Types/ProductsI";
import { strict } from "assert";

interface Props {
  orderId: string;
}

interface OrderItem {
  product_name: string;
  quantity: number;
  price: string;
  options: string ;
  image: string | null;
  product:ProductI
}

interface OrderData {
  order_number: string;
  status: "pending" | "processing" | "delivering" | "completed" | "cancelled" | string;
  status_label: string;
  total_amount: string;
  formatted_total: string;
  customer_name: string;
  customer_phone: string;
  shipping_address: string | null;
  notes: string | null;
  created_at: string;
  items: OrderItem[];
  payment_method_label:string
}

export default function OrderDetailsPage({ orderId }: Props) {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiToken, setApiToken] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = ["تم الطلب", "جاري التنفيذ", "جاري التوصيل", "تم التوصيل"];

  const statusSteps: Record<string, number> = {
    pending: 0,
    processing: 1,
    delivering: 2,
    completed: 3,
    cancelled: 0,
  };

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      setApiToken(token);
    }
  }, []);

  useEffect(() => {
    if (!apiToken) return;

    const fetchOrderDetails = async () => {
      try {
        const res = await fetch(`${baseUrl}/order/${orderId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiToken}`,
          },
        });

        const data = await res.json();
        if (data.status && data.data) {
          const orderData = data.data;

          setCurrentStep(statusSteps[orderData.status] ?? 0);

          orderData.items = orderData.items.map((item: OrderItem) => ({
            ...item,
            options: item.options ? JSON.parse(item.options) : [],
          }));

          setOrder(orderData);
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [apiToken, orderId, baseUrl]);

  if (loading) return <Loading />;
  if (!order) return <p>لم يتم العثور على الطلب</p>;

  return (
    <div className="rounded-2xl lg:px-2 mb-16 w-full">
      {/* Header */}
      <div className="shadow rounded-xl p-3 bg-white text-[#475569] font-semibold pb-4 mb-3">
        <h3 className="text-pro text-[1.6rem] font-bold mb-1">تفاصيل الطلب</h3>
        <p className="mb-1">
          رقم الطلب: <span className="font-bold ms-1">{order.order_number}</span>
        </p>
        <p>
          تاريخ الطلب: <span className="font-bold ms-1">{order.created_at}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        <div className="shadow rounded-2xl pt-3 lg:col-span-2 bg-white h-fit">
          {order.items.map((item, index) => (
            <div key={index} className="mb-4">
              <div className="flex gap-4 ps-4">

                <Image
                  src={item.product.image || "/images/not.jpg"}
                  alt={item.product_name}
                  width={120}
                  height={120}
                  className="rounded-xl w-30 h-25"
                />
             <div className="flex flex-col gap-1">
                  <p className="text-[#323d4b] my-2 font-semibold">{item.product_name}</p>
                  <p className="text-[#383a41b2]">
                    الكمية:
                    <span className="font-semibold mx-1 text-[#475569]">{item.quantity}</span>
                  </p>
                  <p className="text-[#475569]">
                    السعر:
                    <span className="font-semibold mx-1 text-[#475569]">{item.price} جنيه</span>
                  </p>

                  {/* {item.options.length > 0 && (
                    <div className="mt-2">
                      <p className="font-semibold text-[#475569]">الخيارات:</p>
                      
                    </div>
                  )} */}
                </div>
              </div>
            </div>
          ))}


          {order.shipping_address && (
            <div className="flex gap-1 mt-4 items-center ps-4 border-b border-gray-200 pb-4">
              <FaTruckFast size={20} className="scale-x-[-1]" />
              <p className="text-[#696969e6] font-semibold text-[1rem]">
                سيتم التوصيل إلى:
                <span className="font-bold text-[#43454c] mx-1">
                  {order.shipping_address}
                </span>
              </p>
            </div>
          )}

          {/* Progress */}
          {
            order.status === "cancelled"?(
              <div className="p-6 ps-4">
              <p className="text-red-600 font-bold text-lg">تم إلغاء هذا الطلب</p>
            </div>
            ):(
               <div className="p-6 ps-4">
            <OrderProgress steps={steps} currentStep={currentStep} />
          </div>
            )
          }
         

          {/* حالة الطلب */}
          <div className="pb-3 border-t border-gray-200">
            <div
              className={`ms-4 my-3 px-3 rounded-md w-fit text-[0.95rem] py-1 ${
                order.status === "pending"
                  ? "bg-[#fef1df] text-[#a35e00]"
                  : order.status === "completed"
                  ? "bg-[#d1fae5] text-[#065f46]"
                  : order.status === "cancelled"
                  ? "bg-[#fee2e2] text-[#b91c1c]"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {order.status === "pending"
                ? "جاري التنفيذ"
                : order.status === "completed"
                ? "تم التنفيذ"
                : order.status === "cancelled"
                ? "ملغي"
                : order.status}
            </div>
          </div>
        </div>

        {/* ملخص الطلب */}
        <div className="flex flex-col gap-5">
          <div className="shadow rounded-2xl pt-3 bg-white h-fit p-4">
            <div className="flex gap-4 pb-4 border-b border-gray-200 items-center">
              <GoChecklist className="w-9 h-10 p-1.5 rounded bg-blue-50 text-blue-900" />
              <p className="text-[#1f2a4a] font-semibold text-lg">ملخص الطلب</p>
            </div>

            <div className="mt-4 text-[#696969] gap-2.5 font-semibold flex flex-col">
              <div className="flex items-center justify-between">
                <p>المجموع:</p>
                <p className="font-bold">{order.total_amount} جنيه</p>
              </div>

              <div className="flex items-center justify-between">
                <p>الإجمالي النهائي:</p>
                <p className="font-bold text-black">{order.formatted_total}</p>
              </div>
            </div>
          </div>

          {/* طريقة الدفع */}
          <div className="shadow rounded-2xl pt-3 bg-white h-fit p-4 flex items-center gap-4">
            <IoWalletOutline className="w-9 h-10 p-1.5 rounded bg-blue-50 text-blue-900" />
            <div>
              <h5 className="text-xl text-[#696969] font-semibold mb-1.5">طريقة الدفع:</h5>
              <p className="text-[#475569] text-[1rem]">{order.payment_method_label}</p>
            </div>
          </div>

          {/* عنوان الشحن */}
          <div className="shadow rounded-2xl pt-3 bg-white h-fit p-4 flex items-center gap-4">
            <SlLocationPin className="w-9 h-10 p-1.5 rounded bg-blue-50 text-blue-900" />
            <div>
              <h5 className="text-xl text-[#696969] font-semibold mb-1.5">عنوان الشحن:</h5>
              <p className="text-[#475569] font-semibold text-[1rem]">
                {order.shipping_address || "لا يوجد عنوان"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
