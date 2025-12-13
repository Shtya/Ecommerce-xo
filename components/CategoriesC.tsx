"use client";

import { useMemo, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import Image from "next/image";
import Link from "next/link";
import { CategoryI } from "@/Types/CategoriesI";

interface CategoriesSliderProps {
  categories: CategoryI[];
}

export default function CategoriesSlider({ categories }: CategoriesSliderProps) {
  const prevRef = useRef<HTMLButtonElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);
  const paginationRef = useRef<HTMLDivElement | null>(null);

  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const items = useMemo(() => categories ?? [], [categories]);
  const hasSlides = items.length > 0;

  if (!hasSlides) return null;

  return (
    <div className="relative w-full md:px-6 !pb-6 py-4 md:py-6">
 
      <div className="relative">
        {/* Arrows (left/right center) */}
        <button
          ref={prevRef}
          type="button"
          aria-label="السابق"
          className={[
            "swiper-button-prev  absolute !-left-[50px]  top-1/2 -translate-y-1/2 z-20",
            isBeginning ? "is-disabled" : "",
          ].join(" ")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          ref={nextRef}
          type="button"
          aria-label="التالي"
          className={[
            "swiper-button-prev swiper-arrow absolute !-right-[50px] absolute  top-1/2 -translate-y-1/2 z-20",
            isEnd ? "is-disabled" : "",
          ].join(" ")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={10}
          slidesPerGroup={1}
          watchOverflow={true} // ✅ if not enough slides, swiper disables navigation internally
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
            disabledClass: "swiper-nav-disabled",
          }}
          pagination={{
            clickable: true,
            el: paginationRef.current,
          }}
          onInit={(swiper) => {
            // attach refs
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

            setIsBeginning(swiper.isBeginning);
            setIsEnd(swiper.isEnd);
          }}
          onSlideChange={(swiper) => {
            setIsBeginning(swiper.isBeginning);
            setIsEnd(swiper.isEnd);
          }}
          onReachBeginning={() => setIsBeginning(true)}
          onReachEnd={() => setIsEnd(true)}
          onFromEdge={() => {
            // swiper left the edge (so both might become false)
            // we update in onSlideChange anyway
          }}
          breakpoints={{
            0: { slidesPerView: 4 },
            640: { slidesPerView: 5 },
            992: { slidesPerView: 7 },
            1424: { slidesPerView: 10 },
          }}
          className=" "
        >
          {items.map((cat) => (
            <SwiperSlide key={cat.id}>
              <Link
                href={`/category/${cat.id}`}
                aria-label={`Go to ${cat.name}`}
                className="block"
              >
                <div className="group flex flex-col items-center gap-2 py-2">
                  <div className="relative w-14 h-14 md:w-[92px] md:h-[92px] rounded-full overflow-hidden bg-gray-100 ring-1 ring-gray-200 group-hover:ring-gray-300 transition">
                    <Image
                      src={cat.image || "/images/cat1.png"}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 768px) 56px, 92px"
                      className="object-cover group-hover:scale-[1.06] transition duration-300"
                    />
                  </div>

                  <p className="text-[13px] md:text-[14px] font-bold text-gray-700 text-center leading-tight line-clamp-1 group-hover:text-pro transition">
                    {cat.name}
                  </p>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Pagination (visible on mobile + desktop) */}
        <div
          ref={paginationRef}
          className=" w-full swiper-pagination bottom-unset !mt-3 flex items-center justify-center"
        />
      </div>
 
    </div>
  );
}
