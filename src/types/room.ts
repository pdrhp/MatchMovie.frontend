import { Movie } from "./movie";

export enum RoomStatus {
    WaitingToStart = 0,
    LoadingMovies = 1,
    InProgress = 2,
    Finished = 3
  }
  
  export interface RoomSettings {
    categories: string[];
    roundDurationInSeconds: number | '';
    maxParticipants: number | '';
  }
  
  export interface Room {
    code: string;
    hostConnectionId: string;
    settings: RoomSettings;
    participantsConnectionIds: string[];
    status: RoomStatus;
    movies: Movie[];
    participantVotes: Record<string, number[]>;
    participantNames: Record<string, string>;
    finalizedData: RoomFinalizedData | null;
  }

  export interface RoomFinalizedData {
    totalParticipants: number;
    movieResults: {
      movieId: number;
      votes: number;
    }[];
  }
  
  export interface RoomCreatedResponse {
    code: string;
    isHost: boolean;
    userName: string;
  }
    
  export interface RoomConfiguredResponse {
    categories: string[];
    roundDurationInMinutes: number;
    maxParticipants: number;
  }

    export interface ParticipantUpdateResponse {
    participantCount: number;
    isHost: boolean;
    userName: string;
    participantNames: Record<string, string>;
  }