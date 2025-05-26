import { pgTable, text, serial, integer, real, boolean, timestamp, varchar, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Teams table
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  abbreviation: varchar("abbreviation", { length: 3 }).notNull(),
  city: text("city").notNull(),
  conference: text("conference").notNull(), // "Eastern" or "Western"
  division: text("division").notNull(),
  strategy: text("strategy").notNull().default("balanced"), // "offensive", "defensive", "balanced", "physical"
  lineMatching: text("line_matching").notNull().default("auto"), // "auto", "energy", "skill", "manual"
  budget: integer("budget").notNull().default(80000000), // Salary cap
  morale: integer("morale").notNull().default(50), // 0-100
  createdAt: timestamp("created_at").defaultNow()
});

// Players table
export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").references(() => teams.id),
  name: text("name").notNull(),
  position: text("position").notNull(), // "C", "LW", "RW", "D", "G"
  jerseyNumber: integer("jersey_number").notNull(),
  age: integer("age").notNull(),
  salary: integer("salary").notNull(),
  contractYears: integer("contract_years").notNull(),
  
  // Core attributes (0-100)
  skating: integer("skating").notNull(),
  shooting: integer("shooting").notNull(),
  passing: integer("passing").notNull(),
  defense: integer("defense").notNull(),
  physicality: integer("physicality").notNull(),
  hockey_iq: integer("hockey_iq").notNull(),
  
  // Current state
  energy: integer("energy").notNull().default(100), // 0-100
  morale: integer("morale").notNull().default(50), // 0-100
  injured: boolean("injured").notNull().default(false),
  injuryDays: integer("injury_days").notNull().default(0),
  
  // Development
  potential: integer("potential").notNull(), // 0-100, max possible skill
  development: text("development").notNull().default("normal"), // "slow", "normal", "fast"
  
  createdAt: timestamp("created_at").defaultNow()
});

// Games table
export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  season: integer("season").notNull(),
  gameNumber: integer("game_number").notNull(),
  homeTeamId: integer("home_team_id").references(() => teams.id).notNull(),
  awayTeamId: integer("away_team_id").references(() => teams.id).notNull(),
  homeScore: integer("home_score").notNull().default(0),
  awayScore: integer("away_score").notNull().default(0),
  period: integer("period").notNull().default(1),
  timeRemaining: integer("time_remaining").notNull().default(1200), // seconds
  status: text("status").notNull().default("scheduled"), // "scheduled", "live", "completed"
  gameData: json("game_data"), // Store detailed game state
  playByPlay: json("play_by_play"), // Store play-by-play events
  scheduledAt: timestamp("scheduled_at").notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow()
});

// Game events for play-by-play
export const gameEvents = pgTable("game_events", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").references(() => games.id).notNull(),
  period: integer("period").notNull(),
  timeInPeriod: integer("time_in_period").notNull(), // seconds elapsed in period
  eventType: text("event_type").notNull(), // "goal", "shot", "save", "turnover", "penalty", "faceoff"
  teamId: integer("team_id").references(() => teams.id),
  playerId: integer("player_id").references(() => players.id),
  assistPlayer1Id: integer("assist_player_1_id").references(() => players.id),
  assistPlayer2Id: integer("assist_player_2_id").references(() => players.id),
  description: text("description").notNull(),
  eventData: json("event_data"), // Additional event-specific data
  createdAt: timestamp("created_at").defaultNow()
});

// Player statistics
export const playerStats = pgTable("player_stats", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").references(() => players.id).notNull(),
  season: integer("season").notNull(),
  gamesPlayed: integer("games_played").notNull().default(0),
  goals: integer("goals").notNull().default(0),
  assists: integer("assists").notNull().default(0),
  points: integer("points").notNull().default(0),
  plusMinus: integer("plus_minus").notNull().default(0),
  shotsOnGoal: integer("shots_on_goal").notNull().default(0),
  hits: integer("hits").notNull().default(0),
  blockedShots: integer("blocked_shots").notNull().default(0),
  faceoffWins: integer("faceoff_wins").notNull().default(0),
  faceoffLosses: integer("faceoff_losses").notNull().default(0),
  penaltyMinutes: integer("penalty_minutes").notNull().default(0),
  powerPlayGoals: integer("power_play_goals").notNull().default(0),
  shortHandedGoals: integer("short_handed_goals").notNull().default(0),
  gameWinningGoals: integer("game_winning_goals").notNull().default(0),
  
  // Goalie specific stats
  saves: integer("saves").notNull().default(0),
  goalsAgainst: integer("goals_against").notNull().default(0),
  shutouts: integer("shutouts").notNull().default(0),
  wins: integer("wins").notNull().default(0),
  losses: integer("losses").notNull().default(0),
  overtimeLosses: integer("overtime_losses").notNull().default(0),
  
  createdAt: timestamp("created_at").defaultNow()
});

