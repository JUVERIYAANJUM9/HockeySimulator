import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Dumbbell, 
  TrendingUp, 
  Users, 
  Clock,
  Target,
  Zap,
  Brain,
  Shield,
  Activity
} from "lucide-react";

export default function Training() {
  const [selectedTeamId] = useState(1);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [trainingType, setTrainingType] = useState("individual");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: team } = useQuery({
    queryKey: ["/api/teams", selectedTeamId]
  });

  const { data: players, isLoading: playersLoading } = useQuery({
    queryKey: ["/api/players", { teamId: selectedTeamId }]
  });

  const trainPlayerMutation = useMutation({
    mutationFn: ({ playerId, skillType }: { playerId: number; skillType: string }) => {
      // Calculate skill improvement based on training
      const improvement = Math.floor(Math.random() * 3) + 1; // 1-3 points
      const updates: any = {};
      
      switch (skillType) {
        case "skating":
          updates.skating = Math.min(100, (selectedPlayer?.skating || 0) + improvement);
          break;
        case "shooting":
          updates.shooting = Math.min(100, (selectedPlayer?.shooting || 0) + improvement);
          break;
        case "passing":
          updates.passing = Math.min(100, (selectedPlayer?.passing || 0) + improvement);
          break;
        case "defense":
          updates.defense = Math.min(100, (selectedPlayer?.defense || 0) + improvement);
          break;
        case "physicality":
          updates.physicality = Math.min(100, (selectedPlayer?.physicality || 0) + improvement);
          break;
        case "hockey_iq":
          updates.hockey_iq = Math.min(100, (selectedPlayer?.hockey_iq || 0) + improvement);
          break;
      }
      
      return apiRequest("PATCH", `/api/players/${playerId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      toast({
        title: "Training Complete",
        description: "Player skills have been improved through training.",
      });
    }
  });

  const teamTrainingMutation = useMutation({
    mutationFn: ({ focusArea }: { focusArea: string }) => {
      // Team training affects multiple players
      const updates = players?.map((player: any) => {
        const improvement = Math.floor(Math.random() * 2) + 1; // 1-2 points
        const skillUpdates: any = {};
        
        switch (focusArea) {
          case "conditioning":
            skillUpdates.skating = Math.min(100, player.skating + improvement);
            break;
          case "offense":
            skillUpdates.shooting = Math.min(100, player.shooting + improvement);
            skillUpdates.passing = Math.min(100, player.passing + improvement);
            break;
          case "defense":
            skillUpdates.defense = Math.min(100, player.defense + improvement);
            break;
          case "teamwork":
            skillUpdates.hockey_iq = Math.min(100, player.hockey_iq + improvement);
            break;
        }
        
        return apiRequest("PATCH", `/api/players/${player.id}`, skillUpdates);
      });
      
      return Promise.all(updates || []);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      toast({
        title: "Team Training Complete",
        description: "All players have benefited from team training session.",
      });
    }
  });

  const calculateOverallRating = (player: any) => {
    return Math.round((player.skating + player.shooting + player.passing + player.defense + player.physicality + player.hockey_iq) / 6);
  };

  const getSkillColor = (skill: number) => {
    if (skill >= 90) return "text-green-600";
    if (skill >= 80) return "text-blue-600";
    if (skill >= 70) return "text-yellow-600";
    if (skill >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const getSkillBarColor = (skill: number) => {
    if (skill >= 90) return "bg-green-500";
    if (skill >= 80) return "bg-blue-500";
    if (skill >= 70) return "bg-yellow-500";
    if (skill >= 60) return "bg-orange-500";
    return "bg-red-500";
  };

  const skillCategories = [
    { key: "skating", label: "Skating", icon: Activity },
    { key: "shooting", label: "Shooting", icon: Target },
    { key: "passing", label: "Passing", icon: Zap },
    { key: "defense", label: "Defense", icon: Shield },
    { key: "physicality", label: "Physicality", icon: Dumbbell },
    { key: "hockey_iq", label: "Hockey IQ", icon: Brain },
  ];

  if (playersLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hockey-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading training facilities...</p>
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
              <Dumbbell className="h-6 w-6 mr-3" />
              Training Center
            </h2>
            <p className="text-gray-600 mt-1">
              Develop your players' skills and improve team performance
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={trainingType} onValueChange={setTrainingType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="team">Team Training</SelectItem>
                <SelectItem value="skills">Skills Camp</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-hockey-light hover:bg-hockey-blue">
              <Clock className="h-4 w-4 mr-2" />
              Schedule Session
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Training Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Active Players</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{players?.length || 0}</p>
                  <p className="text-gray-600 text-sm mt-1">Available for training</p>
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
                  <p className="text-gray-600 text-sm font-medium">Avg Overall</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {players?.length ? Math.round(players.reduce((sum: number, p: any) => sum + calculateOverallRating(p), 0) / players.length) : 0}
                  </p>
                  <p className="text-green-600 text-sm mt-1 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +2 this week
                  </p>
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
                  <p className="text-gray-600 text-sm font-medium">Training Budget</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">$2.5M</p>
                  <p className="text-gray-600 text-sm mt-1">Available</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Target className="text-amber-600 h-6 w-6" />
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
                  <Activity className="text-purple-600 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Training Interface */}
        <Tabs value={trainingType} onValueChange={setTrainingType}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="individual">Individual Training</TabsTrigger>
            <TabsTrigger value="team">Team Training</TabsTrigger>
            <TabsTrigger value="skills">Skills Development</TabsTrigger>
          </TabsList>

          <TabsContent value="individual" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Player Selection */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Select Player</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {players?.map((player: any) => (
                      <div
                        key={player.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedPlayer?.id === player.id 
                            ? "border-hockey-blue bg-blue-50" 
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedPlayer(player)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{player.name}</p>
                            <p className="text-sm text-gray-600">{player.position} • #{player.jerseyNumber}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">{calculateOverallRating(player)}</p>
                            <p className="text-xs text-gray-600">Overall</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Training Interface */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>
                    {selectedPlayer ? `Training: ${selectedPlayer.name}` : "Select a Player"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedPlayer ? (
                    <div className="space-y-6">
                      {/* Player Skills Overview */}
                      <div className="grid grid-cols-2 gap-4">
                        {skillCategories.map((skill) => {
                          const skillValue = selectedPlayer[skill.key] || 0;
                          const Icon = skill.icon;
                          
                          return (
                            <div key={skill.key} className="p-4 border border-gray-200 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <Icon className="h-4 w-4 text-gray-600" />
                                  <span className="text-sm font-medium text-gray-700">{skill.label}</span>
                                </div>
                                <span className={`text-lg font-bold ${getSkillColor(skillValue)}`}>
                                  {skillValue}
                                </span>
                              </div>
                              <div className="space-y-2">
                                <Progress value={skillValue} className="h-2" />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full"
                                  onClick={() => trainPlayerMutation.mutate({ 
                                    playerId: selectedPlayer.id, 
                                    skillType: skill.key 
                                  })}
                                  disabled={trainPlayerMutation.isPending}
                                >
                                  <Dumbbell className="h-3 w-3 mr-1" />
                                  Train {skill.label}
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Player Development Info */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Development Status</h4>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-lg font-bold text-gray-900">{selectedPlayer.age}</p>
                            <p className="text-xs text-gray-600">Age</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-gray-900">{selectedPlayer.potential}</p>
                            <p className="text-xs text-gray-600">Potential</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-gray-900 capitalize">{selectedPlayer.development}</p>
                            <p className="text-xs text-gray-600">Dev Speed</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Player Selected</h3>
                      <p className="text-gray-600">Choose a player from the list to begin individual training</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            {/* Team Training Programs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Conditioning Camp
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    Intensive fitness training to improve skating and endurance for all players.
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Focus: Skating +1-2</p>
                      <p className="text-sm text-gray-600">Duration: 3 days</p>
                    </div>
                    <Button
                      onClick={() => teamTrainingMutation.mutate({ focusArea: "conditioning" })}
                      disabled={teamTrainingMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Start Training
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Offensive Skills
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    Focus on shooting accuracy, passing precision, and offensive creativity.
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Focus: Shooting & Passing +1-2</p>
                      <p className="text-sm text-gray-600">Duration: 2 days</p>
                    </div>
                    <Button
                      onClick={() => teamTrainingMutation.mutate({ focusArea: "offense" })}
                      disabled={teamTrainingMutation.isPending}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Start Training
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Defensive Systems
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    Improve defensive positioning, shot blocking, and penalty killing techniques.
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Focus: Defense +1-2</p>
                      <p className="text-sm text-gray-600">Duration: 2 days</p>
                    </div>
                    <Button
                      onClick={() => teamTrainingMutation.mutate({ focusArea: "defense" })}
                      disabled={teamTrainingMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Start Training
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="h-5 w-5 mr-2" />
                    Team Chemistry
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    Build team cohesion and improve hockey IQ through tactical exercises.
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Focus: Hockey IQ +1-2</p>
                      <p className="text-sm text-gray-600">Duration: 1 day</p>
                    </div>
                    <Button
                      onClick={() => teamTrainingMutation.mutate({ focusArea: "teamwork" })}
                      disabled={teamTrainingMutation.isPending}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Start Training
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            {/* Skills Development Programs */}
            <Card>
              <CardHeader>
                <CardTitle>Skills Development Center</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Dumbbell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Skills Camp Coming Soon</h3>
                  <p className="text-gray-600 mb-4">
                    Advanced training programs for specific position skills and specialized techniques
                  </p>
                  <Button variant="outline" disabled>
                    <Clock className="h-4 w-4 mr-2" />
                    Available Next Season
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
