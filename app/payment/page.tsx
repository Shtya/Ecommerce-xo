"use client";

import AddressForm from "@/components/AddressForm";
import BankPayment from "@/components/BankPayment";
import CoBon from "@/components/cobon";
import InvoiceSection from "@/components/InvoiceSection";
import OrderSummary from "@/components/OrderSummary";
import TotalOrder from "@/components/TotalOrder";
import { AddressI } from "@/Types/AddressI";
import { useState, useEffect, useMemo } from "react";
import { FiPlus } from "react-icons/fi";
import Button from "@mui/material/Button";
import { useRouter } from "next/navigation";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import Swal from "sweetalert2";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { useAppContext } from "../../src/context/AppContext";


function BlockSkeleton() {
	return (
		<div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm animate-pulse">
			<div className="h-6 bg-slate-100 rounded-xl w-1/3 mb-4" />
			<div className="h-20 bg-slate-100 rounded-2xl w-full" />
			<div className="h-10 bg-slate-100 rounded-2xl w-full mt-4" />
		</div>
	);
}

export default function PaymentPage() {
	const [openModal, setOpenModal] = useState(false);
	const [showAddress, setShowAddress] = useState(false);
	const { paymentMethods } = useAppContext() as any;

	const [addresses, setAddresses] = useState<AddressI[]>([]);
	const [selectedAddress, setSelectedAddress] = useState<AddressI | null>(null);

	const [paymentMethod, setPaymentMethod] = useState<string>("");
	const [notes, setNotes] = useState<string>("");

	const [loading, setLoading] = useState(false);
	const [token, setToken] = useState<string | null>(null);

	const [addrLoading, setAddrLoading] = useState(true);

	const router = useRouter();
	const base_url = process.env.NEXT_PUBLIC_API_URL;

	const paymentLabel = useMemo(() => getPaymentMethodText(paymentMethod), [paymentMethod]);

	useEffect(() => {
		const t = localStorage.getItem("auth_token");
		setToken(t);

		if (!t) {
			Swal.fire("تنبيه", "يرجى تسجيل الدخول لإتمام الدفع", "warning");
			router.push("/login");
		}
	}, [router]);

	useEffect(() => {
		if (!token) return;

		const fetchAddresses = async () => {
			setAddrLoading(true);
			try {
				const res = await fetch(`${base_url}/addresses`, {
					headers: {
						Accept: "application/json",
						Authorization: `Bearer ${token}`,
					},
					cache: "no-store",
				});

				const result = await res.json().catch(() => null);

				if (res.ok && result?.status && Array.isArray(result?.data)) {
					setAddresses(result.data);
					setSelectedAddress(result.data[0] || null);
				}
			} catch (err) {
				console.error("Error fetching addresses:", err);
			} finally {
				setAddrLoading(false);
			}
		};

		fetchAddresses();
	}, [token, base_url]);

	const handleNewAddress = (newAddress: AddressI) => {
		setAddresses((prev) => [newAddress, ...prev]);
		setSelectedAddress(newAddress);
		setOpenModal(false);
		setShowAddress(false);
	};

	const handleAddressChange = () => {
		if (addresses.length > 0) setShowAddress((v) => !v);
		else setOpenModal(true);
	};

	const handleSelectAddress = (address: AddressI) => {
		setSelectedAddress(address);
		setShowAddress(false);
	};

	const handleCompletePurchase = async () => {
		if (loading) return;

		if (!paymentMethod) {
			Swal.fire("تنبيه", "يرجى اختيار طريقة الدفع", "warning");
			return;
		}

		if (!token) {
			Swal.fire("تنبيه", "يرجى تسجيل الدخول", "warning");
			router.push("/login");
			return;
		}

		setLoading(true);

		try {
			const orderData: any = {
				payment_method: paymentMethod,
				notes: notes?.trim() || `تم اختيار ${paymentLabel}`,
			};

			if (selectedAddress?.id) {
				orderData.address_id = selectedAddress.id;
			}

			const response = await fetch(`${base_url}/order`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
					Accept: "application/json",
				},
				body: JSON.stringify(orderData),
				cache: "no-store",
			});

			const result = await response.json();

			if (!response.ok || !result?.status) {
				throw new Error(result?.message || "حدث خطأ أثناء إنشاء الطلب");
			}

			if (paymentMethod === "cash_on_delivery") {
				Swal.fire("نجاح", "تم إنشاء الطلب بنجاح", "success");
				router.push(`/ordercomplete?orderId=${result.data.id}`);
			} else {
				Swal.fire("انتظار", result?.data?.message || "جاري توجيهك إلى بوابة الدفع...", "info");
				console.log(result?.data);
				if (result?.data?.payment_url) window.location.href = result.data.payment_url;
			}
		} catch (error: any) {
			console.error("Error creating order:", error);
			Swal.fire("خطأ", error?.message || "حدث خطأ أثناء إنشاء الطلب", "error");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="container pb-10 pt-6">
			{/* Breadcrumb / Header */}
			<div className="flex items-center gap-2 text-sm mb-4">
				<button onClick={() => router.back()} className="text-pro-max font-bold flex items-center gap-1">
					<MdKeyboardArrowLeft size={18} />
					رجوع
				</button>
				<span className="text-slate-400">/</span>
				<span className="text-slate-600 font-semibold">الدفع</span>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
				{/* Left */}
				<div className="col-span-1 lg:col-span-2 space-y-4">
					{/* Shipping */}
					<div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
						<div className="p-5 border-b border-slate-200 flex items-center justify-between">
							<div>
								<h2 className="text-xl font-extrabold text-slate-900">عنوان الشحن</h2>
								<p className="text-sm text-slate-500 mt-1">اختر العنوان المناسب أو أضف عنوان جديد.</p>
							</div>

							<button
								onClick={() => setOpenModal(true)}
								className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 font-extrabold text-slate-700 hover:bg-slate-100"
							>
								<FiPlus />
								أضف عنوان
							</button>

							<AddressForm open={openModal} onClose={() => setOpenModal(false)} onSuccess={handleNewAddress} />
						</div>

						<div className="p-5">
							{addrLoading ? (
								<BlockSkeleton />
							) : (
								<>
									{/* Selected summary */}
									<div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
										<p className="text-slate-700 font-extrabold">
											التوصيل إلى:{" "}
											<span className="text-slate-900">
												{selectedAddress ? `${selectedAddress.city} - ${selectedAddress.area}` : "لم يتم اختيار عنوان"}
											</span>
										</p>

										{selectedAddress && (
											<div className="mt-2 text-sm text-slate-600 space-y-1">
												<p>{selectedAddress.details}</p>
												<p className="font-semibold">
													{selectedAddress.full_name} {selectedAddress.phone ? `- ${selectedAddress.phone}` : ""}
												</p>
											</div>
										)}

										<div className="mt-3 flex items-center justify-between">
											<button
												onClick={handleAddressChange}
												className="text-pro-max font-extrabold underline underline-offset-4"
											>
												{showAddress ? "إخفاء العناوين" : "تغيير العنوان"}
											</button>

											{selectedAddress && (
												<span className="text-xs font-extrabold rounded-full bg-white border border-slate-200 px-3 py-1 text-slate-600">
													عنوان محدد
												</span>
											)}
										</div>
									</div>

									{/* Address list */}
									{showAddress && addresses.length > 0 && (
										<div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
											{addresses.map((address) => {
												const active = selectedAddress?.id === address.id;
												return (
													<button
														key={address.id}
														onClick={() => handleSelectAddress(address)}
														className={`text-right rounded-3xl border p-4 transition ${active
															? "border-pro-max bg-blue-50"
															: "border-slate-200 bg-white hover:bg-slate-50"
															}`}
													>
														<div className="flex items-start justify-between gap-2">
															<div>
																<p className="font-extrabold text-slate-900">{address.full_name}</p>
																<p className="text-sm text-slate-600 mt-1">
																	{address.city} - {address.area}
																</p>
															</div>
															<span
																className={`text-xs font-extrabold rounded-full px-3 py-1 border ${active ? "bg-white border-pro-max text-pro-max" : "bg-slate-50 border-slate-200 text-slate-600"
																	}`}
															>
																{active ? "محدد" : "اختر"}
															</span>
														</div>
														<p className="text-sm text-slate-600 mt-2">{address.details}</p>
														{address.phone && <p className="text-xs text-slate-500 mt-2">{address.phone}</p>}
													</button>
												);
											})}
										</div>
									)}

									{/* Notes */}
									<div className="mt-5">
										<label className="text-sm font-extrabold text-slate-700">ملاحظات (اختياري)</label>
										<textarea
											value={notes}
											onChange={(e) => setNotes(e.target.value)}
											placeholder="مثال: الرجاء الاتصال قبل التوصيل..."
											className="mt-2 w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 font-semibold outline-none focus:border-pro-max"
											rows={3}
										/>
									</div>
								</>
							)}
						</div>
					</div>

					{/* Payment */}
					<div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
						<div className="p-5 border-b border-slate-200">
							<h2 className="text-xl font-extrabold text-slate-900">اختر طريقة الدفع</h2>
							<p className="text-sm text-slate-500 mt-1">اختر الطريقة الأنسب لإتمام الطلب.</p>
						</div>
						<div className="p-5">
							<BankPayment paymentMethods={paymentMethods} onPaymentMethodChange={setPaymentMethod} />
						</div>
					</div>
				</div>

				{/* Right summary */}
				<div className="col-span-1 space-y-4 lg:sticky lg:top-[150px] h-fit">
					<div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-5">
						<CoBon />
					</div>

					<div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-5">
						<InvoiceSection />
					</div>

					<div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-5">
						<OrderSummary />
						{/* <div className="mt-4">
							<TotalOrder />
						</div> */}

						<div className="mt-4">
							<Button
								variant="contained"
								disabled={loading || !paymentMethod}
								sx={{
									fontSize: "1.1rem",
									backgroundColor: loading ? "#9ca3af" : "#14213d",
									"&:hover": { backgroundColor: loading ? "#9ca3af" : "#0f1a31" },
									color: "#fff",
									gap: "10px",
									px: "20px",
									py: "12px",
									borderRadius: "16px",
									textTransform: "none",
									width: "100%",
									fontWeight: 900,
								}}
								endIcon={<KeyboardBackspaceIcon />}
								onClick={handleCompletePurchase}
							>
								{loading ? "جاري المعالجة..." : "إتمام الشراء"}
							</Button>

							{!paymentMethod && (
								<p className="text-red-500 text-center mt-2 text-sm font-semibold">
									يرجى اختيار طريقة الدفع أولًا
								</p>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function getPaymentMethodText(method: string) {
	const map: Record<string, string> = {
		cash_on_delivery: "الدفع عند الاستلام",
		credit_card: "الدفع بالبطاقة",
		applePay: "Apple Pay",
		stcPay: "STC Pay",
		tamara: "Tamara",
		tabby: "Tabby",
	};
	return map[method] || method || "طريقة دفع";
}
