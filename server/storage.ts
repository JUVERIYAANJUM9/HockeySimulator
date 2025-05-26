import { 
  teams, players, games, gameEvents, playerStats, teamStats, lineups,
  type Team, type InsertTeam,
  type Player, type InsertPlayer,
  type Game, type InsertGame,
  type GameEvent, type InsertGameEvent,
  type PlayerStats, type InsertPlayerStats,
  type TeamStats, type InsertTeamStats,
  type Lineup, type InsertLineup
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // Teams
  getTeam(id: number): Promise<Team | undefined>;
  getAllTeams(): Promise<Team[]>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: number, updates: Partial<InsertTeam>): Promise<Team>;
  
  // Players
  getPlayer(id: number): Promise<Player | undefined>;
  getPlayersByTeam(teamId: number): Promise<Player[]>;
  getAllPlayers(): Promise<Player[]>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  updatePlayer(id: number, updates: Partial<InsertPlayer>): Promise<Player>;
  
  // Games
  getGame(id: number): Promise<Game | undefined>;
  getGamesByTeam(teamId: number): Promise<Game[]>;
  getCurrentGames(): Promise<Game[]>;
  createGame(game: InsertGame): Promise<Game>;
  updateGame(id: number, updates: Partial<InsertGame>): Promise<Game>;
  
  // Game Events
  getGameEvents(gameId: number): Promise<GameEvent[]>;
  createGameEvent(event: InsertGameEvent): Promise<GameEvent>;
  
  // Player Stats
  getPlayerStats(playerId: number, season: number): Promise<PlayerStats | undefined>;
  getPlayerStatsBySeason(season: number): Promise<PlayerStats[]>;
  updatePlayerStats(playerId: number, season: number, updates: Partial<InsertPlayerStats>): Promise<PlayerStats>;
  
  // Team Stats
  getTeamStats(teamId: number, season: number): Promise<TeamStats | undefined>;
  getTeamStatsBySeason(season: number): Promise<TeamStats[]>;
  updateTeamStats(teamId: number, season: number, updates: Partial<InsertTeamStats>): Promise<TeamStats>;
  
  // Lineups
  getTeamLineups(teamId: number): Promise<Lineup[]>;
  createLineup(lineup: InsertLineup): Promise<Lineup>;
  updateLineup(id: number, updates: Partial<InsertLineup>): Promise<Lineup>;
  
  // Dashboard queries
  getTopPerformers(season: number, limit?: number): Promise<any[]>;
  getUpcomingGames(teamId: number, limit?: number): Promise<any[]>;
  getTeamAnalytics(teamId: number, season: number): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // Teams
  async getTeam(id: number): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team || undefined;
  }

  async getAllTeams(): Promise<Team[]> {
    return await db.select().from(teams);
  }

  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const [team] = await db.insert(teams).values(insertTeam).returning();
    return team;
  }

  async updateTeam(id: number, updates: Partial<InsertTeam>): Promise<Team> {
    const [team] = await db.update(teams).set(updates).where(eq(teams.id, id)).returning();
    return team;
  }

  // Players
  async getPlayer(id: number): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.id, id));
    return player || undefined;
  }

  async getPlayersByTeam(teamId: number): Promise<Player[]> {
    return await db.select().from(players).where(eq(players.teamId, teamId));
  }

  async getAllPlayers(): Promise<Player[]> {
    return await db.select().from(players);
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const [player] = await db.insert(players).values(insertPlayer).returning();
    return player;
  }

  async updatePlayer(id: number, updates: Partial<InsertPlayer>): Promise<Player> {
    const [player] = await db.update(players).set(updates).where(eq(players.id, id)).returning();
    return player;
  }

  // Games
  async getGame(id: number): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.id, id));
    return game || undefined;
  }

  async getGamesByTeam(teamId: number): Promise<Game[]> {
    return await db
      .select()
      .from(games)
      .where(
        sql`${games.homeTeamId} = ${teamId} OR ${games.awayTeamId} = ${teamId}`
      )
      .orderBy(desc(games.scheduledAt));
  }

  async getCurrentGames(): Promise<Game[]> {
    return await db
      .select()
      .from(games)
      .where(eq(games.status, "live"))
      .orderBy(games.scheduledAt);
  }

  async createGame(insertGame: InsertGame): Promise<Game> {
    const [game] = await db.insert(games).values(insertGame).returning();
    return game;
  }

  async updateGame(id: number, updates: Partial<InsertGame>): Promise<Game> {
    const [game] = await db.update(games).set(updates).where(eq(games.id, id)).returning();
    return game;
  }

  // Game Events
  async getGameEvents(gameId: number): Promise<GameEvent[]> {
    return await db
      .select()
      .from(gameEvents)
      .where(eq(gameEvents.gameId, gameId))
      .orderBy(desc(gameEvents.period), desc(gameEvents.timeInPeriod));
  }

  async createGameEvent(insertEvent: InsertGameEvent): Promise<GameEvent> {
    const [event] = await db.insert(gameEvents).values(insertEvent).returning();
    return event;
  }

  // Player Stats
  async getPlayerStats(playerId: number, season: number): Promise<PlayerStats | undefined> {
    const [stats] = await db
      .select()
      .from(playerStats)
      .where(and(eq(playerStats.playerId, playerId), eq(playerStats.season, season)));
    return stats || undefined;
  }

  async getPlayerStatsBySeason(season: number): Promise<PlayerStats[]> {
    return await db
      .select()
      .from(playerStats)
      .where(eq(playerStats.season, season));
  }

  async updatePlayerStats(playerId: number, season: number, updates: Partial<InsertPlayerStats>): Promise<PlayerStats> {
    // Try to update existing stats
    const [existingStats] = await db
      .update(playerStats)
      .set(updates)
      .where(and(eq(playerStats.playerId, playerId), eq(playerStats.season, season)))
      .returning();

    if (existingStats) {
      return existingStats;
    }

    // Create new stats if none exist
    const [newStats] = await db
      .insert(playerStats)
      .values({ playerId, season, ...updates })
      .returning();
    return newStats;
  }

  // Team Stats
  async getTeamStats(teamId: number, season: number): Promise<TeamStats | undefined> {
    const [stats] = await db
      .select()
      .from(teamStats)
      .where(and(eq(teamStats.teamId, teamId), eq(teamStats.season, season)));
    return stats || undefined;
  }

  async getTeamStatsBySeason(season: number): Promise<TeamStats[]> {
    return await db
      .select()
      .from(teamStats)
      .where(eq(teamStats.season, season))
      .orderBy(desc(teamStats.points), desc(teamStats.wins));
  }

  async updateTeamStats(teamId: number, season: number, updates: Partial<InsertTeamStats>): Promise<TeamStats> {
    // Try to update existing stats
    const [existingStats] = await db
      .update(teamStats)
      .set(updates)
      .where(and(eq(teamStats.teamId, teamId), eq(teamStats.season, season)))
      .returning();

    if (existingStats) {
      return existingStats;
    }

    // Create new stats if none exist
    const [newStats] = await db
      .insert(teamStats)
      .values({ teamId, season, ...updates })
      .returning();
    return newStats;
  }

  // Lineups
  async getTeamLineups(teamId: number): Promise<Lineup[]> {
    return await db
      .select()
      .from(lineups)
      .where(and(eq(lineups.teamId, teamId), eq(lineups.isActive, true)));
  }

  async createLineup(insertLineup: InsertLineup): Promise<Lineup> {
    const [lineup] = await db.insert(lineups).values(insertLineup).returning();
    return lineup;
  }

  async updateLineup(id: number, updates: Partial<InsertLineup>): Promise<Lineup> {
    const [lineup] = await db.update(lineups).set(updates).where(eq(lineups.id, id)).returning();
    return lineup;
  }

  // Dashboard queries
  async getTopPerformers(season: number, limit: number = 10): Promise<any[]> {
    const result = await db
      .select({
        id: players.id,
        name: players.name,
        position: players.position,
        jerseyNumber: players.jerseyNumber,
        teamName: teams.name,
        gamesPlayed: playerStats.gamesPlayed,
        goals: playerStats.goals,
        assists: playerStats.assists,
        points: playerStats.points,
        plusMinus: playerStats.plusMinus
      })
      .from(playerStats)
      .innerJoin(players, eq(playerStats.playerId, players.id))
      .innerJoin(teams, eq(players.teamId, teams.id))
      .where(eq(playerStats.season, season))
      .orderBy(desc(playerStats.points))
      .limit(limit);

    return result;
  }

  async getUpcomingGames(teamId: number, limit: number = 5): Promise<any[]> {
    const result = await db
      .select({
        id: games.id,
        scheduledAt: games.scheduledAt,
        isHomeGame: sql<boolean>`${games.homeTeamId} = ${teamId}`,
        opponent: sql<{name: string, abbreviation: string}>`
          CASE 
            WHEN ${games.homeTeamId} = ${teamId} 
            THEN json_build_object('name', away_team.name, 'abbreviation', away_team.abbreviation)
            ELSE json_build_object('name', home_team.name, 'abbreviation', home_team.abbreviation)
          END
        `
      })
      .from(games)
      .leftJoin(teams, sql`teams.id = CASE WHEN ${games.homeTeamId} = ${teamId} THEN ${games.awayTeamId} ELSE ${games.homeTeamId} END`)
      .where(
        and(
          sql`${games.homeTeamId} = ${teamId} OR ${games.awayTeamId} = ${teamId}`,
          eq(games.status, "scheduled")
        )
      )
      .orderBy(games.scheduledAt)
      .limit(limit);

    return result;
  }

  async getTeamAnalytics(teamId: number, season: number): Promise<any> {
    const [stats] = await db
      .select()
      .from(teamStats)
      .where(and(eq(teamStats.teamId, teamId), eq(teamStats.season, season)));

    if (!stats) {
      return {
        shots: 0,
        possession: 50,
        powerPlay: 0,
        penaltyKill: 0,
        faceoffWins: 0
      };
    }

    const shotPercentage = stats.shotsFor > 0 ? (stats.shotsFor / (stats.shotsFor + stats.shotsAgainst)) * 100 : 0;
    const powerPlayPercentage = stats.powerPlayOpportunities > 0 ? (stats.powerPlayGoals / stats.powerPlayOpportunities) * 100 : 0;
    const penaltyKillPercentage = stats.penaltyKillOpportunities > 0 ? ((stats.penaltyKillOpportunities - stats.penaltyKillGoalsAgainst) / stats.penaltyKillOpportunities) * 100 : 0;
    const faceoffPercentage = (stats.faceoffWins + stats.faceoffLosses) > 0 ? (stats.faceoffWins / (stats.faceoffWins + stats.faceoffLosses)) * 100 : 0;

    return {
      shots: Math.round(shotPercentage * 10) / 10,
      possession: 52.8, // This would need more complex tracking
      powerPlay: Math.round(powerPlayPercentage * 10) / 10,
      penaltyKill: Math.round(penaltyKillPercentage * 10) / 10,
      faceoffWins: Math.round(faceoffPercentage * 10) / 10
    };
  }
}

export const storage = new DatabaseStorage();
