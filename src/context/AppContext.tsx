"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { fetchHomeData } from "@/lib/api";
import { fetchApi } from "@/lib/api";

import { CategoryI } from "@/Types/CategoriesI";
import { ProductI } from "@/Types/ProductsI";
import { SubCategoriesI } from "@/Types/SubCategoriesI";
import { BannerI } from "@/Types/BannerI";
import { SocialMediaI } from "@/Types/SocialMediaI";


interface HomeData {
  categories: CategoryI[];
  products: ProductI[];
  sub_categories: SubCategoriesI[];
  sliders: BannerI[];

}

interface AppContextType {
  homeData: HomeData | null;
  parentCategories: CategoryI[];
  childCategories: CategoryI[];
  socialMedia: SocialMediaI[];

  loading: boolean;
  error: string | null;
}

const AppContext = createContext<AppContextType>({
  homeData: null,
  parentCategories: [],
  childCategories: [],
  socialMedia: [],

  loading: true,
  error: null,
});

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [parentCategories, setParentCategories] = useState<CategoryI[]>([]);
  const [childCategories, setChildCategories] = useState<CategoryI[]>([]);
  const [socialMedia, setSocialMedia] = useState<SocialMediaI[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);

        // 1)   HOME
        const home = await fetchHomeData();
        setHomeData(home);

        // 2) Categories Parent
        const parents = await fetchApi("categories?type=parent");
        setParentCategories(Array.isArray(parents) ? parents : []);

        // 3) Categories Child
        const children = await fetchApi("categories?type=child");
        setChildCategories(Array.isArray(children) ? children : []);
        // 4) socialMedia
        const socialMedia = await fetchApi("social-media");
        setSocialMedia(Array.isArray(socialMedia) ? socialMedia : []);
        
      } catch (err: any) {
        setError(err.message || "فشل تحميل البيانات");
          console.error("Error loading data:", err);

      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  return (
    <AppContext.Provider
      value={{
        homeData,
        parentCategories,
        childCategories,
        socialMedia,
        loading,
        error,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
