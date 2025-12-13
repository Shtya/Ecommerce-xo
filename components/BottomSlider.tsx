"use client";
import React from "react";
import { MdStars } from "react-icons/md";
import { PiTruckLight } from "react-icons/pi";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function BottomSlider() {
  const items = [
    {
      icon: <PiTruckLight size={20} />,
      text: "شحن مجاني",
    },
    {
      icon: <MdStars size={20} />,
      text: "#1 في  التوصيل السريع",
    },
    {
      icon: <p className="text-lg">!</p>,
      text: (
        <>
          متبقي <span className="font-bold text-red-600">عدد قليل</span>  في المخزن
        </>
      ),
    },
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-5 flex items-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          className="flex items-center gap-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          {items[index].icon}
          <p className="text-xs line-clamp-1 text-gray-700">{items[index].text}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
