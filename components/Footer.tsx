"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAppContext } from "@/src/context/AppContext";
import {
  FaPhone,
  FaWhatsapp,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaEnvelope,
  FaMapMarkerAlt,
  FaInstagram,
  FaSnapchat,
  FaTelegram,
  FaYoutube,
  FaPinterest,
  FaTiktok,
  FaReddit,
  FaDiscord,
} from "react-icons/fa";

type SocialItem = { key: string; value: any; icon?: string };
type PaymentMethod = { id: number; name: string; icon?: string; is_active: boolean };

function isEmptyValue(v: any) {
  if (v === null || v === undefined) return true;
  if (typeof v !== "string") return false;
  return v.trim().length === 0;
}

function normalizeSocialHref(key: string, value: string) {
  const v = value.trim();
 
  if (key === "phone") return v.startsWith("tel:") ? v : `tel:${v}`;

  // email
  if (key === "email") return v.startsWith("mailto:") ? v : `mailto:${v}`;

  // whatsapp: accept url or number
  if (key === "whatsapp") {
    if (v.startsWith("http")) return v;
    const digits = v.replace(/[^\d+]/g, "");
    // wa.me expects number without +
    const wa = digits.startsWith("+") ? digits.slice(1) : digits;
    return `https://wa.me/${wa}`;
  }

  // address is not a link
  if (key === "address") return "";

  // otherwise: assume it's url (add https if missing)
  if (v.startsWith("http")) return v;
  return `https://${v}`;
}
 
