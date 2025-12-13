"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LayoutShell({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();

	const hideLayout = ["/login", "/signup", "/login/forgetPassword"].includes(
		pathname
	);

	return (
		<>
			{!hideLayout && <Navbar />}

			<div className={`${!hideLayout ? "pt-[90px] lg:pt-[140px]" : ""}  min-h-[80vh]`}>
				{children}
			</div>

			{!hideLayout && <Footer />}
		</>
	);
}
