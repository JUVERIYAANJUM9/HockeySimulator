import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTeamSchema, insertPlayerSchema, insertGameSchema, insertGameEventSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const currentSeason = 2024;

  // Teams
  app.get("/api/teams", async (req, res) => {
    try {
      const teams = await storage.getAllTeams();
      res.json(teams);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch teams" });
    }
  });

  app.get("/api/teams/:id", async (req, res) => {
    try {
      const team = await storage.getTeam(parseInt(req.params.id));
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      res.json(team);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch team" });
    }
  });

  app.post("/api/teams", async (req, res) => {
    try {
      const validatedTeam = insertTeamSchema.parse(req.body);
      const team = await storage.createTeam(validatedTeam);
      res.status(201).json(team);
    } catch (error) {
      res.status(400).json({ message: "Invalid team data" });
    }
  });

  app.patch("/api/teams/:id", async (req, res) => {
    try {
      const updates = insertTeamSchema.partial().parse(req.body);
      const team = await storage.updateTeam(parseInt(req.params.id), updates);
      res.json(team);
    } catch (error) {
      res.status(400).json({ message: "Invalid team data" });
    }
  });

  // Players
  app.get("/api/players", async (req, res) => {
    try {
      const teamId = req.query.teamId ? parseInt(req.query.teamId as string) : undefined;
      const players = teamId ? await storage.getPlayersByTeam(teamId) : await storage.getAllPlayers();
      res.json(players);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch players" });
    }
  });

  app.get("/api/players/:id", async (req, res) => {
    try {
      const player = await storage.getPlayer(parseInt(req.params.id));
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }
      res.json(player);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch player" });
    }
  });

  app.post("/api/players", async (req, res) => {
    try {
      const validatedPlayer = insertPlayerSchema.parse(req.body);
      const player = await storage.createPlayer(validatedPlayer);
      res.status(201).json(player);
    } catch (error) {
      res.status(400).json({ message: "Invalid player data" });
    }
  });

  app.patch("/api/players/:id", async (req, res) => {
    try {
      const updates = insertPlayerSchema.partial().parse(req.body);
      const player = await storage.updatePlayer(parseInt(req.params.id), updates);
      res.json(player);
    } catch (error) {
      res.status(400).json({ message: "Invalid player data" });
    }
  });

  // Games
  app.get("/api/games", async (req, res) => {
    try {
      const teamId = req.query.teamId ? parseInt(req.query.teamId as string) : undefined;
      const status = req.query.status as string;
      
      let games;
      if (status === "live") {
        games = await storage.getCurrentGames();
      } else if (teamId) {
        games = await storage.getGamesByTeam(teamId);
      } else {
        games = await storage.getCurrentGames();
      }
      
      res.json(games);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch games" });
    }
  });

  app.get("/api/games/:id", async (req, res) => {
    try {
      const game = await storage.getGame(parseInt(req.params.id));
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }
      res.json(game);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch game" });
    }
  });

  app.post("/api/games", async (req, res) => {
    try {
      const validatedGame = insertGameSchema.parse(req.body);
      const game = await storage.createGame(validatedGame);
      res.status(201).json(game);
    } catch (error) {
      res.status(400).json({ message: "Invalid game data" });
    }
  });

  app.patch("/api/games/:id", async (req, res) => {
    try {
      const updates = insertGameSchema.partial().parse(req.body);
      const game = await storage.updateGame(parseInt(req.params.id), updates);
      res.json(game);
    } catch (error) {
      res.status(400).json({ message: "Invalid game data" });
    }
  });

  // Game Events
  app.get("/api/games/:id/events", async (req, res) => {
    try {
      const events = await storage.getGameEvents(parseInt(req.params.id));
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch game events" });
    }
  });

  app.post("/api/games/:id/events", async (req, res) => {
    try {
      const validatedEvent = insertGameEventSchema.parse({
        ...req.body,
        gameId: parseInt(req.params.id)
      });
      const event = await storage.createGameEvent(validatedEvent);
      res.status(201).json(event);
    } catch (error) {
      res.status(400).json({ message: "Invalid event data" });
    }
  });

  // Statistics
  app.get("/api/stats/players", async (req, res) => {
    try {
      const season = req.query.season ? parseInt(req.query.season as string) : currentSeason;
      const stats = await storage.getPlayerStatsBySeason(season);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch player stats" });
    }
  });

  app.get("/api/stats/teams", async (req, res) => {
    try {
      const season = req.query.season ? parseInt(req.query.season as string) : currentSeason;
      const stats = await storage.getTeamStatsBySeason(season);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch team stats" });
    }
  });

  // Dashboard data
  app.get("/api/dashboard/top-performers", async (req, res) => {
    try {
      const season = req.query.season ? parseInt(req.query.season as string) : currentSeason;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const performers = await storage.getTopPerformers(season, limit);
      res.json(performers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch top performers" });
    }
  });

  app.get("/api/dashboard/upcoming-games/:teamId", async (req, res) => {
    try {
      const teamId = parseInt(req.params.teamId);
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const games = await storage.getUpcomingGames(teamId, limit);
      res.json(games);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch upcoming games" });
    }
  });

  app.get("/api/dashboard/analytics/:teamId", async (req, res) => {
    try {
      const teamId = parseInt(req.params.teamId);
      const season = req.query.season ? parseInt(req.query.season as string) : currentSeason;
      const analytics = await storage.getTeamAnalytics(teamId, season);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch team analytics" });
    }
  });

  // Lineups
  app.get("/api/teams/:id/lineups", async (req, res) => {
    try {
      const lineups = await storage.getTeamLineups(parseInt(req.params.id));
      res.json(lineups);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lineups" });
    }
  });

  // Game simulation controls
  app.post("/api/games/:id/simulate", async (req, res) => {
    try {
      const gameId = parseInt(req.params.id);
      const game = await storage.getGame(gameId);
      
      if (!game) {
        return res.status(404).json({ message: "Game not found" });
      }

      // Update game status to live
      const updatedGame = await storage.updateGame(gameId, { status: "live" });
      res.json(updatedGame);
    } catch (error) {
      res.status(500).json({ message: "Failed to start simulation" });
    }
  });

  app.post("/api/games/:id/pause", async (req, res) => {
    try {
      const gameId = parseInt(req.params.id);
      const game = await storage.updateGame(gameId, { status: "paused" });
      res.json(game);
    } catch (error) {
      res.status(500).json({ message: "Failed to pause simulation" });
    }
  });

  app.post("/api/games/:id/resume", async (req, res) => {
    try {
      const gameId = parseInt(req.params.id);
      const game = await storage.updateGame(gameId, { status: "live" });
      res.json(game);
    } catch (error) {
      res.status(500).json({ message: "Failed to resume simulation" });
    }
  });

  // Initialize demo data
  app.post("/api/initialize", async (req, res) => {
    try {
      // Create demo teams
      const bruins = await storage.createTeam({
        name: "Boston Bruins",
        abbreviation: "BOS",
        city: "Boston",
        conference: "Eastern",
        division: "Atlantic",
        strategy: "balanced",
        lineMatching: "auto",
        budget: 82000000,
        morale: 87
      });

      const leafs = await storage.createTeam({
        name: "Toronto Maple Leafs",
        abbreviation: "TOR",
        city: "Toronto",
        conference: "Eastern",
        division: "Atlantic",
        strategy: "offensive",
        lineMatching: "skill",
        budget: 82000000,
        morale: 76
      });

      // Create demo players for Bruins
      const bruinsPlayers = [
        { name: "David Pastrnak", position: "RW", jerseyNumber: 88, age: 27, salary: 11250000, contractYears: 6, skating: 85, shooting: 95, passing: 85, defense: 70, physicality: 75, hockey_iq: 90, potential: 95, teamId: bruins.id },
        { name: "Brad Marchand", position: "LW", jerseyNumber: 63, age: 35, salary: 6125000, contractYears: 2, skating: 80, shooting: 85, passing: 90, defense: 75, physicality: 85, hockey_iq: 95, potential: 90, teamId: bruins.id },
        { name: "Patrice Bergeron", position: "C", jerseyNumber: 37, age: 38, salary: 5000000, contractYears: 1, skating: 75, shooting: 80, passing: 95, defense: 95, physicality: 70, hockey_iq: 98, potential: 95, teamId: bruins.id },
        { name: "Charlie McAvoy", position: "D", jerseyNumber: 73, age: 25, salary: 9500000, contractYears: 7, skating: 90, shooting: 75, passing: 85, defense: 90, physicality: 85, hockey_iq: 85, potential: 92, teamId: bruins.id },
        { name: "Tuukka Rask", position: "G", jerseyNumber: 40, age: 36, salary: 5000000, contractYears: 1, skating: 70, shooting: 50, passing: 70, defense: 95, physicality: 70, hockey_iq: 90, potential: 90, teamId: bruins.id }
      ];

      for (const player of bruinsPlayers) {
        await storage.createPlayer(player);
      }

      // Initialize team stats
      await storage.updateTeamStats(bruins.id, currentSeason, {
        gamesPlayed: 23,
        wins: 15,
        losses: 6,
        overtimeLosses: 2,
        points: 32,
        goalsFor: 79,
        goalsAgainst: 65,
        shotsFor: 580,
        shotsAgainst: 520,
        powerPlayGoals: 18,
        powerPlayOpportunities: 75,
        penaltyKillGoalsAgainst: 12,
        penaltyKillOpportunities: 68,
        faceoffWins: 765,
        faceoffLosses: 645
      });

      // Create a demo game
      const demoGame = await storage.createGame({
        season: currentSeason,
        gameNumber: 24,
        homeTeamId: bruins.id,
        awayTeamId: leafs.id,
        homeScore: 2,
        awayScore: 1,
        period: 2,
        timeRemaining: 754,
        status: "live",
        scheduledAt: new Date(),
        gameData: {
          homeLineup: { line1: [1, 2, 3], defense1: [4], goalie: 5 },
          awayLineup: { line1: [], defense1: [], goalie: null }
        },
        playByPlay: []
      });

      res.json({ message: "Demo data initialized successfully", teams: [bruins, leafs], game: demoGame });
    } catch (error) {
      console.error("Initialization error:", error);
      res.status(500).json({ message: "Failed to initialize demo data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
