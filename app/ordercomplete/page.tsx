"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { FaAngleLeft } from "react-icons/fa6";
import OrderPayDetails from "@/components/orderPayDetails";
import TotalOrder from "@/components/TotalOrder";
import { TbCopy } from "react-icons/tb";
import OrderProgress from "@/components/OrderProgress";
import Link from "next/link";
import { useCart } from "@/src/context/CartContext";
import { useSearchParams } from "next/navigation";
import { OrderCompleteI } from "@/Types/OrderComplete";

export default function page() {
  const [section, setSection] = useState("orders");
  const steps = ["تم الطلب", "جاري التنفيذ", "جاري التوصيل", "تم التوصيل"];
  const [currentStep, setCurrentStep] = useState(0);
  const [order, setOrder] = useState<OrderCompleteI>();
  const { clearCart } = useCart();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const statusSteps: Record<string, number> = {
    pending: 0,
    processing: 1,
    delivering: 2,
    completed: 3,
    cancelled: 0,
  };
  const subtotalCalc = order?.items?.reduce((sum, item) => {
  return sum + parseFloat(item.price) * item.quantity;
}, 0) || 0;

const responseForTotalOrder = order
  ? {
      status: true,
      data: {
        items_count: order.items?.length || 0,
        subtotal: order.items?.reduce(
          (sum, item) => sum + parseFloat(item.price) * item.quantity,
          0
        ) || 0,
        total: order.items?.reduce(
          (sum, item) => sum + parseFloat(item.price) * item.quantity,
          0
        ) || 0,
        items: order.items || [],
      },
    }
  : null;


  useEffect(() => {
    const emptyCart = async () => {
      try {
        await clearCart();
        console.log("تم تفريغ السلة بنجاح بعد إتمام الطلب");
      } catch (err) {
        console.warn("فشل تفريغ السلة (ربما مفيش إنترنت)", err);
      }
    };

    emptyCart();
  }, [clearCart]);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/order/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
            },
          }
        );
        const data = await res.json();
        setCurrentStep(statusSteps[data.data.status] ?? 0);
        if (data.status) setOrder(data.data);
      } catch (err) {
        console.error("خطأ في جلب بيانات الطلب:", err);
      }
    };
    fetchOrder();
  }, [orderId]);
  return (
    <>
      <div className="px-5 lg:px-[7%] xl:px-[18%] py-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="col-span-1 lg:col-span-2 h-fit shadow p-5 rounded-2xl ">
            {/* باقي الكود زي ما هو... */}
            <div className="flex  items-center gap-3">
              <Image
                src="/images/success.png"
                alt="success"
                width={87}
                height={92}
              />
              <div className="flex flex-col gap-7">
                <div className="flex items-center gap-1 font-semibold text-2xl text-green-600 mt-5">
                  <p>شكراً</p>
                  <p>{order?.customer_name}</p>
                  <p>!</p>
                </div>
                <div className="flex gap-4">
                  <div className="bg-gray-100 px-2  rounded flex items-center gap-1 w-fit">
                    <h6>رقم الطلب </h6>
                    <p>{order?.order_number}</p>
                  </div>
                  <div className="p-2 border  border-gray-200 rounded w-fit cursor-pointer">
                    <TbCopy size={20} className="cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full bg-gray-50 mt-8 flex items-center justify-center my-4 py-4 rounded-xl">
              {order?.status === "cancelled" ? (
                <div className="p-6 ps-4">
                  <p className="text-red-600 font-bold text-lg">
                    تم إلغاء هذا الطلب
                  </p>
                </div>
              ) : (
                <div className="p-6 ps-4">
                  <OrderProgress steps={steps} currentStep={currentStep} />
                </div>
              )}
            </div>
            <div className="p-3 rounded-lg border border-gray-200">
              <h5 className="font-semibold text-xl my-2">حالة الطلب</h5>
              <p className="text-sm mb-2">
                تم استلام طلبك بنجاح. ستصلك رسالة تأكيد عبر البريد الإلكتروني
                <span className="font-semibold">{order?.user?.email}</span>
              </p>
              <Link href={`/myAccount/${orderId}`}>
                <div className="flex items-center gap-0.5 font-semibold text-md cursor-pointer text-pro-max mb-2">
                  <p>تتبع طلبك</p>
                  <FaAngleLeft />
                </div>
              </Link>
            </div>
            <div className="p-3 rounded-lg border border-gray-200 mt-5">
              <h5 className="font-semibold text-xl my-2">عنوان الشحن</h5>
              <div className="flex flex-col text-black/75 text-md my-3">
                <p>{order?.full_address?.full_name}</p>
                <p>{order?.full_address?.details}</p>
                <p>{order?.full_address?.phone}</p>
              </div>
            </div>
            <div className="p-3 rounded-lg border border-gray-200 mt-5">
              <h5 className="font-semibold text-xl my-2">طريقة الدفع</h5>
              <div className="flex items-center gap-1 my-2">
                <Image
                  src="/images/cod.png"
                  alt="payment method"
                  width={55}
                  height={33}
                />
                <p className="text-lg text-black/90 ">
                  {order?.payment_method_label}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between my-2">
              <div className="flex items-center gap-1">
                <p>إذا كنت بحاجة إلى أي دعم</p>
                <span>|</span>
                <Link href="/myAccount/help" className=" underline ">
                  مركز المساعدة
                </Link>
              </div>
              <div className="px-4 bg-pro text-white py-2 rounded w-fit">
                <Link href="/">اضافه طلب جديد</Link>
              </div>
            </div>
          </div>
          <div className="col-span-1 lg:col-span-1 h-fit ">
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <h2 className="font-semibold text-2xl mb-4">تفاصيل الطلب</h2>
              {order?.items?.map((prot, index) => (
                <div key={index}>
                  <OrderPayDetails item={prot} />
                </div>
              ))}
            </div>

            <div className="bg-white rounded-lg shadow p-5">
              <h2 className="font-semibold text-2xl mb-4">ملخص الطلب</h2>
              <TotalOrder response={responseForTotalOrder} />

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
