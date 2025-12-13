import { FaHeart, FaRegHeart } from "react-icons/fa";

import { HiMiniHeart, HiOutlineHeart } from "react-icons/hi2";

interface HearComponentProps {
  liked: boolean;
  onToggleLike: () => void;
  ClassName?:string
  ClassNameP?:string
}

export default function HearComponent({
  liked,
  onToggleLike,
  ClassName,
  ClassNameP
}: HearComponentProps) {
  return (
    <button
    aria-label="heart icon"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggleLike();
      }}
      className={`w-8 h-8 md:w-11 md:h-11 ${ClassNameP} rounded-full bg-white border border-slate-200 duration-75
        flex items-center justify-center  p-0.5 cursor-pointer transition-transform hover:scale-110`}
    >
      {liked ? (
        <HiMiniHeart size={18} className=" text-pro" />
      ) : (
        <HiOutlineHeart size={18} className={`${ClassName}`}/>
      )}
    </button>
  );
}
