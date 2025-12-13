"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SideBarProps {
  active: string;
}

export default function SideBar({ active }: SideBarProps) {
  const pathname = usePathname();

  const items = [
    { key: "account", label: "حسابي", href: "/myAccount" },
    { key: "orders", label: "طلباتي", href: "/myAccount/orders" },
    { key: "favorites", label: "منتجاتي المفضلة", href: "/myAccount/favorites" },
    { key: "addresses", label: "إدارة العناوين", href: "/myAccount/addresses" },
    { key: "help", label: "مركز المساعدة", href: "/myAccount/help" },
  ];

  return (
    <div className="shadow bg-white p-5 rounded-xl">
      <ul className="flex flex-col gap-3">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.key === "account" && pathname === "/myAccount");

          return (
            <li key={item.key}>
              <Link
                href={item.href}
                className={`block px-4 py-2 rounded-md transition text-[1rem] font-semibold ${
                  isActive
                    ? "bg-pro text-white"
                    : "text-[#475569] hover:bg-gray-100"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
