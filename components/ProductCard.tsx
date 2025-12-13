'use client';

import { useEffect, useMemo, useState } from 'react';
import HearComponent from './HearComponent';
import PriceComponent from './PriceComponent';
import ImageComponent from './ImageComponent';
import Link from 'next/link';
import { BsCart3 } from 'react-icons/bs';
import { useCart } from '@/src/context/CartContext';
import BottomSlider from './BottomSlider';
import { ProductI } from '@/Types/ProductsI';
import ShowImage from './ShowImage';
import RatingStars from './RatingStars';
import toast from 'react-hot-toast';
import { useAuth } from '@/src/context/AuthContext';
import { GoEye } from 'react-icons/go';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductCardProps extends ProductI {
  className?: string;
  className2?: string;
  className3?: string;
  classNameHome?: string;
  classNameCate?: string;
  Bottom?: string;
  onFavoriteChange?: (productId: number, newValue: boolean) => void;

  selectedSizeId?: number | null;
  selectedColorId?: number | null;
  selectedPrintingMethodId?: number | null;
  selectedPrintLocations?: number[];
  selectedEmbroiderLocations?: number[];
  selectedOptions?: { option_name: string; option_value: string }[];
  selectedDesignServiceId?: number | null;
  isSample?: boolean;
 
}

