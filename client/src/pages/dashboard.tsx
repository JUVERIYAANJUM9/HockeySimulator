import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import LiveGame from "@/components/game-simulation/live-game";
import { 
  Trophy, 
  Medal, 
  Target, 
  Smile, 
  ArrowUp, 
  Play, 
  Save,
  TrendingUp,
  Calendar,
  Users
} from "lucide-react";
import { useState } from "react";

export default function Dashboard() {
  const [selectedTeamId] = useState(1); // Default to first team
  const currentSeason = 2024;

  const { data: teams, isLoading: teamsLoading } = useQuery({
    queryKey: ["/api/teams"]
  });

  const { data: topPerformers, isLoading: performersLoading } = useQuery({
    queryKey: ["/api/dashboard/top-performers", { season: currentSeason, limit: 5 }]
  });

  const { data: upcomingGames, isLoading: gamesLoading } = useQuery({
    queryKey: ["/api/dashboard/upcoming-games", selectedTeamId, { limit: 3 }]
  });

  const { data: teamAnalytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["/api/dashboard/analytics", selectedTeamId, { season: currentSeason }]
  });

  const { data: teamStats } = useQuery({
    queryKey: ["/api/stats/teams", { season: currentSeason }]
  });

  const { data: currentGames } = useQuery({
    queryKey: ["/api/games", { status: "live" }]
  });

  if (teamsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hockey-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Hockey Manager...</p>
        </div>
      </div>
    );
  }

  const currentTeam = teams?.find((t: any) => t.id === selectedTeamId);
  const currentTeamStats = teamStats?.find((s: any) => s.teamId === selectedTeamId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
            <p className="text-gray-600 mt-1">Season 2024-2025 • Game {currentTeamStats?.gamesPlayed || 0} of 82</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button className="bg-hockey-light hover:bg-hockey-blue">
              <Play className="h-4 w-4 mr-2" />
              Simulate Next Game
            </Button>
            <Button variant="outline">
              <Save className="h-4 w-4 mr-2" />
              Save Game
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Team Record</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {currentTeamStats ? `${currentTeamStats.wins}-${currentTeamStats.losses}-${currentTeamStats.overtimeLosses}` : "0-0-0"}
                  </p>
                  <p className="text-green-600 text-sm font-medium mt-1 flex items-center">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    Good form
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Trophy className="text-green-600 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">League Position</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">2nd</p>
                  <p className="text-gray-600 text-sm mt-1">Eastern Conference</p>
                </div>
                <div className="w-12 h-12 bg-hockey-light/10 rounded-lg flex items-center justify-center">
                  <Medal className="text-hockey-light h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Goals Per Game</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {currentTeamStats ? (currentTeamStats.goalsFor / Math.max(currentTeamStats.gamesPlayed, 1)).toFixed(2) : "0.00"}
                  </p>
                  <p className="text-green-600 text-sm font-medium mt-1 flex items-center">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    +0.15 from last 10
                  </p>
                </div>
                <div className="w-12 h-12 bg-hockey-red/10 rounded-lg flex items-center justify-center">
                  <Target className="text-hockey-red h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Team Morale</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {currentTeam?.morale > 70 ? "High" : currentTeam?.morale > 40 ? "Good" : "Low"}
                  </p>
                  <p className="text-green-600 text-sm font-medium mt-1">
                    {currentTeam?.morale || 50}/100
                  </p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Smile className="text-amber-600 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Game Simulation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <LiveGame gameId={currentGames?.[0]?.id} />
          </div>

          {/* Team Analytics */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Performance Analytics
                  <Button variant="ghost" size="sm" className="text-hockey-light hover:text-hockey-blue">
                    View Details
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {!analyticsLoading && teamAnalytics && (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Shot Attempts</span>
                        <span className="text-sm text-gray-900">{teamAnalytics.shots.toFixed(1)}%</span>
                      </div>
                      <Progress value={teamAnalytics.shots} className="h-2" />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Possession Time</span>
                        <span className="text-sm text-gray-900">{teamAnalytics.possession.toFixed(1)}%</span>
                      </div>
                      <Progress value={teamAnalytics.possession} className="h-2" />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Power Play %</span>
                        <span className="text-sm text-gray-900">{teamAnalytics.powerPlay.toFixed(1)}%</span>
                      </div>
                      <Progress value={teamAnalytics.powerPlay} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{teamAnalytics.faceoffWins.toFixed(1)}%</p>
                        <p className="text-xs text-gray-600">Faceoff Wins</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{teamAnalytics.penaltyKill.toFixed(1)}%</p>
                        <p className="text-xs text-gray-600">Penalty Kill</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Games */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Upcoming Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!gamesLoading && upcomingGames?.length > 0 ? (
                  upcomingGames.map((game: any, index: number) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-xs font-bold text-gray-600">
                            {game.opponent?.abbreviation || "TBD"}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {game.isHomeGame ? "vs" : "@"} {game.opponent?.name || "TBD"}
                          </p>
                          <p className="text-xs text-gray-600">
                            {new Date(game.scheduledAt).toLocaleDateString()} • 7:00 PM
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-hockey-light hover:text-hockey-blue">
                        Preview
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No upcoming games scheduled</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Top Performers Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Top Performers This Season
              </CardTitle>
              <Button variant="ghost" className="text-hockey-light hover:text-hockey-blue">
                View Full Roster
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GP</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Goals</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assists</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">+/-</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Form</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {!performersLoading && topPerformers?.length > 0 ? (
                    topPerformers.map((player: any) => (
                      <tr key={player.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600">
                                {player.name.split(' ').map((n: string) => n[0]).join('')}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{player.name}</div>
                              <div className="text-sm text-gray-500">#{player.jerseyNumber}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{player.position}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{player.gamesPlayed}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{player.goals}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{player.assists}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{player.points}</td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${player.plusMinus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {player.plusMinus >= 0 ? '+' : ''}{player.plusMinus}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={player.points > 20 ? "default" : "secondary"}>
                            {player.points > 30 ? "Hot" : player.points > 20 ? "Good" : "Steady"}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                        {performersLoading ? "Loading players..." : "No player data available"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
