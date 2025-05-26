import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Sidebar from "@/components/sidebar";
import Dashboard from "@/pages/dashboard";
import TeamRoster from "@/pages/team-roster";
import GameSimulation from "@/pages/game-simulation";
import LeagueStandings from "@/pages/league-standings";
import Training from "@/pages/training";
import TradesDraft from "@/pages/trades-draft";
import Analytics from "@/pages/analytics";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/team-roster" component={TeamRoster} />
          <Route path="/game-simulation" component={GameSimulation} />
          <Route path="/league-standings" component={LeagueStandings} />
          <Route path="/training" component={Training} />
          <Route path="/trades-draft" component={TradesDraft} />
          <Route path="/analytics" component={Analytics} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