export default function ProductCard({ id, image, name, price, final_price, discount, stock, classNameHome = '', className2 = '', classNameCate = '', average_rating, reviews, is_favorite, Bottom = 'bottom-3', onFavoriteChange, selectedSizeId, selectedColorId, selectedPrintingMethodId, selectedPrintLocations = [], selectedEmbroiderLocations = [], selectedOptions = [], selectedDesignServiceId, isSample = false  }: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const { authToken: token } = useAuth();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const inStock = (stock ?? 0) > 0;

  useEffect(() => {
    const loadFavorites = () => {
      const saved = JSON.parse(localStorage.getItem('favorites') || '[]') as number[];
      setIsFavorite(saved.includes(id) || (is_favorite ?? false));
    };

    loadFavorites();
    window.addEventListener('storage', loadFavorites);
    return () => window.removeEventListener('storage', loadFavorites);
  }, [id, is_favorite]);

  const toggleFavorite = async (productId: number) => {
    if (!token) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }

    const newState = !isFavorite;
    setIsFavorite(newState);
    onFavoriteChange?.(productId, newState);

    let saved = JSON.parse(localStorage.getItem('favorites') || '[]') as number[];
    if (newState) saved.push(productId);
    else saved = saved.filter(x => x !== productId);
    localStorage.setItem('favorites', JSON.stringify(saved));

    try {
      const res = await fetch(`${API_URL}/favorites/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: productId }),
      });

      const data = await res.json();

      if (!res.ok || !data.status) {
        setIsFavorite(!newState);
        onFavoriteChange?.(productId, !newState);
        toast.error(data.message || 'فشل تحديث المفضلة');
      } else {
        toast.success('تم تحديث المفضلة');
      }
    } catch {
      setIsFavorite(!newState);
      onFavoriteChange?.(productId, !newState);
      toast.error('حدث خطأ أثناء تحديث المفضلة');
    }
  };

  const { addToCart } = useCart();

  const handleAddToCart = async () => {
    if (!token) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }
    if (isAdding || !inStock) return;

    setIsAdding(true);

    await addToCart(id, {
      quantity: 1,
      size_id: selectedSizeId ?? null,
      color_id: selectedColorId ?? null,
      printing_method_id: selectedPrintingMethodId ?? null,
      print_locations: selectedPrintLocations.length ? selectedPrintLocations : [],
      embroider_locations: selectedEmbroiderLocations.length ? selectedEmbroiderLocations : [],
      selected_options: selectedOptions.length ? selectedOptions : [],
      design_service_id: selectedDesignServiceId ?? null,
      is_sample: isSample,
    });

    setIsAdding(false);
  };

  const priceHasDiscount = useMemo(() => price && Number(price) !== Number(final_price), [price, final_price]);

  const showDiscountChip = Boolean(discount?.value);

  return (
    <motion.div className='relative group' initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className='relative flex flex-col rounded-lg md:rounded-3xl border border-slate-200 bg-white overflow-hidden
                    shadow-inner hover:border-gray-200 transition'>
        {/* Image */}
        <div className={`relative w-full h-[150px] md:h-[240px] bg-gray-50`}>
          <Link href={`/product/${id}`} className='block h-full'>
            <div className='relative h-full overflow-hidden'>
              <ImageComponent image={image || '/images/c1.png'} />
              <div className='absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition' />
            </div>
          </Link>

          {/* Top actions */}
          <div className='absolute top-1 md:top-3 inset-x-1  md:inset-x-3 flex items-center justify-between z-10'>
            {/* Favorite */}
            <motion.button
              type='button'
              aria-label='toggle favorite'
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite(id);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.92 }}
              className=' w-8 h-8 md:w-11 md:h-11 flex-none rounded-full bg-white/90 backdrop-blur shadow flex items-center justify-center ring-1 ring-black/5'>
              <HearComponent onToggleLike={()=>toggleFavorite(id)} liked={isFavorite} ClassName='text-pro' />
            </motion.button>

            {/* Discount / Stock */}
            {showDiscountChip ? <span className='px-3 py-1 text-[11px] font-extrabold rounded-lg md:rounded-full bg-red-50 text-red-600 ring-1 ring-red-100'>-{discount?.value}%</span> : <span className={`px-3 py-1 text-[11px] font-extrabold rounded-lg md:rounded-full ring-1 ring-black/5 ${inStock ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>{inStock ? 'متوفر' : 'غير متوفر'}</span>}
          </div>

          {/* Quick view */}
          <motion.button
            aria-label='show product'
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              setShowImage(true);
            }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className={`absolute bottom-3 end-3 bg-white/90 backdrop-blur w-11 h-11 rounded-full flex items-center justify-center shadow ring-1 ring-black/5 ${className2}`}>
            <GoEye size={18} className='text-gray-800' />
          </motion.button>

          <AnimatePresence>{showImage && <ShowImage onClose={() => setShowImage(false)} src={image || '/images/c1.png'} />}</AnimatePresence>

          {/* If discount exists, still show stock badge small at bottom start */}
          {showDiscountChip && (
            <div className='absolute bottom-3 start-3 z-10'>
              <span className={`px-3 py-1 text-[11px] font-extrabold rounded-full ring-1 ring-black/5 ${inStock ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>{inStock ? 'متوفر' : 'غير متوفر'}</span>
            </div>
          )}

          {/* Cart Floating Button (intentional placement) */}
          <motion.button
            aria-label='add to cart'
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              handleAddToCart();
            }}
            disabled={isAdding || !inStock}
            whileHover={inStock && !isAdding ? { scale: 1.06 } : undefined}
            whileTap={inStock && !isAdding ? { scale: 0.92 } : undefined}
            className={`absolute right-1 md:right-3 top-[58px] md:top-[85px] -translate-y-1/2 z-20 ${classNameCate}`}>
            <div className={`w-8 h-8 md:w-11 md:h-11 rounded-full flex items-center justify-center shadow-lg ring-1 ring-black/5 ${inStock ? 'bg-pro text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>{isAdding ? <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' /> : <BsCart3 className='w-18 max-md:!w-16 ' />}</div>
          </motion.button>
        </div>

        {/* Content */}
        <div className='p-4 space-y-3'>
          <Link href={`/product/${id}`}>
            <h3 className='text-sm md:text-[16px] font-extrabold text-gray-900 line-clamp-1 hover:text-pro transition'>{name}</h3>
          </Link>

          {/* Price */}
          <div className={`flex items-center gap-2 max-md:!mb-1 ${classNameHome}`}>
            {Number(final_price) > 0 ? (
              <>
                <PriceComponent final_price={final_price} />
                {priceHasDiscount && <span className='text-sm text-gray-400 line-through'>{price} ج.م</span>}
              </>
            ) :null}
          </div>

          {/* Rating */}
          <RatingStars average_ratingc={average_rating || 0} reviewsc={reviews || []} />

          {/* Divider */}
          <div className='h-px bg-gray-200/70' />

          {/* Bottom */}
          <BottomSlider />
        </div>
      </motion.div>
    </motion.div>
  );
}
