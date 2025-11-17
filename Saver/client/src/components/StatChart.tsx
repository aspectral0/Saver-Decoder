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

    const antimatter = data.antimatter ?? data.money ?? data.player?.antimatter ?? data.player?.money ?? 0;
    const infinities = data.infinities ?? data.player?.infinities ?? data.player?.infinitied ?? 0;
    const eternities = data.eternities ?? data.player?.eternities ?? 0;
    const realityShards = data.realityShards ?? data.player?.realityShards ?? 0;

    // Mock historical data for demonstration (in a real app, this would come from save history)
    const baseValues = [antimatter, infinities, eternities, realityShards];
    const historicalData = baseValues.map((value, index) => ({
      time: `T${index + 1}`,
      antimatter: Math.max(0, value * (0.1 + index * 0.3)),
      infinities: Math.max(0, infinities * (0.1 + index * 0.2)),
      eternities: Math.max(0, eternities * (0.1 + index * 0.15)),
      realityShards: Math.max(0, realityShards * (0.1 + index * 0.1)),
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
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="time" />
              <YAxis tickFormatter={formatValue} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="antimatter"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--chart-1))" }}
              />
              <Line
                type="monotone"
                dataKey="infinities"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--chart-2))" }}
              />
              <Line
                type="monotone"
                dataKey="eternities"
                stroke="hsl(var(--chart-3))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--chart-3))" }}
              />
              <Line
                type="monotone"
                dataKey="realityShards"
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
              <BarChart data={generatorData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={formatValue} />
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
