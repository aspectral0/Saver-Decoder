import { useState } from "react";
import { Link } from "wouter";
import FileUploader from "@/components/FileUploader";
import JsonViewer from "@/components/JsonViewer";
import JsonEditor from "@/components/JsonEditor";
import ValueEditor from "@/components/ValueEditor";
import StatsDisplay from "@/components/StatsDisplay";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, RefreshCw, FileCode, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Converter() {
  const { toast } = useToast();
  const [oldSaveData, setOldSaveData] = useState<any>(null);
  const [oldFileName, setOldFileName] = useState<string>("");
  const [templateData, setTemplateData] = useState<any>(null);
  const [templateFileName, setTemplateFileName] = useState<string>("");
  const [convertedData, setConvertedData] = useState<any>(null);

  const hexToBytes = (hex: string): Uint8Array => {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
  };

  const bytesToHex = (bytes: Uint8Array): string => {
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const decodeHex = (hex: string): any => {
    const cleaned = hex.trim();
    
    // Check if it's already JSON
    try {
      return JSON.parse(cleaned);
    } catch {
      // Not JSON, continue with hex decoding
    }
    
    // Validate hex format (only 0-9, a-f, A-F, and even length)
    if (!/^[0-9a-fA-F]+$/.test(cleaned)) {
      throw new Error('File must contain hex-encoded data or valid JSON');
    }
    
    // Check for even length (hex strings must have even number of characters)
    if (cleaned.length % 2 !== 0) {
      throw new Error('Invalid hex encoding: odd number of characters');
    }
    
    try {
      const bytes = hexToBytes(cleaned);
      const decoder = new TextDecoder('utf-8');
      const decoded = decoder.decode(bytes);
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Decode error:', error);
      throw new Error('Decoded content is not valid JSON');
    }
  };

  const encodeHex = (data: any): string => {
    try {
      const json = JSON.stringify(data);
      const encoder = new TextEncoder();
      const bytes = encoder.encode(json);
      return bytesToHex(bytes);
    } catch (error) {
      console.error('Encode error:', error);
      throw new Error('Failed to encode data');
    }
  };

  const handleOldFileUpload = (content: string, fileName: string) => {
    try {
      const decoded = decodeHex(content);
      setOldSaveData(decoded);
      setOldFileName(fileName);
      toast({
        title: "File loaded successfully",
        description: `${fileName} has been decoded`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to decode file. Please check the format.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleTemplateUpload = (content: string, fileName: string) => {
    try {
      const decoded = decodeHex(content);
      setTemplateData(decoded);
      setTemplateFileName(fileName);
      toast({
        title: "Template loaded",
        description: `${fileName} will be used as the target format`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to decode template. Please check the format.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleConvert = () => {
    if (!oldSaveData) {
      toast({
        title: "No data to convert",
        description: "Please upload an old save file first",
        variant: "destructive",
      });
      return;
    }

    if (!templateData) {
      toast({
        title: "No template",
        description: "Please upload a template file to define the target format",
        variant: "destructive",
      });
      return;
    }

    const converted = convertToNewFormat(oldSaveData, templateData);
    setConvertedData(converted);
    toast({
      title: "Conversion complete",
      description: "Your save file has been converted to the new format",
    });
  };

  const convertToNewFormat = (oldData: any, template: any): any => {
    const result = JSON.parse(JSON.stringify(template));
    
    // Deep merge function to preserve all data
    const deepMerge = (target: any, source: any): any => {
      const output = { ...target };
      
      for (const key in source) {
        // Skip undefined values - use template default instead
        if (source[key] === undefined) {
          continue;
        }
        
        // Keep null values from source
        if (source[key] === null) {
          output[key] = null;
          continue;
        }
        
        if (Array.isArray(source[key])) {
          // For arrays, preserve the old data structure
          output[key] = source[key].map((item: any, index: number) => {
            if (typeof item === 'object' && item !== null && target[key]?.[index]) {
              return { ...target[key][index], ...item };
            }
            return item;
          });
        } else if (typeof source[key] === 'object') {
          // For objects, recursively merge
          output[key] = deepMerge(target[key] || {}, source[key]);
        } else {
          // For primitive values, use the source value
          output[key] = source[key];
        }
      }
      
      // Ensure all template fields are present (for fields missing in old data)
      for (const key in target) {
        if (!(key in output)) {
          output[key] = target[key];
        }
      }
      
      return output;
    };
    
    // Merge old data into template, preserving all values
    const merged = deepMerge(result, oldData);
    
    return merged;
  };

  const handleDownload = () => {
    if (!convertedData) return;

    const hexEncoded = encodeHex(convertedData);
    const blob = new Blob([hexEncoded], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted_save_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download complete",
      description: "Your converted save file has been downloaded",
    });
  };

  const handleReset = () => {
    setOldSaveData(null);
    setOldFileName("");
    setTemplateData(null);
    setTemplateFileName("");
    setConvertedData(null);
    toast({
      title: "Reset complete",
      description: "All data has been cleared",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/15 rounded-md border border-primary/20">
                <FileCode className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Save File Converter</h1>
                <p className="text-sm text-muted-foreground">Atom Idle Game Tool</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/antimatter">
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Antimatter Dimensions
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                data-testid="button-reset-all"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FileUploader
              label="Old Save File"
              onFileUpload={handleOldFileUpload}
              uploadedFileName={oldFileName}
              onClear={() => {
                setOldSaveData(null);
                setOldFileName("");
                setConvertedData(null);
              }}
            />
            <FileUploader
              label="New Template File Format"
              onFileUpload={handleTemplateUpload}
              uploadedFileName={templateFileName}
              onClear={() => {
                setTemplateData(null);
                setTemplateFileName("");
                setConvertedData(null);
              }}
            />
          </div>

          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={handleConvert}
              disabled={!oldSaveData || !templateData}
              data-testid="button-convert"
            >
              Convert to New Format
            </Button>
          </div>

          {oldSaveData && (
            <>
              <Separator />
              <div>
                <h2 className="text-lg font-semibold mb-4">Old Save Data Overview</h2>
                <StatsDisplay data={oldSaveData} />
              </div>
            </>
          )}

          {templateData && (
            <>
              <Separator />
              <Tabs defaultValue="view" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="view" data-testid="tab-view-template">View Template</TabsTrigger>
                  <TabsTrigger value="edit" data-testid="tab-edit-template">Edit Template</TabsTrigger>
                </TabsList>
                <TabsContent value="view">
                  <JsonViewer title="Template Structure" data={templateData} />
                </TabsContent>
                <TabsContent value="edit">
                  <JsonEditor
                    title="Edit Template Structure"
                    initialData={templateData}
                    onSave={(data) => {
                      setTemplateData(data);
                      toast({
                        title: "Template updated",
                        description: "Changes saved successfully",
                      });
                    }}
                  />
                </TabsContent>
              </Tabs>
            </>
          )}

          {convertedData && (
            <>
              <Separator />
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Converted Data</h2>
                  <Button onClick={handleDownload} data-testid="button-download">
                    <Download className="h-4 w-4 mr-2" />
                    Download Save File
                  </Button>
                </div>
                <StatsDisplay data={convertedData} />
                <div className="mt-6">
                  <Tabs defaultValue="edit-values" className="w-full">
                    <TabsList className="mb-4">
                      <TabsTrigger value="edit-values" data-testid="tab-edit-values">Edit Values</TabsTrigger>
                      <TabsTrigger value="view" data-testid="tab-view-converted">View JSON</TabsTrigger>
                      <TabsTrigger value="edit" data-testid="tab-edit-converted">Edit JSON</TabsTrigger>
                    </TabsList>
                    <TabsContent value="edit-values">
                      <ValueEditor
                        data={convertedData}
                        onSave={(data) => {
                          setConvertedData(data);
                          toast({
                            title: "Values updated",
                            description: "Changes saved successfully",
                          });
                        }}
                      />
                    </TabsContent>
                    <TabsContent value="view">
                      <JsonViewer title="Converted Save Data" data={convertedData} />
                    </TabsContent>
                    <TabsContent value="edit">
                      <JsonEditor
                        title="Edit Converted Data"
                        initialData={convertedData}
                        onSave={(data) => {
                          setConvertedData(data);
                          toast({
                            title: "Data updated",
                            description: "Changes saved successfully",
                          });
                        }}
                      />
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
