import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PlayerCard from "@/components/team/player-card";
import LineupEditor from "@/components/team/lineup-editor";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Settings,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";

export default function TeamRoster() {
  const [selectedTeamId] = useState(1); // Default to first team
  const [searchTerm, setSearchTerm] = useState("");
  const [positionFilter, setPositionFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: team, isLoading: teamLoading } = useQuery({
    queryKey: ["/api/teams", selectedTeamId]
  });

  const { data: players, isLoading: playersLoading } = useQuery({
    queryKey: ["/api/players", { teamId: selectedTeamId }]
  });

  const { data: playerStats } = useQuery({
    queryKey: ["/api/stats/players", { season: 2024 }]
  });

  const { data: lineups } = useQuery({
    queryKey: ["/api/teams", selectedTeamId, "lineups"]
  });

  const updatePlayerMutation = useMutation({
    mutationFn: ({ playerId, updates }: { playerId: number; updates: any }) =>
      apiRequest("PATCH", `/api/players/${playerId}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      toast({
        title: "Player Updated",
        description: "Player information has been successfully updated.",
      });
    }
  });

  const filteredPlayers = players?.filter((player: any) => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition = positionFilter === "all" || player.position === positionFilter;
    return matchesSearch && matchesPosition;
  }) || [];

  const sortedPlayers = [...filteredPlayers].sort((a: any, b: any) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "position":
        return a.position.localeCompare(b.position);
      case "age":
        return a.age - b.age;
      case "salary":
        return b.salary - a.salary;
      case "overall":
        const aOverall = (a.skating + a.shooting + a.passing + a.defense + a.physicality + a.hockey_iq) / 6;
        const bOverall = (b.skating + b.shooting + b.passing + b.defense + b.physicality + b.hockey_iq) / 6;
        return bOverall - aOverall;
      default:
        return 0;
    }
  });

  const getPlayerStats = (playerId: number) => {
    return playerStats?.find((stat: any) => stat.playerId === playerId);
  };

  const calculateOverallRating = (player: any) => {
    return Math.round((player.skating + player.shooting + player.passing + player.defense + player.physicality + player.hockey_iq) / 6);
  };

  const getPlayersByPosition = (position: string[]) => {
    return sortedPlayers.filter((player: any) => position.includes(player.position));
  };

  if (teamLoading || playersLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hockey-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading team roster...</p>
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
              <Users className="h-6 w-6 mr-3" />
              {team?.name || "Team"} Roster
            </h2>
            <p className="text-gray-600 mt-1">
              Manage your team players, lines, and strategies
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Player
            </Button>
            <Button className="bg-hockey-light hover:bg-hockey-blue">
              <Settings className="h-4 w-4 mr-2" />
              Team Settings
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Team Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Active Players</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{players?.length || 0}</p>
                  <p className="text-gray-600 text-sm mt-1">of 23 max</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="text-blue-600 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Salary Cap</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    ${team?.budget ? (team.budget / 1000000).toFixed(1) : 0}M
                  </p>
                  <p className="text-green-600 text-sm mt-1">Under cap</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-green-600 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Avg Age</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {players?.length ? Math.round(players.reduce((sum: number, p: any) => sum + p.age, 0) / players.length) : 0}
                  </p>
                  <p className="text-gray-600 text-sm mt-1">years</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-amber-600 h-6 w-6" />
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
                    {team?.morale > 70 ? "High" : team?.morale > 40 ? "Good" : "Low"}
                  </p>
                  <p className="text-green-600 text-sm mt-1">{team?.morale || 50}/100</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-purple-600 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="roster" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="roster">Player Roster</TabsTrigger>
            <TabsTrigger value="lineups">Line Combinations</TabsTrigger>
            <TabsTrigger value="depth">Depth Chart</TabsTrigger>
          </TabsList>

          <TabsContent value="roster" className="space-y-6">
            {/* Filters and Search */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search players..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={positionFilter} onValueChange={setPositionFilter}>
                    <SelectTrigger className="w-[150px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Positions</SelectItem>
                      <SelectItem value="C">Center</SelectItem>
                      <SelectItem value="LW">Left Wing</SelectItem>
                      <SelectItem value="RW">Right Wing</SelectItem>
                      <SelectItem value="D">Defense</SelectItem>
                      <SelectItem value="G">Goalie</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="position">Position</SelectItem>
                      <SelectItem value="age">Age</SelectItem>
                      <SelectItem value="salary">Salary</SelectItem>
                      <SelectItem value="overall">Overall Rating</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Players Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedPlayers.map((player: any) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  stats={getPlayerStats(player.id)}
                  onUpdate={(updates) => updatePlayerMutation.mutate({ playerId: player.id, updates })}
                />
              ))}
            </div>

            {sortedPlayers.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No players found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || positionFilter !== "all" 
                      ? "Try adjusting your search or filters"
                      : "Add players to your roster to get started"
                    }
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Player
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="lineups" className="space-y-6">
            <LineupEditor 
              players={players || []} 
              lineups={lineups || []}
              teamId={selectedTeamId}
            />
          </TabsContent>

          <TabsContent value="depth" className="space-y-6">
            {/* Depth Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Forwards */}
              <Card>
                <CardHeader>
                  <CardTitle>Forwards Depth Chart</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Centers</h4>
                    <div className="space-y-2">
                      {getPlayersByPosition(["C"]).map((player: any, index: number) => (
                        <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                            <div>
                              <p className="font-medium text-gray-900">{player.name}</p>
                              <p className="text-sm text-gray-600">Overall: {calculateOverallRating(player)}</p>
                            </div>
                          </div>
                          <Badge variant="outline">{player.position}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Wingers</h4>
                    <div className="space-y-2">
                      {getPlayersByPosition(["LW", "RW"]).map((player: any, index: number) => (
                        <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                            <div>
                              <p className="font-medium text-gray-900">{player.name}</p>
                              <p className="text-sm text-gray-600">Overall: {calculateOverallRating(player)}</p>
                            </div>
                          </div>
                          <Badge variant="outline">{player.position}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Defense & Goalies */}
              <Card>
                <CardHeader>
                  <CardTitle>Defense & Goalies</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Defensemen</h4>
                    <div className="space-y-2">
                      {getPlayersByPosition(["D"]).map((player: any, index: number) => (
                        <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                            <div>
                              <p className="font-medium text-gray-900">{player.name}</p>
                              <p className="text-sm text-gray-600">Overall: {calculateOverallRating(player)}</p>
                            </div>
                          </div>
                          <Badge variant="outline">{player.position}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Goalies</h4>
                    <div className="space-y-2">
                      {getPlayersByPosition(["G"]).map((player: any, index: number) => (
                        <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                            <div>
                              <p className="font-medium text-gray-900">{player.name}</p>
                              <p className="text-sm text-gray-600">Overall: {calculateOverallRating(player)}</p>
                            </div>
                          </div>
                          <Badge variant="outline">{player.position}</Badge>
                        </div>
                      ))}
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
