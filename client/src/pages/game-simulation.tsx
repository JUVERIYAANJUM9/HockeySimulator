import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LiveGame from "@/components/game-simulation/live-game";
import { 
  Play, 
  Calendar, 
  Trophy, 
  Clock,
  TrendingUp,
  Users,
  Target
} from "lucide-react";

export default function GameSimulation() {
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState("live");

  const { data: liveGames, isLoading: liveGamesLoading } = useQuery({
    queryKey: ["/api/games", { status: "live" }]
  });

  const { data: scheduledGames } = useQuery({
    queryKey: ["/api/games", { status: "scheduled" }]
  });

  const { data: completedGames } = useQuery({
    queryKey: ["/api/games", { status: "completed" }]
  });

  const { data: teams } = useQuery({
    queryKey: ["/api/teams"]
  });

  const getTeamName = (teamId: number) => {
    return teams?.find((t: any) => t.id === teamId)?.name || "Unknown Team";
  };

  const getTeamAbbr = (teamId: number) => {
    return teams?.find((t: any) => t.id === teamId)?.abbreviation || "UNK";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  };

  if (liveGamesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hockey-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading game simulation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Play className="h-6 w-6 mr-3" />
              Game Simulation
            </h2>
            <p className="text-gray-600 mt-1">
              Simulate games in real-time with detailed play-by-play coverage
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={viewMode} onValueChange={setViewMode}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="live">Live Games</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-hockey-light hover:bg-hockey-blue">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Game
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Game Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Live Games</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{liveGames?.length || 0}</p>
                  <p className="text-green-600 text-sm mt-1">Active now</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Play className="text-green-600 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Scheduled</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{scheduledGames?.length || 0}</p>
                  <p className="text-blue-600 text-sm mt-1">Upcoming</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="text-blue-600 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Completed</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{completedGames?.length || 0}</p>
                  <p className="text-gray-600 text-sm mt-1">This season</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Trophy className="text-gray-600 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Game Simulation */}
          <div className="lg:col-span-2">
            {selectedGameId || (liveGames && liveGames.length > 0) ? (
              <LiveGame gameId={selectedGameId || liveGames[0]?.id} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Game Simulation
                    <Badge variant="outline">
                      <Clock className="h-3 w-3 mr-1" />
                      No Active Game
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Games</h3>
                    <p className="text-gray-600 mb-4">
                      Start a new game simulation or select a scheduled game to begin
                    </p>
                    <Button className="bg-hockey-light hover:bg-hockey-blue">
                      <Play className="h-4 w-4 mr-2" />
                      Start New Simulation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Game List Sidebar */}
          <div className="space-y-6">
            <Tabs value={viewMode} onValueChange={setViewMode}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="live">Live</TabsTrigger>
                <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                <TabsTrigger value="completed">Results</TabsTrigger>
              </TabsList>

              <TabsContent value="live" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Live Games</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {liveGames && liveGames.length > 0 ? (
                      <div className="space-y-3">
                        {liveGames.map((game: any) => (
                          <div
                            key={game.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                              selectedGameId === game.id 
                                ? "border-hockey-blue bg-blue-50" 
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() => setSelectedGameId(game.id)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <Badge className="bg-green-100 text-green-800">
                                <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                                LIVE
                              </Badge>
                              <span className="text-sm text-gray-600">
                                {game.period}P {Math.floor(game.timeRemaining / 60)}:{(game.timeRemaining % 60).toString().padStart(2, '0')}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-sm">
                                <div className="font-medium">{getTeamAbbr(game.awayTeamId)} @ {getTeamAbbr(game.homeTeamId)}</div>
                              </div>
                              <div className="text-lg font-bold">
                                {game.awayScore} - {game.homeScore}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Play className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">No live games</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="scheduled" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Upcoming Games</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {scheduledGames && scheduledGames.length > 0 ? (
                      <div className="space-y-3">
                        {scheduledGames.slice(0, 10).map((game: any) => (
                          <div
                            key={game.id}
                            className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer transition-colors"
                            onClick={() => setSelectedGameId(game.id)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="outline">Scheduled</Badge>
                              <span className="text-sm text-gray-600">
                                {formatDate(game.scheduledAt)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-medium">
                                {getTeamAbbr(game.awayTeamId)} @ {getTeamAbbr(game.homeTeamId)}
                              </div>
                              <Button size="sm" variant="ghost">
                                <Play className="h-3 w-3 mr-1" />
                                Start
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">No scheduled games</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="completed" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {completedGames && completedGames.length > 0 ? (
                      <div className="space-y-3">
                        {completedGames.slice(0, 10).map((game: any) => (
                          <div
                            key={game.id}
                            className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="secondary">Final</Badge>
                              <span className="text-sm text-gray-600">
                                {formatDate(game.completedAt || game.scheduledAt)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="text-sm">
                                <div className="font-medium">{getTeamAbbr(game.awayTeamId)} @ {getTeamAbbr(game.homeTeamId)}</div>
                              </div>
                              <div className="text-lg font-bold">
                                {game.awayScore} - {game.homeScore}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500">No completed games</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Simulation Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Simulation Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Simulation Speed</label>
                  <Select defaultValue="normal">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slow">Slow (5s per event)</SelectItem>
                      <SelectItem value="normal">Normal (3s per event)</SelectItem>
                      <SelectItem value="fast">Fast (1s per event)</SelectItem>
                      <SelectItem value="instant">Instant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Detail Level</label>
                  <Select defaultValue="detailed">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minimal">Goals Only</SelectItem>
                      <SelectItem value="basic">Major Events</SelectItem>
                      <SelectItem value="detailed">All Events</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Auto-pause on</label>
                  <Select defaultValue="goals">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="never">Never</SelectItem>
                      <SelectItem value="goals">Goals</SelectItem>
                      <SelectItem value="periods">Period Ends</SelectItem>
                      <SelectItem value="penalties">Penalties</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
