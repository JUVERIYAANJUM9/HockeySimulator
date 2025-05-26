interface GameState {
  isSimulating: boolean;
  currentGame: any | null;
  simulationSpeed: "slow" | "normal" | "fast" | "instant";
  autoPause: "never" | "goals" | "periods" | "penalties";
  detailLevel: "minimal" | "basic" | "detailed";
}

class GameStateManager {
  private state: GameState = {
    isSimulating: false,
    currentGame: null,
    simulationSpeed: "normal",
    autoPause: "goals",
    detailLevel: "detailed"
  };

  private listeners: Set<(state: GameState) => void> = new Set();

  getState(): GameState {
    return { ...this.state };
  }

  subscribe(listener: (state: GameState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach(listener => listener(this.getState()));
  }

  setCurrentGame(game: any): void {
    this.state.currentGame = game;
    this.notify();
  }

  startSimulation(): void {
    this.state.isSimulating = true;
    this.notify();
  }

  stopSimulation(): void {
    this.state.isSimulating = false;
    this.notify();
  }

  pauseSimulation(): void {
    this.state.isSimulating = false;
    this.notify();
  }

  resumeSimulation(): void {
    this.state.isSimulating = true;
    this.notify();
  }

  setSimulationSpeed(speed: GameState["simulationSpeed"]): void {
    this.state.simulationSpeed = speed;
    this.notify();
  }

  setAutoPause(autoPause: GameState["autoPause"]): void {
    this.state.autoPause = autoPause;
    this.notify();
  }

  setDetailLevel(detailLevel: GameState["detailLevel"]): void {
    this.state.detailLevel = detailLevel;
    this.notify();
  }

  getSimulationInterval(): number {
    switch (this.state.simulationSpeed) {
      case "slow":
        return 5000; // 5 seconds
      case "normal":
        return 3000; // 3 seconds
      case "fast":
        return 1000; // 1 second
      case "instant":
        return 100; // 0.1 seconds
      default:
        return 3000;
    }
  }

  shouldAutoPause(eventType: string): boolean {
    switch (this.state.autoPause) {
      case "never":
        return false;
      case "goals":
        return eventType === "goal";
      case "periods":
        return eventType === "goal" || eventType === "period_end";
      case "penalties":
        return eventType === "goal" || eventType === "period_end" || eventType === "penalty";
      default:
        return false;
    }
  }

  shouldShowEvent(eventType: string): boolean {
    switch (this.state.detailLevel) {
      case "minimal":
        return eventType === "goal";
      case "basic":
        return ["goal", "penalty", "period_end"].includes(eventType);
      case "detailed":
        return true;
      default:
        return true;
    }
  }

  // Game simulation utilities
  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  formatPeriodTime(period: number, timeInPeriod: number): string {
    const minutes = Math.floor(timeInPeriod / 60);
    const seconds = timeInPeriod % 60;
    return `${period}P ${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  calculateGameProgress(game: any): number {
    if (!game) return 0;
    
    const totalPeriodTime = 1200; // 20 minutes in seconds
    const periodsCompleted = Math.max(0, game.period - 1);
    const currentPeriodProgress = (totalPeriodTime - game.timeRemaining) / totalPeriodTime;
    
    // Regular game is 3 periods
    const totalProgress = (periodsCompleted + currentPeriodProgress) / 3;
    return Math.min(100, totalProgress * 100);
  }

  isGameComplete(game: any): boolean {
    if (!game) return false;
    
    // Game is complete if:
    // 1. Regular time (3 periods) and no tie
    // 2. Overtime period and any result
    // 3. Game status is "completed"
    return game.status === "completed" ||
           (game.period >= 3 && game.timeRemaining === 0 && game.homeScore !== game.awayScore) ||
           (game.period === 4 && game.timeRemaining === 0);
  }

  getGameStatus(game: any): string {
    if (!game) return "No Game";
    
    if (this.isGameComplete(game)) {
      return "Final";
    }
    
    if (game.status === "live") {
      return "Live";
    }
    
    if (game.status === "paused") {
      return "Paused";
    }
    
    if (game.period === 4) {
      return "Overtime";
    }
    
    if (game.period === 0) {
      return "Pre-Game";
    }
    
    return `${game.period}${game.period === 1 ? "st" : game.period === 2 ? "nd" : "rd"} Period`;
  }

  // Event generation helpers
  generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateTimestamp(): string {
    return new Date().toISOString();
  }

  // Simulation speed calculations
  calculateEventFrequency(gameSpeed: GameState["simulationSpeed"]): number {
    // Events per minute in real hockey
    const baseEventsPerMinute = 3;
    
    switch (gameSpeed) {
      case "slow":
        return baseEventsPerMinute * 0.5; // Slower event generation
      case "normal":
        return baseEventsPerMinute;
      case "fast":
        return baseEventsPerMinute * 2;
      case "instant":
        return baseEventsPerMinute * 10;
      default:
        return baseEventsPerMinute;
    }
  }

  // Save/Load state
  saveState(): string {
    return JSON.stringify(this.state);
  }

  loadState(stateJson: string): void {
    try {
      const loadedState = JSON.parse(stateJson);
      this.state = { ...this.state, ...loadedState };
      this.notify();
    } catch (error) {
      console.error("Failed to load game state:", error);
    }
  }

  // Reset state
  reset(): void {
    this.state = {
      isSimulating: false,
      currentGame: null,
      simulationSpeed: "normal",
      autoPause: "goals",
      detailLevel: "detailed"
    };
    this.notify();
  }
}

// Create singleton instance
export const gameStateManager = new GameStateManager();

// React hook for using game state
import { useState, useEffect } from "react";

export function useGameState() {
  const [state, setState] = useState<GameState>(gameStateManager.getState());

  useEffect(() => {
    const unsubscribe = gameStateManager.subscribe(setState);
    return unsubscribe;
  }, []);

  return {
    ...state,
    setCurrentGame: gameStateManager.setCurrentGame.bind(gameStateManager),
    startSimulation: gameStateManager.startSimulation.bind(gameStateManager),
    stopSimulation: gameStateManager.stopSimulation.bind(gameStateManager),
    pauseSimulation: gameStateManager.pauseSimulation.bind(gameStateManager),
    resumeSimulation: gameStateManager.resumeSimulation.bind(gameStateManager),
    setSimulationSpeed: gameStateManager.setSimulationSpeed.bind(gameStateManager),
    setAutoPause: gameStateManager.setAutoPause.bind(gameStateManager),
    setDetailLevel: gameStateManager.setDetailLevel.bind(gameStateManager),
    getSimulationInterval: gameStateManager.getSimulationInterval.bind(gameStateManager),
    shouldAutoPause: gameStateManager.shouldAutoPause.bind(gameStateManager),
    shouldShowEvent: gameStateManager.shouldShowEvent.bind(gameStateManager),
    formatTime: gameStateManager.formatTime.bind(gameStateManager),
    formatPeriodTime: gameStateManager.formatPeriodTime.bind(gameStateManager),
    calculateGameProgress: gameStateManager.calculateGameProgress.bind(gameStateManager),
    isGameComplete: gameStateManager.isGameComplete.bind(gameStateManager),
    getGameStatus: gameStateManager.getGameStatus.bind(gameStateManager)
  };
}

export default gameStateManager;
