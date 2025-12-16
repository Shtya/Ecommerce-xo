"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import toast from "react-hot-toast";

import HearComponent from "@/components/HearComponent";
import RatingStars from "@/components/RatingStars";
import ShareButton from "@/components/ShareButton";
import StickerForm from "@/components/StickerForm";
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
import { Trash2, Star, ChevronLeft, ChevronRight, ShieldCheck, Truck, Tags, Package } from "lucide-react";

import { ProductPageSkeleton } from "../../../components/skeletons/HomeSkeletons";

type TabKey = "options" | "reviews";

type ReviewUser = {
	id: number;
	name: string;
	avatar: string | null;
	is_verified?: boolean;
};

type Review = {
	id: number;
	product_id: number;
	user_id: number;
	rating: number;
	comment: string;
	is_verified: boolean;
	created_at: string;
	human_created_at?: string;
	user?: ReviewUser;
};

type ReviewsStats = {
	average_rating: number;
	total_reviews: number;
	rating_distribution: {
		[k: string]: { stars: number; count: number; percentage: number };
	};
};

type ReviewsPagination = {
	total: number;
	per_page: number;
	current_page: number;
	last_page: number;
};

type ReviewsResponse = {
	status: boolean;
	message: string;
	data: {
		product: { id: number; name: string; image: string };
		stats: ReviewsStats;
		user_review: Review | null;
		reviews: Review[];
		pagination: ReviewsPagination;
	};
};

// ✅ Updated SelectedOptions
interface SelectedOptions {
	size: string;
	color: string;
	material: string;
	optionGroups: { [groupName: string]: string }; // ✅ options grouped by option_name
	printing_method: string;
	print_location: string;
	isValid: boolean;
}

