import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link, useParams } from "@tanstack/react-router";
import {
  Award,
  ChevronLeft,
  Crown,
  Loader2,
  Medal,
  Sword,
  Target,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { TournamentStatus } from "../backend.d";
import {
  useGetLeaderboard,
  useGetPrizePool,
  useGetTeams,
  useGetTournament,
  useRegisterTeam,
} from "../hooks/useQueries";

const ORDINALS = ["1ST", "2ND", "3RD", "4TH", "5TH", "6TH", "7TH", "8TH"];

function PrizeRow({
  position,
  amount,
  index,
}: { position: number; amount: number; index: number }) {
  const configs = [
    {
      icon: Crown,
      color: "text-gold",
      glow: "neon-glow-gold",
      bg: "bg-gold/10 border-gold/30",
    },
    {
      icon: Medal,
      color: "text-silver",
      glow: "",
      bg: "bg-silver/10 border-silver/30",
    },
    {
      icon: Award,
      color: "text-bronze",
      glow: "",
      bg: "bg-bronze/10 border-bronze/30",
    },
  ];
  const cfg = configs[index] ?? {
    icon: Trophy,
    color: "text-muted-foreground",
    glow: "",
    bg: "bg-card border-border",
  };
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`flex items-center justify-between p-3 border clip-tactical-sm ${cfg.bg}`}
      data-ocid={`prize.item.${index + 1}`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${cfg.color}`} />
        <span
          className={`font-display font-bold text-sm tracking-wider ${cfg.color} ${cfg.glow}`}
        >
          {ORDINALS[position - 1] ?? `#${position}`}
        </span>
      </div>
      <span
        className={`font-display font-black text-2xl ${cfg.color} ${cfg.glow}`}
      >
        ${amount.toLocaleString()}
      </span>
    </motion.div>
  );
}