// Team statistics
export const teamStats = pgTable("team_stats", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").references(() => teams.id).notNull(),
  season: integer("season").notNull(),
  gamesPlayed: integer("games_played").notNull().default(0),
  wins: integer("wins").notNull().default(0),
  losses: integer("losses").notNull().default(0),
  overtimeLosses: integer("overtime_losses").notNull().default(0),
  points: integer("points").notNull().default(0),
  goalsFor: integer("goals_for").notNull().default(0),
  goalsAgainst: integer("goals_against").notNull().default(0),
  shotsFor: integer("shots_for").notNull().default(0),
  shotsAgainst: integer("shots_against").notNull().default(0),
  powerPlayGoals: integer("power_play_goals").notNull().default(0),
  powerPlayOpportunities: integer("power_play_opportunities").notNull().default(0),
  penaltyKillGoalsAgainst: integer("penalty_kill_goals_against").notNull().default(0),
  penaltyKillOpportunities: integer("penalty_kill_opportunities").notNull().default(0),
  faceoffWins: integer("faceoff_wins").notNull().default(0),
  faceoffLosses: integer("faceoff_losses").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow()
});

// Line combinations
export const lineups = pgTable("lineups", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").references(() => teams.id).notNull(),
  lineNumber: integer("line_number").notNull(), // 1-4 for forward lines, 1-3 for defense pairs
  lineType: text("line_type").notNull(), // "forward", "defense"
  centerId: integer("center_id").references(() => players.id),
  leftWingId: integer("left_wing_id").references(() => players.id),
  rightWingId: integer("right_wing_id").references(() => players.id),
  leftDefenseId: integer("left_defense_id").references(() => players.id),
  rightDefenseId: integer("right_defense_id").references(() => players.id),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow()
});

// Relations
export const teamsRelations = relations(teams, ({ many, one }) => ({
  players: many(players),
  homeGames: many(games, { relationName: "homeTeam" }),
  awayGames: many(games, { relationName: "awayTeam" }),
  teamStats: many(teamStats),
  lineups: many(lineups)
}));

export const playersRelations = relations(players, ({ one, many }) => ({
  team: one(teams, {
    fields: [players.teamId],
    references: [teams.id]
  }),
  stats: many(playerStats),
  gameEvents: many(gameEvents)
}));

export const gamesRelations = relations(games, ({ one, many }) => ({
  homeTeam: one(teams, {
    fields: [games.homeTeamId],
    references: [teams.id],
    relationName: "homeTeam"
  }),
  awayTeam: one(teams, {
    fields: [games.awayTeamId],
    references: [teams.id],
    relationName: "awayTeam"
  }),
  events: many(gameEvents)
}));

export const gameEventsRelations = relations(gameEvents, ({ one }) => ({
  game: one(games, {
    fields: [gameEvents.gameId],
    references: [games.id]
  }),
  team: one(teams, {
    fields: [gameEvents.teamId],
    references: [teams.id]
  }),
  player: one(players, {
    fields: [gameEvents.playerId],
    references: [players.id]
  })
}));

export const playerStatsRelations = relations(playerStats, ({ one }) => ({
  player: one(players, {
    fields: [playerStats.playerId],
    references: [players.id]
  })
}));

export const teamStatsRelations = relations(teamStats, ({ one }) => ({
  team: one(teams, {
    fields: [teamStats.teamId],
    references: [teams.id]
  })
}));

export const lineupsRelations = relations(lineups, ({ one }) => ({
  team: one(teams, {
    fields: [lineups.teamId],
    references: [teams.id]
  }),
  center: one(players, {
    fields: [lineups.centerId],
    references: [players.id],
    relationName: "centerPlayer"
  }),
  leftWing: one(players, {
    fields: [lineups.leftWingId],
    references: [players.id],
    relationName: "leftWingPlayer"
  }),
  rightWing: one(players, {
    fields: [lineups.rightWingId],
    references: [players.id],
    relationName: "rightWingPlayer"
  }),
  leftDefense: one(players, {
    fields: [lineups.leftDefenseId],
    references: [players.id],
    relationName: "leftDefensePlayer"
  }),
  rightDefense: one(players, {
    fields: [lineups.rightDefenseId],
    references: [players.id],
    relationName: "rightDefensePlayer"
  })
}));

// Insert schemas
export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true
});

export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
  createdAt: true
});

export const insertGameSchema = createInsertSchema(games).omit({
  id: true,
  createdAt: true
});

export const insertGameEventSchema = createInsertSchema(gameEvents).omit({
  id: true,
  createdAt: true
});

export const insertPlayerStatsSchema = createInsertSchema(playerStats).omit({
  id: true,
  createdAt: true
});

export const insertTeamStatsSchema = createInsertSchema(teamStats).omit({
  id: true,
  createdAt: true
});

export const insertLineupSchema = createInsertSchema(lineups).omit({
  id: true,
  createdAt: true
});

// Types
export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;

export type Player = typeof players.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;

export type Game = typeof games.$inferSelect;
export type InsertGame = z.infer<typeof insertGameSchema>;

export type GameEvent = typeof gameEvents.$inferSelect;
export type InsertGameEvent = z.infer<typeof insertGameEventSchema>;

export type PlayerStats = typeof playerStats.$inferSelect;
export type InsertPlayerStats = z.infer<typeof insertPlayerStatsSchema>;

export type TeamStats = typeof teamStats.$inferSelect;
export type InsertTeamStats = z.infer<typeof insertTeamStatsSchema>;

export type Lineup = typeof lineups.$inferSelect;
export type InsertLineup = z.infer<typeof insertLineupSchema>;
