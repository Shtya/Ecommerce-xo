import { useState, useRef, ReactNode } from "react";

interface TitleProps {
  title: string | ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  
}

export default function ButtonComponent({ title, onClick }: TitleProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [rippleStyle, setRippleStyle] = useState({});
  const [showRipple, setShowRipple] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    setRippleStyle({
      top: `${y}px`,
      left: `${x}px`,
      width: `${size}px`,
      height: `${size}px`,
    });

    setShowRipple(true);
    setIsLoading(true);

    setTimeout(() => {
      setShowRipple(false);
      setIsLoading(false);
    }, 800);
  };

  return (
    <button
    aria-label="adding"
      ref={buttonRef}
      onClick={(e) => {
        handleAddToCart(e); 
        if (onClick) onClick(e);
      }}
      disabled={isLoading}
      className={`relative overflow-hidden flex items-center px-6 justify-center gap-2 h-14 cursor-pointer text-white rounded w-full mt-3 bg-pro hover:bg-pro-max transition-all duration-300`}
    >
   
      {showRipple && (
        <span
          style={rippleStyle}
          className="absolute bg-white/30 rounded-full animate-ripple pointer-events-none"
        ></span>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center gap-1">
          <span className="w-2 h-2 bg-white/25 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-2 h-2 bg-white/25 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-2 h-2 bg-white/25 rounded-full animate-bounce"></span>
        </div>
      ) : (
        title
      )}
    </button>
  );
}
