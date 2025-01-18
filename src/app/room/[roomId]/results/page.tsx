'use client';
import { useSignalR } from "@/context/SignalRContext";
import { Crown, Heart, Sparkles, Trophy, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


export default function ResultsPage() {
  const { room } = useSignalR();
  const router = useRouter();


  useEffect(() => {
    console.log(room);
  }, [room]);

  if (!room) {
    router.push('/');
    return null;
  }

  

  const movieResults = room.movies.map(movie => {
    const votedParticipants = Object.entries(room.participantVotes)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([connectionId, votes]) => votes.includes(movie.id))
      .map(([connectionId]) => {
        if (connectionId === room.hostConnectionId) {
          return room.participantNames[room.hostConnectionId];
        }
        return room.participantNames[connectionId] || "Participante";
      });

    return {
      movie,
      voteCount: votedParticipants.length,
      matchedParticipants: votedParticipants
    };
  }).sort((a, b) => b.voteCount - a.voteCount);

  const topMovie = movieResults[0];
  const otherMovies = movieResults.slice(1);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 
                    dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Resultados do Match
          </h1>
          <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400">
            <Users size={20} />
            <span>{Object.keys(room.participantNames).length} participantes</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Users className="text-blue-500" size={20} />
            Participantes
          </h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(room.participantNames).map(([connectionId, name]) => (
              <div 
                key={connectionId}
                className="flex items-center gap-2 px-3 py-1.5 
                         bg-gray-100 dark:bg-gray-700 rounded-full"
              >
                {connectionId === room.hostConnectionId && (
                  <Crown size={14} className="text-yellow-500" />
                )}
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {topMovie && topMovie.voteCount > 0 && (
          <div className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 
                         rounded-2xl p-6 border border-yellow-500/20">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="text-yellow-500" size={24} />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Filme com Mais Matches!
              </h2>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              {/* Poster */}
              <div className="w-full md:w-48 aspect-[2/3] rounded-xl overflow-hidden">
                <img
                  src={`https://image.tmdb.org/t/p/w500${topMovie.movie.posterPath}`}
                  alt={topMovie.movie.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Informações */}
              <div className="flex-1 space-y-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {topMovie.movie.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 line-clamp-3">
                  {topMovie.movie.overview}
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Heart className="text-red-500" size={20} />
                    <span className="font-bold text-gray-700 dark:text-gray-300">
                      {topMovie.voteCount} matches
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {topMovie.matchedParticipants.map((name, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-red-500/10 text-red-600 
                                 dark:text-red-400 rounded-full text-sm"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recomendação IA */}
        {room?.analyzedRoom?.recomendacaoFinal && (
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 
                         rounded-2xl p-6 border border-blue-500/20">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="text-blue-500" size={24} />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Sugestão Powered by AI
              </h2>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              {/* Poster */}
              <div className="w-full md:w-48 aspect-[2/3] rounded-xl overflow-hidden">
                <img
                  src={`https://image.tmdb.org/t/p/w500${room.movies.find(m => m.title === room.analyzedRoom?.recomendacaoFinal?.filmeRecomendado)?.posterPath}`}
                  alt={room.analyzedRoom?.recomendacaoFinal?.filmeRecomendado || ''}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Informações */}
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {room.analyzedRoom.recomendacaoFinal.filmeRecomendado}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {room.analyzedRoom.recomendacaoFinal.justificativa}
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300">
                    Compatibilidade por Participante:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {room.analyzedRoom.recomendacaoFinal.compatibilidadePorParticipante.map((comp, index) => (
                      <div 
                        key={index}
                        className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {comp.participante}
                          </span>
                          <div className="relative w-12 h-12">
                            {/* Círculo de progresso */}
                            <svg className="w-12 h-12 transform -rotate-90">
                              <circle
                                className="text-gray-200 dark:text-gray-700"
                                strokeWidth="4"
                                stroke="currentColor"
                                fill="transparent"
                                r="20"
                                cx="24"
                                cy="24"
                              />
                              <circle
                                className="text-blue-500"
                                strokeWidth="4"
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="transparent"
                                r="20"
                                cx="24"
                                cy="24"
                                strokeDasharray={`${2 * Math.PI * 20 * (comp.compatibilidade / 100)} ${2 * Math.PI * 20}`}
                              />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                              {Math.round(comp.compatibilidade)}%
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {comp.razao}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {otherMovies.filter(result => result.voteCount > 0).map((result) => (
            <div 
              key={result.movie.id + result.movie.title + Math.random()}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 
                       shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4">
                <img
                  src={`https://image.tmdb.org/t/p/w200${result.movie.posterPath}`}
                  alt={result.movie.title}
                  className="w-20 h-30 object-cover rounded-lg"
                />
                <div className="flex-1 space-y-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {result.movie.title}
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {result.matchedParticipants.map((name, index) => (
                      <span 
                        key={index}
                        className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 
                                 rounded-full text-xs text-gray-600 
                                 dark:text-gray-400"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Botão de Voltar */}
        <div className="flex justify-center pt-8">
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl
                     hover:bg-blue-600 transition-colors"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    </div>
  );
}
