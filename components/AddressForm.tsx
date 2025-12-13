"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { IoCloseSharp } from "react-icons/io5";
import Button from "@mui/material/Button";
import { motion, AnimatePresence } from "framer-motion";
import { AddressI } from "@/Types/AddressI";

interface AddressFormProps {
  open: boolean;
  onClose: () => void;
  initialData?: AddressI;
  onSuccess?: (newAddress: AddressI) => void;
}

interface AddressFormInputs {
  id?: number;
  firstName: string;
  lastName: string;
  building?: string;
  floor: string;
  apartment: string;
  details: string;
  nickname: string;
  phone: string;
  city: string;
  area: string;
  addressType: string;
}

const schema = yup.object().shape({
  firstName: yup.string().required("الإسم الأول مطلوب"),
  lastName: yup.string().required("الإسم الأخير مطلوب"),
  floor: yup.string().required("الدور مطلوب"),
  apartment: yup.string().required("رقم الشقة مطلوب"),
  nickname: yup.string().required("العنوان مختصر مطلوب"),
  details: yup.string().required("تفاصيل العنوان مطلوبة"),
  phone: yup
    .string()
    .matches(/^01[0-9]{9}$/, "رقم الهاتف غير صحيح")
    .required("رقم الهاتف مطلوب"),
  city: yup.string().required("المدينة مطلوبة"),
  area: yup.string().required("المنطقة مطلوبة"),
  addressType: yup.string().required("نوع العنوان مطلوب"),
});

