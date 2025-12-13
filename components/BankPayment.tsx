"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { MdKeyboardArrowDown } from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";

interface BankPaymentProps {
  onPaymentMethodChange?: (method: string) => void;
}

export default function BankPayment({ onPaymentMethodChange }: BankPaymentProps) {
  const [open, setOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<number | null>(null);
// cash_on_delivery,credit_card
// tabby
// tamara
// apple Pay
// stcPay
 const banks = [
  {
    id: 1,
    name: "Apple Pay",
    desc: "الدفع من خلال Apple Pay",
    img: "/images/applepay.png",
    method: "applePay",
  },
  {
    id: 2,
    name: "STC Pay",
    desc: "الدفع من خلال محفظة STC Pay",
    img: "/images/Stc_pay.svg.png",
    method: "stcPay",
  },
  {
    id: 3,
    name: "Tamara",
    desc: "قسم فاتورتك على دفعات مع تمارا",
    img: "/images/tamara-logo1.png",
    method: "tamara",
  },
  {
    id: 4,
    name: "Tabby",
    desc: "قسم فاتورتك على دفعات مع تابي",
    img: "/images/tabby.jpeg",
    method: "tabby",
  },
];


  const banks2 = [
    {
      id: 5,
      name: "الدفع عند الاستلام",
      desc: "سيتم تطبيق رسوم أضافية",
      img: "/images/money .png",
      method: "cash_on_delivery" 
    },
    {
      id: 6,
      name: "كروت فيزا بريميوم",
      desc: "ادفع بواسطه فيزا",
      img: "/images/visa.png",
      method: "credit_card"
    },
  ];

  useEffect(() => {
    if (selectedBank && onPaymentMethodChange) {
      const allBanks = [...banks, ...banks2];
      const selectedBankObj = allBanks.find(bank => bank.id === selectedBank);
      if (selectedBankObj) {
        console.log("Selected payment method:", selectedBankObj.method);
        onPaymentMethodChange(selectedBankObj.method);
      }
    }
  }, [selectedBank, onPaymentMethodChange]);

  const handleBankSelect = (bankId: number, method: string) => {
    console.log("Bank selected:", bankId, "Method:", method);
    setSelectedBank(bankId);
    if (onPaymentMethodChange) {
      onPaymentMethodChange(method);
    }
  };

  return (
    <div className="shadow-md rounded-xl p-4 mb-4">
      {/* parent */}
      <div
        className="flex items-center justify-between gap-2 cursor-pointer parent"
        onClick={() => setOpen(!open)}
      >
        <p className="text-xl text-gray-800">الدفع بالبطاقات البنكية</p>
        <MdKeyboardArrowDown
          size={22}
          className={`transition-transform duration-300 ${
            open ? "rotate-180" : "rotate-0"
          }`}
        />
      </div>

      <div
        className={`flex items-center gap-4 my-2 images transition-opacity duration-500 ${
          open ? "opacity-0" : "opacity-100"
        }`}
        style={{ minHeight: "50px" }}
      >
        {banks.map((bank) => (
          <Image
            key={bank.id}
            src={bank.img}
            alt={bank.name}
            width={80}
            height={35}
          />
        ))}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="flex flex-col gap-4 selecting overflow-hidden"
          >
            {banks.map((bank) => (
              <label
                key={bank.id}
                className={`flex items-center gap-3 p-4 border rounded cursor-pointer transition-all ${
                  selectedBank === bank.id
                    ? "border-orange-300 bg-orange-50"
                    : "border-gray-200"
                }`}
              >
                <input
                  type="radio"
                  name="bank-payment"
                  checked={selectedBank === bank.id}
                  onChange={() => handleBankSelect(bank.id, bank.method)}
                  className="w-6 h-6 accent-[#e26200] cursor-pointer"
                />
                <Image src={bank.img} alt={bank.name} width={80} height={55} />
                <div className="flex flex-col gap-1">
                  <h6 className="font-semibold">{bank.name}</h6>
                  <p className="text-gray-500 font-semibold text-sm">
                    {bank.desc}
                  </p>
                </div>
              </label>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="my-6">
        {banks2.map((bank) => (
          <label
            key={bank.id}
            className={`flex items-center gap-3 my-6 p-4 border rounded cursor-pointer transition-all ${
              selectedBank === bank.id
                ? "border-orange-300 bg-orange-50"
                : "border-gray-200"
            }`}
          >
            <input
              type="radio"
              name="bank-payment"
              checked={selectedBank === bank.id}
              onChange={() => handleBankSelect(bank.id, bank.method)}
              className="w-6 h-6 accent-[#e26200] cursor-pointer"
            />
            <Image src={bank.img} alt={bank.name} width={40} height={35} />
            <div className="flex flex-col gap-1">
              <h6 className="font-semibold">{bank.name}</h6>
              <p className="text-gray-500 font-semibold text-sm">{bank.desc}</p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}