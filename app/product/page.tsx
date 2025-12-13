"use client";

import { useEffect, useState, useMemo } from "react";
import ProductCard from "@/components/ProductCard";
// import ProductFilter from "@/components/ProductFilter";
import Stack from "@mui/material/Stack";
import Pagination from "@mui/material/Pagination";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import OutlinedInput from "@mui/material/OutlinedInput";
// import { FiFilter } from "react-icons/fi";
import Loading from "@/app/loading";
import { ProductI } from "@/Types/ProductsI";



// interface Filters {
//   available: boolean;
//   brands: string[];
//   materials: string[];
//   colors: string[];
//   categories: number[];
// }

export default function AllProductsPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [loading, setLoading] = useState(true);

  const [products, setProducts] = useState<ProductI[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductI[]>([]);

  // const [showFilter, setShowFilter] = useState(false);
  // const [columns, setColumns] = useState<number>(4);

  // const [filterBrands, setFilterBrands] = useState<string[]>([]);
  const [filterMaterials, setFilterMaterials] = useState<string[]>([]);
  const [filterColors, setFilterColors] = useState<string[]>([]);

  const [page, setPage] = useState<number>(1);
  const rowsPerPage = 12;
  const [priceOrder, setPriceOrder] = useState<"" | "asc" | "desc" | "rating">(
    ""
  );

  // =========================
  // Fetch All Products
  // =========================
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/products`);
        const data = await res.json();
        const list: ProductI[] = data.data || [];
        setProducts(list);
        setFilteredProducts(list);

        setFilterMaterials([
          ...new Set(
            list
              .flatMap((p) => p.materials?.map((m) => m.name) || [])
              .filter(Boolean)
          ),
        ]);

        setFilterColors([
          ...new Set(
            list
              .flatMap((p) => p.colors?.map((c) => c.name) || [])
              .filter(Boolean)
          ),
        ]);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  // =========================
  // Sorting by Price/Rating
  // =========================
  const sortedProducts = useMemo(() => {
    if (priceOrder === "") return filteredProducts;

    const sorted = [...filteredProducts];

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
  }, [filteredProducts, priceOrder]);

  // =========================
  // Pagination
  // =========================
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return sortedProducts.slice(start, start + rowsPerPage);
  }, [sortedProducts, page]);

  if (loading) return <Loading />;

  const handleFavoriteChange = (productId: number, newValue: boolean) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, is_favorite: newValue } : p
      )
    );

    setFilteredProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, is_favorite: newValue } : p
      )
    );

    setFilteredProducts((prev) => [...prev]);
  };

  const options = [
    { label: "الخيارات المميزة", value: "" },
    { label: "الأعلى تقييماً", value: "rating" },
    { label: "السعر: من الأقل إلى الأكثر", value: "asc" },
    { label: "السعر: من الأكثر إلى الأقل", value: "desc" },
  ];

  return (
    <section
      className="px-6 lg:px-[15%] py-5 grid grid-col-1 md:grid-cols-4 gap-5"
      dir="rtl"
    >
      {/* Main content */}
      <div className="col-span-4 flex flex-col items-center">
        <div className="flex flex-col w-full">
          <div className="flex items-center justify-between mb-5">
            <p className="font-bold text-[19px]">جميع المنتجات</p>

            {/* Price Filter Dropdown */}
            <div className="md:text-end ">
              <FormControl sx={{ width: 200 , fontFamily:"cairo"}}>
                <Select
                  sx={{
                    textAlign: "right",
                    p: 0,
                  }}
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
                    return found?.label || <em>الخيارات المميزة</em>;
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
          </div>

          {/* Products Grid */}
          {paginatedProducts.length === 0 ? (
            <p className="text-center text-gray-500">
              لا توجد منتجات مطابقة للفلاتر.
            </p>
          ) : (
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
                      : [{ url: "/images/c1.png", alt: "default image" }]
                  }
                  price={(product.price ?? 1).toString()}
                  final_price={product.final_price}
                  discount={
                    product.discount
                      ? {
                          value: product.discount.value.toString(),
                          type: product.discount.type.toString(),
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
          )}

          {/* Pagination */}
          <div className="self-center text-center mt-6">
            <Stack spacing={2}>
              <Pagination
                count={Math.ceil(sortedProducts.length / rowsPerPage)}
                page={page}
                onChange={(event, value) => setPage(value)}
                color="primary"
                sx={{
                  "& .MuiPaginationItem-icon": { transform: "scaleX(-1)" },
                }}
              />
            </Stack>
          </div>
        </div>
      </div>
    </section>
  );
}