export default function AddressForm({
  open,
  onClose,
  initialData,
  onSuccess,
}: AddressFormProps) {
  const base_url = process.env.NEXT_PUBLIC_API_URL;
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<AddressFormInputs>({
    resolver: yupResolver(schema),
  });

  const selectedType = watch("addressType");

  useEffect(() => {
    if (initialData) {
      setValue("firstName", initialData.full_name.split(" ")[0] || "");
      setValue("lastName", initialData.full_name.split(" ")[1] || "");
      setValue("building", initialData.building || "");
      setValue("floor", initialData.floor || "");
      setValue("apartment", initialData.apartment_number || "");
      setValue("details", initialData.details || "");
      setValue("nickname", initialData.label || "");
      setValue("phone", initialData.phone || "");
      setValue("city", initialData.city);
      setValue("area", initialData.area);
      setValue("addressType", initialData.type);
    } else {
      reset(); // إضافة جديد
    }
  }, [initialData, setValue, reset]);

  const handleAddAddress = async (data: AddressFormInputs) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token");

      const formData = {
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        city: data.city,
        area: data.area,
        address_details: data.details,
        label: data.nickname || `${data.firstName} ${data.lastName}`,
        type: data.addressType,
      };

      let url = `${base_url}/addresses`;
      let method = "POST";

      if (initialData?.id) {
        url = `${base_url}/addresses/${initialData.id}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok || !result.status) {
        throw new Error(result.message || "حدث خطأ");
      }

      toast.success(
        initialData?.id ? "تم تعديل العنوان بنجاح" : "تم إضافة العنوان بنجاح",
        { duration: 1000 }
      );

      if (onSuccess) onSuccess(result.data);

      reset();
      setTimeout(() => onClose(), 100);
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء حفظ العنوان");
    } finally {
      setLoading(false);
    }
  };

  if (!open || !mounted) return null;

  return createPortal(
    <>
   
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl w-[90%] md:w-[900px] max-h-[90vh] overflow-y-auto p-8 relative"
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  تفاصيل العنوان
                </h2>
                <button
                  onClick={onClose}
                  aria-label="close tap"
                  className="cursor-pointer text-gray-500 hover:text-gray-800 transition"
                >
                  <IoCloseSharp size={26} />
                </button>
              </div>

              {/* Form */}
              <form
                onSubmit={handleSubmit(handleAddAddress)}
                className="space-y-6"
              >
                <div className="h-[60vh] overflow-y-scroll flex flex-col gap-4 mt-7 px-4">
                  {/* First + Last Name */}
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-gray-700 mb-1 font-semibold">
                        الإسم الأول
                      </label>
                      <input
                        {...register("firstName")}
                        className={`border rounded-lg w-full p-3 ${
                          errors.firstName
                            ? "border-red-400"
                            : "border-gray-300"
                        }`}
                      />
                      <p className="text-red-500 text-sm mt-1">
                        {errors.firstName?.message}
                      </p>
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1 font-semibold">
                        الإسم الأخير
                      </label>
                      <input
                        {...register("lastName")}
                        className={`border rounded-lg w-full p-3 ${
                          errors.lastName ? "border-red-400" : "border-gray-300"
                        }`}
                      />
                      <p className="text-red-500 text-sm mt-1">
                        {errors.lastName?.message}
                      </p>
                    </div>
                  </div>

                  {/* Building, floor, apartment */}
                  <div className="grid md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-gray-700 mb-1 font-semibold">
                        المبنى (اختياري)
                      </label>
                      <input
                        {...register("building")}
                        className="border rounded-lg w-full p-3 border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1 font-semibold">
                        الدور
                      </label>
                      <input
                        {...register("floor")}
                        className={`border rounded-lg w-full p-3 ${
                          errors.floor ? "border-red-400" : "border-gray-300"
                        }`}
                      />
                      <p className="text-red-500 text-sm mt-1">
                        {errors.floor?.message}
                      </p>
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1 font-semibold">
                        رقم الشقة
                      </label>
                      <input
                        {...register("apartment")}
                        className={`border rounded-lg w-full p-3 ${
                          errors.apartment
                            ? "border-red-400"
                            : "border-gray-300"
                        }`}
                      />
                      <p className="text-red-500 text-sm mt-1">
                        {errors.apartment?.message}
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <div>
                    <label className="block text-gray-700 mb-1 font-semibold">
                      تفاصيل العنوان
                    </label>
                    <textarea
                      {...register("details")}
                      className={`border rounded-lg w-full p-3 ${
                        errors.details ? "border-red-400" : "border-gray-300"
                      }`}
                      rows={3}
                    />
                    <p className="text-red-500 text-sm mt-1">
                      {errors.details?.message}
                    </p>
                  </div>

                  {/* Nickname + phone */}
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-gray-700 mb-1 font-semibold">
                        اسم مختصر
                      </label>
                      <input
                        {...register("nickname")}
                        className="border rounded-lg w-full p-3 border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1 font-semibold">
                        رقم الهاتف
                      </label>
                      <input
                        {...register("phone")}
                        className={`border rounded-lg w-full p-3 ${
                          errors.phone ? "border-red-400" : "border-gray-300"
                        }`}
                      />
                      <p className="text-red-500 text-sm mt-1">
                        {errors.phone?.message}
                      </p>
                    </div>
                  </div>

                  {/* City + Area */}
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-gray-700 mb-1 font-semibold">
                        المدينة
                      </label>
                      <select
                        {...register("city")}
                        className={`border rounded-lg w-full p-3 ${
                          errors.city ? "border-red-400" : "border-gray-300"
                        }`}
                      >
                        <option value="">اختر المدينة</option>
                        <option value="القاهرة">القاهرة</option>
                        <option value="الإسكندرية">الإسكندرية</option>
                        <option value="الجيزة">الجيزة</option>
                      </select>
                      <p className="text-red-500 text-sm mt-1">
                        {errors.city?.message}
                      </p>
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-1 font-semibold">
                        المنطقة
                      </label>
                      <select
                        {...register("area")}
                        className={`border rounded-lg w-full p-3 ${
                          errors.area ? "border-red-400" : "border-gray-300"
                        }`}
                      >
                        <option value="">اختر المنطقة</option>
                        <option value="مدينة نصر">مدينة نصر</option>
                        <option value="الدقي">الدقي</option>
                        <option value="المهندسين">المهندسين</option>
                      </select>
                      <p className="text-red-500 text-sm mt-1">
                        {errors.area?.message}
                      </p>
                    </div>
                  </div>

                  {/* Address Type */}
                  <div>
                    <label className="block text-gray-700 mb-2 font-semibold">
                      نوع العنوان
                    </label>
                    <div className="flex gap-4">
                      {[
                        { value: "home", label: "منزل" },
                        { value: "work", label: "عمل" },
                      ].map((btn) => (
                        <button
                          key={btn.value}
                          type="button"
                          onClick={() => setValue("addressType", btn.value)}
                          className={`px-6 py-2 rounded-lg font-semibold border ${
                            selectedType === btn.value
                              ? "bg-orange-500 text-white border-orange-500"
                              : "bg-white text-gray-700 border-gray-300"
                          }`}
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-red-500 text-sm mt-1">
                      {errors.addressType?.message}
                    </p>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={loading}
                    sx={{
                      fontSize: "1.1rem",
                      backgroundColor: "#14213d",
                      "&:hover": { backgroundColor: "#0f1a31" },
                      paddingX: "60px",
                      paddingY: "8px",
                      borderRadius: "10px",
                      textTransform: "none",
                    }}
                  >
                    {loading ? "جارٍ الحفظ..." : "حفظ العنوان"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>,
    document.body
  );
}
