import { Upload, File, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRef } from "react";

interface FileUploaderProps {
  label: string;
  onFileUpload: (content: string, fileName: string) => void;
  uploadedFileName?: string;
  onClear?: () => void;
}

export default function FileUploader({ 
  label, 
  onFileUpload, 
  uploadedFileName, 
  onClear 
}: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        onFileUpload(content, file.name);
      };
      reader.readAsText(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <Card 
        className={`border-2 border-dashed transition-colors ${
          uploadedFileName 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover-elevate'
        }`}
      >
        <div className="p-6">
          {uploadedFileName ? (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <File className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm font-mono truncate">{uploadedFileName}</span>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleClick}
                  data-testid="button-change-file"
                >
                  Change
                </Button>
                {onClear && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={onClear}
                    data-testid="button-clear-file"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={handleClick}
              className="w-full flex flex-col items-center gap-3 text-muted-foreground hover:text-foreground transition-colors"
              data-testid="button-upload-file"
            >
              <Upload className="h-8 w-8" />
              <div className="text-center">
                <p className="text-sm font-medium">Click to upload or drag and drop</p>
                <p className="text-xs mt-1">TXT files with hex-encoded or JSON data</p>
              </div>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt"
            onChange={handleFileChange}
            className="hidden"
            data-testid="input-file-upload"
          />
        </div>
      </Card>
    </div>
  );
}
