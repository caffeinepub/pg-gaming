import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  Calendar,
  ChevronRight,
  DollarSign,
  Target,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import type { Tournament } from "../backend.d";
import { TournamentStatus } from "../backend.d";
import {
  useGetPrizePool,
  useGetRegisteredTeamsCount,
  useListTournaments,
} from "../hooks/useQueries";

const SKELETON_KEYS = ["sk1", "sk2", "sk3", "sk4", "sk5", "sk6"];

function TournamentCardSkeleton() {
  return (
    <div className="bg-card border border-border p-5 clip-tactical">
      <Skeleton className="h-5 w-3/4 mb-3" />
      <Skeleton className="h-4 w-1/3 mb-4" />
      <div className="flex gap-3 mb-4">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
      </div>
      <Skeleton className="h-8 w-full" />
    </div>
  );
}

function TournamentCard({
  tournament,
  index,
}: { tournament: Tournament; index: number }) {
  const { data: prizePool } = useGetPrizePool(tournament.id);
  const { data: teamsCount } = useGetRegisteredTeamsCount(tournament.id);

  const totalPrize =
    prizePool?.reduce((sum, tier) => sum + Number(tier.prizeAmountUSD), 0) ?? 0;
  const occupancy = teamsCount ? Number(teamsCount) : 0;
  const maxTeams = Number(tournament.maxTeams);
  const occupancyPct =
    maxTeams > 0 ? Math.min((occupancy / maxTeams) * 100, 100) : 0;

  const statusConfig = {
    [TournamentStatus.upcoming]: {
      label: "Upcoming",
      class: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    },
    [TournamentStatus.ongoing]: {
      label: "Live",
      class: "bg-accent/20 text-accent border-accent/30 neon-glow-green",
    },
    [TournamentStatus.completed]: {
      label: "Completed",
      class: "bg-muted text-muted-foreground border-border",
    },
  };

  const statusInfo =
    statusConfig[tournament.status] ?? statusConfig[TournamentStatus.upcoming];

  const modeColors: Record<string, string> = {
    Solo: "bg-primary/20 text-primary border-primary/30",
    Duo: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    Squad: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      data-ocid={`tournament.item.${index + 1}`}
    >
      <Link
        to="/tournament/$id"
        params={{ id: tournament.id.toString() }}
        className="block bg-card border border-border hover:border-primary/50 hover:shadow-card-hover transition-all duration-300 clip-tactical group relative overflow-hidden"
        data-ocid={`tournament.link.${index + 1}`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        <div className="h-0.5 bg-gradient-to-r from-primary via-primary/60 to-transparent" />

        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-display font-bold text-lg text-foreground group-hover:text-primary transition-colors leading-tight">
              {tournament.name}
            </h3>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0 mt-0.5" />
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge
              className={`text-xs font-bold tracking-wider border ${statusConfig[tournament.status]?.class ?? ""}`}
            >
              {tournament.status === TournamentStatus.ongoing && (
                <span className="w-1.5 h-1.5 rounded-full bg-accent mr-1.5 animate-pulse inline-block" />
              )}
              {statusInfo.label}
            </Badge>
            <Badge
              className={`text-xs font-bold tracking-wider border ${modeColors[tournament.gameMode] ?? "bg-muted text-muted-foreground border-border"}`}
            >
              {tournament.gameMode}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-background/60 p-2.5 clip-tactical-sm">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <Trophy className="w-3 h-3 text-gold" />
                <span className="uppercase tracking-wider">Prize Pool</span>
              </div>
              <span className="font-display font-bold text-gold text-lg neon-glow-gold">
                ${totalPrize.toLocaleString()}
              </span>
            </div>
            <div className="bg-background/60 p-2.5 clip-tactical-sm">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                <DollarSign className="w-3 h-3 text-primary" />
                <span className="uppercase tracking-wider">Entry Fee</span>
              </div>
              <span className="font-display font-bold text-primary text-lg">
                ${Number(tournament.entryFee)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3" />
              <span>{tournament.startDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3 h-3" />
              <span className="font-mono">
                {occupancy}/{maxTeams}
              </span>
            </div>
          </div>

          <div className="mt-3 h-1 bg-border rounded-none overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-700"
              style={{ width: `${occupancyPct}%` }}
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function HomePage() {
  const { data: tournaments, isLoading, isError } = useListTournaments();

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="relative h-[420px] sm:h-[500px] flex items-center"
          style={{
            backgroundImage:
              "url('/assets/generated/freefire-hero.dim_1200x400.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center top",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 scanlines opacity-20" />

          <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-primary/60" />
          <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-primary/60" />
          <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-primary/60" />
          <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-primary/60" />

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-primary" />
                <span className="text-primary font-mono text-sm tracking-[0.3em] uppercase">
                  Esports Tournament Platform
                </span>
              </div>
              <h1 className="font-display text-5xl sm:text-7xl font-black tracking-tight leading-none mb-4">
                <span className="text-primary neon-glow-orange block">
                  FREE FIRE
                </span>
                <span className="text-foreground text-3xl sm:text-5xl font-bold">
                  TOURNAMENT HUB
                </span>
              </h1>
              <p className="text-muted-foreground max-w-md text-base sm:text-lg leading-relaxed mb-8">
                Compete in elite battle royale tournaments. Register your squad,
                climb the leaderboard, claim the prize pool.
              </p>
              <div className="flex items-center gap-6 flex-wrap">
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-accent" />
                  <span className="text-muted-foreground">
                    <span className="text-foreground font-bold">
                      {tournaments?.length ?? 0}
                    </span>{" "}
                    Active Tournaments
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Trophy className="w-4 h-4 text-gold" />
                  <span className="text-muted-foreground">
                    Massive Prize Pools
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tournament Listings */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h2 className="font-display text-3xl font-black tracking-tight text-foreground">
              <span className="text-primary">ACTIVE</span> TOURNAMENTS
            </h2>
            <div className="h-0.5 w-24 bg-gradient-to-r from-primary to-transparent mt-2" />
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground bg-card border border-border px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            LIVE DATA
          </div>
        </motion.div>

        {isError && (
          <div
            className="text-center py-16 border border-destructive/30 bg-destructive/10"
            data-ocid="tournaments.error_state"
          >
            <p className="text-destructive font-bold font-display">
              SYSTEM ERROR
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              Failed to load tournaments. Check connection.
            </p>
          </div>
        )}

        {isLoading && (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            data-ocid="tournaments.loading_state"
          >
            {SKELETON_KEYS.map((k) => (
              <TournamentCardSkeleton key={k} />
            ))}
          </div>
        )}

        {!isLoading && !isError && tournaments?.length === 0 && (
          <div
            className="text-center py-20 border border-border bg-card clip-tactical"
            data-ocid="tournaments.empty_state"
          >
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="font-display text-xl font-bold text-muted-foreground">
              NO ACTIVE TOURNAMENTS
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Check back soon or ask an admin to create one.
            </p>
          </div>
        )}

        {!isLoading && !isError && tournaments && tournaments.length > 0 && (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            data-ocid="tournaments.list"
          >
            {tournaments.map((t, i) => (
              <TournamentCard key={t.id.toString()} tournament={t} index={i} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
