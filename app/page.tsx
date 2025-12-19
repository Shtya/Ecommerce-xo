"use client";

import CategoriesSlider from "@/components/CategoriesC";
import InStockSlider from "@/components/InStockSlider";
import ProductCard from "@/components/ProductCard";
import SliderComponent from "@/components/SliderComponent";
import { fetchApi, fetchApi2 } from "@/lib/api";
import { useAppContext } from "@/src/context/AppContext";
import { BannerI } from "@/Types/BannerI";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

// ✅ Skeletons
import {
	CategoriesSliderSkeleton,
	HeroSliderSkeleton,
	CategorySectionSkeleton,
} from "@/components/skeletons/HomeSkeletons";

export default function Home() {
	const { homeData, loadingCategories, parentCategories, loadingHome } =
		useAppContext();

	// ✅ local copy so we can append pages
	const [categories2, setCategories2] = useState<any[]>(
		homeData?.sub_categories || []
	);
	const [paginationState, setPaginationState] = useState<any>(
		homeData?.sub_categories_pagination || null
	);

	// ✅ load-more UI state
	const [loadingMore, setLoadingMore] = useState(false);

	// ✅ sentinel ref for infinite scroll
	const loadMoreRef = useRef<HTMLDivElement | null>(null);

	// ✅ keep local state synced when context homeData updates (first load / refresh)
	useEffect(() => {
		setCategories2(homeData?.sub_categories || []);
		setPaginationState(homeData?.sub_categories_pagination || null);
	}, [homeData?.sub_categories, homeData?.sub_categories_pagination]);

	const loadMore = useCallback(async () => {
		if (!paginationState?.next_page) return;
		if (loadingMore) return;

		setLoadingMore(true);
		try {
			const nextUrl = String(paginationState.next_page);
			const res = await fetchApi2(nextUrl); // ✅ uses your helper

			const newCats = res?.data?.sub_categories ?? res?.sub_categories ?? [];
			const newPagination =
				res?.data?.sub_categories_pagination ??
				res?.sub_categories_pagination ??
				res?.pagination ??
				null;

			// ✅ append + de-dup by id
			setCategories2((prev) => {
				const merged = [...prev, ...(Array.isArray(newCats) ? newCats : [])];
				const map = new Map(merged.map((c: any) => [c.id, c]));
				return Array.from(map.values());
			});

			setPaginationState(newPagination);
		} catch (e) {
			// optionally toast/error UI
		} finally {
			setLoadingMore(false);
		}
	}, [paginationState?.next_page, loadingMore]);

	// ✅ infinite scroll observer
	const hasNext = Boolean(paginationState?.next_page);

	useEffect(() => {
		if (!hasNext) return;

		const el = loadMoreRef.current;
		if (!el) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const first = entries[0];
				if (!first?.isIntersecting) return;
				loadMore();
			},
			{
				root: null,
				rootMargin: "600px", // ✅ preload before bottom
				threshold: 0,
			}
		);

		observer.observe(el);
		return () => observer.disconnect();
	}, [hasNext, loadMore]);

	// ------------------ slider (your existing code) ------------------
	const [mainSlider, setMainSlider] = useState<BannerI[]>([]);
	const [isMainSliderLoading, setIsMainSliderLoading] = useState(true);

	useEffect(() => {
		let mounted = true;

		const getMainSlider = async () => {
			setIsMainSliderLoading(true);
			try {
				const data = await fetchApi("banners?type=main_slider");
				if (!mounted) return;
				setMainSlider(Array.isArray(data) ? data : []);
			} catch (e) {
				if (!mounted) return;
				setMainSlider([]);
			} finally {
				if (!mounted) return;
				setIsMainSliderLoading(false);
			}
		};

		getMainSlider();
		return () => {
			mounted = false;
		};
	}, []);

	const sliderSrc = useMemo(
		() => (mainSlider?.[0]?.items || []).map((i) => i.image),
		[mainSlider]
	);

	return (
		<div className="container  !mt-8 !mb-8">
			<div className="flex flex-col gap-8">
				<div className="rounded-3xl overflow-hidden border border-gray-100 bg-white shadow-sm">
					{isMainSliderLoading ? (
						<HeroSliderSkeleton />
					) : sliderSrc.length > 0 ? (
						<SliderComponent src={mainSlider?.[0]} />
					) : (
						<div className="h-[200px] md:h-[420px] flex items-center justify-center text-gray-400">
							لا توجد بنرات حالياً
						</div>
					)}
				</div>

				<div className="max-md:overflow-hidden w-full pb-12 pt-8">
					{loadingCategories ? (
						<CategoriesSliderSkeleton />
					) : (
						<CategoriesSlider categories={parentCategories} />
					)}
				</div>

				{/* ✅ SECTIONS */}
				<div className="flex flex-col gap-10">
					{loadingHome ? (
						<>
							<CategorySectionSkeleton />
							<CategorySectionSkeleton />
							<CategorySectionSkeleton />
						</>
					) : (
						categories2.map((category) => {
							const hasProducts =
								Array.isArray(category.products) && category.products.length > 0;
							if (!hasProducts) return null;

							const banner =
								category.category_banners?.[0]?.image ?? "/images/d4.jpg";

							return (
								<section
									key={category.id}
									className="rounded-[10px_10px_0_0] md:rounded-3xl md:border md:border-gray-100 !bg-gray-50/50 overflow-hidden"
								>
									<div className="relative w-full h-[120px] md:h-[160px]">
										<Image
											src={banner}
											alt={category.name}
											fill
											className="object-cover"
											priority={false}
										/>
										<div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
										<div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
											<h2 className="text-white text-lg md:text-2xl font-extrabold drop-shadow">
												{category.name}
											</h2>

											<Link
												href={`/category/${category.id}`}
												className="text-white/95 text-sm md:text-base font-semibold px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 transition"
											>
												الكل
											</Link>
										</div>
									</div>

									{/* Products */}
									<div className="md:p-6">
										<InStockSlider
											inStock={category.products}
											isLoading={false}
											title=""
											hiddenArrow={false}
											CardComponent={(product: any) => (
												<ProductCard
													{...product}
													product={product}
													key={product.id}
													id={product.id}
													name={product.name}
													image={product.image || "/images/c1.png"}
													stock={product.stock}
													average_rating={product.average_rating}
													reviews={product.reviews}
													className="hidden"
													className2="hidden"
													classNameHome=""
													Bottom="bottom-3"
												/>
											)}
										/>
									</div>
								</section>
							);
						})
					)}
				</div>

				{/* ✅ Infinite scroll sentinel */}
				{hasNext && (
					<div className="mt-8 flex items-center justify-center">
						<div ref={loadMoreRef} className="h-1 w-full" />
					</div>
				)}

				{/* ✅ Pretty loader when fetching more */}
				{loadingMore && (
					<div className="mt-10 flex items-center justify-center">
						<div className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white/80 backdrop-blur px-6 py-4 shadow-lg">
							{/* animated dots */}
							<div className="flex gap-1">
								<span className="w-2.5 h-2.5 bg-slate-700 rounded-full animate-bounce [animation-delay:-0.3s]" />
								<span className="w-2.5 h-2.5 bg-slate-700 rounded-full animate-bounce [animation-delay:-0.15s]" />
								<span className="w-2.5 h-2.5 bg-slate-700 rounded-full animate-bounce" />
							</div>

							<p className="text-sm font-extrabold text-slate-700 tracking-wide">
								جاري تحميل المزيد
							</p>
						</div>
					</div>
				)}



				{/* ✅ end message */}
				{!hasNext && categories2.length > 0 && !loadingHome && (
					<div className="mt-10 flex items-center justify-center">
						<p className="text-sm font-bold text-slate-500">
							وصلت لنهاية الأقسام ✅
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
