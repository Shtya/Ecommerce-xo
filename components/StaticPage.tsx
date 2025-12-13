"use client";

import { useEffect, useState } from "react";
import parse from "html-react-parser";
import Loading from "@/app/loading";

interface PageData {
  id: number;
  title: string;
  slug: string;
  content: string;
  seo: {
    meta_title: string;
    meta_description: string;
    meta_keywords: string;
  };
}

export default function StaticPage({ slug }: { slug: string }) {
  const [data, setData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const base_url = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${base_url}/${slug}`);
        const result = await res.json();

        if (!res.ok || !result.status) {
          throw new Error(result.message || "حدث خطأ أثناء جلب الصفحة");
        }

        setData(result.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center">
        <Loading/>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center mt-10">
        <p>{error}</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="px-5 md:px-[10%] lg:px-[15%] py-6">
      <h1 className="text-2xl font-bold mb-4">{data.title}</h1>
      <div>{parse(data.content)}</div>
    </div>
  );
}
