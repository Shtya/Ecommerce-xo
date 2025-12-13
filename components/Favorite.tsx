"use client";
import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import NoOrders from "./NoOrders";
import { ProductI } from "@/Types/ProductsI";
import { useAuth } from "@/src/context/AuthContext";
import Loading from "@/app/loading";

export default function Favorite() {
  const [favoriteProducts, setFavoriteProducts] = useState<ProductI[]>([]);
  const [loading, setLoading] = useState(true);
  const { authToken: token } = useAuth();

  const fetchFavorites = async () => {
    if (!token) {
      setFavoriteProducts([]);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        "https://ecommecekhaled.renix4tech.com/api/v1/favorites",
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const dataJson = await res.json();

    
      const favoritesWithFlag: ProductI[] = (dataJson.data || []).map((fav: any) => ({
        ...fav.product,
        is_favorite: true,
      }));

      setFavoriteProducts(favoritesWithFlag);
    } catch (err) {
      console.error("Error fetching favorites:", err);
      setFavoriteProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const removeFavoriteLocally = (productId: number) => {
    setFavoriteProducts(prev => prev.filter(p => p.id !== productId));
  };

  useEffect(() => {
    fetchFavorites();
  }, [token]);

  if (loading) return <Loading/>;
  if (favoriteProducts.length === 0) return <NoOrders title="لا يوجد منتجات مفضلة." />;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">منتجاتي المفضلة</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {favoriteProducts.map(product => (
          <ProductCard
            key={product.id}
            {...product}
            onFavoriteChange={() => removeFavoriteLocally(product.id)}
             Bottom="bottom-41"
             className2="hidden"
          />
        ))}
      </div>
    </div>
  );
}
