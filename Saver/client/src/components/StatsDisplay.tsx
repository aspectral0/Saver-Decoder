import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Atom, TrendingUp, Factory, Zap, Brain, Heart, User, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

interface StatsDisplayProps {
  data: any;
}

export default function StatsDisplay({ data }: StatsDisplayProps) {
  const [generatorsOpen, setGeneratorsOpen] = useState(false);
  const [upgradesOpen, setUpgradesOpen] = useState(false);

  const formatNumber = (num: string | number) => {
    const numStr = String(num);
    if (numStr.includes('e+') || numStr.includes('E+')) {
      return numStr;
    }
    const parsed = parseFloat(numStr);
    if (parsed >= 1e6) {
      return parsed.toExponential(2);
    }
    return parsed.toLocaleString();
  };

  const getIcon = (key: string) => {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes('atom')) return Atom;
    if (lowerKey.includes('prestige')) return TrendingUp;
    if (lowerKey.includes('generator')) return Factory;
    if (lowerKey.includes('upgrade')) return Zap;
    if (lowerKey.includes('mind') || lowerKey.includes('brain')) return Brain;
    if (lowerKey.includes('live') || lowerKey.includes('life') || lowerKey.includes('heart')) return Heart;
    if (lowerKey.includes('human') || lowerKey.includes('meta')) return User;
    return Atom;
  };

  const getColorIndex = (index: number) => {
    const colors = ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'];
    return colors[index % colors.length];
  };

  const formatKey = (key: string) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  const totalGenerators = data?.generators?.reduce((sum: number, gen: any) => sum + (gen.count || 0), 0) || 0;
  const totalUpgrades = data?.upgrades?.reduce((sum: number, upg: any) => sum + (upg.level || 0), 0) || 0;

  const renderSimpleValue = (value: any) => {
    if (typeof value === 'number' || !isNaN(Number(value))) {
      return formatNumber(value);
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    return String(value);
  };

  const simpleFields = Object.entries(data || {}).filter(([key, value]) => 
    !Array.isArray(value) && typeof value !== 'object'
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {simpleFields.map(([key, value], index) => {
          const Icon = getIcon(key);
          const colorClass = getColorIndex(index);
          
          return (
            <Card key={key} className={`p-4 border-${colorClass}/20 bg-gradient-to-br from-${colorClass}/5 to-transparent`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 bg-${colorClass}/15 rounded-md border border-${colorClass}/20`}>
                  <Icon className={`h-5 w-5 text-${colorClass}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{formatKey(key)}</p>
                  <p className="text-lg font-semibold truncate" data-testid={`text-${key.toLowerCase()}`}>
                    {renderSimpleValue(value)}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {data?.generators && data.generators.length > 0 && (
        <Collapsible open={generatorsOpen} onOpenChange={setGeneratorsOpen}>
          <Card className="p-4">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between hover-elevate p-4"
                data-testid="button-toggle-generators"
              >
                <div className="flex items-center gap-3">
                  <Factory className="h-5 w-5 text-chart-3" />
                  <div className="text-left">
                    <p className="font-semibold">Generators</p>
                    <p className="text-sm text-muted-foreground">Total: {formatNumber(totalGenerators)}</p>
                  </div>
                </div>
                {generatorsOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.generators.map((gen: any, index: number) => (
                  <Card key={gen.id || index} className="p-3 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{gen.id || `Generator ${index + 1}`}</span>
                      <span className="text-sm font-semibold text-chart-3" data-testid={`generator-${gen.id || index}-count`}>
                        {formatNumber(gen.count || 0)}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {data?.upgrades && data.upgrades.length > 0 && (
        <Collapsible open={upgradesOpen} onOpenChange={setUpgradesOpen}>
          <Card className="p-4">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-between hover-elevate p-4"
                data-testid="button-toggle-upgrades"
              >
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-chart-4" />
                  <div className="text-left">
                    <p className="font-semibold">Upgrades</p>
                    <p className="text-sm text-muted-foreground">Total Levels: {formatNumber(totalUpgrades)}</p>
                  </div>
                </div>
                {upgradesOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.upgrades.map((upg: any, index: number) => (
                  <Card key={upg.id || index} className="p-3 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{upg.id || `Upgrade ${index + 1}`}</span>
                      <span className="text-sm font-semibold text-chart-4" data-testid={`upgrade-${upg.id || index}-level`}>
                        Level {formatNumber(upg.level || 0)}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}
    </div>
  );
}
