"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import toast from "react-hot-toast";

import Loading from "@/app/loading";
import { ProductI } from "@/Types/ProductsI";
import HearComponent from "@/components/HearComponent";
import RatingStars from "@/components/RatingStars";
import ShareButton from "@/components/ShareButton";
import StickerForm from "@/components/StickerForm";
import POVComponent from "@/components/POVComponent";
import ProductGallery from "@/components/ProductGallery";
import CustomSeparator from "@/components/Breadcrumbs";
import ButtonComponent from "@/components/ButtonComponent";
import InStockSlider from "@/components/InStockSlider";
import ProductCard from "@/components/ProductCard";

import { useAuth } from "@/src/context/AuthContext";
import { useAppContext } from "@/src/context/AppContext";
import { useCart } from "@/src/context/CartContext";

import { FaBarcode } from "react-icons/fa";
import { FiAlertTriangle } from "react-icons/fi";
import { ProductPageSkeleton } from "../../../components/skeletons/HomeSkeletons";

type TabKey = "options" | "reviews";

interface SelectedOptions {
	size: string;
	color: string;
	material: string;
	features: { [key: string]: string };
	isValid: boolean;
}

const fadeUp: any = {
	hidden: { opacity: 0, y: 14 },
	show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export default function ProductPageClient() {
	const { id } = useParams();
	const productId = id as string;
	const [showValidation, setShowValidation] = useState(false);

	const { authToken: token } = useAuth();
	const { addToCart } = useCart();
	const { homeData } = useAppContext();

	const stickerFormRef = useRef<any>(null);

	const [product, setProduct] = useState<ProductI | null>(null);
	const [apiData, setApiData] = useState<any>(null);

	const [loading, setLoading] = useState(true);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);

	const [isFavorite, setIsFavorite] = useState(false);
	const [activeTab, setActiveTab] = useState<TabKey>("options");

	const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({
		size: "اختر",
		color: "اختر",
		material: "اختر",
		features: {},
		isValid: false,
	});

	const API_URL = process.env.NEXT_PUBLIC_API_URL;

	// ✅ fetch product
	useEffect(() => {
		let mounted = true;

		async function fetchProduct() {
			if (!productId) return;

			setLoading(true);
			setErrorMsg(null);

			try {
				const res = await fetch(`${API_URL}/products/${productId}`, {
					headers: token ? { Authorization: `Bearer ${token}` } : {},
				});

				if (!res.ok) throw new Error("not_found");

				const data = await res.json();
				const prod = data?.data ?? null;

				if (!mounted) return;

				setProduct(prod);
				setApiData(data?.data);

				// favorites local
				const saved = JSON.parse(localStorage.getItem("favorites") || "[]") as number[];
				setIsFavorite(!!prod && saved.includes(prod.id));
			} catch (e: any) {
				if (!mounted) return;
				setErrorMsg(e?.message === "not_found" ? "المنتج غير موجود" : "حدث خطأ أثناء تحميل المنتج");
			} finally {
				if (mounted) setLoading(false);
			}
		}

		fetchProduct();
		return () => {
			mounted = false;
		};
	}, [productId, token, API_URL]);

	// ✅ tabs existence
	const hasOptions = useMemo(() => {
		if (!apiData) return false;
		const hasSizes = Array.isArray(apiData?.sizes) && apiData.sizes.length > 0;
		const hasColors = Array.isArray(apiData?.colors) && apiData.colors.length > 0;
		const hasMaterials = Array.isArray(apiData?.materials) && apiData.materials.length > 0;
		const hasFeatures =
			Array.isArray(apiData?.features) &&
			apiData.features.some((f: any) => f?.value || (Array.isArray(f?.values) && f.values.length > 0));
		return hasSizes || hasColors || hasMaterials || hasFeatures;
	}, [apiData]);

	const hasReviews = useMemo(() => {
		return (product?.reviews?.length ?? 0) > 0;
	}, [product]);

	// ✅ if options tab not available, fallback to reviews
	useEffect(() => {
		if (!loading) {
			if (!hasOptions && hasReviews) setActiveTab("reviews");
			if (!hasOptions && !hasReviews) {
				// nothing — keep default, but we will show a “no tabs” card
			}
		}
	}, [loading, hasOptions, hasReviews]);

	const validateOptions = useCallback((options: SelectedOptions, data: any) => {
		if (!data) return { isValid: false, missingOptions: [] as string[] };

		let isValid = true;
		const missingOptions: string[] = [];

		if (data.sizes?.length > 0 && (!options.size || options.size === "اختر")) {
			isValid = false;
			missingOptions.push("المقاس");
		}

		if (data.colors?.length > 0 && (!options.color || options.color === "اختر")) {
			isValid = false;
			missingOptions.push("اللون");
		}

		if (data.materials?.length > 0 && (!options.material || options.material === "اختر")) {
			isValid = false;
			missingOptions.push("الخامة");
		}

		if (data.features?.length > 0) {
			data.features.forEach((feature: any) => {
				const hasValues = feature.value || (feature.values && feature.values.length > 0);
				if (hasValues) {
					const v = options.features?.[feature.name];
					if (!v || v === "اختر") {
						isValid = false;
						missingOptions.push(feature.name);
					}
				}
			});
		}

		return { isValid, missingOptions };
	}, []);

	const getSelectedOptions = async () => {
		if (stickerFormRef.current?.getOptions) {
			const opts = await stickerFormRef.current.getOptions();
			setSelectedOptions(opts);
			return opts;
		}
		return selectedOptions;
	};

	const handleSubmit = async () => {
		if (!product || !apiData) return;

		const opts = await getSelectedOptions();
		const validation = validateOptions(opts, apiData);

		setShowValidation(true);
		if (!validation.isValid && hasOptions) {
			toast.error(`يرجى اختيار: ${validation.missingOptions.join("، ")}`);
			return;
		}

		if (!token) return toast.error("يجب تسجيل الدخول أولاً");


		const cartData = {
			product_id: product.id,
			quantity: 1,
			selected_options: [] as Array<{ option_name: string; option_value: string }>,
		};

		if (opts.size && opts.size !== "اختر") cartData.selected_options.push({ option_name: "المقاس", option_value: opts.size });
		if (opts.color && opts.color !== "اختر") cartData.selected_options.push({ option_name: "اللون", option_value: opts.color });
		if (opts.material && opts.material !== "اختر") cartData.selected_options.push({ option_name: "الخامة", option_value: opts.material });

		Object.entries(opts.features || {}).forEach(([name, value]) => {
			if (value && value !== "اختر") cartData.selected_options.push({ option_name: "خاصية", option_value: `${name}: ${value}` });
		});

		try {
			await addToCart(product.id, cartData).then(res => {
				console.log(res);
			})
			toast.success("تمت الإضافة للسلة ✅");
		} catch {
			toast.error("حدث خطأ أثناء إضافة المنتج للسلة");
		}
	};

	const toggleFavorite = async () => {
		if (!token) return toast.error("يجب تسجيل الدخول أولاً");
		if (!product) return;

		const newState = !isFavorite;
		setIsFavorite(newState);

		let saved = JSON.parse(localStorage.getItem("favorites") || "[]") as number[];
		if (newState) {
			if (!saved.includes(product.id)) saved.push(product.id);
		} else {
			saved = saved.filter((pid) => pid !== product.id);
		}
		localStorage.setItem("favorites", JSON.stringify(saved));

		try {
			const res = await fetch(`${API_URL}/favorites/toggle`, {
				method: "POST",
				headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
				body: JSON.stringify({ product_id: product.id }),
			});

			const data = await res.json();
			if (!res.ok || !data.status) {
				setIsFavorite(!newState);
				toast.error(data.message || "فشل تحديث المفضلة");
			} else {
				toast.success(data.message || "تم تحديث المفضلة");
			}
		} catch {
			setIsFavorite(!newState);
			toast.error("حدث خطأ أثناء تحديث المفضلة");
		}
	};

	if (loading) return <ProductPageSkeleton />;

	if (errorMsg || !product) {
		return (
			<div className="min-h-[60vh] flex items-center justify-center px-4" dir="rtl">
				<div className="max-w-md w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
					<div className="flex items-center gap-3">
						<div className="w-11 h-11 rounded-2xl bg-rose-50 flex items-center justify-center">
							<FiAlertTriangle className="text-rose-600" size={22} />
						</div>
						<div>
							<p className="font-extrabold text-slate-900">تعذر عرض المنتج</p>
							<p className="text-sm text-slate-600 mt-1">{errorMsg || "المنتج غير موجود"}</p>
						</div>
					</div>
					<button
						onClick={() => location.reload()}
						className="mt-4 w-full rounded-2xl bg-slate-900 text-white py-3 font-extrabold hover:opacity-95 transition"
					>
						إعادة المحاولة
					</button>
				</div>
			</div>
		);
	}

	const validation = validateOptions(selectedOptions, apiData);

	const anySelected =
		selectedOptions.size !== "اختر" ||
		selectedOptions.color !== "اختر" ||
		selectedOptions.material !== "اختر" ||
		Object.values(selectedOptions.features || {}).some((v) => v !== "اختر");

	const categories2 = homeData?.sub_categories || [];

	return (
		<>
			<section className=" container pt-4 pb-24" dir="rtl">
				<motion.div variants={fadeUp} initial="hidden" animate="show" className="mb-4">
					<CustomSeparator proName={product.name} />
				</motion.div>

				<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
					{/* Left: Info */}
					<motion.div variants={fadeUp} initial="hidden" animate="show" className="lg:col-span-5">
						<h1 className="text-slate-900 text-2xl md:text-3xl font-extrabold leading-snug">
							{product.name}
						</h1>

						<div className="mt-3 flex items-center justify-between gap-4">
							<div className="flex items-center gap-3">
								<HearComponent
									liked={isFavorite}
									onToggleLike={toggleFavorite}
									ClassName="text-slate-500"
									ClassNameP="border border-slate-200 hover:border-slate-300"
								/>
								<ShareButton />
							</div>

							<div className="flex items-center gap-2">
								<RatingStars average_ratingc={product.average_rating || 0} reviewsc={product.reviews || []} />
							</div>
						</div>

						{/* Specs */}
						<div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
							<h3 className="font-extrabold text-slate-900 text-lg">مواصفات المنتج</h3>
							<div
								className="prose prose-sm max-w-none mt-3 text-slate-700"
								dangerouslySetInnerHTML={{ __html: product.description || "" }}
							/>
							<div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
								<div className="flex items-center gap-2">
									<FaBarcode className="text-pro-max" />
									<p className="text-sm font-bold text-slate-700">رقم الموديل</p>
								</div>
								<p className="text-sm font-extrabold text-slate-900">{product.id}</p>
							</div>
						</div>

						{/* Tabs */}
						<div className="mt-6 rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
							<div className="rounded-2xl border border-gray-200 border-t-0">
								<div className="grid grid-cols-2 border-b-2 border-[#14213d]">
									<div
										className={`flex items-center justify-center py-3 rounded-2xl rounded-br-none rounded-bl-none cursor-pointer
        ${activeTab === "options" ? "bg-[#14213d] !text-white" : "bg-white"}`}
										onClick={() => setActiveTab("options")}
									>
										<button className="text-center transition cursor-pointer">
											خيارات المنتج
										</button>
									</div>

									<div
										className={`flex items-center justify-center py-3 rounded-2xl rounded-br-none rounded-bl-none cursor-pointer
        ${activeTab === "reviews" ? "bg-[#14213d] !text-white" : "bg-white"}`}
										onClick={() => setActiveTab("reviews")}
									>
										<button className="text-center transition cursor-pointer">
											تقييمات المنتج
										</button>
									</div>
								</div>

								<div className="m-4">
									{activeTab === "options" && (
										<StickerForm
											productId={product.id}
											ref={stickerFormRef}
											onOptionsChange={setSelectedOptions}
											showValidation={showValidation}
										/>
									)}

									{activeTab === "reviews" && <POVComponent product={product} />}
								</div>
							</div>

						</div>

						{/* Selected Options Summary */}
						<AnimatePresence>
							{anySelected && (
								<motion.div
									initial={{ opacity: 0, y: 14 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: 14 }}
									className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
								>
									<div className="flex items-center justify-between">
										<h3 className="font-extrabold text-slate-900">الخيارات المختارة</h3>
										{!validation.isValid && hasOptions && (
											<span className="text-xs font-extrabold rounded-full bg-amber-50 text-amber-700 px-3 py-1 border border-amber-200">
												خيارات ناقصة
											</span>
										)}
									</div>

									<div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
										{selectedOptions.size !== "اختر" && (
											<OptChip label="المقاس" value={selectedOptions.size} />
										)}
										{selectedOptions.color !== "اختر" && (
											<OptChip label="اللون" value={selectedOptions.color} />
										)}
										{selectedOptions.material !== "اختر" && (
											<OptChip label="الخامة" value={selectedOptions.material} />
										)}
										{Object.entries(selectedOptions.features || {}).map(([k, v]) =>
											v !== "اختر" ? <OptChip key={k} label={k} value={v} /> : null
										)}
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</motion.div>

					{/* Right: Gallery */}
					<motion.div variants={fadeUp} initial="hidden" animate="show" className="lg:col-span-7">
						<div className="lg:sticky lg:top-[150px]">
							<ProductGallery
								mainImage={product.image || "/images/o1.jpg"}
								images={product.images?.length ? product.images : [{ url: "/images/c1.png", alt: "default" }]}
							/>
						</div>
					</motion.div>
				</div>

				{/* Similar products */}
				<div className="mt-10">
					{product && categories2.length > 0 && (
						<section>
							{(() => {
								const currentCategory = categories2.find((cat: any) =>
									cat.products?.some((p: any) => p.id === product.id)
								);

								const base = currentCategory?.products?.filter((p: any) => p.id !== product.id) || [];
								const fallback = categories2.flatMap((cat: any) => cat.products || []).filter((p: any) => p.id !== product.id).slice(0, 12);

								const list = base.length ? base : fallback;
								if (!list.length) return null;

								return (
									<div className="mb-10">
										<InStockSlider
											title="منتجات قد تعجبك"
											inStock={list}
											CardComponent={(props: any) => <ProductCard {...props} classNameHome="hidden" className2="hidden" />}
										/>
									</div>
								);
							})()}
						</section>
					)}
				</div>
			</section>

			{/* ✅ Bottom bar */}
			<div className="fixed bottom-0 start-0 end-0 z-50 border-t border-slate-200 bg-white/85 backdrop-blur">
				<div className="mx-4 md:mx-10 xl:mx-[14%] py-3 flex items-center justify-between gap-3">
					<div className="flex items-center gap-3 min-w-0">
						<div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 ring-1 ring-slate-200">
							<Image src={product.image || "/images/o1.jpg"} alt={product.name} fill className="object-cover" />
						</div>

						<div className="min-w-0">
							<p className="text-xs text-slate-500 font-bold line-clamp-1">السعر شامل الضريبة</p>
							<p className="text-sm md:text-base font-extrabold text-slate-900 line-clamp-1">
								{product.name}
							</p>
						</div>
					</div>

					<div className="flex items-center gap-3">
						<div className="hidden sm:flex flex-col items-end">
							<p className="text-xs text-slate-500 font-bold">السعر</p>
							<p className="text-lg font-extrabold text-slate-900">{product.price}</p>
						</div>

						<div className="min-w-[170px]">
							<ButtonComponent
								title={hasOptions && !validation.isValid ? "اختر الخيارات أولاً" : "اضافة للسلة"}
								onClick={handleSubmit}
							/>
						</div>
					</div>
				</div>
			</div>

			<div className="h-16" />
		</>
	);
}

function OptChip({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
			<p className="text-xs text-slate-500 font-bold">{label}</p>
			<p className="text-sm font-extrabold text-slate-900 mt-1">{value}</p>
		</div>
	);
}
