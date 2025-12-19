
"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import toast from "react-hot-toast";

import HearComponent from "@/components/HearComponent";
import RatingStars from "@/components/RatingStars";
import ShareButton from "@/components/ShareButton";
import ProductGallery from "@/components/ProductGallery";
import CustomSeparator from "@/components/Breadcrumbs";
import ButtonComponent from "@/components/ButtonComponent";
import InStockSlider from "@/components/InStockSlider";
import ProductCard from "@/components/ProductCard";

import { useAuth } from "@/src/context/AuthContext";
import { useAppContext } from "@/src/context/AppContext";
import { useCart } from "@/src/context/CartContext";

import { FiAlertTriangle } from "react-icons/fi";
import { Trash2, Star, ChevronLeft, ChevronRight, ShieldCheck, Truck, Tags, Package } from "lucide-react";

import { ProductPageSkeleton, StickerFormSkeleton } from "../../../components/skeletons/HomeSkeletons";
import { useImperativeHandle, forwardRef } from "react";
import {
	Box,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	FormHelperText,
	CircularProgress,
	Alert,
	Button,
	Checkbox,
	ListItemText,
} from "@mui/material";
import { Save, CheckCircle, Warning, Info, Refresh } from "@mui/icons-material";

interface StickerFormProps {
	cartItemId?: number;
	productId: number;
	productData?: any; // ✅ pass from parent to avoid refetch
	onOptionsChange?: (options: any) => void;
	showValidation?: boolean;
}

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

// ✅ SelectedOptions
interface SelectedOptions {
	size: string;

	// ✅ NEW: tier selection for size
	size_tier_id?: number | null;
	size_quantity?: number | null;
	size_price_per_unit?: number | null;
	size_total_price?: number | null;

	color: string;
	material: string;
	optionGroups: { [groupName: string]: string };
	printing_method: string;

