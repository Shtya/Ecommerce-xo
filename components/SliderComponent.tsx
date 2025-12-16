"use client";

import { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

type SliderResponse = any;

export default function SliderComponent({ src }: { src: SliderResponse | null }) {
  const prevRef = useRef<HTMLButtonElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);
  const paginationRef = useRef<HTMLDivElement | null>(null);
  const swiperRef = useRef<SwiperType | null>(null);

  const items = useMemo(() => {
    const list = src?.items ?? [];
    return list
      .filter((it: any) => it?.is_active !== false)
      .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
  }, [src]);

  const hasSlides = items.length > 0;
  const showNav = items.length > 1;
  const showPagination = items.length > 1;

  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper) return;

    // wire nav
    if (showNav && prevRef.current && nextRef.current) {
      // @ts-ignore
      swiper.params.navigation.prevEl = prevRef.current;
      // @ts-ignore
      swiper.params.navigation.nextEl = nextRef.current;
      swiper.navigation?.destroy();
      swiper.navigation?.init();
      swiper.navigation?.update();
    }

    // wire pagination
    if (showPagination && paginationRef.current) {
      // @ts-ignore
      swiper.params.pagination.el = paginationRef.current;
      swiper.pagination?.destroy();
      swiper.pagination?.init();
      swiper.pagination?.render();
      swiper.pagination?.update();
    }
  }, [showNav, showPagination, items.length]);

  if (!hasSlides) return null;

  return (
    <div className="relative w-full h-[200px] md:h-[420px]">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={18}
        slidesPerView={1}
        // loop={items.length > 1}
        // autoplay={items.length > 1 ? { delay: 2800, disableOnInteraction: false } : false}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        navigation={showNav}
        pagination={
          showPagination
            ? {
                clickable: true,
                // IMPORTANT: don't set `el` here; it will be null on first render.
                renderBullet: (index, className) =>
                  `<span class="${className} w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-white/60 inline-block mx-1"></span>`,
              }
            : false
        }
        className="w-full h-full"
      >
        {items.map((item: any, index: number) => {
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

        

        {/* optional arrows if you have them */}
        {showNav && (
          <>
            <button ref={prevRef} className="absolute left-2 top-1/2 -translate-y-1/2 z-20">
              {/* Prev */}
            </button>
            <button ref={nextRef} className="absolute right-2 top-1/2 -translate-y-1/2 z-20">
              {/* Next */}
            </button>
          </>
        )}
      </Swiper>

			{/* custom pagination container */}
        {showPagination && (
          <div
            ref={paginationRef}
            className="absolute z-[100] bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-center gap-2 z-20"
          />
        )}
    </div>
  );
}
