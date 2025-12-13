"use client";

import React from "react";
import { usePathname } from "next/navigation";
import SideBar from "@/components/SideBar";


export default function MyAccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname.split("/").pop() || "account";

  return (
    <div className="px-5 xl:px-[10%] lg:px-[5%] py-6 grid grid-cols-12 gap-1 lg:gap-5  min-h-screen">
 
      <div className="col-span-12 lg:col-span-4 xl:col-span-2">
        <SideBar active={active} />
      </div>

      <div className="col-span-12 lg:col-span-8 xl:col-span-10 rounded-2xl lg:px-2 mb-16 w-full transition-all duration-300">
        {children}
      </div>
    </div>
  );
}
