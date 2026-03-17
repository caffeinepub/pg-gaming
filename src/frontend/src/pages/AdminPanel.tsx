import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Lock,
  Plus,
  Shield,
  Sword,
  Trash2,
  Trophy,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { type PrizeTier, TournamentStatus } from "../backend.d";
import {
  useCreateTournament,
  useGetTeams,
  useIsCallerAdmin,
  useListTournaments,
  useSetPrizePool,
  useUpdateTeamScore,
} from "../hooks/useQueries";

function CreateTournamentTab() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [gameMode, setGameMode] = useState("Squad");
  const [startDate, setStartDate] = useState("");
  const [maxTeams, setMaxTeams] = useState(16);
  const [entryFee, setEntryFee] = useState(10);
  const [status, setStatus] = useState<TournamentStatus>(
    TournamentStatus.upcoming,
  );

  const createTournament = useCreateTournament();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTournament.mutateAsync({
        name,
        description,
        gameMode,
        startDate,
        maxTeams: BigInt(maxTeams),
        entryFee: BigInt(entryFee),
        status,
      });
      toast.success("Tournament created! Operators notified.");
      setName("");
      setDescription("");
      setStartDate("");
    } catch {
      toast.error("Failed to create tournament.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
      <div className="space-y-1.5">
        <Label className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
          Tournament Name
        </Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Operation Bermuda S3"
          required
          className="bg-background border-border focus:border-primary rounded-none font-mono"
          data-ocid="admin.create.input"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
          Description
        </Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tournament rules and details..."
          required
          className="bg-background border-border focus:border-primary rounded-none font-mono resize-none"
          rows={3}
          data-ocid="admin.create.textarea"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
            Game Mode
          </Label>
          <Select value={gameMode} onValueChange={setGameMode}>
            <SelectTrigger
              className="bg-background border-border rounded-none"
              data-ocid="admin.create.select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border rounded-none">
              <SelectItem value="Solo">Solo</SelectItem>
              <SelectItem value="Duo">Duo</SelectItem>
              <SelectItem value="Squad">Squad</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
            Status
          </Label>
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as TournamentStatus)}
          >
            <SelectTrigger
              className="bg-background border-border rounded-none"
              data-ocid="admin.create.select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border rounded-none">
              <SelectItem value={TournamentStatus.upcoming}>
                Upcoming
              </SelectItem>
              <SelectItem value={TournamentStatus.ongoing}>Ongoing</SelectItem>
              <SelectItem value={TournamentStatus.completed}>
                Completed
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
            Start Date
          </Label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="bg-background border-border focus:border-primary rounded-none font-mono"
            data-ocid="admin.create.input"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
            Max Teams
          </Label>
          <Input
            type="number"
            min={2}
            value={maxTeams}
            onChange={(e) => setMaxTeams(Number(e.target.value))}
            required
            className="bg-background border-border focus:border-primary rounded-none font-mono"
            data-ocid="admin.create.input"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
            Entry Fee ($)
          </Label>
          <Input
            type="number"
            min={0}
            value={entryFee}
            onChange={(e) => setEntryFee(Number(e.target.value))}
            required
            className="bg-background border-border focus:border-primary rounded-none font-mono"
            data-ocid="admin.create.input"
          />
        </div>
      </div>
      <Button
        type="submit"
        disabled={createTournament.isPending}
        className="bg-primary text-primary-foreground font-display font-bold tracking-wider clip-tactical-sm w-full"
        data-ocid="admin.create.submit_button"
      >
        {createTournament.isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Creating...
          </>
        ) : (
          <>
            <Plus className="w-4 h-4 mr-2" />
            CREATE TOURNAMENT
          </>
        )}
      </Button>
    </form>
  );
}

type TierItem = { id: string; position: number; amount: number };

