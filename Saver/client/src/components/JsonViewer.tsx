import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface JsonViewerProps {
  title: string;
  data: any;
  className?: string;
}

export default function JsonViewer({ title, data, className = "" }: JsonViewerProps) {
  const [copied, setCopied] = useState(false);
  
  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{title}</h3>
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
      <Card className="p-4 bg-muted/50">
        <pre className="text-xs font-mono overflow-x-auto max-h-96 overflow-y-auto" data-testid="text-json-content">
          <code>{jsonString}</code>
        </pre>
      </Card>
    </div>
  );
}
