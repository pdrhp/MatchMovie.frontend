'use client';
import { useSignalR } from "@/context/SignalRContext";
import { Movie } from "@/types/movie";
import { RoomSettings, RoomStatus } from "@/types/room";
import { ClipboardCopy, PlayCircle, Settings, Timer, Users } from 'lucide-react';
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";

export default function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  const { room, connection, error, configureRoom, startMatching, addMoviesToRoom, setLoadingMovies } = useSignalR();
  const router = useRouter();

  // Escuta mudanças no status da sala
  useEffect(() => {
    if (room?.status === RoomStatus.InProgress) {
      router.push(`/room/${roomId}/match`);
    }
  }, [room?.status, roomId, router]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [settings, setSettings] = useState<RoomSettings>({
    categories: [],
    roundDurationInSeconds: 30,
    maxParticipants: 10
  });

  const isHost = room?.hostConnectionId === connection?.connectionId;

  const handleStartMatch = async () => {
    if (!room || !isHost) return;

    try {
      setLoadingMovies();

      const movies: Movie[] = [];
      
      // Para cada categoria selecionada
      for (const category of room.settings.categories) {
        const response = await fetch(`/api/movies?category=${category}`);
        const categoryMovies = await response.json();
        movies.push(...categoryMovies);
      }

      // Primeiro envia os filmes
      await addMoviesToRoom(room.code, movies);
      
      // Depois inicia o matching
      await startMatching(roomId);
    } catch (error) {
      console.error('Erro ao iniciar match:', error);
      toast.error('Erro!', {
        description: 'Não foi possível iniciar o match. Tente novamente.'
      });
    }
  };

  if (!room) {
    return <LoadingRoom />;
  }

  // Loading de filmes
  if (room.status === RoomStatus.LoadingMovies || room.status === RoomStatus.InProgress) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 
                    bg-gradient-to-b from-gray-50 to-gray-100 
                    dark:from-gray-900 dark:to-gray-800">
        <div className="w-full max-w-md space-y-8">
          {/* Círculos de Loading */}
          <div className="relative mx-auto w-32 h-32">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700" />
            <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
          </div>

          {/* Status */}
          <div className="text-center space-y-4">
            <p className="text-xl font-medium text-gray-700 dark:text-gray-300">
              Preparando filmes para o match...
            </p>
            
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Isso pode levar alguns segundos
            </p>
          </div>

          {/* Dicas */}
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 animate-pulse">
            <p>Selecionando os melhores filmes para você...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {isHost ? (
        <HostView 
          roomCode={room.code}
          participantsCount={room.participantsConnectionIds.length}
          settings={room.settings}
          setSettings={setSettings}
          onSaveSettings={configureRoom}
          onStartMatch={handleStartMatch}
          error={error}
        />
      ) : (
        <ParticipantView 
          roomCode={room.code}
          participantsCount={room.participantsConnectionIds.length}
        />
      )}
    </div>
  );
}

function LoadingRoom() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push('/');
    }, 15000); 

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="relative w-32 h-32">
        <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin" />
        <div className="absolute inset-4 rounded-full border-t-2 border-blue-400 animate-spin-slow" />
        <div className="absolute inset-8 rounded-full border-t-2 border-blue-300 animate-spin-slower" />
      </div>
      <p className="text-gray-500 dark:text-gray-400 animate-pulse">
        Conectando à sala...
      </p>
      <p className="text-sm text-gray-400 dark:text-gray-500">
        Redirecionando em 15 segundos se não conectar
      </p>
      
      {/* Botão de Voltar */}
      <button
        onClick={() => router.push('/')}
        className="mt-8 group relative flex items-center gap-2 px-6 py-3 
                 bg-gradient-to-r from-blue-500 to-blue-600 
                 hover:from-blue-600 hover:to-blue-700
                 text-white font-medium rounded-xl
                 transform transition-all duration-200
                 hover:scale-105 active:scale-95
                 shadow-lg hover:shadow-xl
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                 dark:focus:ring-offset-gray-800"
      >
        <svg 
          className="w-5 h-5 transform transition-transform group-hover:-translate-x-1" 
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
    </div>
  );
}

