import { useSignalR } from "@/context/SignalRContext";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface LoadingRoomProps {
  roomCode: string;
}

function LoadingRoom({ roomCode }: LoadingRoomProps) {
  const router = useRouter();
  const { joinRoom, isConnected } = useSignalR();
  const [userName, setUserName] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinRoom = async () => {
    if (!userName.trim()) {
      toast.error('Erro!', { description: 'Digite seu nome' });
      return;
    }

    setIsJoining(true);
    try {
      await joinRoom(roomCode, userName.trim());
    } catch (error) {
      console.error('Erro ao entrar na sala:', error);
      toast.error('Erro!', { description: 'Não foi possível entrar na sala' });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 
                    dark:from-gray-900 dark:to-gray-800 
                    flex flex-col items-center justify-center p-8">
      <div className="text-center space-y-8 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 
                         bg-clip-text text-transparent">
            MatchMovie
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Você foi convidado para uma sessão
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label 
              htmlFor="userName" 
              className="block text-sm font-medium text-left text-gray-700 dark:text-gray-300"
            >
              Seu nome
            </label>
            <input
              id="userName"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Digite seu nome para entrar"
              className="w-full p-3 rounded-xl border border-gray-200 
                       dark:border-gray-600 dark:bg-gray-700
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       transition-all duration-200 ease-in-out
                       text-gray-900 dark:text-white
                       placeholder-gray-400 dark:placeholder-gray-500"
              maxLength={30}
              disabled={isJoining}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleJoinRoom}
            disabled={!isConnected || isJoining}
            className="w-full px-6 py-3 
                     bg-gradient-to-r from-blue-500 to-blue-600 
                     hover:from-blue-600 hover:to-blue-700
                     disabled:from-blue-400 disabled:to-blue-400
                     text-white font-medium rounded-xl
                     transform transition-all duration-200
                     shadow-lg hover:shadow-xl
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                     dark:focus:ring-offset-gray-800
                     disabled:cursor-not-allowed"
          >
            {!isConnected ? 'Conectando...' : isJoining ? 'Entrando...' : 'Entrar na Sala'}
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <button
            onClick={() => router.push("/")}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200
                     transition-colors text-sm flex items-center gap-2 mx-auto"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Voltar ao Menu
          </button>
        </motion.div>
      </div>
    </div>
  );
}

export default LoadingRoom;
