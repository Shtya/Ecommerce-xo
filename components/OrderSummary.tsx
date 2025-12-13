"use client";

import { useState } from "react";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
// import OrderPayDetails from "./orderPayDetails";
import { useCart } from "@/src/context/CartContext"; 
import Image from "next/image";

export default function OrderSummary() {
  const [showDetails, setShowDetails] = useState(false);
  const { cart } = useCart(); 

  return (
    <div className="w-full">
      {/* Header */}
      <div
        className="flex items-center justify-between cursor-pointer showDetails mb-4"
        onClick={() => setShowDetails(!showDetails)}
      >
        <h4 className="text-pro font-semibold my-2 text-xl">ملخص الطلب</h4>

        <div className="flex items-center gap-1">
          <p className="text-gray-800 transition-all duration-300">
            {showDetails ? "إخفاء التفاصيل" : "إظهار التفاصيل"}
          </p>
          <MdOutlineKeyboardArrowDown
            size={22}
            className={`text-gray-400 transition-transform duration-300 ${
              showDetails ? "rotate-180" : "rotate-0"
            }`}
          />
        </div>
      </div>

      {/* Animated component */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-3 mb-4">
              {cart?.map((item) => (
                <div
                  key={item.cart_item_id}
                  className="flex items-center justify-between  p-3 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    {/* صورة المنتج */}
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-22 h-22 rounded-md object-cover"
                      width={16}
                      height={16}
                    />

                    <div className="text-sm text-gray-700 flex flex-col gap-1">
                      <p className="font-semibold">{item.product.name}</p>
                      <p className="text-gray-500">الكمية: {item.quantity}</p>
                  <p className="font-semibold text-gray-800 text-sm">
                    {item.line_total} ج.م
                  </p>
                      {item.size && (
                        <p className="text-gray-500">المقاس: {item.size}</p>
                      )}

                      {item.color?.name && (
                        <p className="text-gray-500">اللون: {item.color.name}</p>
                      )}

                      {item.printing_method && (
                        <p className="text-gray-500">
                          طريقة الطباعة: {item.printing_method}
                        </p>
                      )}
                    </div>
                  </div>

                
                </div>
              ))}
            </div>

         
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
