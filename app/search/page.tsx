"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import Stack from "@mui/material/Stack";
import Pagination from "@mui/material/Pagination";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
import Loading from "@/app/loading";
import { ProductI } from "@/Types/ProductsI";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() || "";

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductI[]>([]);
  const [page, setPage] = useState<number>(1);
  const rowsPerPage = 12;

  const [priceOrder, setPriceOrder] = useState<"" | "asc" | "desc" | "rating">(
    ""
  );

  // جلب المنتجات حسب كلمة البحث
  useEffect(() => {
    if (!query) {
      setProducts([]);
      setLoading(false);
      return;
    }

    async function fetchSearchResults() {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_URL}/products?search=${encodeURIComponent(query)}`
        );
        const data = await res.json();
        const list: ProductI[] = data.data || [];
        setProducts(list);
      } catch (err) {
        console.error("Error searching products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
        setPage(1); // رجّع الصفحة للأولى لما يتغير البحث
      }
    }

    fetchSearchResults();
  }, [query]);

  // ترتيب المنتجات
  const sortedProducts = useMemo(() => {
    if (priceOrder === "") return products;

    const sorted = [...products];

    if (priceOrder === "asc" || priceOrder === "desc") {
      sorted.sort((a, b) => {
        const priceA = Number(a.final_price ?? a.price ?? 0);
        const priceB = Number(b.final_price ?? b.price ?? 0);
        return priceOrder === "asc" ? priceA - priceB : priceB - priceA;
      });
    } else if (priceOrder === "rating") {
      sorted.sort((a, b) => (b.average_rating ?? 0) - (a.average_rating ?? 0));
    }

    return sorted;
  }, [products, priceOrder]);

  // تقسيم الصفحات
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return sortedProducts.slice(start, start + rowsPerPage);
  }, [sortedProducts, page]);

  const handleFavoriteChange = (productId: number, newValue: boolean) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, is_favorite: newValue } : p))
    );
  };

  const options = [
    { label: "الخيارات المميزة", value: "" },
    { label: "الأعلى تقييماً", value: "rating" },
    { label: "السعر: من الأقل إلى الأكثر", value: "asc" },
    { label: "السعر: من الأكثر إلى الأقل", value: "desc" },
  ];

  // لو مفيش كلمة بحث
  if (!query) {
    return (
      <section className="px-6 lg:px-[15%] py-20 text-center" dir="rtl">
        <h1 className="text-3xl font-bold mb-4">ابحث عن منتج</h1>
        <p className="text-gray-600">اكتب كلمة في شريط البحث أولاً</p>
      </section>
    );
  }

  if (loading) return <Loading />;

  return (
    <section
      className="px-6 lg:px-[15%] py-8 grid grid-cols-1 md:grid-cols-4 gap-5"
      dir="rtl"
    >
      <div className="col-span-4 flex flex-col items-center">
        <div className="w-full max-w-7xl">
          {/* العنوان + السورت */}
          <div  className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <h1 className="text-xl  font-semibold">
              نتائج البحث عن:{" "}
              <span className="text-blue-800">{query}</span>
            </h1>

            <FormControl sx={{ minWidth: 200 }}>
              <Select
                value={priceOrder}
                onChange={(e) =>
                  setPriceOrder(
                    e.target.value as "" | "asc" | "desc" | "rating"
                  )
                }
                input={<OutlinedInput />}
                displayEmpty
                renderValue={(selected) => {
                  const found = options.find((o) => o.value === selected);
                  return found?.label || "الخيارات المميزة";
                }}
              >
                {options.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <p className="text-gray-600 mb-6">
            تم العثور على {sortedProducts.length} منتج
            {sortedProducts.length === 1 ? "" : "ات"}
          </p>

          {/* المنتجات */}
          {paginatedProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-2xl text-gray-500">
              {`لا توجد منتجات مطابقة لكلمة "${query}"`}
              </p>
              <p className="mt-3 text-gray-500">جرب كلمات مفتاحية أخرى</p>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    image={product.image || "/images/c1.png"}
                    images={
                      product.images?.length
                        ? product.images
                        : [{ url: "/images/c1.png", alt: "default" }]
                    }
                    price={(product.price ?? 1).toString()}
                    final_price={product.final_price}
                    discount={
                      product.discount
                        ? {
                            value: product.discount.value.toString(),
                            type: product.discount.type,
                          }
                        : null
                    }
                    stock={product.stock || 0}
                    average_rating={product.average_rating}
                    reviews={product.reviews}
                    className2="hidden"
                    is_favorite={product.is_favorite}
                    onFavoriteChange={handleFavoriteChange}
                    Bottom="bottom-41.5"
                  />
                ))}
              </div>

              {/* Pagination */}
              {sortedProducts.length > rowsPerPage && (
                <div className="mt-10 flex justify-center">
                  <Stack spacing={2}>
                    <Pagination
                      count={Math.ceil(sortedProducts.length / rowsPerPage)}
                      page={page}
                      onChange={(_e, value) => setPage(value)}
                      color="primary"
                      size="large"
                      sx={{
                        "& .MuiPaginationItem-icon": {
                          transform: "scaleX(-1)",
                        },
                      }}
                    />
                  </Stack>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}