	// ✅ NEW: multi-select print locations
	print_locations: string[];

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

function SectionCard({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
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

function buildIdsPayload(apiData: any, opts: any) {
	const sizeObj = apiData?.sizes?.find((s: any) => s?.name === opts.size);
	const colorObj = apiData?.colors?.find((c: any) => c?.name === opts.color);
	const materialObj = apiData?.materials?.find((m: any) => m?.name === opts.material);
	const pmObj = apiData?.printing_methods?.find((p: any) => p?.name === opts.printing_method);

	// ✅ print locations => array of IDs
	const printLocationIds =
		Array.isArray(opts.print_locations) && opts.print_locations.length
			? opts.print_locations
				.map((name: any) => apiData?.print_locations?.find((pl: any) => pl?.name === name)?.id)
				.filter((id: any) => typeof id === "number")
			: [];

	return {
		size_id: typeof sizeObj?.id === "number" ? sizeObj.id : null,
		color_id: typeof colorObj?.id === "number" ? colorObj.id : null,
		material_id: typeof materialObj?.id === "number" ? materialObj.id : null,
		printing_method_id: typeof pmObj?.id === "number" ? pmObj.id : null,
		print_locations: printLocationIds,
		embroider_locations: [],
	};
}

// -------------------------
// ✅ helpers for pricing + selected_options payload
// -------------------------
const num = (v: any) => {
	const x = typeof v === "string" ? Number(v) : typeof v === "number" ? v : Number(v ?? 0);
	return Number.isFinite(x) ? x : 0;
};

function buildSelectedOptionsWithPrice(apiData: any, opts: SelectedOptions) {
	const selected_options: Array<{ option_name: string; option_value: string; additional_price: number }> = [];

	// ✅ size (name)
	if (opts.size && opts.size !== "اختر") {
		selected_options.push({ option_name: "المقاس", option_value: opts.size, additional_price: 0 });
	}

	// ✅ size tier (quantity pricing info) -> send as extra fields as options (keeps backend compatible)
	// If your backend supports a dedicated field, replace this with it.
	if (opts.size_tier_id && opts.size_quantity && opts.size_total_price != null) {
		selected_options.push({
			option_name: "كمية المقاس",
			option_value: String(opts.size_quantity),
			additional_price: 0,
		});
		selected_options.push({
			option_name: "سعر المقاس الإجمالي",
			option_value: String(opts.size_total_price),
			additional_price: 0,
		});
	}

	// color
	if (opts.color && opts.color !== "اختر") {
		const c = apiData?.colors?.find((x: any) => x.name === opts.color);
		selected_options.push({ option_name: "اللون", option_value: opts.color, additional_price: num(c?.additional_price) });
	}

	// material
	if (opts.material && opts.material !== "اختر") {
		const m = apiData?.materials?.find((x: any) => x.name === opts.material);
		selected_options.push({ option_name: "الخامة", option_value: opts.material, additional_price: num(m?.additional_price) });
	}

	// option groups
	Object.entries(opts.optionGroups || {}).forEach(([group, value]) => {
		if (!value || value === "اختر") return;
		const row = apiData?.options?.find(
			(o: any) =>
				String(o.option_name || "").trim() === String(group).trim() &&
				String(o.option_value || "").trim() === String(value).trim()
		);
		selected_options.push({
			option_name: group,
			option_value: value,
			additional_price: num(row?.additional_price),
		});
	});

	// printing method
	if (opts.printing_method && opts.printing_method !== "اختر") {
		const pm = apiData?.printing_methods?.find((x: any) => x.name === opts.printing_method);
		selected_options.push({
			option_name: "طريقة الطباعة",
			option_value: opts.printing_method,
			additional_price: num(pm?.base_price ?? pm?.pivot_price),
		});
	}

	// ✅ print locations (MULTI)
	if (Array.isArray(opts.print_locations) && opts.print_locations.length > 0) {
		opts.print_locations.forEach((locName) => {
			const pl = apiData?.print_locations?.find((x: any) => x.name === locName);
			selected_options.push({
				option_name: "مكان الطباعة",
				option_value: locName,
				additional_price: num(pl?.additional_price ?? pl?.pivot_price),
			});
		});
	}

	return selected_options;
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

	const [showValidation, setShowValidation] = useState(false);

	const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({
		size: "اختر",
		size_tier_id: null,
		size_quantity: null,
		size_price_per_unit: null,
		size_total_price: null,

		color: "اختر",
		material: "اختر",
		optionGroups: {},
		printing_method: "اختر",
		print_locations: [],
		isValid: false,
	});

	const API_URL = process.env.NEXT_PUBLIC_API_URL;

	// -------------------------
	// Reviews state
	// -------------------------
	const [reviewsLoading, setReviewsLoading] = useState(false);
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

				// ✅ seed reviews from product details (NO extra call)
				if (Array.isArray(prod?.reviews)) {
					setReviewsData({
						reviews: prod.reviews,
						stats: {
							average_rating: num(prod?.average_rating),
							total_reviews: num(prod?.total_reviews ?? prod?.reviews?.length),
							rating_distribution: {}, // not available in this endpoint
						},
						pagination: {
							total: num(prod?.total_reviews ?? prod?.reviews?.length),
							per_page: prod.reviews.length || 10,
							current_page: 1,
							last_page: 1,
						},
						user_review: null,
					});
					setReviewsLoading(false);
					setReviewsError(null);
				}

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

	const hasSeededDefaultRef = useRef(false);

	useEffect(() => {
		if (Array.isArray(product?.reviews) && product.reviews.length > 0) {
			hasSeededDefaultRef.current = true;
		}
	}, [product?.id]); // or [productId]

	// ✅ fetch reviews ONLY when needed
	const fetchReviews = useCallback(async () => {
		if (!API_URL || !productId) return;

		const isDefaultQuery =
			reviewsPage === 1 &&
			reviewsRatingFilter === "" &&
			reviewsSortBy === "created_at" &&
			reviewsSortDir === "desc";

		if (isDefaultQuery && hasSeededDefaultRef.current) return;

		setReviewsLoading(true);
		setReviewsError(null);

		try {
			const params = new URLSearchParams();
			params.set("sort_by", reviewsSortBy);
			params.set("sort_direction", reviewsSortDir);
			params.set("page", String(reviewsPage));
			if (reviewsRatingFilter !== "") params.set("rating", String(reviewsRatingFilter));

			const res = await fetch(`${API_URL}/reviews/product/${productId}?${params.toString()}`, {
				headers: token ? { Authorization: `Bearer ${token}` } : {},
				cache: "no-store",
			});

			const json = await res.json();
			if (!res.ok || !json.status) throw new Error(json.message || "فشل تحميل التقييمات");

			setReviewsData(json.data);
			hasSeededDefaultRef.current = false; // now server data is source of truth
		} catch (e: any) {
			setReviewsError(e?.message || "حدث خطأ أثناء تحميل التقييمات");
		} finally {
			setReviewsLoading(false);
		}
	}, [API_URL, productId, token, reviewsPage, reviewsRatingFilter, reviewsSortBy, reviewsSortDir]);

	// ✅ only auto-fetch reviews when user opens the tab (or after product has seeded empty)
	useEffect(() => {
		if (activeTab !== "reviews") return;
		fetchReviews();
	}, [activeTab, fetchReviews]);

	// ✅ OPTIONS exist?
	const hasOptions = useMemo(() => {
		if (!apiData) return false;

		const hasSizes = Array.isArray(apiData?.sizes) && apiData.sizes.length > 0;
		const hasColors = Array.isArray(apiData?.colors) && apiData.colors.length > 0;
		const hasMaterials = Array.isArray(apiData?.materials) && apiData.materials.length > 0;

		const hasExtraOptions = Array.isArray(apiData?.options) && apiData.options.length > 0;
		const hasPrinting = Array.isArray(apiData?.printing_methods) && apiData.printing_methods.length > 0;

		return hasSizes || hasColors || hasMaterials || hasExtraOptions || hasPrinting;
	}, [apiData]);

	const hasReviews = useMemo(() => {
		return (product?.total_reviews ?? reviewsData?.pagination?.total ?? 0) > 0;
	}, [product?.total_reviews, reviewsData]);

	useEffect(() => {
		if (!loading) {
			if (activeTab === "options" && !hasOptions) setActiveTab("reviews");
			// if (activeTab === "reviews" && !hasReviews && hasOptions) setActiveTab("options");
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
		if (!raw) return null;
		if (/^أشهر\s+ضمان$/.test(raw) || raw === "أشهر ضمان") return null;

		return raw;
	}, [apiData]);

	const validateOptions = useCallback((options: SelectedOptions, data: any) => {
		if (!data) return { isValid: false, missingOptions: [] as string[] };

		let isValid = true;
		const missingOptions: string[] = [];

		if (data.sizes?.length > 0 && (!options.size || options.size === "اختر")) {
			isValid = false;
			missingOptions.push("المقاس");
		}

		// ✅ if size has tiers -> require tier selection
		const selectedSizeObj = (data?.sizes || []).find((s: any) => s?.name === options.size);
		const hasTiers = Array.isArray(selectedSizeObj?.tiers) && selectedSizeObj.tiers.length > 0;
		if (data.sizes?.length > 0 && hasTiers && !options.size_tier_id) {
			isValid = false;
			missingOptions.push("كمية المقاس");
		}

		if (data.colors?.length > 0 && (!options.color || options.color === "اختر")) {
			isValid = false;
			missingOptions.push("اللون");
		}

		if (data.materials?.length > 0 && (!options.material || options.material === "اختر")) {
			isValid = false;
			missingOptions.push("الخامة");
		}

		// required option groups
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

		if (Array.isArray(data?.printing_methods) && data.printing_methods.length > 0) {
			if (!options.printing_method || options.printing_method === "اختر") {
				isValid = false;
				missingOptions.push("طريقة الطباعة");
			}
		}

		// ✅ print locations multi select: at least one
		if (Array.isArray(data?.print_locations) && data.print_locations.length > 0) {
			if (!Array.isArray(options.print_locations) || options.print_locations.length === 0) {
				isValid = false;
				missingOptions.push("مكان الطباعة");
			}
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

	// ✅ BASE price:
	// - if user chose size tier, base price = tier.total_price
	// - otherwise fallback to product final_price/price/lowest_price
	const basePrice = useMemo(() => {
		const tierTotal = num(selectedOptions?.size_total_price);
		if (tierTotal > 0) return tierTotal;

		const p = num(product?.final_price ?? product?.price);
		if (p > 0) return p;

		return num(product?.lowest_price ?? 0);
	}, [product, selectedOptions?.size_total_price]);

	// ✅ compute extras from selected options (excluding size tier because it's now basePrice)
	const extrasTotal = useMemo(() => {
		if (!apiData) return 0;
		const selected = buildSelectedOptionsWithPrice(apiData, selectedOptions);

		// remove our helper options "كمية المقاس" & "سعر المقاس الإجمالي" from extras
		const filtered = selected.filter((o) => !["كمية المقاس", "سعر المقاس الإجمالي"].includes(o.option_name));

		return filtered.reduce((sum, o) => sum + num(o.additional_price), 0);
	}, [apiData, selectedOptions]);

	const displayTotal = useMemo(() => {
		const total = basePrice + extrasTotal;
		return total > 0 ? total : 0;
	}, [basePrice, extrasTotal]);




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

		// const selected_options = buildSelectedOptionsWithPrice(apiData, opts);

		const selected_options = buildSelectedOptionsWithPrice(apiData, opts);
		const idsPayload = buildIdsPayload(apiData, opts);

		const cartData = {
			product_id: product.id,
			quantity: 1,

			// ✅ IDs
			...idsPayload,

			// ✅ keep your detailed options too
			selected_options,

			// optional fields you already have in example:
			design_service_id: null,
			is_sample: false,
			note: "",
			image_design: null,
		};


		try {
			await addToCart(product.id, cartData);
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

	// Reviews actions
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

	// Render states
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

	const currentValidation = validateOptions(selectedOptions, apiData);
	const showMissingBadge = showValidation && hasOptions && !currentValidation.isValid;

	const anySelected =
		selectedOptions.size !== "اختر" ||
		selectedOptions.color !== "اختر" ||
		selectedOptions.material !== "اختر" ||
		selectedOptions.printing_method !== "اختر" ||
		(selectedOptions.print_locations?.length ?? 0) > 0 ||
		Object.values(selectedOptions.optionGroups || {}).some((v) => v !== "اختر");

	return (
		<>
			<section className="container pt-8 pb-24" dir="rtl">
				<motion.div variants={fadeUp} initial="hidden" animate="show" className="mb-4">
					<CustomSeparator proName={product.name} />
				</motion.div>

				<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
					{/* Left: Info */}
					<motion.div variants={fadeUp} initial="hidden" animate="show" className=" space-y-5 lg:col-span-5">
						<h1 className="text-slate-900 text-2xl md:text-3xl font-extrabold leading-snug">{product.name}</h1>

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

						<SectionCard title="وصف المنتج" icon={<Package className="w-5 h-5 text-slate-700" />}>
							<div className="prose prose-sm max-w-none text-slate-700" dangerouslySetInnerHTML={{ __html: product.description || "" }} />
						</SectionCard>

						{apiData?.delivery_time && (
							<SectionCard title="معلومات الشحن والضمان والعروض" icon={<Truck className="w-5 h-5 text-slate-700" />}>
								<div className="space-y-3">
									{apiData?.delivery_time?.estimated && (
										<InfoRow label="التوصيل المتوقع" value={<Pill tone="emerald">{apiData.delivery_time.estimated}</Pill>} />
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
							</SectionCard>
						)}

						{Array.isArray(apiData?.features) && apiData.features.length > 0 && (
							<SectionCard title="المواصفات" icon={<Star className="w-5 h-5 text-slate-700" />}>
								<div className="space-y-2">
									{apiData.features.map((f: any, idx: number) => (
										<InfoRow key={`${f?.name}-${idx}`} label={String(f?.name || "—")} value={<span className="font-black">{String(f?.value || "—")}</span>} />
									))}
								</div>
							</SectionCard>
						)}

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
								{activeTab === "options" &&
									(hasOptions ? (
										<StickerForm
											productId={product.id}
											productData={apiData} // ✅ pass data
											ref={stickerFormRef}
											onOptionsChange={setSelectedOptions}
											showValidation={showValidation}
										/>
									) : (
										<div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-600 font-bold">لا توجد خيارات لهذا المنتج.</div>
									))}

								{activeTab === "reviews" && (
									<div className="space-y-5">
										{ reviewsLoading ? (
											<ReviewsSkeleton />
										) : reviewsError ? (
											<div className="rounded-2xl border border-slate-200 bg-white p-5">
												<p className="font-extrabold text-slate-900">تعذر تحميل التقييمات</p>
												<p className="text-sm text-slate-600 mt-1">{reviewsError}</p>
												<button onClick={fetchReviews} className="mt-4 rounded-xl border border-slate-200 px-4 py-2 font-extrabold hover:bg-slate-50 transition">
													إعادة المحاولة
												</button>
											</div>
										) : (
											<>
												<div className="rounded-3xl border border-slate-200 bg-white p-5">
													<div className="flex items-start justify-between gap-4">
														<div>
															<p className="text-sm font-bold text-slate-500">متوسط التقييم</p>
															<div className="flex items-center gap-3 mt-1">
																<p className="text-3xl font-black text-slate-900">{reviewsData?.stats?.average_rating ?? product?.average_rating ?? 0}</p>
																<StarsRow value={Math.round(reviewsData?.stats?.average_rating ?? product?.average_rating ?? 0)} />
															</div>
															<p className="text-sm text-slate-500 mt-1">{reviewsData?.stats?.total_reviews ?? product?.total_reviews ?? 0} تقييم</p>
														</div>
													</div>
												</div>

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
														<div className="flex items-center gap-4 ">
															<StarRatingInput value={myRating} onChange={setMyRating} disabled={!token} />
														</div>

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
																					<div className="w-full h-full flex items-center justify-center text-slate-400 font-black">{r.user?.name?.[0] ?? "U"}</div>
																				)}
																			</div>
																			<div>
																				<p className="font-extrabold text-slate-900">{r.user?.name ?? "مستخدم"}</p>
																				<p className="text-xs text-slate-500 font-bold">{r.human_created_at || r.created_at}</p>
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

																	{r.comment && <p className="mt-3 text-slate-700 font-semibold leading-relaxed">{r.comment}</p>}
																</div>
															))}
														</div>
													) : (
														<div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center text-slate-600 font-bold">لا توجد تقييمات حتى الآن.</div>
													)}

													{/* pagination only if endpoint returns it */}
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

										{showMissingBadge && (
											<span className="text-xs font-extrabold rounded-full bg-amber-50 text-amber-700 px-3 py-1 border border-amber-200">
												خيارات ناقصة
											</span>
										)}
									</div>

									<div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
										{selectedOptions.size !== "اختر" && <OptChip label="المقاس" value={selectedOptions.size} />}

										{!!selectedOptions.size_quantity && (
											<OptChip label="كمية المقاس" value={`${selectedOptions.size_quantity}`} />
										)}

										{selectedOptions.color !== "اختر" && <OptChip label="اللون" value={selectedOptions.color} />}
										{selectedOptions.material !== "اختر" && <OptChip label="الخامة" value={selectedOptions.material} />}

										{selectedOptions.printing_method !== "اختر" && <OptChip label="طريقة الطباعة" value={selectedOptions.printing_method} />}

										{(selectedOptions.print_locations?.length ?? 0) > 0 && (
											<OptChip label="مكان الطباعة" value={selectedOptions.print_locations.join("، ")} />
										)}

										{Object.entries(selectedOptions.optionGroups || {}).map(([k, v]) => (v !== "اختر" ? <OptChip key={k} label={k} value={v} /> : null))}
									</div>

									{/* ✅ price breakdown */}
									<div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
										<div className="flex items-center justify-between text-sm font-extrabold text-slate-700">
											<span>السعر الأساسي</span>
											<span>{basePrice.toFixed(2)} ر.س</span>
										</div>
										<div className="flex items-center justify-between text-sm font-extrabold text-slate-700 mt-2">
											<span>إضافات الخيارات</span>
											<span>+ {extrasTotal.toFixed(2)} ر.س</span>
										</div>
										<div className="h-px bg-slate-200 my-3" />
										<div className="flex items-center justify-between text-base font-black text-slate-900">
											<span>الإجمالي</span>
											<span>{displayTotal.toFixed(2)} ر.س</span>
										</div>
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</motion.div>

					{/* Right: Gallery */}
					<motion.div variants={fadeUp} initial="hidden" animate="show" className="lg:col-span-7">
						<div className="lg:sticky lg:top-[150px]">
							<ProductGallery mainImage={product.image} images={product.images} />
						</div>
					</motion.div>
				</div>

				{/* Similar products */}
				<div className="mt-10">
					{product && categories2.length > 0 && (
						<section>
							{(() => {
								const currentCategory = categories2.find((cat: any) => cat.products?.some((p: any) => p.id === product.id));
								const base = currentCategory?.products?.filter((p: any) => p.id !== product.id) || [];
								const fallback = categories2.flatMap((cat: any) => cat.products || []).filter((p: any) => p.id !== product.id).slice(0, 12);
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
											<p className="text-[12px] text-slate-500 font-extrabold">{product?.includes_tax ? "السعر شامل الضريبة" : "السعر"}</p>

											<span
												className={[
													"text-[11px] font-extrabold px-2 py-1 rounded-full border",
													product?.meta?.in_stock ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200",
												].join(" ")}
											>
												{product?.meta?.stock_status || (product?.stock ? "متوفر" : "غير متوفر")}
											</span>

											<span className="text-[11px] font-extrabold px-2 py-1 rounded-full border bg-slate-50 text-slate-700 border-slate-200">
												{product?.includes_shipping ? "شامل الشحن" : "بدون شحن"}
											</span>
										</div>

										<p className="text-sm md:text-base font-black text-slate-900 line-clamp-2">{product.name}</p>

										<p className="text-[12px] text-slate-500 font-bold mt-0.5 line-clamp-1">
											{product?.delivery_time?.estimated ? `التوصيل المتوقع: ${product.delivery_time.estimated}` : ""}
										</p>
									</div>
								</div>

								{/* Right */}
								<div className="flex max-md:w-full max-md:justify-between items-center gap-3">
									<div className="hidden sm:flex flex-col items-end">
										<div className="flex items-center gap-2 justify-end">
											<p className="text-[12px] text-slate-500 font-extrabold">الإجمالي</p>
											{extrasTotal > 0 && (
												<span className="text-[11px] font-extrabold px-2 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
													+ إضافات {extrasTotal.toFixed(2)}
												</span>
											)}
										</div>

										<div className="mt-0.5 flex items-end gap-2 justify-end">
											<p className="text-xl md:text-2xl font-black text-slate-900 leading-none">{displayTotal.toFixed(2)}</p>
											<span className="text-sm font-extrabold text-slate-700">ر.س</span>
										</div>
									</div>

									<div className="sm:hidden flex flex-col items-end">
										<p className="text-[11px] text-slate-500 font-extrabold">الإجمالي</p>
										<div className="flex items-end gap-1">
											<p className="text-lg font-black text-slate-900 leading-none">{displayTotal.toFixed(2)}</p>
											<span className="text-[12px] font-extrabold text-slate-700">ر.س</span>
										</div>
									</div>

									<div className="min-w-[170px]">
										<ButtonComponent className="scale-[.8]" title={showMissingBadge ? "اختر الخيارات أولاً" : "اضافة للسلة"} onClick={handleAddToCart} />
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

export function StarRatingInput({ value, onChange, disabled = false }: StarRatingInputProps) {
	const [hovered, setHovered] = useState<number | null>(null);
	const activeValue = hovered ?? value;

	return (
		<div className="flex  items-center gap-2">
			<div className={`flex items-center  gap-1 ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
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
							<Star className={`w-10 h-10 transition-colors ${filled ? "text-amber-400" : "text-slate-300"}`} fill={filled ? "currentColor" : "none"} />
						</motion.button>
					);
				})}
			</div>

			<motion.div key={activeValue} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-sm font-extrabold text-slate-700">
				{ratingLabels[activeValue] ?? ""}
			</motion.div>
		</div>
	);
}

const StickerForm = forwardRef(function StickerForm(
	{ cartItemId, productId, productData, onOptionsChange, showValidation = false }: StickerFormProps,
	ref
) {
	const { updateCartItem, fetchCartItemOptions } = useCart();

	const [size, setSize] = useState("اختر");

	// ✅ NEW: tier fields for size
	const [sizeTierId, setSizeTierId] = useState<number | null>(null);
	const [sizeTierTotal, setSizeTierTotal] = useState<number | null>(null);
	const [sizeTierQty, setSizeTierQty] = useState<number | null>(null);
	const [sizeTierUnit, setSizeTierUnit] = useState<number | null>(null);

	const [color, setColor] = useState("اختر");
	const [material, setMaterial] = useState("اختر");

	const [optionGroups, setOptionGroups] = useState<Record<string, string>>({});
	const [printingMethod, setPrintingMethod] = useState("اختر");

	// ✅ NEW: print locations multi
	const [printLocations, setPrintLocations] = useState<string[]>([]);

	const [apiData, setApiData] = useState<any>(null);
	const [formLoading, setFormLoading] = useState(true);

	const [saving, setSaving] = useState(false);
	const [showSaveButton, setShowSaveButton] = useState(false);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
	const [savedSuccessfully, setSavedSuccessfully] = useState(false);

	const [apiError, setApiError] = useState<string | null>(null);

	const groupedOptions = useMemo(() => {
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
		const required: string[] = [];
		Object.keys(groupedOptions).forEach((k) => {
			const items = groupedOptions[k] || [];
			if (items.some((x: any) => Boolean(x?.is_required))) required.push(k);
		});
		return required;
	}, [groupedOptions]);

	const selectedSizeObj = useMemo(() => {
		return (apiData?.sizes || []).find((s: any) => s?.name === size) || null;
	}, [apiData, size]);

	const sizeTiers = useMemo(() => {
		const tiers = selectedSizeObj?.tiers;
		return Array.isArray(tiers) ? tiers : [];
	}, [selectedSizeObj]);

	const validateCurrentOptions = useCallback(() => {
		if (!apiData) return false;

		let isValid = true;

		if (apiData.sizes?.length > 0 && (!size || size === "اختر")) isValid = false;

		// ✅ require tier if size has tiers
		const hasTiers = Array.isArray(selectedSizeObj?.tiers) && selectedSizeObj.tiers.length > 0;
		if (apiData.sizes?.length > 0 && hasTiers && !sizeTierId) isValid = false;

		if (apiData.colors?.length > 0 && (!color || color === "اختر")) isValid = false;
		if (apiData.materials?.length > 0 && (!material || material === "اختر")) isValid = false;

		if (Array.isArray(apiData?.options) && apiData.options.length > 0) {
			requiredOptionGroups.forEach((g) => {
				const v = optionGroups?.[g];
				if (!v || v === "اختر") isValid = false;
			});
		}

		if (Array.isArray(apiData?.printing_methods) && apiData.printing_methods.length > 0) {
			if (!printingMethod || printingMethod === "اختر") isValid = false;
		}

		// ✅ multi locations required if exist
		if (Array.isArray(apiData?.print_locations) && apiData.print_locations.length > 0) {
			if (!Array.isArray(printLocations) || printLocations.length === 0) isValid = false;
		}

		return isValid;
	}, [apiData, size, color, material, optionGroups, requiredOptionGroups, printingMethod, printLocations, selectedSizeObj, sizeTierId]);

	useImperativeHandle(ref, () => ({
		getOptions: () => ({
			size,
			size_tier_id: sizeTierId,
			size_quantity: sizeTierQty,
			size_price_per_unit: sizeTierUnit,
			size_total_price: sizeTierTotal,

			color,
			material,
			optionGroups,
			printing_method: printingMethod,
			print_locations: printLocations,
			isValid: validateCurrentOptions(),
		}),
		validate: () => validateCurrentOptions(),
	}));

	useEffect(() => {
		if (!onOptionsChange) return;
		onOptionsChange({
			size,
			size_tier_id: sizeTierId,
			size_quantity: sizeTierQty,
			size_price_per_unit: sizeTierUnit,
			size_total_price: sizeTierTotal,

			color,
			material,
			optionGroups,
			printing_method: printingMethod,
			print_locations: printLocations,
			isValid: validateCurrentOptions(),
		});
	}, [
		size,
		sizeTierId,
		sizeTierQty,
		sizeTierUnit,
		sizeTierTotal,
		color,
		material,
		optionGroups,
		printingMethod,
		printLocations,
		validateCurrentOptions,
		onOptionsChange,
	]);

	// ✅ NO FETCH HERE: use productData from parent
	useEffect(() => {
		setApiError(null);
		setFormLoading(true);

		try {
			if (!productData) throw new Error("لا توجد بيانات للمنتج");

			setApiData(productData);

			// init optionGroups with "اختر"
			if (Array.isArray(productData?.options)) {
				const list = productData.options;
				const out: Record<string, string> = {};
				list.forEach((o: any) => {
					const k = String(o.option_name || "").trim();
					if (!k) return;
					if (!out[k]) out[k] = "اختر";
				});
				setOptionGroups(out);
			} else {
				setOptionGroups({});
			}

			setPrintingMethod("اختر");
			setPrintLocations([]);

			// reset size tier
			setSizeTierId(null);
			setSizeTierTotal(null);
			setSizeTierQty(null);
			setSizeTierUnit(null);
		} catch (err: any) {
			setApiError(err?.message || "حدث خطأ أثناء تحميل الخيارات");
			setApiData(null);
		} finally {
			setFormLoading(false);
		}
	}, [productData]);

	const extractValueFromOptions = useCallback((options: any[], optionName: string) => {
		if (!options || !Array.isArray(options)) return null;
		const option = options.find((opt: any) => opt.option_name === optionName);
		return option ? option.option_value : null;
	}, []);

	// ✅ NEW: extract multiple values (for "مكان الطباعة")
	const extractValuesFromOptions = useCallback((options: any[], optionName: string) => {
		if (!options || !Array.isArray(options)) return [];
		return options
			.filter((opt: any) => opt.option_name === optionName)
			.map((x: any) => String(x.option_value || "").trim())
			.filter(Boolean);
	}, []);

	const loadSavedOptions = useCallback(async () => {
		if (!cartItemId) return;
		setFormLoading(true);

		try {
			const savedOptions = await fetchCartItemOptions(cartItemId);

			if (savedOptions) {
				const sizeFromOptions = extractValueFromOptions(savedOptions.selected_options, "المقاس");
				const colorFromOptions = extractValueFromOptions(savedOptions.selected_options, "اللون");
				const materialFromOptions = extractValueFromOptions(savedOptions.selected_options, "الخامة");
				const printingFromOptions = extractValueFromOptions(savedOptions.selected_options, "طريقة الطباعة");

				// ✅ multi locations
				const locationsFromOptions = extractValuesFromOptions(savedOptions.selected_options, "مكان الطباعة");

				// ✅ tier info if present
				const qtyFromOptions = extractValueFromOptions(savedOptions.selected_options, "كمية المقاس");
				const totalFromOptions = extractValueFromOptions(savedOptions.selected_options, "سعر المقاس الإجمالي");

				setSize(sizeFromOptions || savedOptions.size || "اختر");
				setColor(colorFromOptions || (savedOptions.color?.name || savedOptions.color) || "اختر");
				setMaterial(materialFromOptions || savedOptions.material || "اختر");

				setPrintingMethod(printingFromOptions || "اختر");
				setPrintLocations(locationsFromOptions || []);

				// try rebuild tier id from size+qty (best effort)
				const q = qtyFromOptions ? Number(qtyFromOptions) : null;
				const t = totalFromOptions ? Number(totalFromOptions) : null;

				if (q && t && apiData?.sizes) {
					const sz = apiData.sizes.find((s: any) => s?.name === (sizeFromOptions || savedOptions.size));
					const tier = (sz?.tiers || []).find((x: any) => Number(x?.quantity) === q && Number(x?.total_price) === t) || null;
					setSizeTierId(tier?.id ?? null);
					setSizeTierQty(tier?.quantity ?? q ?? null);
					setSizeTierTotal(tier?.total_price ?? t ?? null);
					setSizeTierUnit(num(tier?.price_per_unit) || null);
				}

				const out: Record<string, string> = {};
				Object.keys(groupedOptions).forEach((g) => (out[g] = "اختر"));
				if (savedOptions.selected_options && Array.isArray(savedOptions.selected_options)) {
					savedOptions.selected_options.forEach((opt: any) => {
						const name = String(opt.option_name || "").trim();
						const value = String(opt.option_value || "").trim();
						if (!name || !value) return;

						if (["المقاس", "اللون", "الخامة", "طريقة الطباعة", "مكان الطباعة", "كمية المقاس", "سعر المقاس الإجمالي"].includes(name)) return;
						if (Object.prototype.hasOwnProperty.call(out, name)) out[name] = value;
					});
				}
				setOptionGroups(out);

				setHasUnsavedChanges(false);
				setShowSaveButton(false);
			}
		} catch {
			// ignore
		} finally {
			setFormLoading(false);
		}
	}, [cartItemId, fetchCartItemOptions, extractValueFromOptions, extractValuesFromOptions, groupedOptions, apiData]);

	useEffect(() => {
		if (!cartItemId || !apiData) return;
		loadSavedOptions();
	}, [cartItemId, apiData, loadSavedOptions]);

	// ✅ save options with additional_price
	const saveAllOptions = async () => {
		if (!cartItemId || !apiData) return;

		setSaving(true);
		setSavedSuccessfully(false);

		const opts: SelectedOptions = {
			size,
			size_tier_id: sizeTierId,
			size_quantity: sizeTierQty,
			size_price_per_unit: sizeTierUnit,
			size_total_price: sizeTierTotal,

			color,
			material,
			optionGroups,
			printing_method: printingMethod,
			print_locations: printLocations,
			isValid: validateCurrentOptions(),
		};

		const selected_options = buildSelectedOptionsWithPrice(apiData, opts);

		try {
			const idsPayload = buildIdsPayload(apiData, opts);

			const success = await updateCartItem(cartItemId, {
				...idsPayload,
				selected_options,
			});
			if (success) {
				setSavedSuccessfully(true);
				setHasUnsavedChanges(false);
				setShowSaveButton(false);
				setTimeout(() => setSavedSuccessfully(false), 2500);
			}
		} finally {
			setSaving(false);
		}
	};

	const resetAllOptions = () => {
		setSize("اختر");
		setColor("اختر");
		setMaterial("اختر");

		// reset tier
		setSizeTierId(null);
		setSizeTierTotal(null);
		setSizeTierQty(null);
		setSizeTierUnit(null);

		const resetGroups: Record<string, string> = {};
		Object.keys(groupedOptions).forEach((g) => (resetGroups[g] = "اختر"));
		setOptionGroups(resetGroups);

		setPrintingMethod("اختر");
		setPrintLocations([]);

		setHasUnsavedChanges(true);
		setShowSaveButton(true);
		setSavedSuccessfully(false);
	};

	const handleOptionChange = (setter: (v: string) => void, value: string) => {
		setter(value);
		setHasUnsavedChanges(true);
		setShowSaveButton(true);
		setSavedSuccessfully(false);
	};

	const handleGroupChange = (groupName: string, value: string) => {
		setOptionGroups((prev) => {
			const next = { ...prev, [groupName]: value };
			setHasUnsavedChanges(true);
			setShowSaveButton(true);
			setSavedSuccessfully(false);
			return next;
		});
	};

	// ✅ when size changes -> reset tier
	const handleSizeChange = (value: string) => {
		handleOptionChange(setSize, value);
		setSizeTierId(null);
		setSizeTierTotal(null);
		setSizeTierQty(null);
		setSizeTierUnit(null);
	};

	// ✅ when tier changes -> set tier fields (and mark unsaved)
	const handleTierChange = (tierIdStr: string) => {
		const tierId = Number(tierIdStr);
		const tier = sizeTiers.find((t: any) => Number(t?.id) === tierId) || null;

		setSizeTierId(tier ? Number(tier.id) : null);
		setSizeTierQty(tier ? Number(tier.quantity) : null);
		setSizeTierUnit(tier ? num(tier.price_per_unit) : null);
		setSizeTierTotal(tier ? Number(tier.total_price) : null);

		setHasUnsavedChanges(true);
		setShowSaveButton(true);
		setSavedSuccessfully(false);
	};


	// const selectedSizeObj = useMemo(() => {
	// 	return (apiData?.sizes || []).find((s: any) => s?.name === size) || null;
	// }, [apiData, size]);

	// const sizeTiers = useMemo(() => {
	// 	const tiers = selectedSizeObj?.tiers;
	// 	return Array.isArray(tiers) ? tiers : [];
	// }, [selectedSizeObj]);

	// const needSizeTier = needSize && size !== "اختر" && sizeTiers.length > 0;


	if (formLoading) return <StickerFormSkeleton />;

	if (apiError || !apiData) {
		return (
			<div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
				<p className="text-slate-700 font-extrabold">{apiError || "لا توجد بيانات للمنتج"}</p>
			</div>
		);
	}

	const needSize = apiData?.sizes?.length > 0;
	const needColor = apiData?.colors?.length > 0;
	const needMaterial = apiData?.materials?.length > 0;

	const needPrintingMethod = Array.isArray(apiData?.printing_methods) && apiData.printing_methods.length > 0;
	const needPrintLocation = Array.isArray(apiData?.print_locations) && apiData.print_locations.length > 0;

	const needSizeTier = needSize && size !== "اختر" && (sizeTiers?.length ?? 0) > 0;

	return (
		<motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="pt-4 mt-4">
			{cartItemId && showSaveButton && (
				<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-2xl">
					<div className="flex items-center justify-between gap-2">
						<div className="flex items-center gap-2">
							<Warning className="text-yellow-600 text-sm" />
							<p className="text-sm text-yellow-800 font-bold">لديك تغييرات غير محفوظة</p>
						</div>
						<div className="flex gap-2">
							<Button
								variant="outlined"
								size="small"
								onClick={resetAllOptions}
								startIcon={<Refresh />}
								className="flex items-center gap-2"
								sx={{ borderRadius: "14px", borderColor: "#e2e8f0", color: "#0f172a", fontWeight: 900 }}
							>
								إعادة تعيين
							</Button>

							<Button
								variant="contained"
								size="small"
								onClick={saveAllOptions}
								disabled={saving}
								startIcon={saving ? <CircularProgress size={16} /> : <Save />}
								className="flex items-center gap-2"
								sx={{ borderRadius: "14px", backgroundColor: "#f59e0b", fontWeight: 900 }}
							>
								{saving ? "جاري الحفظ..." : "حفظ"}
							</Button>
						</div>
					</div>
				</motion.div>
			)}

			{cartItemId && savedSuccessfully && (
				<motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="mb-4">
					<Alert severity="success" className="rounded-2xl" icon={<CheckCircle />}>
						تم حفظ التغييرات بنجاح
					</Alert>
				</motion.div>
			)}

			<div className="space-y-4">
				{needSize && (
					<Box>
						<FormControl fullWidth size="small" required error={showValidation && needSize && size === "اختر"}>
							<InputLabel>المقاس</InputLabel>
							<Select value={size} onChange={(e) => handleSizeChange(e.target.value as string)} label="المقاس" className="bg-white">
								<MenuItem value="اختر" disabled>
									<em className="text-gray-400">اختر</em>
								</MenuItem>
								{apiData.sizes.map((s: any) => (
									<MenuItem key={s.id} value={s.name}>
										{s.name}
									</MenuItem>
								))}
							</Select>
							{showValidation && needSize && size === "اختر" && <FormHelperText className="text-red-500 text-xs">يجب اختيار المقاس</FormHelperText>}
						</FormControl>
					</Box>
				)}

				{/* ✅ NEW: Size Tier (quantity) */}
				{needSizeTier && (
					<Box>
						<FormControl
							fullWidth
							size="small"
							required
							error={showValidation && needSizeTier && !sizeTierId}
						>
							<InputLabel>الكمية</InputLabel>
							<Select
								value={sizeTierId ? String(sizeTierId) : "اختر"}
								onChange={(e) => handleTierChange(e.target.value as string)}
								label="الكمية"
								className="bg-white"
							>
								<MenuItem value="اختر" disabled>
									<em className="text-gray-400">اختر</em>
								</MenuItem>

								{sizeTiers.map((t: any) => (
									<MenuItem key={t.id} value={String(t.id)}>
										<div className="flex items-center justify-between gap-3 w-full">
											<span>{t.quantity} قطعة</span>
											<span className="text-xs font-black text-slate-700">{Number(t.total_price).toFixed(2)} ر.س</span>
										</div>
									</MenuItem>
								))}
							</Select>

							{showValidation && needSizeTier && !sizeTierId && <FormHelperText className="text-red-500 text-xs">يجب اختيار كمية المقاس</FormHelperText>}

							{!!sizeTierId && (
								<FormHelperText className="text-slate-600 text-xs">
									سعر الوحدة: {num(sizeTierUnit).toFixed(2)} — الإجمالي: {num(sizeTierTotal).toFixed(2)}
								</FormHelperText>
							)}
						</FormControl>
					</Box>
				)}

				{needColor && (
					<Box>
						<FormControl fullWidth size="small" required error={showValidation && needColor && color === "اختر"}>
							<InputLabel>اللون</InputLabel>
							<Select value={color} onChange={(e) => handleOptionChange(setColor, e.target.value as string)} label="اللون" className="bg-white">
								<MenuItem value="اختر" disabled>
									<em className="text-gray-400">اختر</em>
								</MenuItem>
								{apiData.colors.map((c: any) => (
									<MenuItem key={c.id} value={c.name}>
										<div className="flex items-center gap-2">
											{c.hex_code && <div className="w-4 h-4 rounded-full border border-slate-200" style={{ backgroundColor: c.hex_code }} />}
											<span>{c.name}</span>
										</div>
									</MenuItem>
								))}
							</Select>
							{showValidation && needColor && color === "اختر" && <FormHelperText className="text-red-500 text-xs">يجب اختيار اللون</FormHelperText>}
						</FormControl>
					</Box>
				)}

				{needMaterial && (
					<Box>
						<FormControl fullWidth size="small" required error={showValidation && needMaterial && material === "اختر"}>
							<InputLabel>الخامة</InputLabel>
							<Select value={material} onChange={(e) => handleOptionChange(setMaterial, e.target.value as string)} label="الخامة" className="bg-white">
								<MenuItem value="اختر" disabled>
									<em className="text-gray-400">اختر</em>
								</MenuItem>
								{apiData.materials.map((m: any) => (
									<MenuItem key={m.id} value={m.name}>
										<div className="flex items-center justify-between gap-2 w-full">
											<span>{m.name}</span>
											{Number(m.additional_price || 0) > 0 ? (
												<span className="text-xs font-black text-amber-700">+ {m.additional_price}</span>
											) : (
												<span className="text-xs font-black text-slate-500">0</span>
											)}
										</div>
									</MenuItem>
								))}
							</Select>
							{showValidation && needMaterial && material === "اختر" && <FormHelperText className="text-red-500 text-xs">يجب اختيار الخامة</FormHelperText>}
						</FormControl>
					</Box>
				)}

				{Object.keys(groupedOptions).map((groupName) => {
					const items = groupedOptions[groupName] || [];
					const required = items.some((x: any) => Boolean(x?.is_required));
					const currentValue = optionGroups?.[groupName] || "اختر";
					const fieldError = showValidation && required && currentValue === "اختر";

					return (
						<Box key={groupName}>
							<FormControl fullWidth size="small" required={required} error={fieldError}>
								<InputLabel>{groupName}</InputLabel>
								<Select value={currentValue} onChange={(e) => handleGroupChange(groupName, e.target.value as string)} label={groupName} className="bg-white">
									<MenuItem value="اختر" disabled>
										<em className="text-gray-600">اختر</em>
									</MenuItem>

									{items.map((o: any) => (
										<MenuItem key={o.id} value={o.option_value}>
											<div className="flex items-center justify-between gap-3 w-full">
												<span>{o.option_value}</span>
												{Number(o.additional_price || 0) > 0 ? (
													<span className="text-xs font-black text-amber-700">+ {o.additional_price}</span>
												) : (
													<span className="text-xs font-black text-slate-500">0</span>
												)}
											</div>
										</MenuItem>
									))}
								</Select>

								{fieldError && <FormHelperText className="text-red-500 text-xs">يجب اختيار {groupName}</FormHelperText>}
							</FormControl>
						</Box>
					);
				})}

				{needPrintingMethod && (
					<Box>
						<FormControl fullWidth size="small" required error={showValidation && printingMethod === "اختر"}>
							<InputLabel>طريقة الطباعة</InputLabel>
							<Select
								value={printingMethod}
								onChange={(e) => handleOptionChange(setPrintingMethod, e.target.value as string)}
								label="طريقة الطباعة"
								className="bg-white"
							>
								<MenuItem value="اختر" disabled>
									<em className="text-gray-400">اختر</em>
								</MenuItem>
								{apiData.printing_methods.map((p: any) => (
									<MenuItem key={p.id} value={p.name}>
										<div className="flex items-center justify-between gap-3 w-full">
											<span>{p.name}</span>
											<span className="text-xs font-black text-amber-700">{p.base_price}</span>
										</div>
									</MenuItem>
								))}
							</Select>

							{showValidation && printingMethod === "اختر" && <FormHelperText className="text-red-500 text-xs">يجب اختيار طريقة الطباعة</FormHelperText>}
						</FormControl>
					</Box>
				)}

				{/* ✅ UPDATED: Print Locations MULTI */}
				{needPrintLocation && (
					<Box>
						<FormControl
							fullWidth
							size="small"
							required
							error={showValidation && (!Array.isArray(printLocations) || printLocations.length === 0)}
						>
							<InputLabel>مكان الطباعة</InputLabel>
							<Select
								multiple
								value={printLocations}
								onChange={(e) => {
									const value = e.target.value as string[];
									setPrintLocations(value);
									setHasUnsavedChanges(true);
									setShowSaveButton(true);
									setSavedSuccessfully(false);
								}}
								label="مكان الطباعة"
								className="bg-white"
								renderValue={(selected) => (Array.isArray(selected) ? selected.join("، ") : "")}
							>
								{apiData.print_locations.map((p: any) => {
									const checked = printLocations.includes(p.name);
									return (
										<MenuItem key={p.id} value={p.name}>
											<Checkbox checked={checked} />
											<ListItemText
												primary={
													<div className="flex items-center justify-between gap-3 w-full">
														<span>{p.name}</span>
														<span className="text-xs font-black text-slate-500">{p.type}</span>
													</div>
												}
											/>
										</MenuItem>
									);
								})}
							</Select>

							{showValidation && (!Array.isArray(printLocations) || printLocations.length === 0) && (
								<FormHelperText className="text-red-500 text-xs">يجب اختيار مكان الطباعة</FormHelperText>
							)}
						</FormControl>
					</Box>
				)}
			</div>

			{apiData?.options_note && (
				<div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-2xl">
					<div className="flex items-start gap-2">
						<Info className="text-blue-500 text-sm mt-0.5" />
						<p className="text-sm text-blue-700 font-semibold">{apiData.options_note}</p>
					</div>
				</div>
			)}
		</motion.div>
	);
});
