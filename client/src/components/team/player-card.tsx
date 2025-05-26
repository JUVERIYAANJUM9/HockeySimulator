import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Edit, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Target,
  Shield,
  Zap,
  Brain,
  Dumbbell
} from "lucide-react";

interface PlayerCardProps {
  player: any;
  stats?: any;
  onUpdate: (updates: any) => void;
}

export default function PlayerCard({ player, stats, onUpdate }: PlayerCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedPlayer, setEditedPlayer] = useState(player);

  const calculateOverallRating = () => {
    return Math.round((player.skating + player.shooting + player.passing + player.defense + player.physicality + player.hockey_iq) / 6);
  };

  const getSkillColor = (skill: number) => {
    if (skill >= 90) return "text-green-600";
    if (skill >= 80) return "text-blue-600";
    if (skill >= 70) return "text-yellow-600";
    if (skill >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const getEnergyColor = (energy: number) => {
    if (energy >= 80) return "bg-green-500";
    if (energy >= 60) return "bg-yellow-500";
    if (energy >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  const getMoraleColor = (morale: number) => {
    if (morale >= 70) return "text-green-600";
    if (morale >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getAgeIcon = (age: number) => {
    if (age <= 25) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (age <= 32) return <Activity className="h-4 w-4 text-blue-600" />;
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const formatSalary = (salary: number) => {
    return `$${(salary / 1000000).toFixed(1)}M`;
  };

  const handleSave = () => {
    onUpdate(editedPlayer);
    setIsEditing(false);
  };

  const skillCategories = [
    { key: "skating", label: "Skating", icon: Activity, value: player.skating },
    { key: "shooting", label: "Shooting", icon: Target, value: player.shooting },
    { key: "passing", label: "Passing", icon: Zap, value: player.passing },
    { key: "defense", label: "Defense", icon: Shield, value: player.defense },
    { key: "physicality", label: "Physicality", icon: Dumbbell, value: player.physicality },
    { key: "hockey_iq", label: "Hockey IQ", icon: Brain, value: player.hockey_iq },
  ];

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Player Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{player.name}</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Badge variant="outline">{player.position}</Badge>
                  <span>#{player.jerseyNumber}</span>
                  <span className="flex items-center space-x-1">
                    {getAgeIcon(player.age)}
                    <span>Age {player.age}</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">{calculateOverallRating()}</p>
              <p className="text-sm text-gray-600">Overall</p>
            </div>
          </div>

          {/* Player Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Energy</span>
                <span className="text-sm text-gray-900">{player.energy}%</span>
              </div>
              <Progress value={player.energy} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Morale</span>
                <span className={`text-sm font-medium ${getMoraleColor(player.morale)}`}>
                  {player.morale > 70 ? "High" : player.morale > 40 ? "Good" : "Low"}
                </span>
              </div>
              <Progress value={player.morale} className="h-2" />
            </div>
          </div>

          {/* Contract Info */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Salary</p>
                <p className="font-medium text-gray-900">{formatSalary(player.salary)}</p>
              </div>
              <div>
                <p className="text-gray-600">Contract</p>
                <p className="font-medium text-gray-900">{player.contractYears} years</p>
              </div>
            </div>
          </div>

          {/* Stats Preview */}
          {stats && (
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg font-bold text-gray-900">{stats.goals || 0}</p>
                <p className="text-xs text-gray-600">Goals</p>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{stats.assists || 0}</p>
                <p className="text-xs text-gray-600">Assists</p>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{stats.points || 0}</p>
                <p className="text-xs text-gray-600">Points</p>
              </div>
            </div>
          )}

          {/* Injury Status */}
          {player.injured && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm font-medium text-red-800">Injured</p>
              <p className="text-sm text-red-600">{player.injuryDays} days remaining</p>
            </div>
          )}

          {/* Player Details Dialog */}
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Edit className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Player Details: {player.name}</DialogTitle>
              </DialogHeader>
              
              <Tabs defaultValue="skills" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="skills">Skills</TabsTrigger>
                  <TabsTrigger value="stats">Statistics</TabsTrigger>
                  <TabsTrigger value="contract">Contract</TabsTrigger>
                </TabsList>

                <TabsContent value="skills" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {skillCategories.map((skill) => {
                      const Icon = skill.icon;
                      return (
                        <div key={skill.key} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Icon className="h-4 w-4 text-gray-600" />
                              <Label>{skill.label}</Label>
                            </div>
                            <span className={`text-lg font-bold ${getSkillColor(skill.value)}`}>
                              {skill.value}
                            </span>
                          </div>
                          <Progress value={skill.value} className="h-2" />
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={editedPlayer[skill.key] || skill.value}
                            onChange={(e) => setEditedPlayer(prev => ({
                              ...prev,
                              [skill.key]: parseInt(e.target.value) || 0
                            }))}
                            className="h-8"
                          />
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label>Potential</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={editedPlayer.potential || player.potential}
                        onChange={(e) => setEditedPlayer(prev => ({
                          ...prev,
                          potential: parseInt(e.target.value) || 0
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Development</Label>
                      <select
                        value={editedPlayer.development || player.development}
                        onChange={(e) => setEditedPlayer(prev => ({
                          ...prev,
                          development: e.target.value
                        }))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="slow">Slow</option>
                        <option value="normal">Normal</option>
                        <option value="fast">Fast</option>
                      </select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="stats" className="space-y-4">
                  {stats ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Games Played:</span>
                          <span className="font-medium">{stats.gamesPlayed || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Goals:</span>
                          <span className="font-medium">{stats.goals || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Assists:</span>
                          <span className="font-medium">{stats.assists || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Points:</span>
                          <span className="font-medium">{stats.points || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Plus/Minus:</span>
                          <span className={`font-medium ${(stats.plusMinus || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {(stats.plusMinus || 0) >= 0 ? '+' : ''}{stats.plusMinus || 0}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Shots on Goal:</span>
                          <span className="font-medium">{stats.shotsOnGoal || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Penalty Minutes:</span>
                          <span className="font-medium">{stats.penaltyMinutes || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Hits:</span>
                          <span className="font-medium">{stats.hits || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Blocked Shots:</span>
                          <span className="font-medium">{stats.blockedShots || 0}</span>
                        </div>
                        {player.position === "G" && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Save %:</span>
                            <span className="font-medium">
                              {stats.saves && stats.goalsAgainst 
                                ? ((stats.saves / (stats.saves + stats.goalsAgainst)) * 100).toFixed(1)
                                : "0.0"
                              }%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No statistics available for this season</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="contract" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Salary</Label>
                      <Input
                        type="number"
                        value={editedPlayer.salary || player.salary}
                        onChange={(e) => setEditedPlayer(prev => ({
                          ...prev,
                          salary: parseInt(e.target.value) || 0
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Contract Years</Label>
                      <Input
                        type="number"
                        min="1"
                        max="8"
                        value={editedPlayer.contractYears || player.contractYears}
                        onChange={(e) => setEditedPlayer(prev => ({
                          ...prev,
                          contractYears: parseInt(e.target.value) || 1
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Energy</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={editedPlayer.energy || player.energy}
                        onChange={(e) => setEditedPlayer(prev => ({
                          ...prev,
                          energy: parseInt(e.target.value) || 0
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Morale</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={editedPlayer.morale || player.morale}
                        onChange={(e) => setEditedPlayer(prev => ({
                          ...prev,
                          morale: parseInt(e.target.value) || 0
                        }))}
                      />
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Contract Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Value:</span>
                        <span className="font-medium">
                          {formatSalary((editedPlayer.salary || player.salary) * (editedPlayer.contractYears || player.contractYears))}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cap Hit:</span>
                        <span className="font-medium">{formatSalary(editedPlayer.salary || player.salary)}</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} className="bg-hockey-light hover:bg-hockey-blue">
                  Save Changes
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
