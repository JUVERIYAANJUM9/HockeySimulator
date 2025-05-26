import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeftRight, 
  Users, 
  DollarSign,
  Calendar,
  Star,
  TrendingUp,
  Search,
  Filter
} from "lucide-react";

export default function TradesDraft() {
  const [selectedTeamId] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [positionFilter, setPositionFilter] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: team } = useQuery({
    queryKey: ["/api/teams", selectedTeamId]
  });

  const { data: myPlayers } = useQuery({
    queryKey: ["/api/players", { teamId: selectedTeamId }]
  });

  const { data: allPlayers } = useQuery({
    queryKey: ["/api/players"]
  });

  const { data: teams } = useQuery({
    queryKey: ["/api/teams"]
  });

  const tradeProposalMutation = useMutation({
    mutationFn: ({ fromPlayerId, toPlayerId }: { fromPlayerId: number; toPlayerId: number }) => {
      // In a real implementation, this would create a trade proposal
      return apiRequest("POST", "/api/trades", {
        fromTeamId: selectedTeamId,
        toTeamId: selectedPlayer?.teamId,
        fromPlayerId,
        toPlayerId,
        status: "proposed"
      });
    },
    onSuccess: () => {
      toast({
        title: "Trade Proposal Sent",
        description: "Your trade proposal has been sent to the other team.",
      });
    }
  });

  const calculateOverallRating = (player: any) => {
    return Math.round((player.skating + player.shooting + player.passing + player.defense + player.physicality + player.hockey_iq) / 6);
  };

  const getTeamName = (teamId: number) => {
    return teams?.find((t: any) => t.id === teamId)?.name || "Unknown Team";
  };

  const getTeamAbbr = (teamId: number) => {
    return teams?.find((t: any) => t.id === teamId)?.abbreviation || "UNK";
  };

  const getPlayerValue = (player: any) => {
    const overall = calculateOverallRating(player);
    const ageModifier = Math.max(0.5, 1 - (player.age - 20) * 0.02);
    return Math.round(overall * ageModifier * 100000);
  };

  const formatSalary = (salary: number) => {
    return `$${(salary / 1000000).toFixed(1)}M`;
  };

  const availablePlayers = allPlayers?.filter((player: any) => {
    if (player.teamId === selectedTeamId) return false; // Don't show own players
    
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPosition = positionFilter === "all" || player.position === positionFilter;
    
    let matchesPrice = true;
    if (priceRange !== "all") {
      const salary = player.salary;
      switch (priceRange) {
        case "under-2m":
          matchesPrice = salary < 2000000;
          break;
        case "2m-5m":
          matchesPrice = salary >= 2000000 && salary < 5000000;
          break;
        case "5m-8m":
          matchesPrice = salary >= 5000000 && salary < 8000000;
          break;
        case "over-8m":
          matchesPrice = salary >= 8000000;
          break;
      }
    }
    
    return matchesSearch && matchesPosition && matchesPrice;
  }) || [];

  const getAgeColor = (age: number) => {
    if (age <= 25) return "text-green-600";
    if (age <= 30) return "text-yellow-600";
    return "text-red-600";
  };

  const generateDraftProspects = () => {
    // Mock draft prospects - in real implementation, this would come from API
    return [
      { name: "Connor McDavid Jr.", position: "C", age: 18, overall: 85, potential: 95 },
      { name: "Viktor Lundqvist", position: "G", age: 18, overall: 78, potential: 92 },
      { name: "Alex Pettersson", position: "LW", age: 19, overall: 82, potential: 88 },
      { name: "Brady Tkachuk II", position: "RW", age: 18, overall: 80, potential: 87 },
      { name: "Quinn Hughes III", position: "D", age: 19, overall: 83, potential: 90 }
    ];
  };

  const draftProspects = generateDraftProspects();

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <ArrowLeftRight className="h-6 w-6 mr-3" />
              Trades & Draft
            </h2>
            <p className="text-gray-600 mt-1">
              Build your team through trades and draft picks
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge className="bg-blue-100 text-blue-800">
              <Calendar className="h-3 w-3 mr-1" />
              Trade Deadline: Mar 21
            </Badge>
            <Button className="bg-hockey-light hover:bg-hockey-blue">
              <DollarSign className="h-4 w-4 mr-2" />
              View Cap Space
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Team Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Cap Space</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    ${team?.budget ? ((team.budget - (myPlayers?.reduce((sum: number, p: any) => sum + p.salary, 0) || 0)) / 1000000).toFixed(1) : 0}M
                  </p>
                  <p className="text-green-600 text-sm mt-1">Available</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="text-green-600 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Roster Size</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{myPlayers?.length || 0}</p>
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
                  <p className="text-gray-600 text-sm font-medium">Trade Assets</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">12</p>
                  <p className="text-gray-600 text-sm mt-1">Available players</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <ArrowLeftRight className="text-amber-600 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Draft Picks</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">7</p>
                  <p className="text-gray-600 text-sm mt-1">2025 Draft</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Star className="text-purple-600 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="trades" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trades">Player Trades</TabsTrigger>
            <TabsTrigger value="draft">Draft Board</TabsTrigger>
            <TabsTrigger value="free-agents">Free Agents</TabsTrigger>
          </TabsList>

          <TabsContent value="trades" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Available Players */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Available Players</CardTitle>
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
                      <SelectTrigger className="w-[120px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                        <SelectItem value="LW">LW</SelectItem>
                        <SelectItem value="RW">RW</SelectItem>
                        <SelectItem value="D">D</SelectItem>
                        <SelectItem value="G">G</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={priceRange} onValueChange={setPriceRange}>
                      <SelectTrigger className="w-[140px]">
                        <DollarSign className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Prices</SelectItem>
                        <SelectItem value="under-2m">Under $2M</SelectItem>
                        <SelectItem value="2m-5m">$2M - $5M</SelectItem>
                        <SelectItem value="5m-8m">$5M - $8M</SelectItem>
                        <SelectItem value="over-8m">Over $8M</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {availablePlayers.slice(0, 20).map((player: any) => (
                      <div
                        key={player.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedPlayer?.id === player.id 
                            ? "border-hockey-blue bg-blue-50" 
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedPlayer(player)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600">
                                {player.name.split(' ').map((n: string) => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{player.name}</p>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Badge variant="outline">{player.position}</Badge>
                                <span className={getAgeColor(player.age)}>Age {player.age}</span>
                                <span>{getTeamAbbr(player.teamId)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">{calculateOverallRating(player)}</p>
                            <p className="text-sm text-gray-600">{formatSalary(player.salary)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Trade Interface */}
              <Card>
                <CardHeader>
                  <CardTitle>Trade Proposal</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedPlayer ? (
                    <div className="space-y-4">
                      {/* Selected Player Info */}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-2">Target Player</h4>
                        <div className="space-y-2">
                          <p className="font-medium">{selectedPlayer.name}</p>
                          <div className="flex justify-between text-sm">
                            <span>Position:</span>
                            <span>{selectedPlayer.position}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Overall:</span>
                            <span>{calculateOverallRating(selectedPlayer)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Salary:</span>
                            <span>{formatSalary(selectedPlayer.salary)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Team:</span>
                            <span>{getTeamAbbr(selectedPlayer.teamId)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Select Player to Trade */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Offer Player</h4>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select player to trade" />
                          </SelectTrigger>
                          <SelectContent>
                            {myPlayers?.map((player: any) => (
                              <SelectItem key={player.id} value={player.id.toString()}>
                                {player.name} ({player.position}) - {calculateOverallRating(player)} OVR
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Trade Actions */}
                      <div className="space-y-2">
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700"
                          disabled={tradeProposalMutation.isPending}
                        >
                          <ArrowLeftRight className="h-4 w-4 mr-2" />
                          Propose Trade
                        </Button>
                        <Button variant="outline" className="w-full">
                          Add Draft Picks
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ArrowLeftRight className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">Select a player to start trade negotiations</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="draft" className="space-y-6">
            {/* Draft Board */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  2025 NHL Draft Board
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">Your Draft Position</p>
                      <p className="text-sm text-gray-600">Based on current standings</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">#15</p>
                      <p className="text-sm text-gray-600">1st Round</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {draftProspects.map((prospect, index) => (
                      <div key={prospect.name} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300">
                        <div className="flex items-center space-x-4">
                          <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {prospect.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{prospect.name}</p>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Badge variant="outline">{prospect.position}</Badge>
                              <span className="text-green-600">Age {prospect.age}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-4">
                            <div className="text-center">
                              <p className="text-lg font-bold text-gray-900">{prospect.overall}</p>
                              <p className="text-xs text-gray-600">Current</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-bold text-green-600">{prospect.potential}</p>
                              <p className="text-xs text-gray-600">Potential</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="free-agents" className="space-y-6">
            {/* Free Agents */}
            <Card>
              <CardHeader>
                <CardTitle>Free Agent Market</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Free Agency Period Closed</h3>
                  <p className="text-gray-600 mb-4">
                    Free agency opens July 1st. Check back then to sign available players.
                  </p>
                  <Badge variant="outline">
                    <Calendar className="h-3 w-3 mr-1" />
                    Opens July 1, 2025
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
