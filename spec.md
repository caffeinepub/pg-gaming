# FreeFire Esport Tournament Prize Pool

## Current State
New project, nothing exists yet.

## Requested Changes (Diff)

### Add
- Tournament management: create and list tournaments with name, game mode, date, status (upcoming/ongoing/completed)
- Prize pool display: total prize pool, prize distribution by rank (1st, 2nd, 3rd, etc.)
- Team registration: teams can register for tournaments with team name and player count
- Leaderboard: display teams ranked by kills and points per tournament
- Admin panel: create tournaments, set prize pools, update team scores
- Public view: browse tournaments, see prize pools, see registered teams and leaderboard

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend: Tournament actor with CRUD for tournaments, prize pool tiers, team registration, score tracking
2. Backend: Role-based access (admin vs public viewer)
3. Frontend: Home page with active tournaments and prize pool highlights
4. Frontend: Tournament detail page with prize breakdown and leaderboard
5. Frontend: Team registration flow
6. Frontend: Admin dashboard to create tournaments and update scores
