'use client';
import HostView from "@/components/RoomConfiguration/HostView";
import LoadingMovies from "@/components/RoomConfiguration/LoadingMovies";
import JoinToAExistingRoom from "@/components/RoomConfiguration/LoadingRoom";
import ParticipantView from "@/components/RoomConfiguration/ParticipantView";
import { useSignalR } from "@/context/SignalRContext";
import { Movie } from "@/types/movie";
import { RoomStatus } from "@/types/room";
import { useRouter } from "next/navigation";
import { use, useEffect } from "react";
import { toast } from "sonner";

export default function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  const { room, connection, error, configureRoom, startMatching, joinRoom, addMoviesToRoom, setLoadingMovies } = useSignalR();
  const router = useRouter();

  useEffect(() => {
    if (room?.status === RoomStatus.InProgress) {
      router.push(`/room/${roomId}/match`);
    }
  }, [room?.status, roomId, router]);

  const isHost = room?.hostConnectionId === connection?.connectionId;

  const handleStartMatch = async () => {
    if (!room || !isHost) return;

    try {
      setLoadingMovies();

      const movies: Movie[] = [];
      
      for (const category of room.settings.categories) {
        const response = await fetch(`/api/movies?category=${category}`);
        const categoryMovies = await response.json();
        movies.push(...categoryMovies);
      }

      await addMoviesToRoom(room.code, movies);
      
      await startMatching(roomId);
    } catch (error) {
      console.error('Erro ao iniciar match:', error);
      toast.error('Erro!', {
        description: 'Não foi possível iniciar o match. Tente novamente.'
      });
    }
  };

  if (!room) {
    return <JoinToAExistingRoom roomCode={roomId} />;
  }

  if (room.status === RoomStatus.LoadingMovies || room.status === RoomStatus.InProgress) {
    return (
      <LoadingMovies />
    );
  } 

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {isHost ? (
        <HostView 
          roomCode={room.code}
          participantsCount={room.participantsConnectionIds.length}
          settings={room.settings}
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





