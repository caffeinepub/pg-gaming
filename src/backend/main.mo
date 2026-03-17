import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type TournamentId = Nat;
  type TeamId = Nat;
  type PrizePosition = Nat; // 1 for 1st place, 2 for 2nd, etc.

  type TournamentStatus = {
    #upcoming;
    #ongoing;
    #completed;
  };

  type Tournament = {
    id : TournamentId;
    name : Text;
    description : Text;
    gameMode : Text; // "Solo", "Duo", "Squad"
    startDate : Text;
    maxTeams : Nat;
    entryFee : Nat;
    status : TournamentStatus;
  };

  module Tournament {
    public func compare(t1 : Tournament, t2 : Tournament) : Order.Order {
      Nat.compare(t1.id, t2.id);
    };
  };

  type PrizeTier = {
    position : PrizePosition;
    prizeAmountUSD : Nat;
  };

  type Team = {
    id : TeamId;
    tournamentId : TournamentId;
    name : Text;
    captainName : Text;
    playerCount : Nat;
    kills : Nat;
    points : Nat;
    rank : ?Nat;
  };

  module Team {
    public func compareByPoints(a : Team, b : Team) : Order.Order {
      switch (Nat.compare(b.points, a.points)) {
        case (#equal) { Text.compare(a.name, b.name) };
        case (result) { result };
      };
    };
  };

  public type UserProfile = {
    name : Text;
  };

  let tournaments = Map.empty<TournamentId, Tournament>();
  let prizePools = Map.empty<TournamentId, [PrizeTier]>();
  let teams = Map.empty<TeamId, Team>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var nextTournamentId = 1;
  var nextTeamId = 1;

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Tournaments
  public shared ({ caller }) func createTournament(
    name : Text,
    description : Text,
    gameMode : Text,
    startDate : Text,
    maxTeams : Nat,
    entryFee : Nat,
    status : TournamentStatus,
  ) : async TournamentId {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can create tournaments");
    };

    let id = nextTournamentId;
    let tournament : Tournament = {
      id;
      name;
      description;
      gameMode;
      startDate;
      maxTeams;
      entryFee;
      status;
    };

    tournaments.add(id, tournament);
    nextTournamentId += 1;
    id;
  };

  public query func getTournament(id : TournamentId) : async Tournament {
    switch (tournaments.get(id)) {
      case (null) {
        Runtime.trap("Tournament not found");
      };
      case (?t) { t };
    };
  };

  public query func listTournaments() : async [Tournament] {
    tournaments.values().toArray().sort();
  };

  // Prize Pool
  public shared ({ caller }) func setPrizePool(tournamentId : TournamentId, prizeTiers : [PrizeTier]) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can set prize pools");
    };

    if (not tournaments.containsKey(tournamentId)) {
      Runtime.trap("Tournament not found");
    };

    prizePools.add(tournamentId, prizeTiers);
  };

  public query func getPrizePool(tournamentId : TournamentId) : async [PrizeTier] {
    switch (prizePools.get(tournamentId)) {
      case (null) {
        Runtime.trap("Prize pool not found");
      };
      case (?prizes) { prizes };
    };
  };

  // Team Registration
  public shared ({ caller }) func registerTeam(
    tournamentId : TournamentId,
    name : Text,
    captainName : Text,
    playerCount : Nat,
  ) : async TeamId {
    switch (tournaments.get(tournamentId)) {
      case (null) {
        Runtime.trap("Tournament not found");
      };
      case (?tournament) {
        let id = nextTeamId;
        let team : Team = {
          id;
          tournamentId;
          name;
          captainName;
          playerCount;
          kills = 0;
          points = 0;
          rank = null;
        };

        teams.add(id, team);
        nextTeamId += 1;
        id;
      };
    };
  };

  public query func getTeamsForTournament(tournamentId : TournamentId) : async [Team] {
    teams.values().toArray().filter(
      func(team) {
        team.tournamentId == tournamentId;
      }
    );
  };

  public query func getRegisteredTeamsCount(tournamentId : TournamentId) : async Nat {
    teams.values().toArray().filter(
      func(team) {
        team.tournamentId == tournamentId;
      }
    ).size();
  };

  // Leaderboard
  public shared ({ caller }) func updateTeamScore(teamId : TeamId, kills : Nat, points : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update scores");
    };

    switch (teams.get(teamId)) {
      case (null) {
        Runtime.trap("Team not found");
      };
      case (?team) {
        let updatedTeam : Team = {
          id = team.id;
          tournamentId = team.tournamentId;
          name = team.name;
          captainName = team.captainName;
          playerCount = team.playerCount;
          kills;
          points;
          rank = team.rank;
        };

        teams.add(teamId, updatedTeam);
      };
    };
  };

  public query func getLeaderboard(tournamentId : TournamentId) : async [Team] {
    let tournamentTeams = teams.values().toArray().filter(
      func(t) { t.tournamentId == tournamentId }
    );
    tournamentTeams.sort(Team.compareByPoints);
  };
};
