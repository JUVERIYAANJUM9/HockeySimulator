import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Save, 
  RotateCcw,
  Plus,
  Minus,
  ArrowUpDown
} from "lucide-react";

interface LineupEditorProps {
  players: any[];
  lineups: any[];
  teamId: number;
}

export default function LineupEditor({ players, lineups, teamId }: LineupEditorProps) {
  const [editingLineups, setEditingLineups] = useState(() => {
    // Initialize with existing lineups or create default structure
    const forwardLines = [];
    const defensePairs = [];
    let goalie = null;

    // Get existing lineups
    lineups.forEach((lineup: any) => {
      if (lineup.lineType === "forward") {
        forwardLines[lineup.lineNumber - 1] = {
          id: lineup.id,
          center: lineup.centerId,
          leftWing: lineup.leftWingId,
          rightWing: lineup.rightWingId,
        };
      } else if (lineup.lineType === "defense") {
        defensePairs[lineup.lineNumber - 1] = {
          id: lineup.id,
          leftDefense: lineup.leftDefenseId,
          rightDefense: lineup.rightDefenseId,
        };
      }
    });

    // Fill empty lines with null values
    while (forwardLines.length < 4) {
      forwardLines.push({ center: null, leftWing: null, rightWing: null });
    }
    while (defensePairs.length < 3) {
      defensePairs.push({ leftDefense: null, rightDefense: null });
    }

    // Set goalie (first goalie found)
    const goalies = players.filter(p => p.position === "G");
    goalie = goalies.length > 0 ? goalies[0].id : null;

    return { forwardLines, defensePairs, goalie };
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const saveLineupsMutation = useMutation({
    mutationFn: async () => {
      const lineupPromises = [];

      // Save forward lines
      editingLineups.forwardLines.forEach((line: any, index: number) => {
        if (line.center || line.leftWing || line.rightWing) {
          const lineupData = {
            teamId,
            lineNumber: index + 1,
            lineType: "forward",
            centerId: line.center,
            leftWingId: line.leftWing,
            rightWingId: line.rightWing,
            isActive: true,
          };

          if (line.id) {
            lineupPromises.push(
              apiRequest("PATCH", `/api/lineups/${line.id}`, lineupData)
            );
          } else {
            lineupPromises.push(
              apiRequest("POST", "/api/lineups", lineupData)
            );
          }
        }
      });

      // Save defense pairs
      editingLineups.defensePairs.forEach((pair: any, index: number) => {
        if (pair.leftDefense || pair.rightDefense) {
          const lineupData = {
            teamId,
            lineNumber: index + 1,
            lineType: "defense",
            leftDefenseId: pair.leftDefense,
            rightDefenseId: pair.rightDefense,
            isActive: true,
          };

          if (pair.id) {
            lineupPromises.push(
              apiRequest("PATCH", `/api/lineups/${pair.id}`, lineupData)
            );
          } else {
            lineupPromises.push(
              apiRequest("POST", "/api/lineups", lineupData)
            );
          }
        }
      });

      return Promise.all(lineupPromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams", teamId, "lineups"] });
      toast({
        title: "Lineups Saved",
        description: "Team lineups have been successfully updated.",
      });
    }
  });

  const resetLineupsMutation = useMutation({
    mutationFn: () => {
      // Auto-generate lineups based on player overall ratings
      const forwards = players.filter(p => ["C", "LW", "RW"].includes(p.position));
      const defense = players.filter(p => p.position === "D");
      const goalies = players.filter(p => p.position === "G");

      // Sort by overall rating
      const calculateOverall = (player: any) => 
        Math.round((player.skating + player.shooting + player.passing + player.defense + player.physicality + player.hockey_iq) / 6);

      forwards.sort((a, b) => calculateOverall(b) - calculateOverall(a));
      defense.sort((a, b) => calculateOverall(b) - calculateOverall(a));

      // Create lines
      const newForwardLines = [];
      const newDefensePairs = [];

      // Distribute forwards across 4 lines
      for (let i = 0; i < 4; i++) {
        const centers = forwards.filter(p => p.position === "C");
        const leftWings = forwards.filter(p => p.position === "LW");
        const rightWings = forwards.filter(p => p.position === "RW");

        newForwardLines.push({
          center: centers[i]?.id || null,
          leftWing: leftWings[i]?.id || null,
          rightWing: rightWings[i]?.id || null,
        });
      }

      // Distribute defense across 3 pairs
      for (let i = 0; i < 3; i++) {
        newDefensePairs.push({
          leftDefense: defense[i * 2]?.id || null,
          rightDefense: defense[i * 2 + 1]?.id || null,
        });
      }

      setEditingLineups({
        forwardLines: newForwardLines,
        defensePairs: newDefensePairs,
        goalie: goalies[0]?.id || null,
      });

      return Promise.resolve();
    },
    onSuccess: () => {
      toast({
        title: "Lineups Reset",
        description: "Lineups have been auto-generated based on player ratings.",
      });
    }
  });

  const getPlayersByPosition = (position: string[]) => {
    return players.filter(p => position.includes(p.position));
  };

  const getPlayerName = (playerId: number | null) => {
    if (!playerId) return "Select Player";
    const player = players.find(p => p.id === playerId);
    return player ? `${player.name} (${player.jerseyNumber})` : "Unknown Player";
  };

  const updateForwardLine = (lineIndex: number, position: string, playerId: number | null) => {
    setEditingLineups(prev => ({
      ...prev,
      forwardLines: prev.forwardLines.map((line, index) => 
        index === lineIndex ? { ...line, [position]: playerId } : line
      )
    }));
  };

  const updateDefensePair = (pairIndex: number, position: string, playerId: number | null) => {
    setEditingLineups(prev => ({
      ...prev,
      defensePairs: prev.defensePairs.map((pair, index) => 
        index === pairIndex ? { ...pair, [position]: playerId } : pair
      )
    }));
  };

  const getUsedPlayerIds = () => {
    const used = new Set();
    
    editingLineups.forwardLines.forEach(line => {
      if (line.center) used.add(line.center);
      if (line.leftWing) used.add(line.leftWing);
      if (line.rightWing) used.add(line.rightWing);
    });
    
    editingLineups.defensePairs.forEach(pair => {
      if (pair.leftDefense) used.add(pair.leftDefense);
      if (pair.rightDefense) used.add(pair.rightDefense);
    });
    
    if (editingLineups.goalie) used.add(editingLineups.goalie);
    
    return used;
  };

  const usedPlayerIds = getUsedPlayerIds();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Line Combinations
        </h3>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => resetLineupsMutation.mutate()}
            disabled={resetLineupsMutation.isPending}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Auto-Generate
          </Button>
          <Button
            onClick={() => saveLineupsMutation.mutate()}
            disabled={saveLineupsMutation.isPending}
            className="bg-hockey-light hover:bg-hockey-blue"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Lineups
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Forward Lines */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Forward Lines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {editingLineups.forwardLines.map((line, lineIndex) => (
              <div key={lineIndex} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">Line {lineIndex + 1}</h4>
                  <Badge variant={lineIndex === 0 ? "default" : "secondary"}>
                    {lineIndex === 0 ? "Top Line" : lineIndex === 1 ? "2nd Line" : lineIndex === 2 ? "3rd Line" : "4th Line"}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  {/* Left Wing */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">LW</label>
                    <Select
                      value={line.leftWing?.toString() || ""}
                      onValueChange={(value) => updateForwardLine(lineIndex, "leftWing", value ? parseInt(value) : null)}
                    >
                      <SelectTrigger className="h-20 flex-col items-start justify-start p-2">
                        <SelectValue placeholder="Select LW" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No Player</SelectItem>
                        {getPlayersByPosition(["LW"]).map(player => (
                          <SelectItem 
                            key={player.id} 
                            value={player.id.toString()}
                            disabled={usedPlayerIds.has(player.id) && line.leftWing !== player.id}
                          >
                            <div className="flex flex-col items-start">
                              <span className="font-medium">{player.name}</span>
                              <span className="text-sm text-gray-500">#{player.jerseyNumber}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Center */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">C</label>
                    <Select
                      value={line.center?.toString() || ""}
                      onValueChange={(value) => updateForwardLine(lineIndex, "center", value ? parseInt(value) : null)}
                    >
                      <SelectTrigger className="h-20 flex-col items-start justify-start p-2">
                        <SelectValue placeholder="Select C" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No Player</SelectItem>
                        {getPlayersByPosition(["C"]).map(player => (
                          <SelectItem 
                            key={player.id} 
                            value={player.id.toString()}
                            disabled={usedPlayerIds.has(player.id) && line.center !== player.id}
                          >
                            <div className="flex flex-col items-start">
                              <span className="font-medium">{player.name}</span>
                              <span className="text-sm text-gray-500">#{player.jerseyNumber}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Right Wing */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">RW</label>
                    <Select
                      value={line.rightWing?.toString() || ""}
                      onValueChange={(value) => updateForwardLine(lineIndex, "rightWing", value ? parseInt(value) : null)}
                    >
                      <SelectTrigger className="h-20 flex-col items-start justify-start p-2">
                        <SelectValue placeholder="Select RW" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No Player</SelectItem>
                        {getPlayersByPosition(["RW"]).map(player => (
                          <SelectItem 
                            key={player.id} 
                            value={player.id.toString()}
                            disabled={usedPlayerIds.has(player.id) && line.rightWing !== player.id}
                          >
                            <div className="flex flex-col items-start">
                              <span className="font-medium">{player.name}</span>
                              <span className="text-sm text-gray-500">#{player.jerseyNumber}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Defense Pairs & Goalie */}
        <div className="space-y-6">
          {/* Defense Pairs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Defense Pairs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {editingLineups.defensePairs.map((pair, pairIndex) => (
                <div key={pairIndex} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">Pair {pairIndex + 1}</h4>
                    <Badge variant={pairIndex === 0 ? "default" : "secondary"}>
                      {pairIndex === 0 ? "Top Pair" : pairIndex === 1 ? "2nd Pair" : "3rd Pair"}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {/* Left Defense */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">LD</label>
                      <Select
                        value={pair.leftDefense?.toString() || ""}
                        onValueChange={(value) => updateDefensePair(pairIndex, "leftDefense", value ? parseInt(value) : null)}
                      >
                        <SelectTrigger className="h-20 flex-col items-start justify-start p-2">
                          <SelectValue placeholder="Select LD" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No Player</SelectItem>
                          {getPlayersByPosition(["D"]).map(player => (
                            <SelectItem 
                              key={player.id} 
                              value={player.id.toString()}
                              disabled={usedPlayerIds.has(player.id) && pair.leftDefense !== player.id}
                            >
                              <div className="flex flex-col items-start">
                                <span className="font-medium">{player.name}</span>
                                <span className="text-sm text-gray-500">#{player.jerseyNumber}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Right Defense */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">RD</label>
                      <Select
                        value={pair.rightDefense?.toString() || ""}
                        onValueChange={(value) => updateDefensePair(pairIndex, "rightDefense", value ? parseInt(value) : null)}
                      >
                        <SelectTrigger className="h-20 flex-col items-start justify-start p-2">
                          <SelectValue placeholder="Select RD" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No Player</SelectItem>
                          {getPlayersByPosition(["D"]).map(player => (
                            <SelectItem 
                              key={player.id} 
                              value={player.id.toString()}
                              disabled={usedPlayerIds.has(player.id) && pair.rightDefense !== player.id}
                            >
                              <div className="flex flex-col items-start">
                                <span className="font-medium">{player.name}</span>
                                <span className="text-sm text-gray-500">#{player.jerseyNumber}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Goalie */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Starting Goalie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Goaltender</label>
                <Select
                  value={editingLineups.goalie?.toString() || ""}
                  onValueChange={(value) => setEditingLineups(prev => ({
                    ...prev,
                    goalie: value ? parseInt(value) : null
                  }))}
                >
                  <SelectTrigger className="h-20 flex-col items-start justify-start p-2">
                    <SelectValue placeholder="Select Goalie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Player</SelectItem>
                    {getPlayersByPosition(["G"]).map(player => (
                      <SelectItem key={player.id} value={player.id.toString()}>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{player.name}</span>
                          <span className="text-sm text-gray-500">#{player.jerseyNumber}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Lineup Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lineup Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Forwards</h4>
              <div className="space-y-2">
                {editingLineups.forwardLines.map((line, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium">Line {index + 1}:</span>
                    <div className="text-gray-600 ml-2">
                      {[line.leftWing, line.center, line.rightWing].map(playerId => 
                        playerId ? getPlayerName(playerId).split(' (')[0] : 'Empty'
                      ).join(' - ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Defense</h4>
              <div className="space-y-2">
                {editingLineups.defensePairs.map((pair, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium">Pair {index + 1}:</span>
                    <div className="text-gray-600 ml-2">
                      {[pair.leftDefense, pair.rightDefense].map(playerId => 
                        playerId ? getPlayerName(playerId).split(' (')[0] : 'Empty'
                      ).join(' - ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Goalie</h4>
              <div className="text-sm">
                <span className="font-medium">Starter:</span>
                <div className="text-gray-600 ml-2">
                  {editingLineups.goalie ? getPlayerName(editingLineups.goalie).split(' (')[0] : 'No goalie selected'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
