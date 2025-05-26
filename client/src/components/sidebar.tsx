import { Link, useLocation } from "wouter";
import { 
  Trophy, 
  Users, 
  Play, 
  TrendingUp, 
  Dumbbell, 
  ArrowLeftRight, 
  BarChart3,
  User,
  Goal
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    title: "Game Management",
    items: [
      { name: "Dashboard", href: "/", icon: TrendingUp },
      { name: "Team Roster", href: "/team-roster", icon: Users },
      { name: "Game Simulation", href: "/game-simulation", icon: Play },
      { name: "League Standings", href: "/league-standings", icon: Trophy },
    ]
  },
  {
    title: "Player Development", 
    items: [
      { name: "Training", href: "/training", icon: Dumbbell },
      { name: "Trades & Draft", href: "/trades-draft", icon: ArrowLeftRight },
      { name: "Analytics", href: "/analytics", icon: BarChart3 },
    ]
  }
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-rink-dark text-white shadow-2xl">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-hockey-light rounded-lg flex items-center justify-center">
            <Goal className="text-white h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Hockey Manager</h1>
            <p className="text-gray-400 text-sm">Pro Edition</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="mt-6">
        {navigationItems.map((section) => (
          <div key={section.title}>
            <div className="px-6">
              <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-3">
                {section.title}
              </p>
            </div>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = location === item.href;
                const Icon = item.icon;
                
                return (
                  <Link key={item.name} href={item.href}>
                    <div
                      className={cn(
                        "flex items-center px-6 py-3 text-sm font-medium transition-colors cursor-pointer",
                        isActive
                          ? "text-hockey-light bg-blue-900/30 border-r-2 border-hockey-light"
                          : "text-gray-300 hover:text-white hover:bg-gray-700"
                      )}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {item.name}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      
      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-hockey-red rounded-full flex items-center justify-center">
            <User className="text-white h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-white text-sm font-medium">John Doe</p>
            <p className="text-gray-400 text-xs">Head Coach</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
