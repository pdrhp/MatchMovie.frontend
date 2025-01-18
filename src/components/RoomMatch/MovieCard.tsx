import { Movie } from "@/types/movie";
import { motion, MotionValue } from "framer-motion";

interface MovieCardProps {
  movie: Movie;
  x: MotionValue;
  rotate: MotionValue;
  opacity: MotionValue;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onDragEnd: (event: any, info: any) => void;
}

export function MovieCard({ movie, x, rotate, opacity, onDragEnd }: MovieCardProps) {
  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={onDragEnd}
      className="relative aspect-[2/3] rounded-2xl bg-white dark:bg-gray-800 
                 shadow-xl cursor-grab active:cursor-grabbing overflow-hidden"
    >
      <div className="absolute inset-0">
        <img
          src={`https://image.tmdb.org/t/p/w780${movie.posterPath}`}
          alt={movie.title}
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t 
                      from-black/90 via-black/25 to-transparent" />
      </div>

      <div className="absolute inset-x-0 bottom-0 p-6 space-y-3">
        <h2 className="text-2xl font-bold text-white tracking-wide
                     drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          {movie.title}
        </h2>
        <p className="text-gray-100 text-sm leading-relaxed
                   line-clamp-4 overflow-hidden
                   drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          {movie.overview}
        </p>
      </div>
    </motion.div>
  );
}