function HostView({
  roomCode,
  participantsCount,
  settings,
  onSaveSettings,
  onStartMatch,
  error
}: {
  roomCode: string;
  participantsCount: number;
  settings: RoomSettings;
  setSettings: (settings: RoomSettings) => void;
  onSaveSettings: (roomCode: string, settings: RoomSettings) => Promise<void>;
  onStartMatch: () => Promise<void>;
  error: string | null;
}) {
  const [copied, setCopied] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [localSettings, setLocalSettings] = useState<RoomSettings>({
    categories: settings.categories,
    roundDurationInSeconds: settings.roundDurationInSeconds || 60, // Default 60 segundos
    maxParticipants: settings.maxParticipants
  });

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const categories = [
    'Ação', 'Aventura', 'Animação', 'Biografia', 'Comédia', 
    'Crime', 'Documentário', 'Drama', 'Família', 'Fantasia',
    'Ficção Científica', 'Guerra', 'História', 'Horror',
    'Mistério', 'Musical', 'Romance', 'Suspense', 'Terror', 
    'Western'
  ];

  const filteredCategories = categories.filter(category =>
    category.toLowerCase().includes(categoryFilter.toLowerCase())
  );

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveSettings = async () => {
    console.log(localSettings);

    await onSaveSettings(roomCode, localSettings);
  };

  const handleStartMatch = async () => {
    // Verifica se há categorias selecionadas
    if (!localSettings.categories.length) {
      toast.error('Selecione categorias', {
        description: 'Você precisa selecionar pelo menos uma categoria para iniciar o match.'
      });
      return;
    }

    // Continua com o início do match
    onStartMatch();
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-8 pb-6 border-b dark:border-gray-700">
          <div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-purple-500 
                          bg-clip-text text-transparent">
              Sua Sala
            </h1>
            <div className="flex items-center gap-4">
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 
                         rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <span className="font-mono font-bold">{roomCode}</span>
                <ClipboardCopy size={16} />
              </button>
              {copied && (
                <span className="text-sm text-green-500 animate-fade-in">
                  Código copiado!
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full">
            <Users size={18} className="text-gray-500" />
            <span className="font-medium">{participantsCount}</span>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-lg
                         border border-red-200 dark:border-red-800">
            <p className="font-medium">{error}</p>
          </div>
        )}

        <div className="space-y-8 overflow-y-auto flex-1 pr-2">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Settings className="text-blue-500" size={24} />
              <h2 className="text-xl font-semibold">Configurações da Partida</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="relative">
                <label className="flex items-center gap-2 text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  <Timer size={16} className="text-blue-500" />
                  Duração da Rodada
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={30}
                    max={300}
                    value={localSettings.roundDurationInSeconds}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setLocalSettings({
                        ...localSettings,
                        roundDurationInSeconds: value > 0 ? value : ''
                      });
                    }}
                    className="w-full p-3 pl-4 pr-16 rounded-xl border border-gray-200 
                             dark:border-gray-600 dark:bg-gray-800 
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             transition-all duration-200 ease-in-out
                             text-lg font-medium
                             placeholder-gray-400 dark:placeholder-gray-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 
                                 text-sm text-gray-500 dark:text-gray-400">
                    seg
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">
                  Entre 30 e 300 segundos
                </span>
              </div>

              <div className="relative">
                <label className="flex items-center gap-2 text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  <Users size={16} className="text-blue-500" />
                  Máximo de Participantes
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={2}
                    max={10}
                    value={localSettings.maxParticipants}
                    onChange={(e) =>  {
                      const value = parseInt(e.target.value);
                      setLocalSettings({
                        ...localSettings,
                        maxParticipants: value > 0 ? value : ''
                      });
                    }}
                    className="w-full p-3 pl-4 pr-16 rounded-xl border border-gray-200 
                             dark:border-gray-600 dark:bg-gray-800 
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             transition-all duration-200 ease-in-out
                             text-lg font-medium
                             placeholder-gray-400 dark:placeholder-gray-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 
                                 text-sm text-gray-500 dark:text-gray-400">
                    pessoas
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
            <h3 className="text-lg font-medium mb-6 flex items-center gap-2">
              <span className="p-1.5 bg-blue-500 rounded-lg text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
                  <polyline points="17 2 12 7 7 2"></polyline>
                </svg>
              </span>
              Categorias de Filmes
            </h3>

            <div className="mb-4 relative">
              <input
                type="text"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                placeholder="Buscar categorias..."
                className="w-full p-3 pl-10 rounded-xl border border-gray-200 
                         dark:border-gray-600 dark:bg-gray-800 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         transition-all duration-200 ease-in-out"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              {categoryFilter && (
                <button
                  onClick={() => setCategoryFilter('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 
                           hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>

            <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              {localSettings.categories.length} categorias selecionadas
            </div>

            <div className="max-h-[40vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {filteredCategories.map((category) => (
                  <label
                    key={category}
                    className={`group relative flex items-center p-3 rounded-lg cursor-pointer
                               transition-all duration-200 ease-in-out text-sm
                               ${
                                 localSettings.categories.includes(category)
                                   ? 'bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-500 shadow-md'
                                   : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700'
                               }`}
                  >
                    <input
                      type="checkbox"
                      checked={localSettings.categories.includes(category)}
                      onChange={(e) => {
                        const newCategories = e.target.checked
                          ? [...localSettings.categories, category]
                          : localSettings.categories.filter(c => c !== category);
                        setLocalSettings({ ...localSettings, categories: newCategories });
                      }}
                      className="hidden"
                    />
                    <div className={`w-4 h-4 rounded border-2 mr-2 flex items-center justify-center
                                  transition-all duration-200 ease-in-out
                                  ${
                                    localSettings.categories.includes(category)
                                      ? 'bg-blue-500 border-blue-500'
                                      : 'border-gray-300 dark:border-gray-500 group-hover:border-blue-400'
                                  }`}
                    >
                      {localSettings.categories.includes(category) && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`font-medium ${
                      localSettings.categories.includes(category)
                        ? 'text-blue-700 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {category}
                    </span>
                  </label>
                ))}
              </div>

              {filteredCategories.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Nenhuma categoria encontrada para &quot;{categoryFilter}&quot;
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-4 mt-8 border-t dark:border-gray-700">
          <button
            onClick={handleSaveSettings}
            className="flex-1 px-6 py-4 bg-blue-500 text-white rounded-xl
                     hover:bg-blue-600 transition-colors font-medium"
          >
            Salvar Configurações
          </button>
          <button
            onClick={handleStartMatch}
            disabled={localSettings.categories.length === 0}
            className={`flex-1 px-6 py-4 rounded-xl
                       flex items-center justify-center gap-2
                       font-medium transition-colors
                       ${localSettings.categories.length === 0 
                         ? 'bg-gray-400 cursor-not-allowed' 
                         : 'bg-green-500 hover:bg-green-600'} 
                       text-white`}
          >
            <PlayCircle size={20} />
            Iniciar Match
          </button>
        </div>
      </div>
    </div>
  );
}

function ParticipantView({
  roomCode,
  participantsCount
}: {
  roomCode: string;
  participantsCount: number;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center space-y-8">
        <div className="relative h-32 w-32 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700" />
          <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 
                        bg-clip-text text-transparent">
            Aguardando o host iniciar...
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            O host está configurando a sala
          </p>
          <div className="flex items-center justify-center gap-2">
            <span className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full font-mono">
              {roomCode}
            </span>
            <span className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <Users size={16} />
              {participantsCount}
            </span>
          </div>
        </div>

        <div className="flex justify-center gap-2">
          <div className="animate-bounce delay-0 h-2 w-2 bg-blue-500 rounded-full" />
          <div className="animate-bounce delay-150 h-2 w-2 bg-blue-500 rounded-full" />
          <div className="animate-bounce delay-300 h-2 w-2 bg-blue-500 rounded-full" />
        </div>
      </div>
    </div>
  );
}
