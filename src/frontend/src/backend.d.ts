import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Team {
    id: TeamId;
    captainName: string;
    name: string;
    rank?: bigint;
    playerCount: bigint;
    tournamentId: TournamentId;
    kills: bigint;
    points: bigint;
}
export interface UserProfile {
    name: string;
}
export type PrizePosition = bigint;
export interface Tournament {
    id: TournamentId;
    status: TournamentStatus;
    name: string;
    description: string;
    gameMode: string;
    maxTeams: bigint;
    entryFee: bigint;
    startDate: string;
}
export interface PrizeTier {
    position: PrizePosition;
    prizeAmountUSD: bigint;
}
export type TeamId = bigint;
export type TournamentId = bigint;
export enum TournamentStatus {
    upcoming = "upcoming",
    completed = "completed",
    ongoing = "ongoing"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createTournament(name: string, description: string, gameMode: string, startDate: string, maxTeams: bigint, entryFee: bigint, status: TournamentStatus): Promise<TournamentId>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getLeaderboard(tournamentId: TournamentId): Promise<Array<Team>>;
    getPrizePool(tournamentId: TournamentId): Promise<Array<PrizeTier>>;
    getRegisteredTeamsCount(tournamentId: TournamentId): Promise<bigint>;
    getTeamsForTournament(tournamentId: TournamentId): Promise<Array<Team>>;
    getTournament(id: TournamentId): Promise<Tournament>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listTournaments(): Promise<Array<Tournament>>;
    registerTeam(tournamentId: TournamentId, name: string, captainName: string, playerCount: bigint): Promise<TeamId>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setPrizePool(tournamentId: TournamentId, prizeTiers: Array<PrizeTier>): Promise<void>;
    updateTeamScore(teamId: TeamId, kills: bigint, points: bigint): Promise<void>;
}
