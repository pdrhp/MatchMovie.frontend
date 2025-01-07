/* eslint-disable @next/next/no-img-element */
'use client';
import { useSignalR } from "@/context/SignalRContext";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Heart, X } from "lucide-react";
import { use, useState } from "react";

export default function MatchPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  const { room } = useSignalR();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5]);

  const currentMovie = room?.movies[currentIndex];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDragEnd = async (event: any, info: any) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (Math.abs(velocity) >= 500 || Math.abs(offset) >= 100) {
      const direction = offset > 0;
      await handleSwipe(direction);
    }
  };

  const handleSwipe = async (liked: boolean) => {
    if (!currentMovie) return;
    
    try {
      console.log(`Votou ${liked ? 'like' : 'dislike'} no filme ${currentMovie.title}`);
      
      x.set(0);
      
      if (currentIndex < (room?.movies.length ?? 0) - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        console.log('Acabaram os filmes!');
      }
    } catch (error) {
      console.error('Erro ao votar:', error);
    }
  };

  if (!room || !currentMovie) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 
                    dark:from-gray-900 dark:to-gray-800 p-4 flex items-center justify-center">
      <div className="w-full max-w-[320px] mx-auto">
        {/* Timer */}
        <div className="mb-8">
          <div className="h-2 bg-gray-200/50 dark:bg-gray-700/50 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full w-1/2 
                          transition-all duration-1000 ease-in-out" />
          </div>
        </div>

        {/* Card */}
        <motion.div
          style={{ x, rotate, opacity }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          className="relative aspect-[2/3] w-full bg-white dark:bg-gray-800 
                   rounded-3xl shadow-[0_8px_16px_rgba(0,0,0,0.1)]
                   dark:shadow-[0_8px_16px_rgba(0,0,0,0.4)]
                   cursor-grab active:cursor-grabbing overflow-hidden
                   transform transition-shadow duration-300
                   hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)]
                   dark:hover:shadow-[0_12px_24px_rgba(0,0,0,0.5)]"
        >
          {/* Poster com Qualidade Melhorada */}
          <div className="absolute inset-0">
            <img
              src={`https://image.tmdb.org/t/p/w780${currentMovie.posterPath}`}
              alt={currentMovie.title}
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t 
                          from-black/95 via-black/60 to-transparent
                          backdrop-blur-[2px]" />
          </div>

          {/* Informações */}
          <div className="absolute inset-x-0 bottom-0 p-6 space-y-3">
            <h2 className="text-2xl font-bold text-white tracking-wide
                         text-shadow-lg">
              {currentMovie.title}
            </h2>
            <p className="text-gray-200 text-sm leading-relaxed
                       line-clamp-4 overflow-hidden">
              {currentMovie.overview}
            </p>
          </div>
        </motion.div>

        {/* Botões de Ação */}
        <div className="flex justify-center gap-6 mt-8">
          <button
            onClick={() => handleSwipe(false)}
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
            onClick={() => handleSwipe(true)}
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
      </div>
    </div>
  );
}
