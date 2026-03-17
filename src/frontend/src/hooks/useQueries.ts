import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PrizeTier, TournamentStatus } from "../backend.d";
import { useActor } from "./useActor";

export function useListTournaments() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["tournaments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listTournaments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTournament(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["tournament", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getTournament(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useGetPrizePool(tournamentId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["prizePool", tournamentId?.toString()],
    queryFn: async () => {
      if (!actor || tournamentId === null) return [];
      return actor.getPrizePool(tournamentId);
    },
    enabled: !!actor && !isFetching && tournamentId !== null,
  });
}

export function useGetTeams(tournamentId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["teams", tournamentId?.toString()],
    queryFn: async () => {
      if (!actor || tournamentId === null) return [];
      return actor.getTeamsForTournament(tournamentId);
    },
    enabled: !!actor && !isFetching && tournamentId !== null,
  });
}

export function useGetLeaderboard(tournamentId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["leaderboard", tournamentId?.toString()],
    queryFn: async () => {
      if (!actor || tournamentId === null) return [];
      return actor.getLeaderboard(tournamentId);
    },
    enabled: !!actor && !isFetching && tournamentId !== null,
  });
}

export function useGetRegisteredTeamsCount(tournamentId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["teamsCount", tournamentId?.toString()],
    queryFn: async () => {
      if (!actor || tournamentId === null) return BigInt(0);
      return actor.getRegisteredTeamsCount(tournamentId);
    },
    enabled: !!actor && !isFetching && tournamentId !== null,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRegisterTeam() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      tournamentId: bigint;
      name: string;
      captainName: string;
      playerCount: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.registerTeam(
        params.tournamentId,
        params.name,
        params.captainName,
        params.playerCount,
      );
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["teams", vars.tournamentId.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["teamsCount", vars.tournamentId.toString()],
      });
    },
  });
}

export function useCreateTournament() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      name: string;
      description: string;
      gameMode: string;
      startDate: string;
      maxTeams: bigint;
      entryFee: bigint;
      status: TournamentStatus;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createTournament(
        params.name,
        params.description,
        params.gameMode,
        params.startDate,
        params.maxTeams,
        params.entryFee,
        params.status,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tournaments"] });
    },
  });
}

export function useSetPrizePool() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      tournamentId: bigint;
      prizeTiers: PrizeTier[];
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.setPrizePool(params.tournamentId, params.prizeTiers);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["prizePool", vars.tournamentId.toString()],
      });
    },
  });
}

export function useUpdateTeamScore() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      teamId: bigint;
      kills: bigint;
      points: bigint;
      tournamentId: bigint;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateTeamScore(params.teamId, params.kills, params.points);
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["leaderboard", vars.tournamentId.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["teams", vars.tournamentId.toString()],
      });
    },
  });
}
