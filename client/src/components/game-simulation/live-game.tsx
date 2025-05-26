import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import PlayByPlay from "./play-by-play";
import { apiRequest } from "@/lib/queryClient";
import { useGameSimulation } from "@/hooks/use-game-simulation";
import { 
  Play, 
  Pause, 
  FastForward, 
  Square,
  Clock,
  Activity
} from "lucide-react";

interface LiveGameProps {
  gameId?: number;
}

export default function LiveGame({ gameId }: LiveGameProps) {
  const queryClient = useQueryClient();
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  
  const { data: game, isLoading } = useQuery({
    queryKey: ["/api/games", gameId],
    enabled: !!gameId
  });

  const { data: homeTeam } = useQuery({
    queryKey: ["/api/teams", game?.homeTeamId],
    enabled: !!game?.homeTeamId
  });

  const { data: awayTeam } = useQuery({
    queryKey: ["/api/teams", game?.awayTeamId],
    enabled: !!game?.awayTeamId
  });

  const { data: gameEvents } = useQuery({
    queryKey: ["/api/games", gameId, "events"],
    enabled: !!gameId,
    refetchInterval: isSimulationRunning ? 2000 : false
  });

  const { simulateGameEvent } = useGameSimulation();

  const startSimulationMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/games/${gameId}/simulate`),
    onSuccess: () => {
      setIsSimulationRunning(true);
      queryClient.invalidateQueries({ queryKey: ["/api/games", gameId] });
    }
  });

  const pauseSimulationMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/games/${gameId}/pause`),
    onSuccess: () => {
      setIsSimulationRunning(false);
      queryClient.invalidateQueries({ queryKey: ["/api/games", gameId] });
    }
  });

  const resumeSimulationMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/games/${gameId}/resume`),
    onSuccess: () => {
      setIsSimulationRunning(true);
      queryClient.invalidateQueries({ queryKey: ["/api/games", gameId] });
    }
  });

  // Auto-simulation effect
  useEffect(() => {
    if (!isSimulationRunning || !gameId || !game) return;

    const interval = setInterval(() => {
      if (game.timeRemaining > 0 && game.status === "live") {
        simulateGameEvent(gameId, game);
      } else {
        setIsSimulationRunning(false);
      }
    }, 3000); // Event every 3 seconds

    return () => clearInterval(interval);
  }, [isSimulationRunning, gameId, game, simulateGameEvent]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading || !game) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Live Game Simulation
            <Badge variant="outline">
              <Activity className="h-3 w-3 mr-1" />
              No Active Game
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-gray-500">No game currently active</p>
            <Button className="mt-4">Start New Game</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Live Game Simulation</CardTitle>
          <Badge variant={game.status === "live" ? "default" : "secondary"} className="flex items-center">
            <div className={`w-1.5 h-1.5 rounded-full mr-2 ${game.status === "live" ? "bg-green-400 animate-pulse" : "bg-gray-400"}`}></div>
            {game.status === "live" ? "LIVE" : game.status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Hockey Rink Overview */}
        <div className="relative bg-ice-pattern rounded-xl p-8 rink-background">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="text-center">
                <h4 className="text-xl font-bold text-gray-800">{homeTeam?.name || "Home Team"}</h4>
                <p className="text-gray-600 text-sm">{homeTeam?.city}</p>
              </div>
              
              <div className="bg-white/90 backdrop-blur-sm rounded-lg px-6 py-3 shadow-sm">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {game.homeScore} - {game.awayScore}
                  </div>
                  <div className="text-sm text-gray-600 mt-1 flex items-center justify-center">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{game.period === 4 ? "OT" : `${game.period}${game.period === 1 ? "st" : game.period === 2 ? "nd" : "rd"} Period`}</span>
                    <span className="mx-2">•</span>
                    <span>{formatTime(game.timeRemaining)}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <h4 className="text-xl font-bold text-gray-800">{awayTeam?.name || "Away Team"}</h4>
                <p className="text-gray-600 text-sm">{awayTeam?.city}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Play-by-Play Feed */}
        <PlayByPlay events={gameEvents || []} />

        {/* Game Controls */}
        <div className="flex items-center justify-center space-x-4">
          {game.status === "live" ? (
            <>
              <Button 
                onClick={() => pauseSimulationMutation.mutate()}
                disabled={pauseSimulationMutation.isPending}
                variant="outline"
                className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200"
              >
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
              <Button 
                onClick={() => setIsSimulationRunning(!isSimulationRunning)}
                className={isSimulationRunning ? "bg-orange-600 hover:bg-orange-700" : "bg-green-600 hover:bg-green-700"}
              >
                <FastForward className="h-4 w-4 mr-2" />
                {isSimulationRunning ? "Stop Fast Forward" : "Fast Forward"}
              </Button>
            </>
          ) : game.status === "paused" ? (
            <Button 
              onClick={() => resumeSimulationMutation.mutate()}
              disabled={resumeSimulationMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              <Play className="h-4 w-4 mr-2" />
              Resume
            </Button>
          ) : (
            <Button 
              onClick={() => startSimulationMutation.mutate()}
              disabled={startSimulationMutation.isPending}
              className="bg-hockey-light hover:bg-hockey-blue"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Game
            </Button>
          )}
        </div>

        {/* Game Progress */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Period Progress</span>
            <span className="text-sm text-gray-600">
              {Math.max(0, 1200 - game.timeRemaining)}s / 1200s
            </span>
          </div>
          <Progress 
            value={(Math.max(0, 1200 - game.timeRemaining) / 1200) * 100} 
            className="h-2"
          />
        </div>
      </CardContent>
    </Card>
  );
}