function SetPrizePoolTab() {
  const { data: tournaments } = useListTournaments();
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>("");
  const [tiers, setTiers] = useState<TierItem[]>([
    { id: "tier-1", position: 1, amount: 1000 },
    { id: "tier-2", position: 2, amount: 500 },
    { id: "tier-3", position: 3, amount: 250 },
  ]);

  const setPrizePool = useSetPrizePool();

  const addTier = () => {
    const nextPos = tiers.length + 1;
    setTiers((prev) => [
      ...prev,
      { id: `tier-${Date.now()}`, position: nextPos, amount: 100 },
    ]);
  };

  const removeTier = (id: string) => {
    setTiers((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTournamentId) return;
    try {
      const prizeTiers: PrizeTier[] = tiers.map((t) => ({
        position: BigInt(t.position),
        prizeAmountUSD: BigInt(t.amount),
      }));
      await setPrizePool.mutateAsync({
        tournamentId: BigInt(selectedTournamentId),
        prizeTiers,
      });
      toast.success("Prize pool saved.");
    } catch {
      toast.error("Failed to save prize pool.");
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-5 max-w-xl">
      <div className="space-y-1.5">
        <Label className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
          Select Tournament
        </Label>
        <Select
          value={selectedTournamentId}
          onValueChange={setSelectedTournamentId}
        >
          <SelectTrigger
            className="bg-background border-border rounded-none"
            data-ocid="admin.prize.select"
          >
            <SelectValue placeholder="Choose a tournament" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border rounded-none">
            {tournaments?.map((t) => (
              <SelectItem key={t.id.toString()} value={t.id.toString()}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
            Prize Tiers
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addTier}
            className="border-border hover:border-primary rounded-none text-xs"
            data-ocid="admin.prize.button"
          >
            <Plus className="w-3 h-3 mr-1" /> Add Tier
          </Button>
        </div>
        <div className="space-y-2">
          {tiers.map((tier, i) => (
            <div
              key={tier.id}
              className="flex items-center gap-2"
              data-ocid={`admin.prize.item.${i + 1}`}
            >
              <div className="bg-background border border-border px-3 py-2 font-mono text-sm text-muted-foreground w-12 text-center">
                #{tier.position}
              </div>
              <Input
                type="number"
                min={0}
                value={tier.amount}
                onChange={(e) =>
                  setTiers((prev) =>
                    prev.map((t) =>
                      t.id === tier.id
                        ? { ...t, amount: Number(e.target.value) }
                        : t,
                    ),
                  )
                }
                className="bg-background border-border focus:border-primary rounded-none font-mono"
                data-ocid="admin.prize.input"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => removeTier(tier.id)}
                className="border-destructive/50 hover:bg-destructive/10 hover:border-destructive rounded-none shrink-0"
                data-ocid="admin.prize.delete_button"
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Button
        type="submit"
        disabled={setPrizePool.isPending || !selectedTournamentId}
        className="bg-primary text-primary-foreground font-display font-bold tracking-wider clip-tactical-sm w-full"
        data-ocid="admin.prize.submit_button"
      >
        {setPrizePool.isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Trophy className="w-4 h-4 mr-2" />
            SAVE PRIZE POOL
          </>
        )}
      </Button>
    </form>
  );
}

function UpdateScoresTab() {
  const { data: tournaments } = useListTournaments();
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>("");
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [kills, setKills] = useState(0);
  const [points, setPoints] = useState(0);

  const { data: teams, isLoading: loadingTeams } = useGetTeams(
    selectedTournamentId ? BigInt(selectedTournamentId) : null,
  );
  const updateScore = useUpdateTeamScore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeamId || !selectedTournamentId) return;
    try {
      await updateScore.mutateAsync({
        teamId: BigInt(selectedTeamId),
        kills: BigInt(kills),
        points: BigInt(points),
        tournamentId: BigInt(selectedTournamentId),
      });
      toast.success("Scores updated!");
    } catch {
      toast.error("Failed to update scores.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
      <div className="space-y-1.5">
        <Label className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
          Select Tournament
        </Label>
        <Select
          value={selectedTournamentId}
          onValueChange={(v) => {
            setSelectedTournamentId(v);
            setSelectedTeamId("");
          }}
        >
          <SelectTrigger
            className="bg-background border-border rounded-none"
            data-ocid="admin.scores.select"
          >
            <SelectValue placeholder="Choose a tournament" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border rounded-none">
            {tournaments?.map((t) => (
              <SelectItem key={t.id.toString()} value={t.id.toString()}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedTournamentId && (
        <div className="space-y-1.5">
          <Label className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
            Select Team
          </Label>
          {loadingTeams ? (
            <Skeleton className="h-10" />
          ) : (
            <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
              <SelectTrigger
                className="bg-background border-border rounded-none"
                data-ocid="admin.scores.select"
              >
                <SelectValue placeholder="Choose a team" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border rounded-none">
                {teams?.map((t) => (
                  <SelectItem key={t.id.toString()} value={t.id.toString()}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
            Kills
          </Label>
          <Input
            type="number"
            min={0}
            value={kills}
            onChange={(e) => setKills(Number(e.target.value))}
            required
            className="bg-background border-border focus:border-primary rounded-none font-mono"
            data-ocid="admin.scores.input"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-bold tracking-wider uppercase text-muted-foreground">
            Points
          </Label>
          <Input
            type="number"
            min={0}
            value={points}
            onChange={(e) => setPoints(Number(e.target.value))}
            required
            className="bg-background border-border focus:border-primary rounded-none font-mono"
            data-ocid="admin.scores.input"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={updateScore.isPending || !selectedTeamId}
        className="bg-primary text-primary-foreground font-display font-bold tracking-wider clip-tactical-sm w-full"
        data-ocid="admin.scores.submit_button"
      >
        {updateScore.isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Updating...
          </>
        ) : (
          <>
            <Sword className="w-4 h-4 mr-2" />
            UPDATE SCORES
          </>
        )}
      </Button>
    </form>
  );
}

export default function AdminPanel() {
  const { data: isAdmin, isLoading } = useIsCallerAdmin();

  if (isLoading) {
    return (
      <div
        className="container mx-auto px-4 py-16"
        data-ocid="admin.loading_state"
      >
        <Skeleton className="h-10 w-48 mb-8" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div
        className="container mx-auto px-4 py-16 text-center"
        data-ocid="admin.error_state"
      >
        <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-display text-3xl font-black text-destructive">
          ACCESS DENIED
        </h2>
        <p className="text-muted-foreground mt-2">
          Admin credentials required. Login to proceed.
        </p>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-7 h-7 text-primary" />
          <h1 className="font-display text-4xl font-black tracking-tight">
            <span className="text-primary">ADMIN</span> PANEL
          </h1>
        </div>
        <div className="h-0.5 w-32 bg-gradient-to-r from-primary to-transparent mb-8" />

        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="bg-card border border-border rounded-none p-0 h-auto">
            <TabsTrigger
              value="create"
              className="rounded-none font-display font-bold tracking-wider uppercase text-xs px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              data-ocid="admin.create.tab"
            >
              Create Tournament
            </TabsTrigger>
            <TabsTrigger
              value="prize"
              className="rounded-none font-display font-bold tracking-wider uppercase text-xs px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              data-ocid="admin.prize.tab"
            >
              Set Prize Pool
            </TabsTrigger>
            <TabsTrigger
              value="scores"
              className="rounded-none font-display font-bold tracking-wider uppercase text-xs px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              data-ocid="admin.scores.tab"
            >
              Update Scores
            </TabsTrigger>
          </TabsList>

          <div className="bg-card border border-border p-6 clip-tactical">
            <TabsContent value="create" className="mt-0">
              <h2 className="font-display text-xl font-black tracking-wider mb-6 text-primary">
                CREATE TOURNAMENT
              </h2>
              <CreateTournamentTab />
            </TabsContent>
            <TabsContent value="prize" className="mt-0">
              <h2 className="font-display text-xl font-black tracking-wider mb-6 text-primary">
                SET PRIZE POOL
              </h2>
              <SetPrizePoolTab />
            </TabsContent>
            <TabsContent value="scores" className="mt-0">
              <h2 className="font-display text-xl font-black tracking-wider mb-6 text-primary">
                UPDATE SCORES
              </h2>
              <UpdateScoresTab />
            </TabsContent>
          </div>
        </Tabs>
      </motion.div>
    </main>
  );
}
