"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CategoryI } from "@/Types/CategoriesI";
import { fetchApi } from "@/lib/api";
import { FiChevronDown } from "react-icons/fi";

type Status = "idle" | "loading" | "success" | "error";

function cn(...c: (string | false | undefined | null)[]) {
	return c.filter(Boolean).join(" ");
}

export default function CateNavbar() {
	const [categories, setCategories] = useState<CategoryI[]>([]);
	const [status, setStatus] = useState<Status>("loading");
	const [errorMsg, setErrorMsg] = useState<string | null>(null);

	useEffect(() => {
		let alive = true;

		const getCats = async () => {
			try {
				setStatus("loading");
				setErrorMsg(null);

				const data = await fetchApi("categories?type=parent");
				const list = Array.isArray(data) ? data : [];

				if (!alive) return;

				setCategories(list);
				setStatus("success");
			} catch (error) {
				console.log("Error fetching categories:", error);
				if (!alive) return;

				setCategories([]);
				setStatus("error");
				setErrorMsg("حدث خطأ أثناء تحميل الأقسام");
			}
		};

		getCats();
		return () => {
			alive = false;
		};
	}, []);

	const items = useMemo(() => categories ?? [], [categories]);

	if (status === "loading") return <CateNavbarSkeleton />;

	return (
		<div className="bg-white/80  hidden1 ">
			<div className="container  border-b border-slate-200 ">
				<div className="flex items-center justify-between gap-3 py-2.5">
					{/* All products */}
					<Link
						href="/product"
						className={cn(
							"shrink-0 rounded-xl px-3 py-2 text-sm font-extrabold",
							"bg-slate-100 text-slate-800 hover:bg-slate-200 transition"
						)}
					>
						كل المنتجات
					</Link>

					{/* Error */}
					{status === "error" && (
						<div className="flex-1 text-center text-sm text-rose-600 font-bold">
							{errorMsg || "حدث خطأ"}{" "}
							<button
								type="button"
								onClick={() => location.reload()}
								className="underline underline-offset-2 hover:opacity-80"
							>
								إعادة المحاولة
							</button>
						</div>
					)}

					{/* Categories */}
					{status === "success" && (
						<div className="flex-1 flex items-center justify-end gap-1 overflow-x-auto">
							{items.map((cat) => {
								const hasChildren = Array.isArray(cat.children) && cat.children.length > 0;
								const parentHref = `/category/${(cat as any)?.slug ?? cat.id}`;

								return (
									<div key={cat.id} className="relative group">
										<Link
											href={parentHref}
											className={cn(
												"inline-flex items-center gap-1 rounded-xl px-3 py-2",
												"text-[0.98rem] font-extrabold text-slate-700",
												"hover:bg-slate-50 hover:text-pro transition"
											)}
										>
											<span className="whitespace-nowrap">{cat.name}</span>
											{hasChildren && (
												<FiChevronDown className="text-slate-500 group-hover:text-pro transition" />
											)}
										</Link>

										{/* Dropdown */}
										{hasChildren && (
											<div
												className={cn(
													"absolute start-0 top-full z-50 mt-2 hidden group-hover:block",
													"min-w-[240px] overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl"
												)}
											>
												{/* header */}
												<div className="px-4 py-3 bg-slate-50 border-b">
													<p className="text-sm font-extrabold text-slate-900">
														أقسام {cat.name}
													</p>
													<p className="text-xs text-slate-500 mt-0.5">
														اختر القسم المناسب
													</p>
												</div>

												<div className="max-h-[320px] overflow-y-auto py-2">
													{cat.children!.map((child: CategoryI) => {
														const childHref = `/category/${(child as any)?.slug ?? child.id}`;

														return (
															<Link
																key={child.id}
																href={childHref}
																className={cn(
																	"block px-4 py-2.5 text-sm font-bold",
																	"text-slate-700 hover:bg-slate-50 hover:text-pro transition"
																)}
															>
																<div className="flex items-center justify-between gap-3">
																	<span className="truncate">{child.name}</span>
																	<span className="text-xs text-slate-400">عرض</span>
																</div>
															</Link>
														);
													})}
												</div>

												{/* footer */}
												<div className="px-4 py-3 bg-white border-t">
													<Link
														href={parentHref}
														className="inline-flex w-full items-center justify-center rounded-xl bg-pro text-white py-2 text-sm font-extrabold hover:opacity-95 transition"
													>
														عرض كل {cat.name}
													</Link>
												</div>
											</div>
										)}
									</div>
								);
							})}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

/** ✅ Skeleton matches the real navbar look */
function CateNavbarSkeleton() {
	return (
		<div className="hidden1 border-b border-slate-200 bg-white">
			<div className="container mx-auto px-4">
				<div className="flex items-center justify-between gap-3 py-2.5">
					<div className="h-10 w-28 rounded-xl bg-slate-100 animate-pulse" />
					<div className="flex-1 flex items-center justify-end gap-2 overflow-hidden">
						{Array.from({ length: 7 }).map((_, i) => (
							<div
								key={i}
								className="h-10 w-24 rounded-xl bg-slate-100 animate-pulse"
							/>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
