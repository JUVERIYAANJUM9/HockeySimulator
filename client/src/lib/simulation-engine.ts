interface SimulationPlayer {
  id: number;
  name: string;
  position: string;
  skating: number;
  shooting: number;
  passing: number;
  defense: number;
  physicality: number;
  hockey_iq: number;
  energy: number;
}

interface SimulationTeam {
  id: number;
  name: string;
  players: SimulationPlayer[];
  strategy: string;
}

interface SimulationGame {
  id: number;
  homeTeamId: number;
  awayTeamId: number;
  period: number;
  timeRemaining: number;
  homeScore: number;
  awayScore: number;
}

export interface SimulationEvent {
  type: "goal" | "shot" | "save" | "turnover" | "penalty" | "faceoff" | "hit";
  description: string;
  teamId: number;
  playerId?: number;
  assistPlayer1Id?: number;
  assistPlayer2Id?: number;
  period: number;
  timeInPeriod: number;
}

export class HockeySimulationEngine {
  private random(): number {
    return Math.random();
  }

  private weightedChoice<T>(choices: Array<{ item: T; weight: number }>): T {
    const totalWeight = choices.reduce((sum, choice) => sum + choice.weight, 0);
    let random = this.random() * totalWeight;
    
    for (const choice of choices) {
      random -= choice.weight;
      if (random <= 0) {
        return choice.item;
      }
    }
    
    return choices[choices.length - 1].item;
  }

  private calculatePlayerSkill(player: SimulationPlayer, skillType: 'offense' | 'defense' | 'goalie'): number {
    const energyMultiplier = player.energy / 100;
    
    switch (skillType) {
      case 'offense':
        return ((player.skating + player.shooting + player.passing + player.hockey_iq) / 4) * energyMultiplier;
      case 'defense':
        return ((player.skating + player.defense + player.physicality + player.hockey_iq) / 4) * energyMultiplier;
      case 'goalie':
        return ((player.defense + player.hockey_iq) / 2) * energyMultiplier;
      default:
        return 0;
    }
  }

  private getActivePlayers(team: SimulationTeam, lineType: 'forward' | 'defense' | 'goalie'): SimulationPlayer[] {
    switch (lineType) {
      case 'forward':
        return team.players.filter(p => ['C', 'LW', 'RW'].includes(p.position)).slice(0, 3);
      case 'defense':
        return team.players.filter(p => p.position === 'D').slice(0, 2);
      case 'goalie':
        return team.players.filter(p => p.position === 'G').slice(0, 1);
      default:
        return [];
    }
  }

  private generateEventDescription(event: SimulationEvent, attacking: SimulationTeam, defending: SimulationTeam): string {
    const attackingPlayer = attacking.players.find(p => p.id === event.playerId);
    const defendingGoalie = defending.players.find(p => p.position === 'G');
    
    switch (event.type) {
      case 'goal':
        const assist1 = attacking.players.find(p => p.id === event.assistPlayer1Id);
        const assist2 = attacking.players.find(p => p.id === event.assistPlayer2Id);
        let goalDesc = `⚡ GOAL! ${attacking.name} scores - ${attackingPlayer?.name || 'Unknown'}`;
        if (assist1) goalDesc += ` assisted by ${assist1.name}`;
        if (assist2) goalDesc += ` and ${assist2.name}`;
        return goalDesc;
        
      case 'shot':
        return `${attacking.name} shot on goal by ${attackingPlayer?.name || 'Unknown'} - Save by ${defendingGoalie?.name || 'Goalie'}`;
        
      case 'save':
        return `Great save by ${defendingGoalie?.name || 'Goalie'} (${defending.name})`;
        
      case 'turnover':
        return `${defending.name} forces turnover in ${this.getZoneName()}`;
        
      case 'faceoff':
        return `${attacking.name} wins faceoff in ${this.getZoneName()}`;
        
      case 'penalty':
        return `${attacking.name} penalty - ${attackingPlayer?.name || 'Unknown'} (2 min)`;
        
      case 'hit':
        return `${attacking.name} delivers hit - ${attackingPlayer?.name || 'Unknown'}`;
        
      default:
        return `${attacking.name} ${event.type}`;
    }
  }

  private getZoneName(): string {
    const zones = ['offensive zone', 'neutral zone', 'defensive zone'];
    return zones[Math.floor(this.random() * zones.length)];
  }

