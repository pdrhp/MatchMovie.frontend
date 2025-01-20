/* eslint-disable @next/next/no-img-element */
'use client';
import { LoadingResult } from "@/components/RoomMatch/LoadingResult";
import { MovieCard } from "@/components/RoomMatch/MovieCard";
import { SwipeButtons } from "@/components/RoomMatch/SwipeButtons";
import { useSignalR } from "@/context/SignalRContext";
import { RoomStatus } from "@/types/room";
import { useMotionValue, useTransform } from "framer-motion";
import { Hourglass } from 'lucide-react';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function MatchPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(100);
  const [startTime] = useState(Date.now());
  const { room, connection, voteMovie, finishRoom } = useSignalR();
  const [hasFinishedMovies, setHasFinishedMovies] = useState(false);
  

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
      setHasFinishedMovies(true);
      console.log('Acabaram os filmes!');
    }

    if (liked) {
      voteMovie(room.code, currentMovie.id).catch(error => {
        console.error('Erro ao votar:', error);
      });
    }
  };

  if (!room || !currentMovie) return null;


  if (room?.status === RoomStatus.LoadingFinalizedData || room?.status === RoomStatus.Finished) {
    return (
      <LoadingResult />
    );
  }

  if (hasFinishedMovies) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 
                    dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 max-w-md mx-auto text-center">
          <div className="flex justify-center mb-4">
            <Hourglass className="w-12 h-12 text-blue-500 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Você já votou em todos os filmes!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Aguarde enquanto os outros participantes terminam suas votações.
            O resultado será exibido assim que todos finalizarem.
          </p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full
                        transition-all duration-300 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            A sala será finalizada automaticamente quando o tempo acabar
          </p>
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
          <MovieCard 
            movie={currentMovie} 
            x={x} 
            rotate={rotate} 
            opacity={opacity} 
            onDragEnd={handleDragEnd} 
          />

          <SwipeButtons onSwipe={handleSwipe} />
        </div>
      </div>
    </div>
  );
}
