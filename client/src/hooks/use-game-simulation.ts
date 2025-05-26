import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { simulationEngine } from "@/lib/simulation-engine";
import { useToast } from "@/hooks/use-toast";

export function useGameSimulation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createGameEventMutation = useMutation({
    mutationFn: ({ gameId, event }: { gameId: number; event: any }) =>
      apiRequest("POST", `/api/games/${gameId}/events`, event),
    onSuccess: (_, { gameId }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/games", gameId, "events"] });
    }
  });

  const updateGameMutation = useMutation({
    mutationFn: ({ gameId, updates }: { gameId: number; updates: any }) =>
      apiRequest("PATCH", `/api/games/${gameId}`, updates),
    onSuccess: (_, { gameId }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/games", gameId] });
    }
  });

  const simulateGameEvent = async (gameId: number, game: any) => {
    try {
      // Get team data
      const homeTeamResponse = await fetch(`/api/teams/${game.homeTeamId}`);
      const homeTeam = await homeTeamResponse.json();
      
      const awayTeamResponse = await fetch(`/api/teams/${game.awayTeamId}`);
      const awayTeam = await awayTeamResponse.json();

      // Get players for both teams
      const homePlayersResponse = await fetch(`/api/players?teamId=${game.homeTeamId}`);
      const homePlayers = await homePlayersResponse.json();
      
      const awayPlayersResponse = await fetch(`/api/players?teamId=${game.awayTeamId}`);
      const awayPlayers = await awayPlayersResponse.json();

      const homeTeamData = { ...homeTeam, players: homePlayers };
      const awayTeamData = { ...awayTeam, players: awayPlayers };

      // Simulate event
      const event = simulationEngine.simulateEvent(game, homeTeamData, awayTeamData);
      
      if (event) {
        // Create the event
        await createGameEventMutation.mutateAsync({
          gameId,
          event: {
            period: event.period,
            timeInPeriod: event.timeInPeriod,
            eventType: event.type,
            teamId: event.teamId,
            playerId: event.playerId,
            assistPlayer1Id: event.assistPlayer1Id,
            assistPlayer2Id: event.assistPlayer2Id,
            description: event.description
          }
        });

        // Update game state
        let gameUpdates: any = {};

        // Update scores for goals
        if (event.type === "goal") {
          if (event.teamId === game.homeTeamId) {
            gameUpdates.homeScore = game.homeScore + 1;
          } else {
            gameUpdates.awayScore = game.awayScore + 1;
          }

          toast({
            title: "⚡ GOAL!",
            description: event.description,
            duration: 3000,
          });
        }

        // Simulate time progression
        const timeUpdates = simulationEngine.simulateTimeStep(game, Math.floor(Math.random() * 30) + 10);
        gameUpdates = { ...gameUpdates, ...timeUpdates };

        // Check if game is complete
        const updatedGame = { ...game, ...gameUpdates };
        if (simulationEngine.isGameComplete(updatedGame)) {
          gameUpdates.status = "completed";
          gameUpdates.completedAt = new Date().toISOString();
          
          toast({
            title: "Game Complete!",
            description: `Final Score: ${updatedGame.homeScore} - ${updatedGame.awayScore}`,
            duration: 5000,
          });
        }

        // Update the game
        if (Object.keys(gameUpdates).length > 0) {
          await updateGameMutation.mutateAsync({ gameId, updates: gameUpdates });
        }
      }
    } catch (error) {
      console.error("Simulation error:", error);
      toast({
        title: "Simulation Error",
        description: "Failed to simulate game event",
        variant: "destructive",
      });
    }
  };

  return {
    simulateGameEvent,
    isSimulating: createGameEventMutation.isPending || updateGameMutation.isPending
  };
}
