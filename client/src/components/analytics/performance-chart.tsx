import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface PerformanceChartProps {
  data: any[];
}

export default function PerformanceChart({ data }: PerformanceChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const calculateTrend = (dataKey: string) => {
    if (data.length < 2) return 0;
    const recent = data.slice(-3).reduce((sum, item) => sum + item[dataKey], 0) / 3;
    const earlier = data.slice(0, 3).reduce((sum, item) => sum + item[dataKey], 0) / 3;
    return ((recent - earlier) / earlier * 100).toFixed(1);
  };

  const goalsTrend = calculateTrend('goalsFor');
  const shotsTrend = calculateTrend('shots');

  return (
    <Tabs defaultValue="goals" className="space-y-4">
      <div className="flex items-center justify-between">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="shots">Shots</TabsTrigger>
          <TabsTrigger value="comparison">Compare</TabsTrigger>
        </TabsList>
        
        <div className="flex items-center space-x-3">
          <Badge variant={parseFloat(goalsTrend) > 0 ? "default" : "secondary"}>
            Goals: {parseFloat(goalsTrend) > 0 ? "+" : ""}{goalsTrend}%
          </Badge>
          <Badge variant={parseFloat(shotsTrend) > 0 ? "default" : "secondary"}>
            Shots: {parseFloat(shotsTrend) > 0 ? "+" : ""}{shotsTrend}%
          </Badge>
        </div>
      </div>

      <TabsContent value="goals" className="space-y-4">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="game" 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="goalsFor" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
                name="Goals For"
              />
              <Line 
                type="monotone" 
                dataKey="goalsAgainst" 
                stroke="#ef4444" 
                strokeWidth={3}
                dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
                name="Goals Against"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {data.length > 0 ? (data.reduce((sum, game) => sum + game.goalsFor, 0) / data.length).toFixed(1) : "0.0"}
                </p>
                <p className="text-sm text-gray-600">Avg Goals For</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {data.length > 0 ? (data.reduce((sum, game) => sum + game.goalsAgainst, 0) / data.length).toFixed(1) : "0.0"}
                </p>
                <p className="text-sm text-gray-600">Avg Goals Against</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="shots" className="space-y-4">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="game" 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="shots" 
                fill="#8b5cf6" 
                name="Shots"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="saves" 
                fill="#10b981" 
                name="Saves"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {data.length > 0 ? (data.reduce((sum, game) => sum + game.shots, 0) / data.length).toFixed(1) : "0.0"}
                </p>
                <p className="text-sm text-gray-600">Avg Shots</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {data.length > 0 ? (data.reduce((sum, game) => sum + game.saves, 0) / data.length).toFixed(1) : "0.0"}
                </p>
                <p className="text-sm text-gray-600">Avg Saves</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="comparison" className="space-y-4">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="game" 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="goalsFor" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 3 }}
                name="Goals For"
              />
              <Line 
                type="monotone" 
                dataKey="goalsAgainst" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={{ fill: "#ef4444", strokeWidth: 2, r: 3 }}
                name="Goals Against"
              />
              <Line 
                type="monotone" 
                dataKey="shots" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 3 }}
                name="Shots"
                yAxisId="right"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-lg font-bold text-blue-600">
                  {data.length > 0 ? data.reduce((sum, game) => sum + game.goalsFor, 0) : 0}
                </p>
                <p className="text-xs text-gray-600">Total Goals For</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-lg font-bold text-red-600">
                  {data.length > 0 ? data.reduce((sum, game) => sum + game.goalsAgainst, 0) : 0}
                </p>
                <p className="text-xs text-gray-600">Total Goals Against</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-lg font-bold text-purple-600">
                  {data.length > 0 ? data.reduce((sum, game) => sum + game.shots, 0) : 0}
                </p>
                <p className="text-xs text-gray-600">Total Shots</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">
                  {data.length > 0 ? 
                    ((data.reduce((sum, game) => sum + game.goalsFor, 0) / 
                      data.reduce((sum, game) => sum + game.shots, 0)) * 100).toFixed(1) : "0.0"
                  }%
                </p>
                <p className="text-xs text-gray-600">Shooting %</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}
