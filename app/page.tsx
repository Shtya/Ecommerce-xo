'use client';

import CategoriesSlider from '@/components/CategoriesC';
import InStockSlider from '@/components/InStockSlider';
import ProductCard from '@/components/ProductCard';
import SliderComponent from '@/components/SliderComponent';
import { fetchApi } from '@/lib/api';
import { useAppContext } from '@/src/context/AppContext';
import { BannerI } from '@/Types/BannerI';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// ✅ Skeletons
import { CategoriesSliderSkeleton, HeroSliderSkeleton, CategorySectionSkeleton } from '@/components/skeletons/HomeSkeletons';

export default function Home() {
  const { homeData , loading } = useAppContext();

  const categories1 = homeData?.categories || [];
  const categories2 = homeData?.sub_categories || [];

  const [mainSlider, setMainSlider] = useState<BannerI[]>([]);
  const [isMainSliderLoading, setIsMainSliderLoading] = useState(true);

  const isHomeDataLoading = loading;

  useEffect(() => {
    let mounted = true;

    const getMainSlider = async () => {
      setIsMainSliderLoading(true);
      try {
        const data = await fetchApi('banners?type=main_slider');
        if (!mounted) return;
        setMainSlider(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!mounted) return;
        setMainSlider([]);
      } finally {
        if (!mounted) return;
        setIsMainSliderLoading(false);
      }
    };

    getMainSlider();
    return () => {
      mounted = false;
    };
  }, []);

  const sliderSrc = useMemo(() => (mainSlider?.[0]?.items || []).map(i => i.image), [mainSlider]);
  
  return (
    <div className='container py-6 pt-12'>
      <div className=' flex flex-col gap-8'>
        <div className='rounded-3xl overflow-hidden border border-gray-100 bg-white shadow-sm'>{isMainSliderLoading ? <HeroSliderSkeleton /> : sliderSrc.length > 0 ? <SliderComponent src={mainSlider?.[0]}   /> : <div className='h-[200px] md:h-[420px] flex items-center justify-center text-gray-400'>لا توجد بنرات حالياً</div>}</div>

        <div className=' max-md:overflow-hidden w-full pb-12 pt-8'>{isHomeDataLoading ? <CategoriesSliderSkeleton /> : <CategoriesSlider categories={categories1} />}</div>

        {/* ✅ SECTIONS */}
        <div className='flex flex-col gap-10'>
          {isHomeDataLoading ? (
            <>
              <CategorySectionSkeleton />
              <CategorySectionSkeleton />
              <CategorySectionSkeleton />
            </>
          ) : (
            categories2.map(category => {
              const hasProducts = Array.isArray(category.products) && category.products.length > 0;
              if (!hasProducts) return null;

              const banner = category.category_banners?.[0]?.image ?? '/images/d4.jpg';

              return (
                <section key={category.id} className=' rounded-[10px_10px_0_0] md:rounded-3xl md:border md:border-gray-100 !bg-gray-50/50 overflow-hidden'>
                  <div className='relative w-full h-[120px] md:h-[160px]'>
                    <Image src={banner} alt={category.name} fill className='object-cover' priority={false} />
                    <div className='absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent' />
                    <div className='absolute bottom-3 left-3 right-3 flex items-end justify-between'>
                      <h2 className='text-white text-lg md:text-2xl font-extrabold drop-shadow'>{category.name}</h2>

                      <Link href={`/category/${category.id}`} className='text-white/95 text-sm md:text-base font-semibold px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 transition'>
                        الكل
                      </Link>
                    </div>
                  </div>

                  {/* Products */}
                  <div className='  md:p-6'>
                    <InStockSlider
                      inStock={category.products}
                      isLoading={false}
                      title=''
											hiddenArrow={false}
                      CardComponent={(product: any) => (
                        <ProductCard
                          {...product}
													product={product}
                          key={product.id}
                          id={product.id}
                          name={product.name}
                          image={product.image || '/images/c1.png'}
                          stock={product.stock}
                          average_rating={product.average_rating}
                          reviews={product.reviews}
                          // ✅ keep your props but make consistent:
                          className='hidden'
                          className2='hidden'
                          classNameHome=''
                          Bottom='bottom-3'
                        />
                      )}
                    />
                  </div>
                </section>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