const fadeUp: any = {
	hidden: { opacity: 0, y: 14 },
	show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

function Sk({ className = "" }: { className?: string }) {
	return <div className={`animate-pulse rounded-xl bg-slate-200 ${className}`} />;
}

function ReviewsSkeleton() {
	return (
		<div className="space-y-4">
			<div className="rounded-2xl border border-slate-200 bg-white p-4">
				<Sk className="h-5 w-40" />
				<Sk className="h-3 w-72 mt-3" />
				<Sk className="h-3 w-56 mt-2" />
			</div>

			<div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
				{Array.from({ length: 3 }).map((_, i) => (
					<div key={i} className="rounded-2xl border border-slate-200 p-4">
						<div className="flex items-center gap-3">
							<Sk className="h-10 w-10 rounded-full" />
							<div className="flex-1">
								<Sk className="h-4 w-40" />
								<Sk className="h-3 w-24 mt-2" />
							</div>
							<Sk className="h-6 w-14" />
						</div>
						<Sk className="h-3 w-full mt-4" />
						<Sk className="h-3 w-10/12 mt-2" />
					</div>
				))}
			</div>
		</div>
	);
}

function StarsRow({ value }: { value: number }) {
	return (
		<div className="flex items-center gap-1">
			{Array.from({ length: 5 }).map((_, i) => {
				const filled = i < value;
				return (
					<Star
						key={i}
						className={`w-4 h-4 ${filled ? "text-amber-500" : "text-slate-300"}`}
						fill={filled ? "currentColor" : "none"}
					/>
				);
			})}
		</div>
	);
}

function getPages(current: number, total: number): Array<number | "…"> {
	if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

	const pages = new Set<number>([1, total, current]);
	if (current - 1 >= 1) pages.add(current - 1);
	if (current + 1 <= total) pages.add(current + 1);

	const sorted = Array.from(pages).sort((a, b) => a - b);

	const out: Array<number | "…"> = [];
	for (let i = 0; i < sorted.length; i++) {
		const p = sorted[i];
		const prev = sorted[i - 1];
		if (i > 0 && p - (prev as number) > 1) out.push("…");
		out.push(p);
	}
	return out;
}

// ✅ small UI helpers
function SectionCard({
	title,
	icon,
	children,
}: {
	title: string;
	icon?: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
			<div className="flex items-center justify-between gap-3">
				<h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
					{icon}
					{title}
				</h3>
			</div>
			<div className="mt-4">{children}</div>
		</div>
	);
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
	return (
		<div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
			<p className="text-sm font-extrabold text-slate-700">{label}</p>
			<div className="text-sm font-black text-slate-900 text-left">{value}</div>
		</div>
	);
}

function Pill({ children, tone = "slate" }: { children: React.ReactNode; tone?: "slate" | "amber" | "emerald" }) {
	const map = {
		slate: "bg-slate-50 text-slate-700 border-slate-200",
		amber: "bg-amber-50 text-amber-800 border-amber-200",
		emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
	};
	return <span className={`text-[11px] font-extrabold px-2 py-1 rounded-full border ${map[tone]}`}>{children}</span>;
}

export default function ProductPageClient() {
	const { id } = useParams();
	const productId = id as string;

	const { authToken: token, user, userId } = useAuth() as any;
	const currentUserId: number | null = typeof userId === "number" ? userId : user?.id ?? null;

	const { addToCart } = useCart();
	const { homeData } = useAppContext();

	const stickerFormRef = useRef<any>(null);

	const [product, setProduct] = useState<any>(null);
	const [apiData, setApiData] = useState<any>(null);

	const [loading, setLoading] = useState(true);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);

	const [isFavorite, setIsFavorite] = useState(false);
	const [activeTab, setActiveTab] = useState<TabKey>("options");

	// ✅ showValidation only after pressing add-to-cart
	const [showValidation, setShowValidation] = useState(false);

	const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({
		size: "اختر",
		color: "اختر",
		material: "اختر",
		optionGroups: {},
		printing_method: "اختر",
		print_location: "اختر",
		isValid: false,
	});

	const API_URL = process.env.NEXT_PUBLIC_API_URL;

	// -------------------------
	// Reviews state
	// -------------------------
	const [reviewsLoading, setReviewsLoading] = useState(true);
	const [reviewsError, setReviewsError] = useState<string | null>(null);
	const [reviewsData, setReviewsData] = useState<any>(null);

	const [reviewsPage, setReviewsPage] = useState(1);
	const [reviewsRatingFilter, setReviewsRatingFilter] = useState<number | "">("");
	const [reviewsSortBy, setReviewsSortBy] = useState<"rating" | "created_at">("created_at");
	const [reviewsSortDir, setReviewsSortDir] = useState<"asc" | "desc">("desc");

	const [myRating, setMyRating] = useState<number>(5);
	const [myComment, setMyComment] = useState<string>("");

	// ✅ fetch product
	useEffect(() => {
		let mounted = true;

		async function fetchProduct() {
			if (!productId || !API_URL) return;

			setLoading(true);
			setErrorMsg(null);

			try {
				const res = await fetch(`${API_URL}/products/${productId}`, {
					headers: token ? { Authorization: `Bearer ${token}` } : {},
					cache: "no-store",
				});

				if (!res.ok) throw new Error("not_found");

				const json = await res.json();
				const prod = json?.data ?? null;

				if (!mounted) return;

				setProduct(prod);
				setApiData(json?.data);

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

	// ✅ fetch reviews
	const fetchReviews = useCallback(async () => {
		if (!API_URL || !productId) return;

		setReviewsLoading(true);
		setReviewsError(null);

		try {
			const params = new URLSearchParams();
			params.set("sort_by", reviewsSortBy === "created_at" ? "created_at" : "rating");
			params.set("sort_direction", reviewsSortDir);
			params.set("page", String(reviewsPage));
			if (reviewsRatingFilter !== "") params.set("rating", String(reviewsRatingFilter));

			const res = await fetch(`${API_URL}/reviews/product/${productId}?${params.toString()}`, {
				headers: token ? { Authorization: `Bearer ${token}` } : {},
				cache: "no-store",
			});

			const json: ReviewsResponse = await res.json();
			if (!res.ok || !json.status) throw new Error(json.message || "فشل تحميل التقييمات");

			setReviewsData(json.data);

			if (json.data.user_review) {
				setMyRating(json.data.user_review.rating || 5);
				setMyComment(json.data.user_review.comment || "");
			} else {
				setMyRating(5);
				setMyComment("");
			}
		} catch (e: any) {
			setReviewsError(e?.message || "حدث خطأ أثناء تحميل التقييمات");
			setReviewsData(null);
		} finally {
			setReviewsLoading(false);
		}
	}, [API_URL, productId, token, reviewsPage, reviewsRatingFilter, reviewsSortBy, reviewsSortDir]);

	useEffect(() => {
		fetchReviews();
	}, [fetchReviews]);

	// ✅ OPTIONS exist?
	const hasOptions = useMemo(() => {
		if (!apiData) return false;

		const hasSizes = Array.isArray(apiData?.sizes) && apiData.sizes.length > 0;
		const hasColors = Array.isArray(apiData?.colors) && apiData.colors.length > 0;
		const hasMaterials = Array.isArray(apiData?.materials) && apiData.materials.length > 0;

		// ✅ features are NOT options anymore (they're specs)
		const hasExtraOptions = Array.isArray(apiData?.options) && apiData.options.length > 0;
		const hasPrinting = Array.isArray(apiData?.printing_methods) && apiData.printing_methods.length > 0;

		return hasSizes || hasColors || hasMaterials || hasExtraOptions || hasPrinting;
	}, [apiData]);

	const hasReviews = useMemo(() => {
		return (reviewsData?.pagination?.total ?? 0) > 0;
	}, [reviewsData]);

	useEffect(() => {
		if (!loading) {
			if (activeTab === "options" && !hasOptions) setActiveTab("reviews");
			if (activeTab === "reviews" && !hasReviews && hasOptions) setActiveTab("options");
		}
	}, [loading, hasOptions, hasReviews, activeTab]);

	// ✅ group options (option_name -> items)
	const groupedApiOptions = useMemo(() => {
		const list = Array.isArray(apiData?.options) ? apiData.options : [];
		const out: Record<string, any[]> = {};
		list.forEach((o: any) => {
			const k = String(o.option_name || "").trim();
			if (!k) return;
			out[k] = out[k] || [];
			out[k].push(o);
		});
		return out;
	}, [apiData]);

	const requiredOptionGroups = useMemo(() => {
		const groups = groupedApiOptions;
		const required: string[] = [];
		Object.keys(groups).forEach((k) => {
			const items = groups[k] || [];
			const isRequired = items.some((x: any) => Boolean(x?.is_required));
			if (isRequired) required.push(k);
		});
		return required;
	}, [groupedApiOptions]);

	// ✅ warranty text fix
	const warrantyText = useMemo(() => {
		const w = apiData?.warranty;
		if (!w) return null;

		const months = w?.months;
		if (typeof months === "number" && months > 0) return `${months} أشهر ضمان`;

		const raw = String(w?.display_text || "").trim();
		// if it's just "أشهر ضمان" بدون رقم => hide
		if (!raw) return null;
		if (/^أشهر\s+ضمان$/.test(raw) || raw === "أشهر ضمان") return null;

		return raw;
	}, [apiData]);

	const validateOptions = useCallback(
		(options: SelectedOptions, data: any) => {
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

			// ✅ required option groups
			if (Array.isArray(data?.options) && data.options.length > 0) {
				const groups: Record<string, any[]> = {};
				data.options.forEach((o: any) => {
					const k = String(o.option_name || "").trim();
					if (!k) return;
					groups[k] = groups[k] || [];
					groups[k].push(o);
				});

				Object.keys(groups).forEach((groupName) => {
					const items = groups[groupName] || [];
					const isRequired = items.some((x: any) => Boolean(x?.is_required));
					if (!isRequired) return;

					const v = options.optionGroups?.[groupName];
					if (!v || v === "اختر") {
						isValid = false;
						missingOptions.push(groupName);
					}
				});
			}

			// ✅ printing method required if exists
			if (Array.isArray(data?.printing_methods) && data.printing_methods.length > 0) {
				if (!options.printing_method || options.printing_method === "اختر") {
					isValid = false;
					missingOptions.push("طريقة الطباعة");
				}
			}

			// ✅ print location required if exists
			if (Array.isArray(data?.print_locations) && data.print_locations.length > 0) {
				if (!options.print_location || options.print_location === "اختر") {
					isValid = false;
					missingOptions.push("مكان الطباعة");
				}
			}

			return { isValid, missingOptions };
		},
		[]
	);

	const getSelectedOptions = async () => {
		if (stickerFormRef.current?.getOptions) {
			const opts = await stickerFormRef.current.getOptions();
			setSelectedOptions(opts);
			return opts;
		}
		return selectedOptions;
	};

	const handleAddToCart = async () => {
		if (!product || !apiData) return;

		setShowValidation(true);

		const opts = await getSelectedOptions();
		const validation = validateOptions(opts, apiData);

		if (!validation.isValid && hasOptions) {
			toast.error(`يرجى اختيار: ${validation.missingOptions.join("، ")}`);
			return;
		}

		if (!token) return toast.error("يجب تسجيل الدخول أولاً");

		const cartData = {
			product_id: product.id,
			quantity: 1,
			selected_options: [] as Array<any>,
		};

		if (opts.size && opts.size !== "اختر") cartData.selected_options.push({ option_name: "المقاس", option_value: opts.size });
		if (opts.color && opts.color !== "اختر") cartData.selected_options.push({ option_name: "اللون", option_value: opts.color });
		if (opts.material && opts.material !== "اختر") cartData.selected_options.push({ option_name: "الخامة", option_value: opts.material });

		// ✅ options groups
		Object.entries(opts.optionGroups || {}).forEach(([group, value]) => {
			if (value && value !== "اختر") cartData.selected_options.push({ option_name: group, option_value: value });
		});

		// ✅ printing
		if (opts.printing_method && opts.printing_method !== "اختر")
			cartData.selected_options.push({ option_name: "طريقة الطباعة", option_value: opts.printing_method });

		if (opts.print_location && opts.print_location !== "اختر")
			cartData.selected_options.push({ option_name: "مكان الطباعة", option_value: opts.print_location });

		try {
			await addToCart(product.id, cartData);
			// toast.success("تمت الإضافة للسلة ✅");
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

	const categories2 = homeData?.sub_categories || [];

	// -------- Reviews actions (POST / DELETE) --------
	const canDeleteReview = useCallback(
		(r: Review) => {
			if (reviewsData?.user_review && r.id === reviewsData.user_review.id) return true;
			if (currentUserId && r.user_id === currentUserId) return true;
			return false;
		},
		[reviewsData?.user_review, currentUserId]
	);

	const submitReview = async () => {
		if (!token) return toast.error("يجب تسجيل الدخول أولاً");
		if (!product) return;

		const comment = myComment.trim();
		if (!comment) return toast.error("اكتب تعليقك أولاً");
		if (myRating < 1 || myRating > 5) return toast.error("التقييم غير صحيح");

		try {
			const res = await fetch(`${API_URL}/reviews`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
					Accept: "application/json",
				},
				body: JSON.stringify({
					product_id: product.id,
					rating: myRating,
					comment,
				}),
			});

			const json = await res.json();
			if (!res.ok || !json.status) throw new Error(json.message || "فشل إرسال التقييم");

			toast.success("تم إرسال تقييمك ✅");
			setReviewsPage(1);
			await fetchReviews();
		} catch (e: any) {
			toast.error(e?.message || "حدث خطأ أثناء إرسال التقييم");
		}
	};

	const deleteReview = async (reviewId: number) => {
		if (!token) return toast.error("يجب تسجيل الدخول أولاً");

		try {
			const res = await fetch(`${API_URL}/reviews/${reviewId}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
					Accept: "application/json",
				},
			});

			const json = await res.json();
			if (!res.ok || !json.status) throw new Error(json.message || "فشل حذف التقييم");

			toast.success("تم حذف التقييم");
			setReviewsPage(1);
			await fetchReviews();
		} catch (e: any) {
			toast.error(e?.message || "حدث خطأ أثناء حذف التقييم");
		}
	};

	// ------------------------------------
	// Render states
	// ------------------------------------
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

	// ✅ Only show "missing options" badge AFTER submit attempt
	const currentValidation = validateOptions(selectedOptions, apiData);
	const showMissingBadge = showValidation && hasOptions && !currentValidation.isValid;

	const anySelected =
		selectedOptions.size !== "اختر" ||
		selectedOptions.color !== "اختر" ||
		selectedOptions.material !== "اختر" ||
		selectedOptions.printing_method !== "اختر" ||
		selectedOptions.print_location !== "اختر" ||
		Object.values(selectedOptions.optionGroups || {}).some((v) => v !== "اختر");

	return (
		<>
			<section className="container pt-4 pb-24" dir="rtl">
				<motion.div variants={fadeUp} initial="hidden" animate="show" className="mb-4">
					<CustomSeparator proName={product.name} />
				</motion.div>

				<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
					{/* Left: Info */}
					<motion.div variants={fadeUp} initial="hidden" animate="show" className=" space-y-5 lg:col-span-5">
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

						{/* Specs (description + model) */}
						<SectionCard title="وصف المنتج" icon={<Package className="w-5 h-5 text-slate-700" />}>
							<div
								className="prose prose-sm max-w-none text-slate-700"
								dangerouslySetInnerHTML={{ __html: product.description || "" }}
							/>
						</SectionCard>

						{/* ✅ Shipping + Warranty + Offers */}
						{apiData?.delivery_time && <SectionCard title="معلومات الشحن والضمان والعروض" icon={<Truck className="w-5 h-5 text-slate-700" />}>
							<div className="space-y-3">
								{apiData?.delivery_time?.estimated && (
									<InfoRow
										label="التوصيل المتوقع"
										value={<Pill tone="emerald">{apiData.delivery_time.estimated}</Pill>}
									/>
								)}

								{warrantyText && (
									<InfoRow
										label="الضمان"
										value={
											<span className="inline-flex items-center gap-2">
												<ShieldCheck className="w-4 h-4 text-emerald-600" />
												<span className="font-black">{warrantyText}</span>
											</span>
										}
									/>
								)}

								{Array.isArray(apiData?.offers) && apiData.offers.length > 0 && (
									<div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
										<p className="text-sm font-extrabold text-slate-700 flex items-center gap-2">
											<Tags className="w-4 h-4" /> العروض المتاحة
										</p>
										<div className="mt-2 flex flex-wrap gap-2">
											{apiData.offers.map((o: any) => (
												<Pill key={o.id} tone="amber">
													{o.name}
												</Pill>
											))}
										</div>
									</div>
								)}
							</div>
						</SectionCard>}

						{/* ✅ Features as SPECs (NOT selectable) */}
						{Array.isArray(apiData?.features) && apiData.features.length > 0 && (
							<SectionCard title="المواصفات" icon={<Star className="w-5 h-5 text-slate-700" />}>
								<div className="space-y-2">
									{apiData.features.map((f: any, idx: number) => (
										<InfoRow
											key={`${f?.name}-${idx}`}
											label={String(f?.name || "—")}
											value={<span className="font-black">{String(f?.value || "—")}</span>}
										/>
									))}
								</div>
							</SectionCard>
						)}

						{/* ✅ Sizes + tiers */}
						{Array.isArray(apiData?.sizes) && apiData.sizes.length > 0 && (
							<SectionCard title="المقاسات وأسعار الكميات" icon={<Package className="w-5 h-5 text-slate-700" />}>
								<div className="space-y-3">
									{apiData.sizes.map((s: any) => (
										<div key={s.id} className="rounded-2xl border border-slate-200 overflow-hidden">
											<div className="bg-slate-50 px-4 py-3 flex items-center justify-between">
												<p className="font-extrabold text-slate-900">{s.name}</p>
												<Pill>{(s?.tiers?.length ?? 0)} شريحة</Pill>
											</div>

											<div className="p-4">
												{s?.tiers?.length ? (
													<div className="overflow-x-auto">
														<table className="w-full text-sm">
															<thead>
																<tr className="text-slate-500">
																	<th className="text-right py-2">الكمية</th>
																	<th className="text-right py-2">سعر الوحدة</th>
																	<th className="text-right py-2">الإجمالي</th>
																</tr>
															</thead>
															<tbody>
																{s.tiers.map((t: any, i: number) => (
																	<tr key={i} className="border-t border-slate-200">
																		<td className="py-2 font-extrabold text-slate-900">{t.quantity}</td>
																		<td className="py-2 font-bold text-slate-700">{t.price_per_unit}</td>
																		<td className="py-2 font-black text-slate-900">{t.total_price}</td>
																	</tr>
																))}
															</tbody>
														</table>
													</div>
												) : (
													<p className="text-sm font-bold text-slate-600">لا توجد شرائح تسعير لهذا المقاس.</p>
												)}
											</div>
										</div>
									))}
								</div>
							</SectionCard>
						)}

						{/* ✅ Pricing tiers */}
						{Array.isArray(apiData?.pricing_tiers) && apiData.pricing_tiers.length > 0 && (
							<SectionCard title="شرائح التسعير العامة" icon={<Tags className="w-5 h-5 text-slate-700" />}>
								<div className="overflow-x-auto rounded-2xl border border-slate-200">
									<table className="w-full text-sm">
										<thead className="bg-slate-50">
											<tr className="text-slate-600">
												<th className="text-right py-3 px-4">الكمية</th>
												<th className="text-right py-3 px-4">السعر</th>
												<th className="text-right py-3 px-4">الخصم %</th>
											</tr>
										</thead>
										<tbody>
											{apiData.pricing_tiers.map((t: any, i: number) => (
												<tr key={i} className="border-t border-slate-200">
													<td className="py-3 px-4 font-extrabold text-slate-900">{t.quantity}</td>
													<td className="py-3 px-4 font-bold text-slate-700">{t.price ?? "—"}</td>
													<td className="py-3 px-4 font-bold text-slate-700">{t.discount_percentage ?? "—"}</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</SectionCard>
						)}

						{/* ✅ Materials */}
						{Array.isArray(apiData?.materials) && apiData.materials.length > 0 && (
							<SectionCard title="المواد" icon={<Package className="w-5 h-5 text-slate-700" />}>
								<div className="space-y-3">
									{apiData.materials.map((m: any) => (
										<div key={m.id} className="rounded-2xl border border-slate-200 p-4">
											<div className="flex items-start justify-between gap-3">
												<div>
													<p className="font-extrabold text-slate-900">{m.name}</p>
													{m.description && <p className="text-sm text-slate-600 font-bold mt-1">{m.description}</p>}
												</div>
												{Number(m.additional_price || 0) > 0 ? (
													<Pill tone="amber">+ {m.additional_price}</Pill>
												) : (
													<Pill tone="slate">بدون زيادة</Pill>
												)}
											</div>

											<div className="mt-3 grid grid-cols-2 gap-2">
												<InfoRow label="الكمية" value={m.quantity ?? "—"} />
												<InfoRow label="الوحدة" value={m.unit ?? "—"} />
											</div>
										</div>
									))}
								</div>
							</SectionCard>
						)}

						{/* ✅ Options (read-only list) */}
						{Array.isArray(apiData?.options) && apiData.options.length > 0 && (
							<SectionCard title="الخيارات الإضافية" icon={<Tags className="w-5 h-5 text-slate-700" />}>
								<div className="space-y-3">
									{Object.keys(groupedApiOptions).map((group) => {
										const items = groupedApiOptions[group] || [];
										const required = items.some((x: any) => Boolean(x?.is_required));
										return (
											<div key={group} className="rounded-2xl border border-slate-200 overflow-hidden">
												<div className="bg-slate-50 px-4 py-3 flex items-center justify-between">
													<p className="font-extrabold text-slate-900">{group}</p>
													{required ? <Pill tone="amber">إجباري</Pill> : <Pill>اختياري</Pill>}
												</div>
												<div className="p-4 space-y-2">
													{items.map((o: any) => (
														<div key={o.id} className="flex items-center justify-between gap-3">
															<p className="text-sm font-bold text-slate-700">{o.option_value}</p>
															{Number(o.additional_price || 0) > 0 ? (
																<Pill tone="amber">+ {o.additional_price}</Pill>
															) : (
																<Pill>0</Pill>
															)}
														</div>
													))}
												</div>
											</div>
										);
									})}
								</div>
							</SectionCard>
						)}

						{/* ✅ Printing (read-only list) */}
						{(Array.isArray(apiData?.printing_methods) && apiData.printing_methods.length > 0) ||
							(Array.isArray(apiData?.print_locations) && apiData.print_locations.length > 0) ? (
							<SectionCard title="الطباعة ومواقعها" icon={<Star className="w-5 h-5 text-slate-700" />}>
								<div className="space-y-4">
									{Array.isArray(apiData?.printing_methods) && apiData.printing_methods.length > 0 && (
										<div className="rounded-2xl border border-slate-200 p-4">
											<p className="font-extrabold text-slate-900">طرق الطباعة</p>
											<div className="mt-3 space-y-2">
												{apiData.printing_methods.map((pm: any) => (
													<div key={pm.id} className="flex items-start justify-between gap-3">
														<div>
															<p className="text-sm font-extrabold text-slate-800">{pm.name}</p>
															{pm.description && <p className="text-sm text-slate-600 font-bold mt-1">{pm.description}</p>}
														</div>
														<Pill tone="amber">{pm.base_price}</Pill>
													</div>
												))}
											</div>
										</div>
									)}

									{Array.isArray(apiData?.print_locations) && apiData.print_locations.length > 0 && (
										<div className="rounded-2xl border border-slate-200 p-4">
											<p className="font-extrabold text-slate-900">أماكن الطباعة</p>
											<div className="mt-3 space-y-2">
												{apiData.print_locations.map((pl: any) => (
													<div key={pl.id} className="flex items-center justify-between gap-3">
														<p className="text-sm font-extrabold text-slate-800">
															{pl.name}{" "}
															<span className="text-xs font-black text-slate-500">({pl.type})</span>
														</p>
														<Pill>{pl.additional_price ?? "0.00"}</Pill>
													</div>
												))}
											</div>
										</div>
									)}
								</div>
							</SectionCard>
						) : null}

						{/* Tabs */}
						<div className="mt-6 rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
							<div className="grid grid-cols-2 border-b border-slate-200">
								<button
									disabled={!hasOptions}
									className={[
										"py-3 font-extrabold transition",
										activeTab === "options" ? "bg-[#14213d] text-white" : "bg-white text-slate-800",
										!hasOptions ? "opacity-40 cursor-not-allowed" : " ",
									].join(" ")}
									onClick={() => hasOptions && setActiveTab("options")}
								>
									خيارات المنتج
								</button>

								<button
									className={[
										"py-3 font-extrabold transition",
										activeTab === "reviews" ? "bg-[#14213d] text-white" : "bg-white text-slate-800",
										"  ",
									].join(" ")}
									onClick={() => setActiveTab("reviews")}
								>
									تقييمات المنتج
								</button>
							</div>

							<div className="m-4">
								{activeTab === "options" && (
									hasOptions ? (
										<StickerForm
											productId={product.id}
											ref={stickerFormRef}
											onOptionsChange={setSelectedOptions}
											showValidation={showValidation}
										/>
									) : (
										<div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-600 font-bold">
											لا توجد خيارات لهذا المنتج.
										</div>
									)
								)}

								{activeTab === "reviews" && (
									<div className="space-y-5">
										{reviewsLoading ? (
											<ReviewsSkeleton />
										) : reviewsError ? (
											<div className="rounded-2xl border border-slate-200 bg-white p-5">
												<p className="font-extrabold text-slate-900">تعذر تحميل التقييمات</p>
												<p className="text-sm text-slate-600 mt-1">{reviewsError}</p>
												<button
													onClick={fetchReviews}
													className="mt-4 rounded-xl border border-slate-200 px-4 py-2 font-extrabold hover:bg-slate-50 transition"
												>
													إعادة المحاولة
												</button>
											</div>
										) : (
											<>
												{/* Stats Card */}
												<div className="rounded-3xl border border-slate-200 bg-white p-5">
													<div className="flex items-start justify-between gap-4">
														<div>
															<p className="text-sm font-bold text-slate-500">متوسط التقييم</p>
															<div className="flex items-center gap-3 mt-1">
																<p className="text-3xl font-black text-slate-900">
																	{reviewsData?.stats?.average_rating ?? 0}
																</p>
																<StarsRow value={Math.round(reviewsData?.stats?.average_rating ?? 0)} />
															</div>
															<p className="text-sm text-slate-500 mt-1">
																{reviewsData?.stats?.total_reviews ?? 0} تقييم
															</p>
														</div>

													</div>

													<div className="mt-5 space-y-2">
														{[5, 4, 3, 2, 1].map((s) => {
															const d = reviewsData?.stats?.rating_distribution?.[String(s)];
															const pct = d?.percentage ?? 0;
															const count = d?.count ?? 0;
															return (
																<div key={s} className="flex items-center gap-3">
																	<div className="w-10 text-sm font-extrabold text-slate-700">{s}</div>
																	<div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
																		<div className="h-full bg-amber-400" style={{ width: `${pct}%` }} />
																	</div>
																	<div className="w-16 text-left text-sm text-slate-500 font-bold">
																		{count}
																	</div>
																</div>
															);
														})}
													</div>
												</div>

												{/* My review */}
												<div className="rounded-3xl border border-slate-200 bg-white p-5">
													<div className="flex items-center justify-between gap-3">
														<p className="font-extrabold text-slate-900">اكتب تقييمك</p>
														{!token && (
															<span className="text-xs font-extrabold rounded-full bg-slate-50 text-slate-600 px-3 py-1 border border-slate-200">
																سجّل الدخول لإضافة تقييم
															</span>
														)}
													</div>

													<div className="mt-5 flex flex-col  gap-5">
														{/* ⭐ STARS */}
														<div className="flex items-center gap-4 ">


															<StarRatingInput
																value={myRating}
																onChange={setMyRating}
																disabled={!token}
															/>
														</div>

														{/* COMMENT */}
														<div className=" flex items-start gap-4">

															<textarea
																disabled={!token}
																value={myComment}
																onChange={(e) => setMyComment(e.target.value)}
																rows={4}
																className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-amber-300 disabled:opacity-50"
																placeholder="اكتب رأيك في المنتج بكل صراحة..."
															/>
														</div>
													</div>

													<button
														disabled={!token}
														onClick={submitReview}
														className="mt-5 w-full md:w-auto rounded-2xl bg-[#14213d] text-white px-8 py-3 font-extrabold hover:opacity-95 transition disabled:opacity-50"
													>
														إرسال التقييم
													</button>
												</div>


												{/* Reviews list */}
												<div className="rounded-3xl border border-slate-200 bg-white p-5">
													<p className="font-extrabold text-slate-900 mb-4">آراء العملاء</p>

													{reviewsData?.reviews?.length ? (
														<div className="space-y-3">
															{reviewsData.reviews.map((r: any) => (
																<div key={r.id} className="rounded-2xl border border-slate-200 p-4">
																	<div className="flex items-start justify-between gap-3">
																		<div className="flex items-center gap-3">
																			<div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
																				{r.user?.avatar ? (
																					<Image src={r.user.avatar} alt={r.user.name} fill className="object-cover" />
																				) : (
																					<div className="w-full h-full flex items-center justify-center text-slate-400 font-black">
																						{r.user?.name?.[0] ?? "U"}
																					</div>
																				)}
																			</div>
																			<div>
																				<p className="font-extrabold text-slate-900">{r.user?.name ?? "مستخدم"}</p>
																				<p className="text-xs text-slate-500 font-bold">
																					{r.human_created_at || r.created_at}
																				</p>
																			</div>
																		</div>

																		<div className="flex items-center gap-2">
																			<StarsRow value={r.rating} />

																			{canDeleteReview(r) && (
																				<button
																					onClick={() => deleteReview(r.id)}
																					className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 hover:bg-rose-50 transition"
																					aria-label="حذف التقييم"
																					title="حذف التقييم"
																				>
																					<Trash2 className="w-4 h-4 text-rose-600" />
																				</button>
																			)}
																		</div>
																	</div>

																	<p className="mt-3 text-slate-700 font-semibold leading-relaxed">
																		{r.comment}
																	</p>
																</div>
															))}
														</div>
													) : (
														<div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center text-slate-600 font-bold">
															لا توجد تقييمات حتى الآن.
														</div>
													)}

													{/* pagination */}
													{reviewsData?.pagination?.last_page > 1 && (
														<div className="mt-6 flex items-center justify-center">
															<div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
																<button
																	onClick={() => setReviewsPage((p) => Math.max(1, p - 1))}
																	disabled={reviewsPage === 1}
																	className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-extrabold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition"
																	aria-label="السابق"
																>
																	<ChevronRight className="w-4 h-4" />
																</button>

																<div className="h-6 w-px bg-slate-200 mx-1" />

																<div className="flex items-center gap-1">
																	{getPages(reviewsPage, reviewsData.pagination.last_page).map((p, idx) =>
																		p === "…" ? (
																			<span key={`dots-${idx}`} className="px-2 text-slate-400 font-extrabold">
																				…
																			</span>
																		) : (
																			<motion.button
																				key={p}
																				whileHover={{ scale: 1.03 }}
																				whileTap={{ scale: 0.98 }}
																				onClick={() => setReviewsPage(p)}
																				className={[
																					"min-w-[38px] h-[38px] rounded-xl px-2 text-sm font-black transition",
																					p === reviewsPage ? "bg-[#14213d] text-white shadow" : "text-slate-700 hover:bg-slate-50",
																				].join(" ")}
																				aria-current={p === reviewsPage ? "page" : undefined}
																				aria-label={`الصفحة ${p}`}
																			>
																				{p}
																			</motion.button>
																		)
																	)}
																</div>

																<div className="h-6 w-px bg-slate-200 mx-1" />

																<button
																	onClick={() => setReviewsPage((p) => Math.min(reviewsData.pagination.last_page, p + 1))}
																	disabled={reviewsPage >= reviewsData.pagination.last_page}
																	className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-extrabold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition"
																	aria-label="التالي"
																>
																	<ChevronLeft className="w-4 h-4" />
																</button>
															</div>
														</div>
													)}
												</div>
											</>
										)}
									</div>
								)}
							</div>
						</div>

						{/* ✅ Selected Options Summary (NO features here) */}
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

										{showMissingBadge && (
											<span className="text-xs font-extrabold rounded-full bg-amber-50 text-amber-700 px-3 py-1 border border-amber-200">
												خيارات ناقصة
											</span>
										)}
									</div>

									<div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
										{selectedOptions.size !== "اختر" && <OptChip label="المقاس" value={selectedOptions.size} />}
										{selectedOptions.color !== "اختر" && <OptChip label="اللون" value={selectedOptions.color} />}
										{selectedOptions.material !== "اختر" && <OptChip label="الخامة" value={selectedOptions.material} />}

										{selectedOptions.printing_method !== "اختر" && (
											<OptChip label="طريقة الطباعة" value={selectedOptions.printing_method} />
										)}
										{selectedOptions.print_location !== "اختر" && (
											<OptChip label="مكان الطباعة" value={selectedOptions.print_location} />
										)}

										{Object.entries(selectedOptions.optionGroups || {}).map(([k, v]) =>
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
								const fallback = categories2
									.flatMap((cat: any) => cat.products || [])
									.filter((p: any) => p.id !== product.id)
									.slice(0, 12);

								const list = base.length ? base : fallback;
								if (!list.length) return null;

								return (
									<div className="mb-10">
										<InStockSlider
											title="منتجات قد تعجبك"
											inStock={list}
											CardComponent={(props: any) => <ProductCard {...props} product={product} classNameHome="hidden" className2="hidden" />}
										/>
									</div>
								);
							})()}
						</section>
					)}
				</div>
			</section>

			{/* Bottom bar */}
			<div className="fixed bottom-0 start-0 end-0 z-50">
				<div className="border-t border-slate-200 bg-white/80 backdrop-blur">
					<div className="container py-3">
						<div className="rounded-3xl border border-slate-200 bg-white shadow-sm px-3 py-3 md:px-4 md:py-4">
							<div className="flex max-md:flex-col items-center justify-between gap-3">
								{/* Left */}
								<div className="max-md:w-full flex items-center gap-3 min-w-0">
									<div className="relative w-14 h-14 md:w-16 md:h-16 rounded-2xl overflow-hidden bg-slate-100 ring-1 ring-slate-200 shrink-0">
										<Image src={product.image || "/images/o1.jpg"} alt={product.name} fill className="object-cover" />
									</div>

									<div className="min-w-0">
										<div className="flex items-center gap-2 flex-wrap">
											<p className="text-[12px] text-slate-500 font-extrabold">
												{product?.includes_tax ? "السعر شامل الضريبة" : "السعر"}
											</p>

											<span
												className={[
													"text-[11px] font-extrabold px-2 py-1 rounded-full border",
													product?.meta?.in_stock
														? "bg-emerald-50 text-emerald-700 border-emerald-200"
														: "bg-rose-50 text-rose-700 border-rose-200",
												].join(" ")}
											>
												{product?.meta?.stock_status || (product?.stock ? "متوفر" : "غير متوفر")}
											</span>

											<span className="text-[11px] font-extrabold px-2 py-1 rounded-full border bg-slate-50 text-slate-700 border-slate-200">
												{product?.includes_shipping ? "شامل الشحن" : "بدون شحن"}
											</span>
										</div>

										<p className="text-sm md:text-base font-black text-slate-900 line-clamp-2">
											{product.name}
										</p>

										<p className="text-[12px] text-slate-500 font-bold mt-0.5 line-clamp-1">
											{product?.delivery_time?.estimated ? `التوصيل المتوقع: ${product.delivery_time.estimated}` : ""}
										</p>
									</div>
								</div>

								{/* Right */}
								<div className="flex max-md:w-full max-md:justify-between items-center gap-3">
									{(() => {
										const currency = "ر.س";
										const price = Number(product?.price ?? 0);
										const final = Number(product?.final_price ?? price);

										const hasDiscount =
											Boolean(product?.has_discount) && Number.isFinite(final) && final > 0 && final < price;

										const saving = hasDiscount ? Math.max(0, price - final) : 0;

										const d = product?.discount;
										const discountLabel =
											hasDiscount && d?.value
												? d.type === "percentage"
													? `خصم ${Number(d.value)}%`
													: `خصم ${Number(d.value)} ${currency}`
												: null;

										return (
											<div className="hidden sm:flex flex-col items-end">
												<div className="flex items-center gap-2 justify-end">
													<p className="text-[12px] text-slate-500 font-extrabold">الإجمالي</p>
													{discountLabel && (
														<span className="text-[11px] font-extrabold px-2 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
															{discountLabel}
														</span>
													)}
												</div>

												<div className="mt-0.5 flex items-end gap-2 justify-end">
													<p className="text-xl md:text-2xl font-black text-slate-900 leading-none">
														{final.toFixed(2)}
													</p>
													<span className="text-sm font-extrabold text-slate-700">{currency}</span>
												</div>

												{hasDiscount && (
													<div className="mt-1 flex items-center gap-2 justify-end">
														<p className="text-sm text-slate-400 line-through font-extrabold">
															{price.toFixed(2)} {currency}
														</p>
														<span className="text-xs font-extrabold text-emerald-700">
															وفّرت {saving.toFixed(2)} {currency}
														</span>
													</div>
												)}
											</div>
										);
									})()}

									{(() => {
										const currency = "ر.س";
										const price = Number(product?.price ?? 0);
										const final = Number(product?.final_price ?? price);
										const hasDiscount = Boolean(product?.has_discount) && final > 0 && final < price;

										return (
											<div className="sm:hidden flex flex-col items-end">
												<p className="text-[11px] text-slate-500 font-extrabold">الإجمالي</p>
												<div className="flex items-end gap-1">
													<p className="text-lg font-black text-slate-900 leading-none">{final.toFixed(2)}</p>
													<span className="text-[12px] font-extrabold text-slate-700">{currency}</span>
												</div>
												{hasDiscount && (
													<p className="text-[11px] text-slate-400 line-through font-extrabold">
														{price.toFixed(2)} {currency}
													</p>
												)}
											</div>
										);
									})()}

									<div className="min-w-[170px]">
										<ButtonComponent className="scale-[.8]"  title={showMissingBadge ? "اختر الخيارات أولاً" : "اضافة للسلة"} onClick={handleAddToCart} />
									</div>
								</div>
							</div>
 
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


const ratingLabels: Record<number, string> = {
	1: "سيئ جدًا",
	2: "سيئ",
	3: "متوسط",
	4: "جيد جدًا",
	5: "ممتاز",
};

interface StarRatingInputProps {
	value: number;
	onChange: (v: number) => void;
	disabled?: boolean;
}

export function StarRatingInput({
	value,
	onChange,
	disabled = false,
}: StarRatingInputProps) {
	const [hovered, setHovered] = useState<number | null>(null);

	const activeValue = hovered ?? value;

	return (
		<div className="flex  items-center gap-2">
			<div
				className={`flex items-center  gap-1 ${disabled ? "opacity-50 cursor-not-allowed" : ""
					}`}
			>
				{[1, 2, 3, 4, 5].map((star) => {
					const filled = star <= activeValue;

					return (
						<motion.button
							key={star}
							type="button"
							whileHover={!disabled ? { scale: 1.15 } : undefined}
							whileTap={!disabled ? { scale: 0.95 } : undefined}
							onMouseEnter={() => !disabled && setHovered(star)}
							onMouseLeave={() => !disabled && setHovered(null)}
							onClick={() => !disabled && onChange(star)}
							className="focus:outline-none"
							aria-label={`تقييم ${star} نجوم`}
						>
							<Star
								className={`w-10 h-10 transition-colors ${filled ? "text-amber-400" : "text-slate-300"
									}`}
								fill={filled ? "currentColor" : "none"}
							/>
						</motion.button>
					);
				})}
			</div>

			{/* label */}
			<motion.div
				key={activeValue}
				initial={{ opacity: 0, y: 6 }}
				animate={{ opacity: 1, y: 0 }}
				className="text-sm font-extrabold text-slate-700"
			>
				{ratingLabels[activeValue] ?? ""}
			</motion.div>
		</div>
	);
}

