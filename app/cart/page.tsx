"use client";

import Link from "next/link";
import Image from "next/image";
import { FaPlus, FaMinus } from "react-icons/fa6";
import { BsTrash3 } from "react-icons/bs";
import { useCart } from "@/src/context/CartContext";
import toast from "react-hot-toast";
import { MdKeyboardArrowLeft } from "react-icons/md";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import CoBon from "@/components/cobon";
import TotalOrder from "@/components/TotalOrder";
import Button from "@mui/material/Button";
import { useRouter } from "next/navigation";
import { IoIosCloseCircle } from "react-icons/io";
import StickerForm from "@/components/StickerForm";
import Swal from "sweetalert2";
import { useState, useEffect } from "react";
import { CircularProgress } from "@mui/material";
import Loading from "../loading";

export default function CartPage() {
  const router = useRouter();

  const { cart, cartCount, total, removeFromCart, updateQuantity, loading } =
    useCart();

  const [isCartReady, setIsCartReady] = useState(false);

  useEffect(() => {
    if (cart.length > 0 && !loading) {
      const timer = setTimeout(() => {
        setIsCartReady(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [cart, loading]);

  const handleClick = () => {
    if (!isCartReady) {
      toast.error("جاري تحميل بيانات السلة، يرجى الانتظار...");
      return;
    }

    let hasEmptyFields = false;
    const errorMessages: string[] = [];

    cart.forEach((item, index) => {
      const productData = item.product;

      const apiData = {
        sizes: productData.sizes || [],
        colors: productData.colors || [],
        materials: productData.materials || [],
        features: productData.features || [],
      };

      const selected: any = {};

      item.selected_options?.forEach((opt: any) => {
        if (opt.option_name === "المقاس")
          selected["المقاس"] = opt.option_value?.trim();
        if (opt.option_name === "اللون")
          selected["اللون"] = opt.option_value?.trim();
        if (opt.option_name === "الخامة")
          selected["الخامة"] = opt.option_value?.trim();
      });

      item.selected_options?.forEach((opt: any) => {
        if (opt.option_name === "خاصية" && opt.option_value) {
          const match = opt.option_value.match(/^(.+?):\s*(.+)$/);
          if (match) {
            selected[match[1].trim()] = match[2].trim();
          }
        }
      });

      let itemHasEmptyFields = false;
      let itemErrorMessages: string[] = [];

      if (apiData.sizes.length > 0) {
        if (!selected["المقاس"] || selected["المقاس"] === "اختر") {
          itemHasEmptyFields = true;
          itemErrorMessages.push("المقاس");
        }
      }

      if (apiData.colors.length > 0) {
        if (!selected["اللون"] || selected["اللون"] === "اختر") {
          itemHasEmptyFields = true;
          itemErrorMessages.push("اللون");
        }
      }

      if (apiData.materials.length > 0) {
        if (!selected["الخامة"] || selected["الخامة"] === "اختر") {
          itemHasEmptyFields = true;
          itemErrorMessages.push("الخامة");
        }
      }

      apiData.features.forEach((feature: any) => {
        const required = feature.values?.length > 0;

        if (required) {
          const val = selected[feature.name];
          if (!val || val === "اختر") {
            itemHasEmptyFields = true;
            itemErrorMessages.push(feature.name);
          }
        }
      });

      if (itemHasEmptyFields) {
        hasEmptyFields = true;
        errorMessages.push(
          `• المنتج ${index + 1}: ${productData.name} (${itemErrorMessages.join(
            "، "
          )})`
        );
      }
    });

    if (hasEmptyFields) {
      const finalMessage = `
الرجاء اختيار كل الحقول المطلوبة قبل المتابعة

المنتجات التي تحتاج إكمال البيانات:

${errorMessages.join("\n")}

يرجى التأكد من اختيار جميع الخيارات المطلوبة لكل منتج.
      `;

      Swal.fire({
        icon: "error",
        title: "الحقول غير مكتملة",
        html: finalMessage.replace(/\n/g, "<br/>"),
        confirmButtonText: "حسنًا",
        customClass: {
          popup: "font-sans text-sm",
          confirmButton: "bg-pro text-white font-bold",
        },
      });
      return;
    }

    router.push("/payment");
  };

  if (loading) {
    return (
      <Loading/>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="p-10 text-center flex flex-col items-center justify-center min-h-[60vh]">
        <Image
          src="/images/cart2.webp"
          alt="empty cart"
          width={300}
          height={250}
        />
        <h2 className="text-2xl font-bold mb-6 text-gray-700">العربة فارغة</h2>
        <Link
          href="/"
          className="bg-pro text-white py-3 px-8 rounded-lg hover:bg-pro-max transition text-lg font-medium"
        >
          العودة للتسوق
        </Link>
      </div>
    );
  }

  return (
    <div className="px-5 lg:px-[7%] xl:px-[18%] pb-8 pt-5">
      <div className="flex items-center gap-2 text-sm mb-1">
        <Link href="/" aria-label="go to home" className="text-pro-max">
          الرئيسيه
        </Link>
        <MdKeyboardArrowLeft />
        <h6 className="text-gray-600">عربة التسوق</h6>
      </div>

      {!isCartReady && <Loading />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="col-span-1 lg:col-span-2">
          <div className="flex flex-col my-4 bg-white overflow-hidden">
            {cart.map((item) => (
              <div
                key={item.cart_item_id}
                className="p-6 relative border rounded-lg border-gray-200 mb-4"
              >
                <div className="relative md:border-0 border-b border-gray-200">
                  <div className="md:flex justify-between items-start flex md:flex-row flex-col gap-3 md:gap-0">
                    <div className="flex gap-3 md:border-0 border-b border-gray-200 w-full md:w-fit pb-4 md:pb-0">
                      <div className="w-25 h-20 bg-gray-100 rounded">
                       <Link href={`/product/${item.product.id}`}>
                            <Image
                          src={item.product.image || "/images/not.jpg"}
                          alt={item.product.name}
                          width={96}
                          height={80}
                          className="w-full h-full object-fit rounded"
                        />
                       </Link>
                   
                      </div>

                      <div className="flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-md text-gray-800">
                            {item.product.name}
                          </h3>

                      

                          <div className="text-sm text-gray-600 mt-1 space-y-1">
                            <p className="text-gray-500">
                              السعر :{" "}
                              {parseFloat(item.price_per_unit || "0").toFixed(
                                2
                              )}{" "}
                              جنيه
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 border border-gray-200 rounded-lg">
                      <button
                        onClick={() => {
                          if (item.quantity >= 10) {
                            toast.error("الحد الأقصى 10 قطع فقط لهذا المنتج", {
                              icon: "معلومة",
                              duration: 4000,
                            });
                          } else {
                            updateQuantity(
                              item.cart_item_id,
                              item.quantity + 1
                            );
                          }
                        }}
                        className="w-10 h-9 text-gray-500 cursor-pointer border-gray-200 border-l rounded-lg rounded-bl-none rounded-tl-none transition flex items-center justify-center"
                      >
                        <FaPlus size={16} />
                      </button>
                      <span className="font-semibold w-5 text-lg text-center bg-white">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => {
                          if (item.quantity <= 1) {
                            removeFromCart(item.cart_item_id);
                          } else {
                            updateQuantity(
                              item.cart_item_id,
                              item.quantity - 1
                            );
                          }
                        }}
                        className="w-10 h-9 border-gray-200 border-r cursor-pointer rounded-lg rounded-br-none rounded-tr-none transition flex items-center justify-center"
                      >
                        {item.quantity <= 1 ? (
                          <BsTrash3 className="text-red-500" size={16} />
                        ) : (
                          <FaMinus className="text-gray-600" size={14} />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center text-sm text-red-400 gap-4">
                      <div className="flex absolute bottom-1/6 end-0 md:relative items-center">
                        <p className="text-sm text-green-600 mt-1 font-semibold">
                          الإجمالي:{" "}
                          {parseFloat(item.line_total || "0").toFixed(2)} جنيه
                        </p>
                      </div>

                      <button
                        onClick={async () => {
                          const result = await Swal.fire({
                            title: "هل أنت متأكد؟",
                            text: "سيتم حذف هذا المنتج من السلة نهائيًا!",
                            icon: "warning",
                            showCancelButton: true,
                            confirmButtonColor: "#d33",
                            cancelButtonColor: "#3085d6",
                            confirmButtonText: "نعم، احذفه",
                            cancelButtonText: "لا، ألغِ الأمر",
                            reverseButtons: true,
                            customClass: {
                              popup: "animate__animated animate__fadeInDown",
                              confirmButton: "font-bold",
                              cancelButton: "font-bold",
                            },
                          });

                          if (result.isConfirmed) {
                            await removeFromCart(item.cart_item_id);
                          }
                        }}
                        className="cursor-pointer absolute top-0 end-0 md:relative"
                      >
                        <IoIosCloseCircle className="text-red-400" size={28} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <StickerForm
                    cartItemId={item.cart_item_id}
                    productId={item.product.id}
                    productData={item.product}
                    cartItemData={item}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-1">
          <div className="border border-gray-200 rounded-lg p-6 mt-4 bg-white">
            <CoBon />

            <h4 className="text-md font-semibold text-pro my-5">ملخص الطلب</h4>
            <TotalOrder
              response={{
                status: true,
                data: {
                  items_count: cartCount,
                  subtotal: total.toString(),
                  total: total.toString(),
                  items: cart,
                },
              }}
            />

            <Button
              variant="contained"
              onClick={handleClick}
              disabled={!isCartReady}
              fullWidth
              sx={{
                mt: 3,
                py: 1.5,
                fontSize: "1.2rem",
                fontWeight: "bold",
                backgroundColor: isCartReady ? "#14213d" : "#9ca3af",
                "&:hover": {
                  backgroundColor: isCartReady ? "#0f1a31" : "#9ca3af",
                },
                borderRadius: "12px",
                textTransform: "none",
              }}
              endIcon={<KeyboardBackspaceIcon />}
            >
              {isCartReady ? "تابع عملية الشراء" : "جاري التحميل..."}
            </Button>

            {!isCartReady && (
              <p className="text-xs text-gray-500 text-center mt-2">
                جاري تحميل خيارات المنتجات، يرجى الانتظار...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
