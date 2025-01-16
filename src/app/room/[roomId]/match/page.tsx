/* eslint-disable @next/next/no-img-element */
'use client';
import { useSignalR } from "@/context/SignalRContext";
import { RoomStatus } from "@/types/room";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Heart, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function MatchPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(100);
  const [startTime] = useState(Date.now());
  const { room, connection, voteMovie, finishRoom } = useSignalR();
  

  const router = useRouter();

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5]);
  const currentMovie = room?.movies[currentIndex];
  const durationInMs = room?.settings?.roundDurationInSeconds 
    ? room.settings.roundDurationInSeconds * 1000
    : 0;

  const isHost = room?.hostConnectionId === connection?.connectionId;

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsedTime = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsedTime / durationInMs) * 100);
      
      setProgress(remaining);

      if (remaining === 0 && isHost) {
        clearInterval(interval);
        if (room?.code) {
          finishRoom(room.code).catch(error => {
            console.error('Erro ao finalizar sala:', error);
          });
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [durationInMs, room?.code, finishRoom, startTime, isHost]);

  useEffect(() => {
    if (room?.status === RoomStatus.Finished) {
      router.push(`/room/${room.code}/results`);
    }
  }, [room?.status, router]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDragEnd = async (event: any, info: any) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (Math.abs(velocity) >= 500 || Math.abs(offset) >= 100) {
      const direction = offset > 0;
      handleSwipe(direction);
    }
  };

  const handleSwipe = (liked: boolean) => {
    if (!currentMovie || !room?.code) return;
    
    x.set(0);
    if (currentIndex < (room?.movies.length ?? 0) - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      console.log('Acabaram os filmes!');
    }

    if (liked) {
      voteMovie(room.code, currentMovie.id).catch(error => {
        console.error('Erro ao votar:', error);
      });
    }
  };

  if (!room || !currentMovie) return null;


  if (room?.status === RoomStatus.LoadingFinalizedData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 
                      dark:from-gray-900 dark:to-gray-800 
                      flex flex-col items-center justify-center p-8">
        <div className="space-y-8 text-center max-w-md">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 
                          bg-clip-text text-transparent">
              Analisando Resultados
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              Estamos processando os votos e encontrando o filme perfeito para todos...
            </p>
          </motion.div>

          <div className="relative">
            <motion.div 
              animate={{ 
                rotate: 360,
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
              className="w-16 h-16 border-4 border-blue-500 border-t-transparent 
                         rounded-full mx-auto"
            />
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <span className="text-2xl">🎬</span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-2"
          >
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                animate={{
                  width: ["0%", "100%"],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Calculando compatibilidade entre participantes...
            </p>
          </motion.div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 
                    dark:from-gray-900 dark:to-gray-800">
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="h-1.5 bg-gray-200/50 dark:bg-gray-700/50">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-blue-400
                      transition-all duration-300 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-[320px]">
          <motion.div
            style={{ x, rotate, opacity }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            className="relative aspect-[2/3] rounded-2xl bg-white dark:bg-gray-800 
                     shadow-xl cursor-grab active:cursor-grabbing overflow-hidden"
          >
            <div className="absolute inset-0">
              <img
                src={`https://image.tmdb.org/t/p/w780${currentMovie.posterPath}`}
                alt={currentMovie.title}
                className="w-full h-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t 
                            from-black/90 via-black/25 to-transparent" />
            </div>

            <div className="absolute inset-x-0 bottom-0 p-6 space-y-3">
              <h2 className="text-2xl font-bold text-white tracking-wide
                           drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {currentMovie.title}
              </h2>
              <p className="text-gray-100 text-sm leading-relaxed
                         line-clamp-4 overflow-hidden
                         drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                {currentMovie.overview}
              </p>
            </div>
          </motion.div>

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
    </div>
  );
}
