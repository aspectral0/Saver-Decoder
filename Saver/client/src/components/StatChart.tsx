import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StatChartProps {
  data: any;
}

export default function StatChart({ data }: StatChartProps) {
  const chartData = useMemo(() => {
    if (!data) return [];

    // Atom Idle specific data
    const atoms = parseFloat(data.atoms) || 0;
    const prestigePoints = parseFloat(data.prestigePoints) || 0;
    const lives = parseFloat(data.lives) || 0;
    const stardust = parseFloat(data.stardust) || 0;

    // Mock historical data for demonstration (in a real app, this would come from save history)
    const baseValues = [atoms, prestigePoints, lives, stardust];
    const historicalData = baseValues.map((value, index) => ({
      time: `T${index + 1}`,
      atoms: Math.max(0, atoms * (0.1 + index * 0.3)),
      prestigePoints: Math.max(0, prestigePoints * (0.1 + index * 0.2)),
      lives: Math.max(0, lives * (0.1 + index * 0.15)),
      stardust: Math.max(0, stardust * (0.1 + index * 0.1)),
    }));

    return historicalData;
  }, [data]);

  const generatorData = useMemo(() => {
    if (!data?.generators || !Array.isArray(data.generators)) return [];

    return data.generators.map((gen: any, index: number) => ({
      name: gen.id || `Generator ${index + 1}`,
      count: gen.count || 0,
      level: gen.level || 0,
    }));
  }, [data]);

  const formatValue = (value: number) => {
    if (value >= 1e6) {
      return value.toExponential(2);
    }
    return value.toLocaleString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{`Time: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey}: ${formatValue(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!data) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          No data available for charts
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="h-5 w-5 text-chart-1" />
          <h3 className="text-lg font-semibold">Progress Over Time</h3>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 50, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="time" />
              <YAxis width={80} tickFormatter={formatValue} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="atoms"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--chart-1))" }}
              />
              <Line
                type="monotone"
                dataKey="prestigePoints"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--chart-2))" }}
              />
              <Line
                type="monotone"
                dataKey="lives"
                stroke="hsl(var(--chart-3))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--chart-3))" }}
              />
              <Line
                type="monotone"
                dataKey="stardust"
                stroke="hsl(var(--chart-4))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--chart-4))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {generatorData.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="h-5 w-5 text-chart-2" />
            <h3 className="text-lg font-semibold">Generator Counts</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={generatorData} margin={{ top: 20, right: 50, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" />
                <YAxis width={80} tickFormatter={formatValue} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="hsl(var(--chart-2))" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
}