function RegisterTeamModal({
  tournamentId,
  gameMode,
}: { tournamentId: bigint; gameMode: string }) {
  const [open, setOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [captainName, setCaptainName] = useState("");
  const [playerCount, setPlayerCount] = useState(4);
  const registerTeam = useRegisterTeam();

  const maxPlayers = gameMode === "Solo" ? 1 : gameMode === "Duo" ? 2 : 4;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerTeam.mutateAsync({
        tournamentId,
        name: teamName,
        captainName,
        playerCount: BigInt(playerCount),
      });
      toast.success("Team registered successfully! Ready to battle.");
      setOpen(false);
      setTeamName("");
      setCaptainName("");
      setPlayerCount(maxPlayers);
    } catch {
      toast.error("Registration failed. Try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-display font-bold tracking-wider clip-tactical-sm gap-2 shadow-neon-orange"
          data-ocid="register.open_modal_button"
        >
          <Sword className="w-4 h-4" />
          REGISTER TEAM
        </Button>
      </DialogTrigger>
      <DialogContent
        className="bg-card border-border clip-tactical sm:max-w-md"
        data-ocid="register.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-black tracking-tight">
            <span className="text-primary">REGISTER</span> TEAM
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
              Team Name
            </Label>
            <Input
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter squad callsign"
              required
              className="bg-background border-border focus:border-primary rounded-none font-mono"
              data-ocid="register.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
              Captain Name
            </Label>
            <Input
              value={captainName}
              onChange={(e) => setCaptainName(e.target.value)}
              placeholder="Squad leader name"
              required
              className="bg-background border-border focus:border-primary rounded-none font-mono"
              data-ocid="register.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
              Player Count (max {maxPlayers})
            </Label>
            <Input
              type="number"
              min={1}
              max={maxPlayers}
              value={playerCount}
              onChange={(e) => setPlayerCount(Number(e.target.value))}
              required
              className="bg-background border-border focus:border-primary rounded-none font-mono"
              data-ocid="register.input"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-border hover:border-primary rounded-none"
              onClick={() => setOpen(false)}
              data-ocid="register.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={registerTeam.isPending}
              className="flex-1 bg-primary text-primary-foreground font-bold clip-tactical-sm"
              data-ocid="register.submit_button"
            >
              {registerTeam.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                  Registering...
                </>
              ) : (
                "DEPLOY SQUAD"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function TournamentDetailPage() {
  const { id } = useParams({ from: "/tournament/$id" });
  const tournamentId = BigInt(id);

  const { data: tournament, isLoading: loadingTournament } =
    useGetTournament(tournamentId);
  const { data: prizePool, isLoading: loadingPrize } =
    useGetPrizePool(tournamentId);
  const { data: teams, isLoading: loadingTeams } = useGetTeams(tournamentId);
  const { data: leaderboard, isLoading: loadingLeaderboard } =
    useGetLeaderboard(tournamentId);

  const totalPrize =
    prizePool?.reduce((s, t) => s + Number(t.prizeAmountUSD), 0) ?? 0;
  const sortedLeaderboard = [...(leaderboard ?? [])].sort(
    (a, b) => Number(b.points) - Number(a.points),
  );
  const sortedPrize = [...(prizePool ?? [])].sort(
    (a, b) => Number(a.position) - Number(b.position),
  );

  const statusConfig = {
    [TournamentStatus.upcoming]: {
      label: "Upcoming",
      class: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    },
    [TournamentStatus.ongoing]: {
      label: "Live",
      class: "bg-accent/20 text-accent border-accent/30",
    },
    [TournamentStatus.completed]: {
      label: "Completed",
      class: "bg-muted text-muted-foreground border-border",
    },
  };

  if (loadingTournament) {
    return (
      <div
        className="container mx-auto px-4 py-16"
        data-ocid="tournament.loading_state"
      >
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-6 w-full mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div
        className="container mx-auto px-4 py-16 text-center"
        data-ocid="tournament.error_state"
      >
        <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-display text-2xl font-black text-destructive">
          TOURNAMENT NOT FOUND
        </h2>
        <Link to="/" className="text-primary hover:underline mt-4 inline-block">
          &larr; Back to Hub
        </Link>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Link
        to="/"
        className="flex items-center gap-1.5 text-muted-foreground hover:text-primary text-sm mb-6 transition-colors w-fit"
        data-ocid="nav.link"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Tournaments
      </Link>

      {/* Tournament Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge
                className={`text-xs font-bold border ${statusConfig[tournament.status]?.class ?? ""}`}
              >
                {tournament.status === TournamentStatus.ongoing && (
                  <span className="w-1.5 h-1.5 rounded-full bg-accent mr-1.5 animate-pulse inline-block" />
                )}
                {statusConfig[tournament.status]?.label}
              </Badge>
              <Badge className="text-xs border border-primary/30 bg-primary/10 text-primary">
                {tournament.gameMode}
              </Badge>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-black tracking-tight text-foreground">
              {tournament.name}
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              {tournament.description}
            </p>
          </div>
          <RegisterTeamModal
            tournamentId={tournament.id}
            gameMode={tournament.gameMode}
          />
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Total Prize",
              value: `$${totalPrize.toLocaleString()}`,
              icon: Trophy,
              color: "text-gold",
            },
            {
              label: "Entry Fee",
              value: `$${Number(tournament.entryFee)}`,
              icon: Zap,
              color: "text-primary",
            },
            {
              label: "Max Teams",
              value: Number(tournament.maxTeams).toString(),
              icon: Users,
              color: "text-muted-foreground",
            },
            {
              label: "Start Date",
              value: tournament.startDate,
              icon: Target,
              color: "text-muted-foreground",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-card border border-border p-4 clip-tactical-sm"
            >
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1 uppercase tracking-wider">
                <stat.icon className={`w-3 h-3 ${stat.color}`} />
                {stat.label}
              </div>
              <div className={`font-display font-bold text-lg ${stat.color}`}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Prize Pool */}
        <div className="lg:col-span-1">
          <h2 className="font-display text-xl font-black tracking-wider mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-gold" />
            <span className="text-gold neon-glow-gold">PRIZE POOL</span>
          </h2>
          {loadingPrize ? (
            <div className="space-y-2" data-ocid="prize.loading_state">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14" />
              ))}
            </div>
          ) : sortedPrize.length === 0 ? (
            <div
              className="border border-border bg-card p-6 text-center clip-tactical"
              data-ocid="prize.empty_state"
            >
              <p className="text-muted-foreground text-sm">
                Prize pool not set yet.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedPrize.map((tier, i) => (
                <PrizeRow
                  key={tier.position.toString()}
                  position={Number(tier.position)}
                  amount={Number(tier.prizeAmountUSD)}
                  index={i}
                />
              ))}
            </div>
          )}
        </div>

        {/* Teams + Leaderboard */}
        <div className="lg:col-span-2 space-y-8">
          {/* Leaderboard */}
          <div>
            <h2 className="font-display text-xl font-black tracking-wider mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              <span className="text-primary">LEADERBOARD</span>
            </h2>
            {loadingLeaderboard ? (
              <div data-ocid="leaderboard.loading_state">
                <Skeleton className="h-48" />
              </div>
            ) : sortedLeaderboard.length === 0 ? (
              <div
                className="border border-border bg-card p-6 text-center clip-tactical"
                data-ocid="leaderboard.empty_state"
              >
                <p className="text-muted-foreground text-sm">
                  No scores yet. Battle starts soon.
                </p>
              </div>
            ) : (
              <div
                className="border border-border overflow-hidden"
                data-ocid="leaderboard.table"
              >
                <Table>
                  <TableHeader>
                    <TableRow className="border-border bg-muted/30 hover:bg-muted/30">
                      <TableHead className="font-display font-bold text-xs tracking-wider text-muted-foreground uppercase w-12">
                        #
                      </TableHead>
                      <TableHead className="font-display font-bold text-xs tracking-wider text-muted-foreground uppercase">
                        Team
                      </TableHead>
                      <TableHead className="font-display font-bold text-xs tracking-wider text-muted-foreground uppercase text-right">
                        Kills
                      </TableHead>
                      <TableHead className="font-display font-bold text-xs tracking-wider text-muted-foreground uppercase text-right">
                        Points
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedLeaderboard.map((team, i) => (
                      <TableRow
                        key={team.id.toString()}
                        className="border-border hover:bg-primary/5 transition-colors"
                        data-ocid={`leaderboard.row.${i + 1}`}
                      >
                        <TableCell className="font-mono font-bold">
                          {i === 0 ? (
                            <Crown className="w-4 h-4 text-gold" />
                          ) : i === 1 ? (
                            <span className="text-silver font-bold">#2</span>
                          ) : i === 2 ? (
                            <span className="text-bronze font-bold">#3</span>
                          ) : (
                            <span className="text-muted-foreground">
                              #{i + 1}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="font-display font-bold">
                          {team.name}
                        </TableCell>
                        <TableCell className="text-right font-mono text-primary">
                          {Number(team.kills)}
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-gold">
                          {Number(team.points)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Registered Teams */}
          <div>
            <h2 className="font-display text-xl font-black tracking-wider mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-muted-foreground" />
              <span>REGISTERED TEAMS</span>
              {teams && (
                <span className="ml-auto font-mono text-sm text-muted-foreground font-normal">
                  {teams.length}/{Number(tournament.maxTeams)}
                </span>
              )}
            </h2>
            {loadingTeams ? (
              <div data-ocid="teams.loading_state">
                <Skeleton className="h-48" />
              </div>
            ) : !teams || teams.length === 0 ? (
              <div
                className="border border-border bg-card p-6 text-center clip-tactical"
                data-ocid="teams.empty_state"
              >
                <p className="text-muted-foreground text-sm">
                  No teams registered yet. Be the first!
                </p>
              </div>
            ) : (
              <div
                className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                data-ocid="teams.list"
              >
                {teams.map((team, i) => (
                  <div
                    key={team.id.toString()}
                    className="bg-card border border-border p-3 clip-tactical-sm flex items-center justify-between"
                    data-ocid={`teams.item.${i + 1}`}
                  >
                    <div>
                      <div className="font-display font-bold text-sm">
                        {team.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        CPT: {team.captainName}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="w-3 h-3" />
                      <span className="font-mono">
                        {Number(team.playerCount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
