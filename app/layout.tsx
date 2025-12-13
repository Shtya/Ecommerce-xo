import type { Metadata } from "next";
import "./globals.css";
import "@/styles/screen.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";
import Providers from "./Providers";
import { AppProvider } from "@/src/context/AppContext";
import { ToastProvider } from "@/src/context/ToastContext";
import { Cairo } from "next/font/google";
import LayoutShell from "./LayoutShell";

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["300", "400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ecommerce",
  description: "make your life easier",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
	
  return (
    <html lang="ar" dir="rtl" className={cairo.className}>
      <body className="bg-white">
        <AppProvider>
          <ToastProvider>
            <Providers>
              {/* <Navbar /> */}
							<LayoutShell>{children}</LayoutShell>
              {/* <div className=" min-h-[80vh] pt-[90px] lg:pt-[140px]"></div> */}

              <Toaster position="top-center" />
              {/* <Footer /> */}
            </Providers>
          </ToastProvider>
        </AppProvider>
      </body>
    </html>
  );
}
