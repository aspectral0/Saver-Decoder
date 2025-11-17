
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Plus, Trash2 } from "lucide-react";

interface ValueEditorProps {
  data: any;
  onSave: (data: any) => void;
}

export default function ValueEditor({ data, onSave }: ValueEditorProps) {
  const [editedData, setEditedData] = useState<any>({});

  useEffect(() => {
    setEditedData(JSON.parse(JSON.stringify(data)));
  }, [data]);

  const updateSimpleValue = (key: string, value: string) => {
    setEditedData({ ...editedData, [key]: value });
  };

  const updateGeneratorCount = (index: number, count: string) => {
    const newGenerators = [...(editedData.generators || [])];
    newGenerators[index] = { ...newGenerators[index], count: parseFloat(count) || 0 };
    setEditedData({ ...editedData, generators: newGenerators });
  };

  const updateUpgradeLevel = (index: number, level: string) => {
    const newUpgrades = [...(editedData.upgrades || [])];
    newUpgrades[index] = { ...newUpgrades[index], level: parseFloat(level) || 0 };
    setEditedData({ ...editedData, upgrades: newUpgrades });
  };

  const addGenerator = () => {
    const newGenerators = [...(editedData.generators || [])];
    const nextId = `gen${newGenerators.length + 1}`;
    newGenerators.push({ id: nextId, count: 0 });
    setEditedData({ ...editedData, generators: newGenerators });
  };

  const removeGenerator = (index: number) => {
    const newGenerators = editedData.generators.filter((_: any, i: number) => i !== index);
    setEditedData({ ...editedData, generators: newGenerators });
  };

  const addUpgrade = () => {
    const newUpgrades = [...(editedData.upgrades || [])];
    const nextId = `upgrade${newUpgrades.length + 1}`;
    newUpgrades.push({ id: nextId, level: 0 });
    setEditedData({ ...editedData, upgrades: newUpgrades });
  };

  const removeUpgrade = (index: number) => {
    const newUpgrades = editedData.upgrades.filter((_: any, i: number) => i !== index);
    setEditedData({ ...editedData, upgrades: newUpgrades });
  };

  const handleSave = () => {
    onSave(editedData);
  };

  const formatKey = (key: string) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  const getPlaceholder = (key: string) => {
    const lower = key.toLowerCase();
    if (lower.includes('antimatter') || lower.includes('money')) return 'e.g. 1000000';
    if (lower.includes('infinity') || lower.includes('infinities')) return 'e.g. 100';
    if (lower.includes('eternity') || lower.includes('eternities')) return 'e.g. 50';
    if (lower.includes('count')) return 'e.g. 10';
    if (lower.includes('level')) return 'e.g. 5';
    if (lower.includes('id')) return `e.g. ${key.toLowerCase()}1`;
    if (lower.includes('unlocked')) return 'e.g. true';
    if (lower.includes('prestige')) return 'e.g. 25';
    if (lower.includes('reality')) return 'e.g. 10';
    return formatKey(key);
  };

  const simpleFields = Object.entries(editedData).filter(([key, value]) => 
    !Array.isArray(value) && (typeof value !== 'object' || value === null)
  );

  const objectFields = Object.entries(editedData).filter(([key, value]) => 
    typeof value === 'object' && value !== null && !Array.isArray(value)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Edit Save Values</h3>
        <Button onClick={handleSave} data-testid="button-save-values">
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <Card className="p-6">
        <h4 className="font-semibold mb-4">Basic Values</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {simpleFields.map(([key, value]) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={`field-${key}`}>{formatKey(key)}</Label>
              <Input
                id={`field-${key}`}
                value={String(editedData[key] || '')}
                onChange={(e) => updateSimpleValue(key, e.target.value)}
                placeholder={getPlaceholder(key)}
              />
            </div>
          ))}
        </div>
      </Card>

      {objectFields.length > 0 && (
        <Card className="p-6">
          <h4 className="font-semibold mb-4">Object Values</h4>
          <div className="space-y-4">
            {objectFields.map(([key, value]) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={`obj-${key}`}>{formatKey(key)}</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(value as Record<string, any>).map(([subKey, subValue]) => (
                    <div key={subKey} className="space-y-1">
                      <Label htmlFor={`obj-${key}-${subKey}`} className="text-xs text-muted-foreground">
                        {formatKey(subKey)}
                      </Label>
                      <Input
                        id={`obj-${key}-${subKey}`}
                        value={String(subValue || '')}
                        onChange={(e) => {
                          const newValue = { ...(editedData[key] as Record<string, any>), [subKey]: e.target.value };
                          setEditedData({ ...editedData, [key]: newValue });
                        }}
                        placeholder={getPlaceholder(subKey)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold">Generators</h4>
          <Button size="sm" variant="outline" onClick={addGenerator}>
            <Plus className="h-4 w-4 mr-2" />
            Add Generator
          </Button>
        </div>
        {editedData.generators && editedData.generators.length > 0 ? (
          <div className="space-y-3">
            {editedData.generators.map((gen: any, index: number) => (
              <div key={gen.id || index} className="flex items-center gap-3">
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`gen-id-${index}`}>ID</Label>
                    <Input
                      id={`gen-id-${index}`}
                      value={gen.id || ''}
                      onChange={(e) => {
                        const newGenerators = [...editedData.generators];
                        newGenerators[index] = { ...newGenerators[index], id: e.target.value };
                        setEditedData({ ...editedData, generators: newGenerators });
                      }}
                      placeholder={getPlaceholder('id')}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`gen-count-${index}`}>Count</Label>
                    <Input
                      id={`gen-count-${index}`}
                      type="number"
                      value={gen.count || 0}
                      onChange={(e) => updateGeneratorCount(index, e.target.value)}
                      placeholder={getPlaceholder('count')}
                    />
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removeGenerator(index)}
                  className="mt-6"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No generators yet. Click "Add Generator" to create one.</p>
        )}
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold">Upgrades</h4>
          <Button size="sm" variant="outline" onClick={addUpgrade}>
            <Plus className="h-4 w-4 mr-2" />
            Add Upgrade
          </Button>
        </div>
        {editedData.upgrades && editedData.upgrades.length > 0 ? (
          <div className="space-y-3">
            {editedData.upgrades.map((upg: any, index: number) => (
              <div key={upg.id || index} className="flex items-center gap-3">
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor={`upg-id-${index}`}>ID</Label>
                    <Input
                      id={`upg-id-${index}`}
                      value={upg.id || ''}
                      onChange={(e) => {
                        const newUpgrades = [...editedData.upgrades];
                        newUpgrades[index] = { ...newUpgrades[index], id: e.target.value };
                        setEditedData({ ...editedData, upgrades: newUpgrades });
                      }}
                      placeholder={getPlaceholder('id')}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`upg-level-${index}`}>Level</Label>
                    <Input
                      id={`upg-level-${index}`}
                      type="number"
                      value={upg.level || 0}
                      onChange={(e) => updateUpgradeLevel(index, e.target.value)}
                      placeholder={getPlaceholder('level')}
                    />
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removeUpgrade(index)}
                  className="mt-6"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No upgrades yet. Click "Add Upgrade" to create one.</p>
        )}
      </Card>
    </div>
  );
}
