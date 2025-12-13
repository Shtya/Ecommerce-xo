"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBars, FaRegUser } from "react-icons/fa";
import { LuPhone } from "react-icons/lu";
import { AiOutlineClose } from "react-icons/ai";
import SearchComponent from "./SearchComponent";
import CartSidebar from "./CartSideBar";
import DropdownUser from "./DropdownUser";
import { useAuth } from "@/src/context/AuthContext";
import { useAppContext } from "@/src/context/AppContext";

function cn(...c: (string | false | null | undefined)[]) {
	return c.filter(Boolean).join(" ");
}

export default function SearchNavbar() {
	const [menuOpen, setMenuOpen] = useState(false);

	const { fullName } = useAuth();
	const { socialMedia } = useAppContext();

	// ✅ guard against undefined / wrong type
	const socials = useMemo(
		() => (Array.isArray(socialMedia) ? socialMedia : []),
		[socialMedia]
	);

	const phone = socials.find((s: any) => s.key === "phone")?.value || socials?.[0]?.value || "98098";

	return (
		<div className="bg-white/80 " >
			{/* Navbar */}
			<div className="w-full  container relative  z-30  border-b border-gray-200">
				<div className="flex items-center justify-between gap-3 py-3 md:py-4">
					<div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
						{/* Menu button */}
						<button
							onClick={() => setMenuOpen(true)}
							aria-label="Open menu"
							className={cn(
								"shrink-0 rounded-full p-2.5",
								"bg-[#4a4a4a] text-white shadow-sm",
								"hover:opacity-95 active:scale-[0.98] transition",
								" md:hidden focus:outline-none focus:ring-4 focus:ring-gray-200"
							)}
						>
							<FaBars size={16} />
						</button>

						{/* Logo */}
						<Link href="/" aria-label="home page" className="max-md:hidden relative w-20 md:w-[120px] h-11 shrink-0">
							<Image
								src="/images/logo11.png"
								alt="logo"
								fill
								priority
								className="object-contain"
							/>
						</Link>

						{/* Search (expands on focus) */}
						<div
							className={cn(
								"min-w-0 flex-1",
								// ✅ width grow on focus (works if SearchComponent contains an input)
								// we style by wrapper; you should add `className` support in SearchComponent OR wrap input inside.
								"transition-all duration-300"
							)}
						>
							<SearchGrowWrap>
								<SearchComponent />
							</SearchGrowWrap>
						</div>
					</div>

					{/* Right Section */}
					<div className="flex items-center gap-2 md:gap-4 shrink-0">
						{/* Phone */}
						<div className="hidden lg:flex flex-col text-sm leading-tight">
							<p className="text-gray-500">أي استفسار؟</p>
							<a
								href={`tel:${String(phone).replace(/\s+/g, "")}`}
								className="flex items-center gap-2 text-pro-hover font-bold hover:opacity-90 transition"
							>
								<LuPhone size={18} strokeWidth={1.3} />
								<span className="tabular-nums">{phone}</span>
							</a>
						</div>

						{/* Cart */}
						<div className="cursor-pointer">
							<CartSidebar />
						</div>

						{/* Auth */}
						{!fullName ? (
							<Link
								href="/login"
								className="hidden md:inline-flex items-center gap-2 rounded-xl bg-pro text-white px-4 py-2.5 text-sm font-extrabold shadow-sm hover:opacity-95 active:scale-[0.99] transition"
							>
								<FaRegUser size={15} />
								تسجيل دخول
							</Link>
						) : (
							<DropdownUser />
						)}
					</div>
				</div>
			</div>

			{/* Mobile/Tablet Drawer */}
			<AnimatePresence>
				{menuOpen && (
					<>
						{/* Overlay */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 0.55 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							className="fixed inset-0 bg-black z-40"
							onClick={() => setMenuOpen(false)}
						/>

						{/* Drawer: bottom sheet on mobile, right drawer on md+ */}
						<motion.aside
							role="dialog"
							aria-modal="true"
							initial={{ y: "100%", x: "0%" }}
							animate={{ y: "0%", x: "0%" }}
							exit={{ y: "100%", x: "0%" }}
							transition={{ type: "spring", stiffness: 320, damping: 34 }}
							className={cn(
								"fixed z-50 bg-white shadow-2xl overflow-hidden",
								"w-screen md:w-[420px]",
								"  top-0  right-0",
								" h-full",
								"md:rounded-t-3xl md:rounded-none"
							)}
						>

							{/* Drawer header */}
							<div className="flex items-center justify-between px-4 md:px-5 py-4 border-b border-slate-200 bg-gradient-to-b from-gray-50 to-white">
								<div className="flex items-center gap-3">
									<div className="relative w-10 h-10 rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 overflow-hidden">
										<Image src="/images/logo11.png" alt="logo" fill className="object-contain p-1.5" />
									</div>
									<div>
										<h2 className="text-lg md:text-xl font-extrabold text-gray-900">القائمة</h2>
										<p className="text-xs text-gray-500">تسوق بسهولة حسب الأقسام</p>
									</div>
								</div>

								<button
									aria-label="Close menu"
									onClick={() => setMenuOpen(false)}
									className="rounded-xl p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition focus:outline-none focus:ring-4 focus:ring-gray-200"
								>
									<AiOutlineClose size={22} />
								</button>
							</div>

							{/* Drawer content */}
							<div className=" pl-9 p-5 space-y-5">
								{/* Search inside drawer for mobile */}
								<div className="md:hidden">
									<p className="text-sm font-extrabold text-gray-800 mb-2">ابحث عن منتج</p>
									<SearchGrowWrap inDrawer>
										<SearchComponent />
									</SearchGrowWrap>
								</div>

								{/* Support card */}
								<div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm font-extrabold text-gray-900">الدعم</p>
											<p className="text-xs text-gray-500 mt-0.5">تواصل معنا لأي استفسار</p>
										</div>
										<LuPhone className="text-gray-700" size={20} />
									</div>

									<div className="mt-3 flex gap-2">
										<a
											href={`tel:${String(phone).replace(/\s+/g, "")}`}
											className="flex-1 rounded-xl bg-pro text-white py-2.5 text-sm font-extrabold text-center hover:opacity-95 transition"
										>
											اتصل الآن
										</a>
										<Link
											href="/contactUs"
											onClick={() => setMenuOpen(false)}
											className="flex-1 rounded-xl bg-gray-100 text-gray-900 py-2.5 text-sm font-extrabold text-center hover:bg-gray-200 transition"
										>
											تواصل معنا
										</Link>
									</div>
								</div>

								{/* Section title */}
								<div className="flex items-center justify-between">
									<h3 className="text-base md:text-lg font-extrabold text-gray-900">
										تسوق حسب الأقسام
									</h3>
									<span className="text-xs text-gray-500">اختر القسم</span>
								</div>

								{/* TODO: put categories list here */}
								<div className="grid grid-cols-2 gap-3">
									{["ملابس", "أحذية", "إكسسوارات", "عروض"].map((x) => (
										<Link
											key={x}
											href={`/search?q=${x}`}
											onClick={() => setMenuOpen(false)}
											className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-gray-300  transition"
										>
											<p className="font-extrabold text-gray-900">{x}</p>
											<p className="text-xs text-gray-500 mt-1">اكتشف الآن</p>
										</Link>
									))}
								</div>
							</div>

							{/* Drawer footer */}
							<div className="mt-auto border-slate-200 border-t pl-9 p-5 bg-white">
								{!fullName ? (
									<Link
										href="/login"
										onClick={() => setMenuOpen(false)}
										className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-pro text-white py-3 text-sm font-extrabold shadow-sm hover:opacity-95 transition"
									>
										<FaRegUser size={15} />
										تسجيل دخول
									</Link>
								) : (
									<button
										onClick={() => setMenuOpen(false)}
										className="w-full rounded-2xl bg-gray-100 text-gray-900 py-3 text-sm font-extrabold hover:bg-gray-200 transition"
									>
										إغلاق
									</button>
								)}
							</div>
						</motion.aside>
					</>
				)}
			</AnimatePresence>
		</div>
	);
}

/**
 * ✅ Makes search expand on focus (without changing SearchComponent internals)
 * If SearchComponent input gets focus, wrapper uses :focus-within to animate width.
 */
function SearchGrowWrap({
	children,
	inDrawer = false,
}: {
	children: React.ReactNode;
	inDrawer?: boolean;
}) {
	return (
		<div
			className={cn(
				"transition-all duration-300",
				"focus-within:w-full",
				inDrawer
					? "w-full"
					: "w-[180px] sm:w-[240px] md:w-[320px] lg:w-[420px] xl:w-[520px] focus-within:w-[92vw] md:focus-within:w-[560px]",
				"max-w-full"
			)}
		>
			{children}
		</div>
	);
}