export default function Footer() {
  const { socialMedia, paymentMethods } = useAppContext() as any;

  const socials: SocialItem[] = Array.isArray(socialMedia) ? socialMedia : [];
  const payments: PaymentMethod[] = Array.isArray(paymentMethods) ? paymentMethods : [];

  const socialIcons: Record<string, any> = {
    phone: FaPhone,
    whatsapp: FaWhatsapp,
    facebook: FaFacebook,
    twitter: FaTwitter,
    linkedin: FaLinkedin,
    instagram: FaInstagram,
    snapchat: FaSnapchat,
    telegram: FaTelegram,
    email: FaEnvelope,
    tiktok: FaTiktok,
    youtube: FaYoutube,
    pinterest: FaPinterest,
    reddit: FaReddit,
    discord: FaDiscord,
    address: FaMapMarkerAlt,
    // If you want more icons later, just add them here
  };

  const Links = [
    { title: "معلومات عنا", href: "/about" },
    { title: "الشروط و الأحكام", href: "/terms" },
    { title: "سياسة الإسترجاع", href: "/returnsPolicy" },
    { title: "سياسة الخصوصية", href: "/policy" },
    { title: "الضمان", href: "/warranty" },
    { title: "أنضم كشريك", href: "/partner" },
    { title: "الفريق", href: "/team" },
    { title: "اتصل بنا", href: "/contactUs" },
  ];

  const companyLinks = Links.slice(0, 3);
  const importantLinks = Links.slice(3, 7);
  const helpLinks = Links.slice(7);

  const email = socials.find((s) => s.key === "email")?.value;
  const phone = socials.find((s) => s.key === "phone")?.value;
  const address = socials.find((s) => s.key === "address")?.value;

  // ✅ show ALL socials that have value, except address handled separately
  const socialButtons = useMemo(() => {
    return socials
      .filter((s) => !isEmptyValue(s.value))
      .filter((s) => s.key !== "address");
  }, [socials]);

  // ✅ active payments only (from /payment-methods?is_payment=true)
  const activePayments = useMemo(() => {
    return payments.filter((p) => p?.is_active);
  }, [payments]);

  const year = new Date().getFullYear();

  return (
    <footer className="bg-pro text-white">
      <div className="container max-md:!px-6 px-5">
        {/* top */}
        <div className=" max-md:w-fit max-md:mx-auto grid grid-cols-2 lg:grid-cols-4 gap-10 py-12">
          {/* Brand/About */}
          <div className="space-y-2">
            <h3 className="text-lg font-extrabold">Tala Aliazeera</h3>
            <p className=" max-md:max-w-[200px] text-white/80 text-sm leading-relaxed">
              منصة تساعدك تشتري بسهولة، وتتابع طلباتك، وتوصل لمنتجاتك بأفضل تجربة.
            </p>

            {/* Quick actions */}
            <div className="flex flex-wrap gap-2 pt-2">
              {!isEmptyValue(phone) && (
                <a
                  href={normalizeSocialHref("phone", String(phone))}
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/15 transition"
                  aria-label="اتصال بالدعم"
                >
                  <FaPhone className="opacity-90" />
                  <span>اتصل</span>
                </a>
              )}

              {!isEmptyValue(email) && (
                <a
                  href={normalizeSocialHref("email", String(email))}
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/15 transition"
                  aria-label="إرسال بريد"
                >
                  <FaEnvelope className="opacity-90" />
                  <span>بريد</span>
                </a>
              )}

              {!isEmptyValue(socials.find((s) => s.key === "whatsapp")?.value) && (
                <a
                  href={normalizeSocialHref(
                    "whatsapp",
                    String(socials.find((s) => s.key === "whatsapp")!.value)
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/15 transition"
                  aria-label="واتساب"
                >
                  <FaWhatsapp className="opacity-90" />
                  <span>واتساب</span>
                </a>
              )}
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-extrabold tracking-wide">الشركة</h4>
            <div className="mt-4 flex flex-col gap-3">
              {companyLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="text-white/85 hover:text-white transition underline-offset-4 hover:underline"
                >
                  {link.title}
                </Link>
              ))}
            </div>
          </div>

          {/* Important */}
          <div>
            <h4 className="text-sm font-extrabold tracking-wide">روابط مهمة</h4>
            <div className="mt-4 flex flex-col gap-3">
              {importantLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="text-white/85 hover:text-white transition underline-offset-4 hover:underline"
                >
                  {link.title}
                </Link>
              ))}
            </div>
          </div>

          {/* Help / Address */}
          <div className="space-y-4">
            <h4 className="text-sm font-extrabold tracking-wide">تريد مساعدة؟</h4>

            <div className="flex flex-col gap-3">
              {helpLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="text-white/85 hover:text-white transition underline-offset-4 hover:underline"
                >
                  {link.title}
                </Link>
              ))}
            </div>

            {/* Contact details */}
            <div className="mt-5 space-y-2 text-sm text-white/85">
              {!isEmptyValue(email) && (
                <div className="flex items-center gap-2">
                  <FaEnvelope className="opacity-80" />
                  <span className="break-all">{String(email)}</span>
                </div>
              )}

              {!isEmptyValue(phone) && (
                <div className="flex items-center gap-2">
                  <FaPhone className="opacity-80" />
                  <span className="tabular-nums">{String(phone)}</span>
                </div>
              )}

              {!isEmptyValue(address) && (
                <div className="flex items-start gap-2">
                  <FaMapMarkerAlt className="opacity-80 mt-0.5" />
                  <span className="leading-relaxed">{String(address)}</span>
                </div>
              )}

              {!email && !phone && !address && (
                <p className="text-white/70">بيانات التواصل غير متاحة حالياً.</p>
              )}
            </div>
          </div>
        </div>

        {/* divider */}
        <div className="h-px w-full bg-white/10" />

        {/* bottom */}
        <div className="grid max-md:w-fit max-md:mx-auto grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 py-8">
          {/* payments */}
          <div className="space-y-2 lg:col-span-3">
            <p className="text-sm font-extrabold">نحن نقبل</p>

            {activePayments.length === 0 ? (
              <span className="text-white/70 text-sm">طرق الدفع غير متاحة حالياً</span>
            ) : (
              <div className="flex flex-wrap gap-2">
                {activePayments.map((p) => (
                  <span
                    key={p.id}
                    className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-bold ring-1 ring-white/10 hover:bg-white/15 transition"
                    title={p.name}
                  > 
                    <span>{p.name}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* socials */}
          <div className="space-y-2">
            <p className="text-sm font-extrabold">تابعنا</p>

            <div className="flex items-center gap-2 flex-wrap">
              {socialButtons.length === 0 ? (
                <span className="text-white/70 text-sm">لا توجد روابط اجتماعية حالياً</span>
              ) : (
                socialButtons.map((social, idx) => {
                  const Icon = socialIcons[social.key];
                  if (!Icon) return null;

                  const href = normalizeSocialHref(social.key, String(social.value));
                  const isExternal = href.startsWith("http");

                  // phone/email handled already in quick actions, but still ok here
                  const target = isExternal ? "_blank" : undefined;

                  return (
                    <Link
                      key={`${social.key}-${idx}`}
                      href={href || "#"}
                      target={target}
                      rel={isExternal ? "noreferrer" : undefined}
                      className="group inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/15 transition ring-1 ring-white/10"
                      aria-label={social.key}
                    >
                      <Icon className="text-white group-hover:scale-110 transition" size={18} />
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* copyright */}
        <p className="text-center text-white/70 text-sm pb-10">
          Ⓒ جميع الحقوق محفوظة {year}
        </p>
      </div>
    </footer>
  );
}
