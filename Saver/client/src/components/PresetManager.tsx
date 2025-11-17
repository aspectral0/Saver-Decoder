import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap, Infinity, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PresetManagerProps {
  data: any;
  onApplyPreset: (presetData: any) => void;
}

const PRESETS = [
  {
    id: "max-generators",
    name: "Max Generators",
    description: "Set all generators to maximum count",
    icon: Zap,
    color: "chart-2",
    apply: (data: any) => {
      const newData = JSON.parse(JSON.stringify(data));
      // For Antimatter Dimensions, generators are under dimensions.antimatter
      if (newData.dimensions?.antimatter && Array.isArray(newData.dimensions.antimatter)) {
        newData.dimensions.antimatter = newData.dimensions.antimatter.map((gen: any) => ({
          ...gen,
          amount: "1e308", // Maximum safe number as string
        }));
      }
      // For Atom Idle, generators are in a top-level generators array
      if (newData.generators && Array.isArray(newData.generators)) {
        newData.generators = newData.generators.map((gen: any) => ({
          ...gen,
          count: "1e308", // Maximum safe number as string
        }));
      }
      return newData;
    },
  },
  {
    id: "infinite-antimatter",
    name: "Infinite Antimatter",
    description: "Set antimatter to infinite",
    icon: Infinity,
    color: "chart-1",
    apply: (data: any) => {
      const newData = JSON.parse(JSON.stringify(data));
      if (newData.antimatter !== undefined) newData.antimatter = 1e308;
      if (newData.money !== undefined) newData.money = 1e308;
      if (newData.player?.antimatter !== undefined) newData.player.antimatter = 1e308;
      if (newData.player?.money !== undefined) newData.player.money = 1e308;
      return newData;
    },
  },
  {
    id: "max-infinities",
    name: "Max Infinities",
    description: "Set infinities to maximum",
    icon: Star,
    color: "chart-3",
    apply: (data: any) => {
      const newData = JSON.parse(JSON.stringify(data));
      if (newData.infinities !== undefined) newData.infinities = 1e308;
      if (newData.player?.infinities !== undefined) newData.player.infinities = 1e308;
      if (newData.player?.infinitied !== undefined) newData.player.infinitied = 1e308;
      return newData;
    },
  },
  {
    id: "reset-progress",
    name: "Reset Progress",
    description: "Reset all values to zero",
    icon: Sparkles,
    color: "destructive",
    apply: (data: any) => {
      const newData = JSON.parse(JSON.stringify(data));
      // Reset basic values
      if (newData.antimatter !== undefined) newData.antimatter = 0;
      if (newData.money !== undefined) newData.money = 0;
      if (newData.infinities !== undefined) newData.infinities = 0;
      if (newData.eternities !== undefined) newData.eternities = 0;
      if (newData.realityShards !== undefined) newData.realityShards = 0;

      // Reset player values
      if (newData.player) {
        if (newData.player.antimatter !== undefined) newData.player.antimatter = 0;
        if (newData.player.money !== undefined) newData.player.money = 0;
        if (newData.player.infinities !== undefined) newData.player.infinities = 0;
        if (newData.player.infinitied !== undefined) newData.player.infinitied = 0;
        if (newData.player.eternities !== undefined) newData.player.eternities = 0;
        if (newData.player.realityShards !== undefined) newData.player.realityShards = 0;
      }

      // Reset generators
      if (newData.generators && Array.isArray(newData.generators)) {
        newData.generators = newData.generators.map((gen: any) => ({
          ...gen,
          count: 0,
        }));
      }

      // Reset upgrades
      if (newData.upgrades && Array.isArray(newData.upgrades)) {
        newData.upgrades = newData.upgrades.map((upg: any) => ({
          ...upg,
          level: 0,
        }));
      }

      return newData;
    },
  },
];

export default function PresetManager({ data, onApplyPreset }: PresetManagerProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    try {
      const newData = preset.apply(data);
      onApplyPreset(newData);
      setIsOpen(false);
      toast({
        title: "Preset Applied",
        description: `${preset.name} preset has been applied to your save.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to apply preset. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="h-4 w-4" />
          Apply Preset
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Apply Preset Templates</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {PRESETS.map((preset) => {
            const Icon = preset.icon;
            return (
              <Card key={preset.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className={`p-2 bg-${preset.color}/15 rounded-md border border-${preset.color}/20`}>
                    <Icon className={`h-5 w-5 text-${preset.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm">{preset.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{preset.description}</p>
                    <Button
                      size="sm"
                      className="mt-3 w-full"
                      onClick={() => handleApplyPreset(preset)}
                      variant={preset.id === "reset-progress" ? "destructive" : "default"}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            <strong>Warning:</strong> Applying presets will modify your save data. Make sure to download a backup first.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
