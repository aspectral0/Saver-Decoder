import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Save, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

interface JsonEditorProps {
  title: string;
  initialData: any;
  onSave: (data: any) => void;
  className?: string;
}

export default function JsonEditor({ title, initialData, onSave, className = "" }: JsonEditorProps) {
  const [jsonText, setJsonText] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setJsonText(JSON.stringify(initialData, null, 2));
  }, [initialData]);

  const handleSave = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setError(null);
      onSave(parsed);
      console.log('JSON saved successfully');
    } catch (err) {
      setError("Invalid JSON format");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonText(e.target.value);
    setError(null);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{title}</h3>
        <Button
          size="sm"
          onClick={handleSave}
          data-testid="button-save-json"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>
      <Card className="p-4 bg-muted/50">
        <Textarea
          value={jsonText}
          onChange={handleChange}
          className="font-mono text-xs min-h-96 resize-none bg-background"
          placeholder="Enter JSON data..."
          data-testid="textarea-json-editor"
        />
      </Card>
      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive" data-testid="text-json-error">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