  public simulateEvent(game: SimulationGame, homeTeam: SimulationTeam, awayTeam: SimulationTeam): SimulationEvent | null {
    // Determine which team has possession (simplified)
    const attacking = this.random() > 0.5 ? homeTeam : awayTeam;
    const defending = attacking.id === homeTeam.id ? awayTeam : homeTeam;
    
    // Get active players
    const attackingForwards = this.getActivePlayers(attacking, 'forward');
    const attackingDefense = this.getActivePlayers(attacking, 'defense');
    const defendingGoalie = this.getActivePlayers(defending, 'goalie')[0];
    
    if (attackingForwards.length === 0) return null;
    
    // Calculate team strengths
    const attackingStrength = attackingForwards.reduce((sum, p) => sum + this.calculatePlayerSkill(p, 'offense'), 0) / attackingForwards.length;
    const defendingStrength = defendingGoalie ? this.calculatePlayerSkill(defendingGoalie, 'goalie') : 50;
    
    // Determine event type based on team strategies and skills
    const eventChoices = [
      { item: 'shot', weight: 30 + (attackingStrength - defendingStrength) / 2 },
      { item: 'faceoff', weight: 25 },
      { item: 'turnover', weight: 20 + (defendingStrength - attackingStrength) / 2 },
      { item: 'hit', weight: 15 },
      { item: 'penalty', weight: 5 },
    ];
    
    const eventType = this.weightedChoice(eventChoices);
    const activePlayer = attackingForwards[Math.floor(this.random() * attackingForwards.length)];
    
    // For shots, determine if it's a goal
    let finalEventType = eventType;
    if (eventType === 'shot') {
      const shotQuality = this.calculatePlayerSkill(activePlayer, 'offense');
      const saveChance = defendingGoalie ? this.calculatePlayerSkill(defendingGoalie, 'goalie') : 50;
      const goalProbability = Math.max(0.05, Math.min(0.25, (shotQuality - saveChance) / 400 + 0.1));
      
      if (this.random() < goalProbability) {
        finalEventType = 'goal';
      } else {
        finalEventType = 'save';
      }
    }
    
    // Generate assists for goals
    let assistPlayer1Id: number | undefined;
    let assistPlayer2Id: number | undefined;
    
    if (finalEventType === 'goal') {
      const possibleAssisters = attackingForwards.concat(attackingDefense).filter(p => p.id !== activePlayer.id);
      if (possibleAssisters.length > 0 && this.random() > 0.3) {
        assistPlayer1Id = possibleAssisters[Math.floor(this.random() * possibleAssisters.length)].id;
        
        if (possibleAssisters.length > 1 && this.random() > 0.6) {
          const remainingAssisters = possibleAssisters.filter(p => p.id !== assistPlayer1Id);
          assistPlayer2Id = remainingAssisters[Math.floor(this.random() * remainingAssisters.length)].id;
        }
      }
    }
    
    const event: SimulationEvent = {
      type: finalEventType as any,
      description: '',
      teamId: attacking.id,
      playerId: activePlayer.id,
      assistPlayer1Id,
      assistPlayer2Id,
      period: game.period,
      timeInPeriod: 1200 - game.timeRemaining
    };
    
    event.description = this.generateEventDescription(event, attacking, defending);
    
    return event;
  }

  public simulateTimeStep(game: SimulationGame, timeStep: number = 1): Partial<SimulationGame> {
    const newTimeRemaining = Math.max(0, game.timeRemaining - timeStep);
    let newPeriod = game.period;
    
    // Handle period transitions
    if (newTimeRemaining === 0 && game.period < 3) {
      newPeriod = game.period + 1;
      return {
        period: newPeriod,
        timeRemaining: 1200 // 20 minutes
      };
    } else if (newTimeRemaining === 0 && game.period === 3) {
      // Game over or overtime logic
      if (game.homeScore === game.awayScore) {
        // Overtime
        newPeriod = 4;
        return {
          period: newPeriod,
          timeRemaining: 300 // 5 minutes OT
        };
      }
    }
    
    return {
      timeRemaining: newTimeRemaining
    };
  }

  public isGameComplete(game: SimulationGame): boolean {
    return (game.period >= 3 && game.timeRemaining === 0 && game.homeScore !== game.awayScore) ||
           (game.period === 4 && game.timeRemaining === 0);
  }
}

export const simulationEngine = new HockeySimulationEngine();
