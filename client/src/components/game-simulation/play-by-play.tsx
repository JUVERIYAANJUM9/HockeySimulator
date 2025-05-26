import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Goal, 
  Target, 
  Shield, 
  ArrowRightLeft, 
  Circle,
  Clock
} from "lucide-react";

interface GameEvent {
  id: number;
  period: number;
  timeInPeriod: number;
  eventType: string;
  description: string;
  teamId?: number;
  playerId?: number;
}

interface PlayByPlayProps {
  events: GameEvent[];
}

export default function PlayByPlay({ events }: PlayByPlayProps) {
  const formatPeriodTime = (period: number, timeInPeriod: number) => {
    const minutes = Math.floor(timeInPeriod / 60);
    const seconds = timeInPeriod % 60;
    return `${period}P ${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "goal":
        return <Goal className="h-4 w-4 text-red-600" />;
      case "shot":
        return <Target className="h-4 w-4 text-blue-600" />;
      case "save":
        return <Shield className="h-4 w-4 text-green-600" />;
      case "turnover":
        return <ArrowRightLeft className="h-4 w-4 text-orange-600" />;
      case "faceoff":
        return <Circle className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case "goal":
        return "text-red-600 font-semibold";
      case "shot":
        return "text-blue-600";
      case "save":
        return "text-green-600";
      case "turnover":
        return "text-orange-600";
      case "penalty":
        return "text-yellow-600 font-medium";
      default:
        return "text-gray-900";
    }
  };

  const sortedEvents = [...events].sort((a, b) => {
    if (a.period !== b.period) {
      return b.period - a.period;
    }
    return b.timeInPeriod - a.timeInPeriod;
  });

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
        <Clock className="h-4 w-4 mr-2" />
        Play-by-Play
      </h4>
      <ScrollArea className="h-64">
        <div className="space-y-2">
          {sortedEvents.length > 0 ? (
            sortedEvents.map((event) => (
              <div key={event.id} className="flex items-start space-x-3 text-sm">
                <div className="flex items-center space-x-2 min-w-0 flex-shrink-0">
                  {getEventIcon(event.eventType)}
                  <span className="text-gray-500 font-mono text-xs">
                    {formatPeriodTime(event.period, event.timeInPeriod)}
                  </span>
                </div>
                <span className={getEventColor(event.eventType)}>
                  {event.description}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No events yet</p>
              <p className="text-gray-400 text-xs">Game events will appear here during simulation</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
