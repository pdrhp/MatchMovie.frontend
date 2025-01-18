import { Heart, X } from "lucide-react";

interface SwipeButtonsProps {
  onSwipe: (liked: boolean) => void;
}

export function SwipeButtons({ onSwipe }: SwipeButtonsProps) {
  return (
    <div className="flex justify-center gap-6 mt-8">
      <button
        onClick={() => onSwipe(false)}
        className="p-4 rounded-full bg-white/90 dark:bg-gray-800/90 
                 shadow-lg hover:shadow-xl
                 transform transition-all duration-200
                 hover:scale-110 active:scale-95
                 hover:bg-red-50 dark:hover:bg-red-900/30 
                 group"
      >
        <X className="w-8 h-8 text-red-500 transition-transform group-hover:rotate-12" />
      </button>

      <button
        onClick={() => onSwipe(true)}
        className="p-4 rounded-full bg-white/90 dark:bg-gray-800/90 
                 shadow-lg hover:shadow-xl
                 transform transition-all duration-200
                 hover:scale-110 active:scale-95
                 hover:bg-green-50 dark:hover:bg-green-900/30 
                 group"
      >
        <Heart className="w-8 h-8 text-green-500 transition-transform group-hover:rotate-12" />
      </button>
    </div>
  );
}