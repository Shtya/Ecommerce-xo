"use client";

import { useMemo, useRef } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

type SliderItem = {
  id: number;
  order?: number;
  image: string | null;
  mobile_image: string | null;
  alt?: string | null;
  link_url?: string | null;
  link_target?: "_self" | "_blank" | string;
  is_active?: boolean;
  is_link_active?: boolean;
};

type SliderResponse = any

export default function SliderComponent({ src }: { src: SliderResponse | null }) {
  const prevRef = useRef<HTMLButtonElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);
  const paginationRef = useRef<HTMLDivElement | null>(null);

  // Normalize items + filter active + sort by order
  const items = useMemo(() => {
    const list = src?.items ?? [];
    return list
      .filter((it:any) => it?.is_active !== false)
      .sort((a:any, b:any) => (a.order ?? 0) - (b.order ?? 0));
  }, [src]);

  const hasSlides = items.length > 0;
  const showNav = items.length > 1; // ✅ arrows only if 2+ slides
  const showPagination = items.length > 1; // ✅ show pagination on mobile too

  if (!hasSlides) return null; // ✅ don't render anything until data exists

  return (
    <div className="relative w-full h-[200px] md:h-[420px]">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={18}
        slidesPerView={1}
        loop={items.length > 1}
        autoplay={items.length > 1 ? { delay: 2800, disableOnInteraction: false } : false}
        // Use onInit (more reliable for refs than onBeforeInit in many setups)
        onInit={(swiper) => {
          // @ts-ignore
          swiper.params.navigation.prevEl = prevRef.current;
          // @ts-ignore
          swiper.params.navigation.nextEl = nextRef.current;
          // @ts-ignore
          swiper.params.pagination.el = paginationRef.current;

          swiper.navigation?.init();
          swiper.navigation?.update();
          swiper.pagination?.init();
          swiper.pagination?.render();
          swiper.pagination?.update();
        }}
        navigation={showNav}
        pagination={
          showPagination
            ? {
                clickable: true,
                renderBullet: (index, className) =>
                  `<span class="${className} w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-white/60 inline-block mx-1"></span>`,
              }
            : false
        }
        className="w-full h-full"
      >
        {items.map((item:any, index:any) => {
          const href = item?.is_link_active === false ? "/" : item?.link_url || "/";
          const target = item?.link_target || "_self";
          const alt = item?.alt || `Slide ${index + 1}`;

          return (
            <SwiperSlide key={item.id ?? index}>
              <div className="relative w-full h-[200px] md:h-[420px] overflow-hidden">
                <Link href={href} target={target} aria-label={`Go to slide ${index + 1}`}>
                  <img
                    src={item.mobile_image || item.image || ""}
                    alt={alt}
                    className="object-fill w-full h-full"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent" />
                </Link>
              </div>
            </SwiperSlide>
          );
        })}

        {/* ✅ arrows only when 2+ slides */}
        {/* {showNav && (
          <>
            <button
              ref={prevRef}
              className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/85 hover:bg-white shadow items-center justify-center transition active:scale-95"
              aria-label="السابق"
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              ref={nextRef}
              className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/85 hover:bg-white shadow items-center justify-center transition active:scale-95"
              aria-label="التالي"
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )} */}

        {/* ✅ pagination visible on phone */}
        {showPagination && (
          <div
            ref={paginationRef}
            className="absolute bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-center gap-2 z-20"
          />
        )}
      </Swiper>
 
    </div>
  );
}
