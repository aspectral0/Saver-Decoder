import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, Edit, Eye, Save, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

interface JsonViewerProps {
  title: string;
  data: any;
  onSave?: (data: any) => void;
  className?: string;
}

export default function JsonViewer({ title, data, onSave, className = "" }: JsonViewerProps) {
  const [editMode, setEditMode] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setJsonText(JSON.stringify(data, null, 2));
  }, [data]);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setError(null);
      if (onSave) {
        onSave(parsed);
        console.log('JSON saved successfully');
      }
    } catch (err) {
      setError("Invalid JSON format");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonText(e.target.value);
    setError(null);
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
    setError(null);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{title}</h3>
        <div className="flex gap-2">
          {onSave && (
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleEditMode}
              data-testid="button-toggle-edit"
            >
              {editMode ? (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </>
              )}
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopy}
            data-testid="button-copy-json"
          >
            {copied ? (
              <Check className="h-4 w-4 text-chart-2" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      <Card className="p-4 bg-muted/50">
        {editMode ? (
          <Textarea
            value={jsonText}
            onChange={handleChange}
            className="font-mono text-xs min-h-96 resize-none bg-background"
            placeholder="Enter JSON data..."
            data-testid="textarea-json-editor"
          />
        ) : (
          <pre className="text-xs font-mono overflow-x-auto max-h-96 overflow-y-auto" data-testid="text-json-content">
            <code>{jsonText}</code>
          </pre>
        )}
      </Card>
      {editMode && (
        <div className="flex items-center justify-between">
          <Button
            size="sm"
            onClick={handleSave}
            data-testid="button-save-json"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive" data-testid="text-json-error">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
