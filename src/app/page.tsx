'use client';
import { useSignalR } from "@/context/SignalRContext";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const { createRoom, joinRoom, error, isConnected, room } = useSignalR();
  const router = useRouter();
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (room?.code) {
      router.push(`/room/${room.code}`);
    }
  }, [room, room?.code, router]);

  const handleCreateRoom = async () => {
    if (!userName.trim()) {
      toast.error('Erro!', { description: 'Digite seu nome' });
      return;
    }
    await createRoom(userName.trim());
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) {
      toast.error('Erro!', { description: 'Digite o código da sala' });
      return;
    }
    if (!userName.trim()) {
      toast.error('Erro!', { description: 'Digite seu nome' });
      return;
    }
    await joinRoom(roomCode.toUpperCase(), userName.trim());
    setIsJoinModalOpen(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <main className="flex flex-col items-center gap-8">


        
        <motion.h1 
          className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 
                     bg-clip-text text-transparent drop-shadow-sm"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            ease: "easeOut"
          }}
        >
          <motion.span
            initial={{ display: "inline-block" }}
            whileHover={{ 
              scale: 1.05,
              rotate: [-1, 1, -1],
              transition: {
                rotate: {
                  repeat: Infinity,
                  duration: 0.5
                }
              }
            }}
            className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500"
          >
            Match
          </motion.span>
          <motion.span
            initial={{ display: "inline-block" }}
            whileHover={{ 
              scale: 1.05,
              rotate: [1, -1, 1],
              transition: {
                rotate: {
                  repeat: Infinity,
                  duration: 0.5
                }
              }
            }}
            className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500"
          >
            Movie
          </motion.span>
        </motion.h1>
        
        {error && (
          <div className="p-4 text-red-500 bg-red-100 dark:bg-red-900/30 rounded-lg">
            {error}
          </div>
        )}

        {/* Input de Nome */}
        <div className="w-full max-w-[400px]">
          <label 
            htmlFor="userName" 
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Seu nome
          </label>
          <input
            id="userName"
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Digite seu nome"
            className="w-full p-3 rounded-xl border border-gray-200 
                     dark:border-gray-600 dark:bg-gray-700
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     transition-all duration-200 ease-in-out
                     text-gray-900 dark:text-white
                     placeholder-gray-400 dark:placeholder-gray-500"
            maxLength={30}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleCreateRoom}
            disabled={!isConnected}
            className="px-8 py-4 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 
                     text-white rounded-xl font-medium transition-colors
                     disabled:cursor-not-allowed min-w-[200px]
                     shadow-lg hover:shadow-xl"
          >
            {!isConnected ? 'Conectando...' : 'Criar Sala'}
          </button>

          <button
            onClick={() => setIsJoinModalOpen(true)}
            className="px-8 py-4 bg-white hover:bg-gray-50 
                     text-gray-900 rounded-xl font-medium
                     border-2 border-gray-200 transition-colors
                     min-w-[200px] shadow-lg hover:shadow-xl
                     dark:bg-gray-800 dark:border-gray-700 
                     dark:text-white dark:hover:bg-gray-700"
          >
            Entrar em Sala
          </button>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md mt-8">
          Crie uma sala para começar a encontrar filmes com seus amigos ou 
          entre em uma sala existente usando um código.
        </p>
      </main>

      {/* Modal de Entrada na Sala */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Entrar em uma Sala
            </h2>
            <form onSubmit={handleJoinRoom} className="space-y-4">
              <div>
                <label 
                  htmlFor="roomCode" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Código da Sala
                </label>
                <input
                  type="text"
                  id="roomCode"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="Digite o código da sala"
                  className="w-full p-3 rounded-xl border border-gray-200 
                           dark:border-gray-600 dark:bg-gray-700
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           transition-all duration-200 ease-in-out
                           text-lg font-mono uppercase
                           placeholder-gray-400 dark:placeholder-gray-500"
                  maxLength={6}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsJoinModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600
                           text-gray-700 dark:text-gray-300 rounded-xl
                           hover:bg-gray-50 dark:hover:bg-gray-700
                           transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-xl
                           hover:bg-blue-600 transition-colors"
                >
                  Entrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="fixed bottom-4 text-center text-sm text-gray-500 dark:text-gray-400">
        Feito com ❤️ para casais e amigos
      </footer>
    </div>
  );
}
