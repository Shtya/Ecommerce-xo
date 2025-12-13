"use client";

import AddressForm from "@/components/AddressForm";
import BankPayment from "@/components/BankPayment";
import CoBon from "@/components/cobon";
import InvoiceSection from "@/components/InvoiceSection";
import OrderSummary from "@/components/OrderSummary";
import TotalOrder from "@/components/TotalOrder";
import { AddressI } from "@/Types/AddressI";
import { useState, useEffect } from "react";
import { FiPlus } from "react-icons/fi";
import Button from "@mui/material/Button";
import { useRouter } from "next/navigation";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import Swal from "sweetalert2";

export default function PaymentPage() {
  const [openModal, setOpenModal] = useState(false);
  const [showAddress, setShowAddress] = useState(false);
  const [addresses, setAddresses] = useState<AddressI[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<AddressI | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();
  
  const base_url = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const t = localStorage.getItem("auth_token");
    setToken(t);
  }, []);

  useEffect(() => {
    if (!token) return;

    const fetchAddresses = async () => {
      try {
        const res = await fetch(`${base_url}/addresses`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (res.ok) {
          const result = await res.json();
          if (result.status && result.data) {
            setAddresses(result.data);
            if (result.data.length > 0) {
              setSelectedAddress(result.data[0]);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching addresses:", err);
      }
    };

    fetchAddresses();
  }, [token]);


  const handleNewAddress = (newAddress: AddressI) => {
    setAddresses(prev => [newAddress, ...prev]);
    setSelectedAddress(newAddress);
    setOpenModal(false);
  };

  const handleAddressChange = () => {
    if (addresses.length > 0) {
      setShowAddress(true);
    } else {
      setOpenModal(true);
    }
  };

  const handleSelectAddress = (address: AddressI) => {
    setSelectedAddress(address);
    setShowAddress(false);
  };

 const handleCompletePurchase = async () => {
  if (!paymentMethod) {
    Swal.fire("تنبيه", "يرجى اختيار طريقة الدفع", "warning");
    return;
  }

  setLoading(true);
  try {
    let orderData: any = {};

    if (selectedAddress) {
      orderData = {
        address_id: selectedAddress.id,
        payment_method: paymentMethod,
        notes: notes || `تم الدفع عبر ${getPaymentMethodText(paymentMethod)}`
      };
    } else {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      orderData = {
        shipping_address: "سيتم تحديد العنوان لاحقاً",
        customer_name: user?.name || "العميل",
        customer_phone: user?.phone || "01000000000",
        payment_method: paymentMethod,
        notes: notes || `تم الدفع عبر ${getPaymentMethodText(paymentMethod)}`
      };
    }

    console.log("Sending order data:", orderData);

    const response = await fetch(`${base_url}/order`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    const result = await response.json();
    console.log("API Response:", result);

    if (!response.ok || !result.status) {
      throw new Error(result.message || "حدث خطأ أثناء إنشاء الطلب");
    }

    if (paymentMethod === "cash_on_delivery") {
      Swal.fire("نجاح", "تم إنشاء الطلب بنجاح", "success");
      router.push(`/ordercomplete?orderId=${result.data.id}`);
    } else {
      Swal.fire("انتظار", result.data.message || "جاري توجيهك إلى بوابة الدفع...", "info");
      window.location.href = result.data.payment_url;
    }

  } catch (error: any) {
    console.error("Error creating order:", error);
    Swal.fire("خطأ", error.message || "حدث خطأ أثناء إنشاء الطلب", "error");
  } finally {
    setLoading(false);
  }
};



  const getPaymentMethodText = (method: string) => {
    const methods: { [key: string]: string } = {
      online: "الدفع الإلكتروني",
      cash: "الدفع عند الاستلام"
    };
    return methods[method] || method;
  };

  return (
    <>
      <div className="px-5 lg:px-[7%] xl:px-[18%]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="col-span-1 lg:col-span-2 h-fit">
            <div className="p-2 ps-6 shadow rounded-xl my-4">
              <h2 className="text-2xl font-semibold py-3"> عنوان الشحن</h2>
            </div>
            <div className="flex flex-col shadow rounded-xl my-4 p-6 gap-3">
              <div className="rounded-xl  border border-gray-100 overflow-hidden pt-5 gap-4">
                <div className=" mb-2">
                  <h3 className="border-b border-gray-300 pb-4 ps-4 text-xl font-semibold">
                    عنوان الشحن
                  </h3>
                  <p className="ps-4 py-4 text-gray-700 font-semibold">
                    التوصيل إلى
                    <span> {selectedAddress ? `${selectedAddress.city} - ${selectedAddress.area}` : "لم يتم اختيار عنوان"}</span>
                  </p>
                  {selectedAddress && (
                    <div className="ps-4 pb-4">
                      <p className="text-gray-600">{selectedAddress.details}</p>
                      <p className="text-gray-500">{selectedAddress.full_name} - {selectedAddress.phone}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between bg-gray-50 p-4">
                  <button
                    onClick={() => setOpenModal(true)}
                    className="flex items-center text-pro-max font-bold cursor-pointer"
                  >
                    <FiPlus />
                    <p>أضف عنوان</p>
                  </button>
                  <AddressForm
                    open={openModal}
                    onClose={() => setOpenModal(false)}
                    onSuccess={handleNewAddress}
                  />
                  <button
                    onClick={handleAddressChange}
                    className="text-pro-max underline font-bold cursor-pointer"
                  >
                    تغيير
                  </button>
                </div>
              </div>

              {/* عرض قائمة العناوين عند النقر على تغيير */}
              {showAddress && addresses.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-4 mt-4">
                  <h4 className="font-semibold mb-3">اختر عنوان الشحن:</h4>
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className={`p-3 border rounded-lg cursor-pointer ${
                          selectedAddress?.id === address.id ? 'border-pro-max bg-blue-50' : 'border-gray-200'
                        }`}
                        onClick={() => handleSelectAddress(address)}
                      >
                        <p className="font-semibold">{address.full_name}</p>
                        <p className="text-gray-600">{address.city} - {address.area}</p>
                        <p className="text-gray-500">{address.details}</p>
                        <p className="text-gray-500">{address.phone}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* حقل الملاحظات */}
              <div className="mt-4">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أضف ملاحظات إضافية للطلب (اختياري)..."
                  className="w-full border border-gray-300 rounded-lg p-3 focus:border-pro-max focus:outline-none"
                  rows={3}
                />
              </div>
            </div>
            <div className="p-2 ps-6 shadow rounded-xl my-4">
              <h2 className="text-2xl font-semibold py-3">اختر طريقة الدفع</h2>
            </div>

            <BankPayment onPaymentMethodChange={setPaymentMethod} />
          </div>
          <div className="col-span-1 lg:col-span-1 h-fit mt-4">
            <div className="p-2 shadow mb-1 pb-5 rounded-xl">
              <CoBon />
            </div>

            <div className="p-2 shadow my-3 pb-3 rounded-xl">
              <InvoiceSection />
            </div>
            <div className="p-2 pb-0 shadow mt-3  rounded-xl">
              <OrderSummary />
              <TotalOrder />
              <div className="">
                <Button
                  variant="contained"
                  disabled={loading || !paymentMethod}
                  sx={{
                    fontSize: "1.1rem",
                    backgroundColor: loading ? "#ccc" : "#14213d",
                    "&:hover": { backgroundColor: loading ? "#ccc" : "#0f1a31" },
                    color: "#fff",
                    gap: "10px",
                    paddingX: "20px",
                    paddingY: "10px",
                    borderRadius: "10px",
                    textTransform: "none",
                    width:"100%"
                  }}
                  endIcon={<KeyboardBackspaceIcon />}
                  onClick={handleCompletePurchase}
                >
                  {loading ? "جاري المعالجة..." : "اتمام الشراء"}
                </Button>
                {!paymentMethod && (
                  <p className="text-red-500 text-center mt-2 text-sm">
                    يرجى اختيار طريقة الدفع
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}