"use client";
import AddressForm from "@/components/AddressForm";
import { AddressI } from "@/Types/AddressI";
import { useState, useEffect } from "react";
import { FiPlus, FiEdit, FiTrash2 } from "react-icons/fi";
import Swal from "sweetalert2";

export default function Page() {
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressI | null>(null);
  const [addresses, setAddresses] = useState<AddressI[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const base_url =process.env.NEXT_PUBLIC_API_URL;

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
        const result = await res.json();
        if (res.ok && result.status) setAddresses(result.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAddresses();
  }, [token]);

  const handleNewAddress = (newAddress: AddressI) => {
    setAddresses((prev) => {
      const exists = prev.find((a) => a.id === newAddress.id);
      if (exists) {
        return prev.map((a) => (a.id === newAddress.id ? newAddress : a));
      }
      return [newAddress, ...prev];
    });
  };

  const handleDelete = async (id: number) => {
    if (!token) {
      Swal.fire("تنبيه", "يجب تسجيل الدخول", "warning");
      return;
    }

    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من التراجع عن الحذف!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${base_url}/addresses/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        const data = await res.json();
        if (!res.ok || !data.status) throw new Error(data.message || "حدث خطأ");
        setAddresses((prev) => prev.filter((a) => a.id !== id));
        Swal.fire("تم الحذف!", "تم حذف العنوان بنجاح.", "success");
      } catch (err: any) {
        Swal.fire("خطأ", err.message || "حدث خطأ أثناء الحذف", "error");
      }
    }
  };

  const handleEdit = (address: AddressI) => {
    setEditingAddress(address);
    setOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between">
        <h2 className="text-[#252525] font-bold text-[1.7rem]">
          إدارة العناوين
        </h2>
        <button
          onClick={() => {
            setEditingAddress(null);
            setOpen(true);
          }}
          className="cursor-pointer p-1 bg-gray-50 rounded-md px-2 hover:bg-gray-100 text-[1.1rem]"
        >
          <div className="flex items-center">
            <FiPlus size={20} />
            <p className="font-semibold"> اضافه عنوان</p>
          </div>
        </button>
      </div>

      <AddressForm
        open={open}
        onClose={() => setOpen(false)}
        initialData={editingAddress || undefined}
        onSuccess={handleNewAddress}
      />

      <div className="flex flex-col gap-4 mt-7">
        <div className="flex flex-col gap-4 mt-7">
          {addresses.length > 0 ? (
            addresses.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedAddress(item.id)}
                className={`cursor-pointer rounded-2xl border transition-all duration-300 ${
                  selectedAddress === item.id
                    ? "border-orange-500"
                    : "border-gray-200"
                }`}
              >
                <div
                  className={`flex items-center justify-between border-b rounded-2xl rounded-bl-none rounded-br-none border-gray-200 p-4 ${
                    selectedAddress === item.id ? "bg-orange-100" : "bg-gray-50"
                  }`}
                >
                  <h4 className="text-[#000000de] font-semibold text-xl">
                    {item.city} - {item.area}
                  </h4>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-pro cursor-pointer bg-transparent hover:bg-gray-100"
                    >
                      <FiEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-500 cursor-pointer hover:text-red-800"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="px-4 py-3 flex flex-col gap-1">
                  <h5>{item.full_name}</h5>
                  <p>{item.details}</p>
                  <p>{item.phone}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center mt-4">
              لا يوجد عناوين لعرضها
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
