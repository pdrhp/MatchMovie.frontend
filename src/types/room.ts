import { Movie } from "./movie";

export enum RoomStatus {
    WaitingToStart = 0,
    LoadingMovies = 1,
    InProgress = 2,
    Finished = 3
  }
  
  export interface RoomSettings {
    categories: string[];
    roundDurationInMinutes: number | '';
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
  }
  
  export interface RoomCreatedResponse {
    code: string;
    isHost: boolean;
  }
  
  export interface ParticipantUpdateResponse {
    participantCount: number;
    isHost: boolean;
  }
  
  export interface RoomConfiguredResponse {
    categories: string[];
    roundDurationInMinutes: number;
    maxParticipants: number;
  }