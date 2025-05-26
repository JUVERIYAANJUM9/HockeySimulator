import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PerformanceChart from "@/components/analytics/performance-chart";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Shield, 
  Activity,
  Users,
  Clock,
  Award,
  Zap
} from "lucide-react";

export default function Analytics() {
  const [selectedTeamId] = useState(1);
  const [selectedSeason] = useState(2024);
  const [timeRange, setTimeRange] = useState("season");
  const [metricType, setMetricType] = useState("team");

  const { data: team } = useQuery({
    queryKey: ["/api/teams", selectedTeamId]
  });

  const { data: teamStats } = useQuery({
    queryKey: ["/api/stats/teams", { season: selectedSeason }]
  });

  const { data: playerStats } = useQuery({
    queryKey: ["/api/stats/players", { season: selectedSeason }]
  });

  const { data: teamAnalytics } = useQuery({
    queryKey: ["/api/dashboard/analytics", selectedTeamId, { season: selectedSeason }]
  });

  const { data: players } = useQuery({
    queryKey: ["/api/players", { teamId: selectedTeamId }]
  });

  const { data: recentGames } = useQuery({
    queryKey: ["/api/games", { teamId: selectedTeamId }]
  });

  const currentTeamStats = teamStats?.find((s: any) => s.teamId === selectedTeamId);
  const teamPlayerStats = playerStats?.filter((s: any) => {
    const player = players?.find((p: any) => p.id === s.playerId);
    return player?.teamId === selectedTeamId;
  }) || [];

  // Calculate advanced metrics
  const calculateAdvancedMetrics = () => {
    if (!currentTeamStats) return {};

    const gamesPlayed = currentTeamStats.gamesPlayed || 1;
    const shotsFor = currentTeamStats.shotsFor || 0;
    const shotsAgainst = currentTeamStats.shotsAgainst || 0;
    const goalsFor = currentTeamStats.goalsFor || 0;
    const goalsAgainst = currentTeamStats.goalsAgainst || 0;

    return {
      shotPercentage: shotsFor > 0 ? ((goalsFor / shotsFor) * 100).toFixed(1) : "0.0",
      savePercentage: shotsAgainst > 0 ? (((shotsAgainst - goalsAgainst) / shotsAgainst) * 100).toFixed(1) : "0.0",
      goalsPerGame: (goalsFor / gamesPlayed).toFixed(2),
      goalsAgainstPerGame: (goalsAgainst / gamesPlayed).toFixed(2),
      shotsPerGame: (shotsFor / gamesPlayed).toFixed(1),
      shotsAgainstPerGame: (shotsAgainst / gamesPlayed).toFixed(1),
      powerPlayPercentage: currentTeamStats.powerPlayOpportunities > 0 
        ? ((currentTeamStats.powerPlayGoals / currentTeamStats.powerPlayOpportunities) * 100).toFixed(1) 
        : "0.0",
      penaltyKillPercentage: currentTeamStats.penaltyKillOpportunities > 0 
        ? (((currentTeamStats.penaltyKillOpportunities - currentTeamStats.penaltyKillGoalsAgainst) / currentTeamStats.penaltyKillOpportunities) * 100).toFixed(1) 
        : "0.0",
      faceoffPercentage: (currentTeamStats.faceoffWins + currentTeamStats.faceoffLosses) > 0 
        ? ((currentTeamStats.faceoffWins / (currentTeamStats.faceoffWins + currentTeamStats.faceoffLosses)) * 100).toFixed(1) 
        : "0.0"
    };
  };

  const advancedMetrics = calculateAdvancedMetrics();

  const getTopPerformers = () => {
    return teamPlayerStats
      .sort((a: any, b: any) => b.points - a.points)
      .slice(0, 5)
      .map((stat: any) => {
        const player = players?.find((p: any) => p.id === stat.playerId);
        return { ...stat, player };
      });
  };

  const getRecentForm = () => {
    if (!recentGames || recentGames.length === 0) return [];
    
    return recentGames
      .filter((game: any) => game.status === "completed")
      .slice(0, 10)
      .map((game: any) => {
        const isHome = game.homeTeamId === selectedTeamId;
        const teamScore = isHome ? game.homeScore : game.awayScore;
        const opponentScore = isHome ? game.awayScore : game.homeScore;
        
        let result = "L";
        if (teamScore > opponentScore) result = "W";
        else if (teamScore === opponentScore) result = "OT";
        
        return {
          ...game,
          result,
          teamScore,
          opponentScore,
          goalDifferential: teamScore - opponentScore
        };
      });
  };

  const recentForm = getRecentForm();
  const topPerformers = getTopPerformers();

  const generatePerformanceData = () => {
    // Generate chart data based on recent games
    return recentForm.map((game: any, index: number) => ({
      game: `Game ${recentForm.length - index}`,
      goalsFor: game.teamScore,
      goalsAgainst: game.opponentScore,
      shots: Math.floor(Math.random() * 20) + 25, // Mock shots data
      saves: Math.floor(Math.random() * 15) + 20  // Mock saves data
    })).reverse();
  };

  const performanceData = generatePerformanceData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <BarChart3 className="h-6 w-6 mr-3" />
              Team Analytics
            </h2>
            <p className="text-gray-600 mt-1">
              Advanced performance metrics and statistical analysis for {team?.name}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[150px]">
                <Clock className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="season">Full Season</SelectItem>
                <SelectItem value="last-10">Last 10 Games</SelectItem>
                <SelectItem value="last-20">Last 20 Games</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-hockey-light hover:bg-hockey-blue">
              <Target className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Goals Per Game</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{advancedMetrics.goalsPerGame}</p>
                  <p className="text-green-600 text-sm mt-1 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    League Avg: 3.12
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Target className="text-red-600 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Save Percentage</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{advancedMetrics.savePercentage}%</p>
                  <p className="text-blue-600 text-sm mt-1 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    League Avg: 91.2%
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Shield className="text-blue-600 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Power Play %</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{advancedMetrics.powerPlayPercentage}%</p>
                  <p className="text-amber-600 text-sm mt-1 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    League Avg: 20.1%
                  </p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Zap className="text-amber-600 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Faceoff %</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{advancedMetrics.faceoffPercentage}%</p>
                  <p className="text-purple-600 text-sm mt-1 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    League Avg: 50.0%
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Activity className="text-purple-600 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics Content */}
        <Tabs value={metricType} onValueChange={setMetricType}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="team">Team Performance</TabsTrigger>
            <TabsTrigger value="players">Player Analytics</TabsTrigger>
            <TabsTrigger value="trends">Trends & Patterns</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="team" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance Chart */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Game Performance Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <PerformanceChart data={performanceData} />
                </CardContent>
              </Card>

              {/* Recent Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Recent Form
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentForm.slice(0, 8).map((game: any, index: number) => (
                      <div key={game.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center space-x-3">
                          <Badge 
                            className={
                              game.result === "W" 
                                ? "bg-green-100 text-green-800" 
                                : game.result === "OT" 
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {game.result}
                          </Badge>
                          <span className="text-sm text-gray-600">Game {recentForm.length - index}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {game.teamScore} - {game.opponentScore}
                          </p>
                          <p className={`text-xs ${game.goalDifferential >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {game.goalDifferential >= 0 ? '+' : ''}{game.goalDifferential}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Shooting Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Shooting Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">{advancedMetrics.shotsPerGame}</p>
                      <p className="text-xs text-gray-600">Shots/Game</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">{advancedMetrics.shotPercentage}%</p>
                      <p className="text-xs text-gray-600">Shot %</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>High Danger</span>
                      <span className="font-medium">15.2%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Medium Danger</span>
                      <span className="font-medium">8.7%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Low Danger</span>
                      <span className="font-medium">4.1%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="players" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Performers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="h-5 w-5 mr-2" />
                    Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topPerformers.map((performer: any, index: number) => (
                      <div key={performer.playerId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                          <div>
                            <p className="font-medium text-gray-900">{performer.player?.name || "Unknown"}</p>
                            <p className="text-sm text-gray-600">{performer.player?.position}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">{performer.points}</p>
                          <p className="text-sm text-gray-600">{performer.goals}G {performer.assists}A</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Position Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Position Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {["C", "LW", "RW", "D", "G"].map((position) => {
                      const positionPlayers = players?.filter((p: any) => p.position === position) || [];
                      const positionStats = teamPlayerStats.filter((s: any) => {
                        const player = players?.find((p: any) => p.id === s.playerId);
                        return player?.position === position;
                      });
                      
                      const totalPoints = positionStats.reduce((sum: number, s: any) => sum + s.points, 0);
                      const avgPoints = positionStats.length > 0 ? (totalPoints / positionStats.length).toFixed(1) : "0.0";
                      
                      return (
                        <div key={position} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{position === "C" ? "Centers" : position === "LW" ? "Left Wings" : position === "RW" ? "Right Wings" : position === "D" ? "Defense" : "Goalies"}</p>
                            <p className="text-sm text-gray-600">{positionPlayers.length} players</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">{avgPoints}</p>
                            <p className="text-sm text-gray-600">Avg Points</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Trends & Patterns Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Trend Analysis</h3>
                  <p className="text-gray-600 mb-4">
                    Detailed trend analysis and pattern recognition features coming soon
                  </p>
                  <Button variant="outline" disabled>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Available in Pro Version
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            {/* Advanced Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Special Teams</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Power Play Efficiency</span>
                      <span className="text-lg font-bold text-gray-900">{advancedMetrics.powerPlayPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-amber-500 h-2 rounded-full" 
                        style={{ width: `${Math.min(100, parseFloat(advancedMetrics.powerPlayPercentage || "0"))}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Penalty Kill Success</span>
                      <span className="text-lg font-bold text-gray-900">{advancedMetrics.penaltyKillPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${Math.min(100, parseFloat(advancedMetrics.penaltyKillPercentage || "0"))}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Possession Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Faceoff Win %</span>
                      <span className="text-lg font-bold text-gray-900">{advancedMetrics.faceoffPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full" 
                        style={{ width: `${Math.min(100, parseFloat(advancedMetrics.faceoffPercentage || "50"))}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Shot Differential</span>
                      <span className="text-lg font-bold text-gray-900">
                        {currentTeamStats ? `+${currentTeamStats.shotsFor - currentTeamStats.shotsAgainst}` : "+0"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-center text-sm">
                      <div className="p-2 bg-green-50 rounded">
                        <p className="font-medium text-green-600">{advancedMetrics.shotsPerGame}</p>
                        <p className="text-green-600">For/Game</p>
                      </div>
                      <div className="p-2 bg-red-50 rounded">
                        <p className="font-medium text-red-600">{advancedMetrics.shotsAgainstPerGame}</p>
                        <p className="text-red-600">Against/Game</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
