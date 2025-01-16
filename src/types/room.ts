import { Movie } from "./movie";
import { MovieAnalysis } from "./movie-analysis";

export enum RoomStatus {
    WaitingToStart = 0,
    LoadingMovies = 1,
    InProgress = 2,
    LoadingFinalizedData = 3,
    Finished = 4
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
    analyzedRoom: MovieAnalysis | null;
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