import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  Medal,
  Target,
  Shield,
  Clock
} from "lucide-react";

export default function LeagueStandings() {
  const [selectedSeason] = useState(2024);
  const [conferenceFilter, setConferenceFilter] = useState("all");

  const { data: teamStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats/teams", { season: selectedSeason }]
  });

  const { data: teams } = useQuery({
    queryKey: ["/api/teams"]
  });

  const { data: recentGames } = useQuery({
    queryKey: ["/api/games", { status: "completed" }]
  });

  const getTeamInfo = (teamId: number) => {
    return teams?.find((t: any) => t.id === teamId);
  };

  const calculatePointsPercentage = (points: number, gamesPlayed: number) => {
    const maxPoints = gamesPlayed * 2; // 2 points per game max
    return maxPoints > 0 ? ((points / maxPoints) * 100).toFixed(1) : "0.0";
  };

  const getGoalsDifferential = (goalsFor: number, goalsAgainst: number) => {
    const diff = goalsFor - goalsAgainst;
    return diff >= 0 ? `+${diff}` : `${diff}`;
  };

  const getStreakIcon = (record: string) => {
    // This would normally calculate from recent games
    const isWinning = Math.random() > 0.5;
    return isWinning ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  const getPlayoffPosition = (position: number) => {
    if (position <= 8) {
      return "Playoff Position";
    } else if (position <= 16) {
      return "Wild Card Race";
    } else {
      return "Out of Playoffs";
    }
  };

  const getPlayoffPositionColor = (position: number) => {
    if (position <= 8) {
      return "text-green-600";
    } else if (position <= 16) {
      return "text-yellow-600";
    } else {
      return "text-red-600";
    }
  };

  const filteredStats = teamStats?.filter((stat: any) => {
    if (conferenceFilter === "all") return true;
    const team = getTeamInfo(stat.teamId);
    return team?.conference === conferenceFilter;
  }) || [];

  const sortedStats = [...filteredStats].sort((a: any, b: any) => {
    // Sort by points, then by points percentage, then by goal differential
    if (b.points !== a.points) return b.points - a.points;
    
    const aPointsPct = parseFloat(calculatePointsPercentage(a.points, a.gamesPlayed));
    const bPointsPct = parseFloat(calculatePointsPercentage(b.points, b.gamesPlayed));
    if (bPointsPct !== aPointsPct) return bPointsPct - aPointsPct;
    
    const aGoalDiff = a.goalsFor - a.goalsAgainst;
    const bGoalDiff = b.goalsFor - b.goalsAgainst;
    return bGoalDiff - aGoalDiff;
  });

  const easternStats = sortedStats.filter((stat: any) => {
    const team = getTeamInfo(stat.teamId);
    return team?.conference === "Eastern";
  });

  const westernStats = sortedStats.filter((stat: any) => {
    const team = getTeamInfo(stat.teamId);
    return team?.conference === "Western";
  });

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hockey-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading league standings...</p>
        </div>
      </div>
    );
  }

  const StandingsTable = ({ stats, title }: { stats: any[], title: string }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Trophy className="h-5 w-5 mr-2" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GP</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">W</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">L</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">OTL</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PTS</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PTS%</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GF</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GA</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DIFF</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Streak</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.map((stat: any, index: number) => {
                const team = getTeamInfo(stat.teamId);
                const position = index + 1;
                const playoffStatus = getPlayoffPosition(position);
                const playoffColor = getPlayoffPositionColor(position);
                
                return (
                  <tr key={stat.teamId} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">{position}</span>
                        {position <= 8 && (
                          <Medal className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-xs font-bold text-gray-600">
                            {team?.abbreviation || "UNK"}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{team?.name || "Unknown"}</div>
                          <div className={`text-xs ${playoffColor}`}>{playoffStatus}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{stat.gamesPlayed}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{stat.wins}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{stat.losses}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{stat.overtimeLosses}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{stat.points}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {calculatePointsPercentage(stat.points, stat.gamesPlayed)}%
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{stat.goalsFor}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{stat.goalsAgainst}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={stat.goalsFor >= stat.goalsAgainst ? "text-green-600" : "text-red-600"}>
                        {getGoalsDifferential(stat.goalsFor, stat.goalsAgainst)}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        {getStreakIcon("W3")}
                        <span className="text-sm text-gray-600">W3</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Trophy className="h-6 w-6 mr-3" />
              League Standings
            </h2>
            <p className="text-gray-600 mt-1">
              Current standings and playoff race for the {selectedSeason}-{selectedSeason + 1} season
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={conferenceFilter} onValueChange={setConferenceFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Conferences</SelectItem>
                <SelectItem value="Eastern">Eastern</SelectItem>
                <SelectItem value="Western">Western</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* League Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">League Leader</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    {sortedStats[0] ? getTeamInfo(sortedStats[0].teamId)?.abbreviation : "TBD"}
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    {sortedStats[0]?.points || 0} points
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Trophy className="text-yellow-600 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Most Goals</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    {[...sortedStats].sort((a, b) => b.goalsFor - a.goalsFor)[0] 
                      ? getTeamInfo([...sortedStats].sort((a, b) => b.goalsFor - a.goalsFor)[0].teamId)?.abbreviation 
                      : "TBD"
                    }
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    {[...sortedStats].sort((a, b) => b.goalsFor - a.goalsFor)[0]?.goalsFor || 0} goals
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
                  <p className="text-gray-600 text-sm font-medium">Best Defense</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    {[...sortedStats].sort((a, b) => a.goalsAgainst - b.goalsAgainst)[0] 
                      ? getTeamInfo([...sortedStats].sort((a, b) => a.goalsAgainst - b.goalsAgainst)[0].teamId)?.abbreviation 
                      : "TBD"
                    }
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    {[...sortedStats].sort((a, b) => a.goalsAgainst - b.goalsAgainst)[0]?.goalsAgainst || 0} GA
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
                  <p className="text-gray-600 text-sm font-medium">Games Played</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    {Math.max(...(sortedStats.map(s => s.gamesPlayed) || [0]))}
                  </p>
                  <p className="text-gray-600 text-sm mt-1">of 82 games</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Clock className="text-gray-600 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Standings Tables */}
        <Tabs value={conferenceFilter === "all" ? "both" : conferenceFilter.toLowerCase()} onValueChange={(value) => {
          if (value === "both") setConferenceFilter("all");
          else setConferenceFilter(value === "eastern" ? "Eastern" : "Western");
        }}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="both">Both Conferences</TabsTrigger>
            <TabsTrigger value="eastern">Eastern Conference</TabsTrigger>
            <TabsTrigger value="western">Western Conference</TabsTrigger>
          </TabsList>

          <TabsContent value="both" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <StandingsTable stats={easternStats} title="Eastern Conference" />
              <StandingsTable stats={westernStats} title="Western Conference" />
            </div>
          </TabsContent>

          <TabsContent value="eastern" className="space-y-6">
            <StandingsTable stats={easternStats} title="Eastern Conference Standings" />
          </TabsContent>

          <TabsContent value="western" className="space-y-6">
            <StandingsTable stats={westernStats} title="Western Conference Standings" />
          </TabsContent>
        </Tabs>

        {/* Playoff Picture */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Medal className="h-5 w-5 mr-2" />
              Playoff Picture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Eastern Conference</h4>
                <div className="space-y-2">
                  {easternStats.slice(0, 8).map((stat: any, index: number) => {
                    const team = getTeamInfo(stat.teamId);
                    return (
                      <div key={stat.teamId} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                          <span className="font-medium text-gray-900">{team?.abbreviation}</span>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Playoff Spot</Badge>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Western Conference</h4>
                <div className="space-y-2">
                  {westernStats.slice(0, 8).map((stat: any, index: number) => {
                    const team = getTeamInfo(stat.teamId);
                    return (
                      <div key={stat.teamId} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                          <span className="font-medium text-gray-900">{team?.abbreviation}</span>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Playoff Spot</Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
