'use client';
import { Movie } from '@/types/movie';
import { ParticipantUpdateResponse, Room, RoomCreatedResponse, RoomSettings, RoomStatus } from '@/types/room';
import * as signalR from '@microsoft/signalr';
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';


interface SignalRContextType {
  connection: signalR.HubConnection | null;
  isConnected: boolean;
  room: Room | null;
  error: string | null;
  createRoom: () => Promise<void>;
  joinRoom: (roomCode: string) => Promise<void>;
  startMatching: (roomCode: string) => Promise<void>;
  configureRoom: (roomCode: string, settings: RoomSettings) => Promise<void>;
  addMoviesToRoom: (roomCode: string, movies: Movie[]) => Promise<void>;
}

const SignalRContext = createContext<SignalRContextType>({
  connection: null,
  isConnected: false,
  room: null,
  error: null,
  createRoom: async () => {},
  joinRoom: async () => {},
  startMatching: async () => {},
  configureRoom: async () => {},
  addMoviesToRoom: async () => {}
});

export function SignalRProvider({ children }: { children: ReactNode }) {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Referência para o room atual
  const roomRef = useRef<Room | null>(null);

  // Atualiza a ref sempre que room mudar
  useEffect(() => {
    roomRef.current = room;
  }, [room]);

  useEffect(() => {
    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${process.env.NEXT_PUBLIC_WS_URL}`)
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: retryContext => {
          if (retryContext.previousRetryCount === 3) {
            return null; 
          }
          return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000);
        }
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    setupConnectionListeners(newConnection);
    setupServerEventListeners(newConnection);
    
    startConnection(newConnection);

    setConnection(newConnection);

    return () => {
      newConnection.stop();
    };
  }, []);

  const setupConnectionListeners = (conn: signalR.HubConnection) => {
    conn.onreconnecting(() => {
      setIsConnected(false);
      console.log('Reconectando ao servidor...');
    });

    conn.onreconnected(() => {
      setIsConnected(true);
      console.log('Reconectado ao servidor!');
    });

    conn.onclose(() => {
      setIsConnected(false);
      setError('Conexão perdida com o servidor');
    });
  };

  const setupServerEventListeners = (conn: signalR.HubConnection) => {
    conn.on("RoomCreated", (response: RoomCreatedResponse) => {
      const newRoom = {
        code: response.code,
        hostConnectionId: response.isHost ? conn.connectionId! : '',
        settings: {
          categories: [],
          roundDurationInMinutes: 3,
          maxParticipants: 10
        },
        participantsConnectionIds: [],
        status: RoomStatus.WaitingToStart,
        movies: [],
        participantVotes: {}
      };
      setRoom(newRoom);
      roomRef.current = newRoom;
      setError(null);
    });

    conn.on("RoomClosed", (message: string) => {
      setError(message);
      setRoom(null);
    });

    conn.on("RoomJoined", (room: Room) => {
      setRoom(room);
      roomRef.current = room;
      setError(null);
    });

    conn.on("ParticipantJoined", (update: ParticipantUpdateResponse) => {
      if (roomRef.current) {
        setRoom(prev => ({
          ...prev!,
          participantsConnectionIds: Array(update.participantCount).fill('')
        }));
      }
      setError(null);
    });

    conn.on("ParticipantLeft", (update: ParticipantUpdateResponse) => {
      if (roomRef.current) {
        setRoom(prev => ({
          ...prev!,
          participantsConnectionIds: Array(update.participantCount).fill('')
        }));
      }
    });

    conn.on("MatchingStarted", (updatedRoom: Room) => {
      if (roomRef.current) {
        setRoom(updatedRoom);

        console.log(updatedRoom);
        
        toast.success('Match iniciado!', {
          description: `${updatedRoom.movies.length} filmes carregados para votação`
        });

        setRoom(() => ({
          ...updatedRoom,
          status: RoomStatus.InProgress
        }));
      }
      setError(null);
    });

    conn.on("RoomConfigured", (settings: RoomSettings) => {
      if (roomRef.current) {
        console.log(roomRef.current);
        setRoom(prev => ({
          ...prev!,
          settings
        }));
        toast.success('Configurações da sala atualizadas com sucesso!', {
          description: `${settings.categories.length} categorias selecionadas, 
                       ${settings.roundDurationInMinutes} minutos por rodada, 
                       máximo de ${settings.maxParticipants} participantes.`
        });
      }
      setError(null);
    });

    conn.on("Error", (message: string) => {
      setError(message);
      toast.error('Erro!', {
        description: message
      });
    });

    conn.on("MoviesLoading", (totalMovies: number) => {
      if (roomRef.current) {
        setRoom(prev => ({
          ...prev!,
          status: RoomStatus.LoadingMovies
        }));
        toast.info('Carregando filmes...', {
          description: `${totalMovies} filmes sendo preparados`
        });
      }
    });
  };

  const startConnection = async (conn: signalR.HubConnection) => {
    try {
      await conn.start();
      setIsConnected(true);
      setError(null);
      console.log('Conectado ao hub');
    } catch (err) {
      console.error('Erro ao conectar:', err);
      setError('Não foi possível conectar ao servidor');
    }
  };

  const createRoom = async () => {
    try {
      if (connection && isConnected) {
        await connection.invoke("CreateRoom");
        setError(null);
      }
    } catch (err) {
      setError('Erro ao criar sala');
      console.error('Erro ao criar sala:', err);
    }
  };

  const joinRoom = async (roomCode: string) => {
    try {
      if (connection && isConnected) {
        await connection.invoke("JoinRoom", roomCode);
        setError(null);
      }
    } catch (err) {
      setError('Erro ao entrar na sala');
      console.error('Erro ao entrar na sala:', err);
    }
  };

  const startMatching = async (roomCode: string) => {
    try {
      if (connection && isConnected) {
        await connection.invoke("StartMatching", roomCode);
        setError(null);
      }
    } catch (err) {
      setError('Erro ao iniciar matching');
      console.error('Erro ao iniciar matching:', err);
    }
  };

  const configureRoom = async (roomCode: string, settings: RoomSettings) => {
    try {
      if (connection && isConnected) {
        if (Number(settings.roundDurationInMinutes) < 1 || Number(settings.roundDurationInMinutes) > 5) {
          const errorMsg = 'Duração da rodada deve ser entre 1 e 5 minutos';
          setError(errorMsg);
          toast.error('Erro!', { description: errorMsg });
          return;
        }

        if (settings.categories.length === 0) {
          const errorMsg = 'Selecione pelo menos uma categoria';
          setError(errorMsg);
          toast.error('Erro!', { description: errorMsg });
          return;
        }

        await connection.invoke("ConfigureRoom", roomCode, settings);
        setError(null);
      }
    } catch (err) {
      const errorMsg = 'Erro ao configurar sala';
      setError(errorMsg);
      toast.error('Erro!', { description: errorMsg });
      console.error('Erro ao configurar sala:', err);
    }
  };

  const addMoviesToRoom = async (roomCode: string, movies: Movie[]) => {
    if (!room?.code || !connection) return;
    
    try {
      await connection.invoke("AddMoviesToRoom", room.code, movies);
    } catch (error) {
      console.error('Erro ao enviar filmes:', error);
      toast.error('Erro!', {
        description: 'Não foi possível enviar os filmes para o servidor.'
      });
    }
  };

  return (
    <SignalRContext.Provider value={{
      connection,
      isConnected,
      room,
      error,
      createRoom,
      joinRoom,
      startMatching,
      configureRoom,
      addMoviesToRoom
    }}>
      {children}
    </SignalRContext.Provider>
  );
}

export const useSignalR = () => useContext(SignalRContext);