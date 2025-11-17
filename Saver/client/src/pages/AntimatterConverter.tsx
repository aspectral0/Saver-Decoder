// AntimatterConverter.tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileCode, Clipboard, ArrowLeft, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import JsonViewer from "@/components/JsonViewer";
import JsonEditor from "@/components/JsonEditor";
import StatsDisplay from "@/components/StatsDisplay";
import ValueEditor from "@/components/ValueEditor";
import SearchableTreeEditor from "@/components/SearchableTreeEditor";
import StatChart from "@/components/StatChart";
import PresetManager from "@/components/PresetManager";
import ThemeToggle from "@/components/ThemeToggle";
import FileUploader from "@/components/FileUploader";
import { motion, AnimatePresence } from "framer-motion";
import pako from "pako";

/* Import layout fixes for tree rows so Save / Delete and checkboxes stay aligned */
import "../index.css";                 // import the first CSS
import "../styles/Save-editor-UI.css"; // import the second CSS
// ------------------------ CONSTANTS ------------------------
const ANTIMATTER_PREFIX = "AntimatterDimensionsSavefileFormatAAB";
const ANTIMATTER_SUFFIX = "EndOfSavefile";
const keyStrBase64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
const baseReverseDic: Record<string, Record<string, number>> = {};

// --------------------- LZString Helpers ---------------------
function getBaseValue(character: string): number {
  if (!baseReverseDic["base64"]) {
    baseReverseDic["base64"] = {};
    for (let i = 0; i < keyStrBase64.length; i++) {
      baseReverseDic["base64"][keyStrBase64.charAt(i)] = i;
    }
  }
  return baseReverseDic["base64"][character];
}
function _decompress(length: number, resetValue: number, getNextValue: (index: number) => number): string {
  const dictionary: string[] = [];
  let next: number;
  let enlargeIn = 4;
  let dictSize = 4;
  let numBits = 3;
  let entry = "";
  const result: string[] = [];
  let i: number;
  let w: string;
  let bits: number, resb: number, maxpower: number, power: number;
  let c: string = "";
  const data = { val: getNextValue(0), position: resetValue, index: 1 };

  for (i = 0; i < 3; i++) dictionary[i] = String(i);

  bits = 0;
  maxpower = Math.pow(2, 2);
  power = 1;
  while (power !== maxpower) {
    resb = data.val & data.position;
    data.position >>= 1;
    if (data.position === 0) {
      data.position = resetValue;
      data.val = getNextValue(data.index++);
    }
    bits |= (resb > 0 ? 1 : 0) * power;
    power <<= 1;
  }

  switch ((next = bits)) {
    case 0:
      bits = 0;
      maxpower = Math.pow(2, 8);
      power = 1;
      while (power !== maxpower) {
        resb = data.val & data.position;
        data.position >>= 1;
        if (data.position === 0) {
          data.position = resetValue;
          data.val = getNextValue(data.index++);
        }
        bits |= (resb > 0 ? 1 : 0) * power;
        power <<= 1;
      }
      c = String.fromCharCode(bits);
      break;
    case 1:
      bits = 0;
      maxpower = Math.pow(2, 16);
      power = 1;
      while (power !== maxpower) {
        resb = data.val & data.position;
        data.position >>= 1;
        if (data.position === 0) {
          data.position = resetValue;
          data.val = getNextValue(data.index++);
        }
        bits |= (resb > 0 ? 1 : 0) * power;
        power <<= 1;
      }
      c = String.fromCharCode(bits);
      break;
    case 2:
      return "";
  }

  dictionary[3] = c;
  w = c;
  result.push(c);

  while (true) {
    if (data.index > length) return "";

    bits = 0;
    maxpower = Math.pow(2, numBits);
    power = 1;
    while (power !== maxpower) {
      resb = data.val & data.position;
      data.position >>= 1;
      if (data.position === 0) {
        data.position = resetValue;
        data.val = getNextValue(data.index++);
      }
      bits |= (resb > 0 ? 1 : 0) * power;
      power <<= 1;
    }

    switch ((c = bits as any)) {
      case 0:
        bits = 0;
        maxpower = Math.pow(2, 8);
        power = 1;
        while (power !== maxpower) {
          resb = data.val & data.position;
          data.position >>= 1;
          if (data.position === 0) {
            data.position = resetValue;
            data.val = getNextValue(data.index++);
          }
          bits |= (resb > 0 ? 1 : 0) * power;
          power <<= 1;
        }
        dictionary[dictSize++] = String.fromCharCode(bits);
        c = String(dictSize - 1);
        enlargeIn--;
        break;
      case 1:
        bits = 0;
        maxpower = Math.pow(2, 16);
        power = 1;
        while (power !== maxpower) {
          resb = data.val & data.position;
          data.position >>= 1;
          if (data.position === 0) {
            data.position = resetValue;
            data.val = getNextValue(data.index++);
          }
          bits |= (resb > 0 ? 1 : 0) * power;
          power <<= 1;
        }
        dictionary[dictSize++] = String.fromCharCode(bits);
        c = String(dictSize - 1);
        enlargeIn--;
        break;
      case 2:
        return result.join("");
    }

    if (enlargeIn === 0) {
      enlargeIn = Math.pow(2, numBits);
      numBits++;
    }

    const code = Number(c);
    if (dictionary[code]) {
      entry = dictionary[code];
    } else if (code === dictSize) {
      entry = w + w.charAt(0);
    } else {
      return "";
    }
    result.push(entry);
    dictionary[dictSize++] = w + entry.charAt(0);
    enlargeIn--;
    w = entry;

    if (enlargeIn === 0) {
      enlargeIn = Math.pow(2, numBits);
      numBits++;
    }
  }
}
function decompressFromBase64(input: string): string {
  if (!input) return "";
  return _decompress(
    input.length,
    32,
    (index: number) => getBaseValue(input.charAt(index))
  );
}

// ---------------------- Zlib Helpers ----------------------
function base64ToUint8Array(b64: string): Uint8Array {
  const binary_string = atob(b64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes;
}

// --------------------- Encode Functions --------------------
function encodeAntimatterSave(data: any): string {
  const json = JSON.stringify(data);
  const deflated = pako.deflate(json);
  let binary = "";
  deflated.forEach((b) => { binary += String.fromCharCode(b); });
  let encoded = btoa(binary);
  encoded = encoded.replace(/\+/g, "0b").replace(/\//g, "0c").replace(/0/g, "0a");
  return ANTIMATTER_PREFIX + encoded + ANTIMATTER_SUFFIX;
}

function compressToBase64(input: string): string {
  if (!input) return "";
  // simplified LZString-like compressor already present above; reuse _compress if needed
  // for brevity we assume compressToBase64 exists (from previous code) - in this file we only need decode for Atom Idle
  // If actual LZString encoding is required, import LZString library or reuse earlier code.
  return "";
}

// ------------------------ Decode Functions ------------------------
function tryInflateBase64(base64Str: string): string {
  const bin = base64ToUint8Array(base64Str);
  try {
    return pako.inflate(bin, { to: "string" }) as string;
  } catch (e) {
    const inflated = pako.inflate(bin);
    return new TextDecoder("utf-8").decode(inflated);
  }
}

function decodeAntimatterSave(input: string): any {
  const trimmed = input.trim();
  const prefixIdx = trimmed.indexOf(ANTIMATTER_PREFIX);
  if (prefixIdx !== -1) {
    let encoded: string;
    const suffixIdx = trimmed.lastIndexOf(ANTIMATTER_SUFFIX);
    if (suffixIdx !== -1) encoded = trimmed.substring(prefixIdx + ANTIMATTER_PREFIX.length, suffixIdx);
    else encoded = trimmed.substring(prefixIdx + ANTIMATTER_PREFIX.length);
    encoded = encoded.replace(/[\r\n\s]/g, "").trim();

    try {
      const decompressed = tryInflateBase64(encoded);
      return JSON.parse(decompressed);
    } catch (e1) {
      try {
        const repaired = encoded.replace(/0b/g, "+").replace(/0c/g, "/").replace(/0a/g, "0");
        const decompressed2 = tryInflateBase64(repaired);
        return JSON.parse(decompressed2);
      } catch (e2) {
        throw new Error("Failed to decompress Antimatter Dimensions save file (zlib). Tried AD replacements but decompression still failed.");
      }
    }
  }

  try {
    const json = decompressFromBase64(trimmed);
    if (!json) throw new Error("Failed to decompress Atom Idle (LZString-based) save.");
    return JSON.parse(json);
  } catch (e) {
    throw new Error("Save file format not recognized or could not be decompressed.");
  }
}

// ------------------ Inline Save Editor Helpers ------------------
type Path = (string | number)[];
function getAtPath(obj: any, path: Path) {
  return path.reduce((acc, key) => (acc ? acc[key as any] : undefined), obj);
}
function setAtPath(obj: any, path: Path, value: any) {
  if (path.length === 0) return;
  let cur = obj;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (cur[key as any] === undefined || cur[key as any] === null) {
      const nextKey = path[i + 1];
      cur[key as any] = typeof nextKey === "number" ? [] : {};
    }
    cur = cur[key as any];
  }
  const last = path[path.length - 1];
  cur[last as any] = value;
}
function deleteAtPath(obj: any, path: Path) {
  if (path.length === 0) return;
  const parentPath = path.slice(0, -1);
  const last = path[path.length - 1];
  const parent = parentPath.length ? getAtPath(obj, parentPath) : obj;
  if (parent && last !== undefined) {
    if (Array.isArray(parent) && typeof last === "number") parent.splice(last, 1);
    else delete parent[last as any];
  }
}
function isNumericString(s: string) {
  if (s.trim() === "") return false;
  return !Number.isNaN(Number(s));
}



// ------------------ Main Component ------------------
export default function AntimatterConverter() {
  const { toast } = useToast();
  const [saveInput, setSaveInput] = useState("");
  const [decodedData, setDecodedData] = useState<any>(null);
  const [fileName, setFileName] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [selectedTab, setSelectedTab] = useState<"view" | "edit" | "form" | "chart" | "stats">("view");
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  useEffect(() => {
    setUnsavedChanges(false);
  }, [decodedData]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveEnabled && decodedData && unsavedChanges) {
      const draftKey = `antimatter_draft_${Date.now()}`;
      localStorage.setItem(draftKey, JSON.stringify(decodedData));
      // Keep only last 5 drafts
      const keys = Object.keys(localStorage).filter(key => key.startsWith('antimatter_draft_'));
      if (keys.length > 5) {
        keys.sort().slice(0, keys.length - 5).forEach(key => localStorage.removeItem(key));
      }
    }
  }, [decodedData, unsavedChanges, autoSaveEnabled]);

  // Load draft on mount
  useEffect(() => {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('antimatter_draft_'));
    if (keys.length > 0) {
      const latestKey = keys.sort().pop()!;
      try {
        const draftData = JSON.parse(localStorage.getItem(latestKey)!);
        setDecodedData(draftData);
        toast({ title: "Draft Loaded", description: "Previous unsaved changes have been restored." });
      } catch (e) {
        // Invalid draft, remove it
        localStorage.removeItem(latestKey);
      }
    }
  }, []);

  const handleFileUpload = (content: string, name: string) => {
    setSaveInput(content);
    setUploadedFileName(name);
    toast({ title: "File uploaded", description: `${name} loaded.` });
  };

  const handleDecode = () => {
    try {
      const decoded = decodeAntimatterSave(saveInput);
      setDecodedData(decoded);
      setFileName(`antimatter_${Date.now()}.txt`);
      toast({ title: "Decoded", description: "Save decoded successfully." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || String(err), variant: "destructive" });
    }
  };

  const handleDownload = () => {
    if (!decodedData) return;
    try {
      const encoded = encodeAntimatterSave(decodedData);
      const blob = new Blob([encoded], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || `antimatter_save_${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: "Downloaded", description: "Save file downloaded successfully." });
      setUnsavedChanges(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || String(err), variant: "destructive" });
    }
  };

  const handleCopyToClipboard = async () => {
    if (!decodedData) return;
    try {
      const encoded = encodeAntimatterSave(decodedData);
      await navigator.clipboard.writeText(encoded);
      toast({ title: "Copied", description: "Save copied to clipboard." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || String(err), variant: "destructive" });
    }
  };

  const applyEditorChanges = (newData: any) => {
    setDecodedData(newData);
    setUnsavedChanges(true);
  };

  const applyPreset = (presetData: any) => {
    setDecodedData(presetData);
    setUnsavedChanges(true);
  };

  const resetToDecoded = () => {
    setDecodedData((d: any) => (d ? structuredClone(d) : d));
    setUnsavedChanges(false);
    toast({ title: "Reset", description: "Editor reset to last decoded data." });
  };

  // Remove unused prettyStats as we now use StatsDisplay

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/15 rounded-md border border-primary/20">
              <FileCode className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Antimatter Dimensions Save Editor</h1>
              <p className="text-sm text-muted-foreground">Decode, view and edit saves with a simple UI</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" /> Home
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <FileUploader
          label="Upload Save File"
          onFileUpload={handleFileUpload}
          uploadedFileName={uploadedFileName}
          onClear={() => {
            setUploadedFileName("");
            setSaveInput("");
            setDecodedData(null);
          }}
        />
        <Card className="p-4 mt-6">
          <Textarea
            value={saveInput}
            onChange={(e) => setSaveInput(e.target.value)}
            placeholder="Paste your save starting with AntimatterDimensionsSavefileFormatAAB..."
            className="font-mono text-xs min-h-32 resize-none"
          />
        </Card>

        <div className="flex justify-center gap-3 mt-4">
          <Button onClick={handleDecode} disabled={!saveInput.trim()}>
            Decode Save
          </Button>
          <Button onClick={() => { setSaveInput(""); setDecodedData(null); setUploadedFileName(""); }} variant="outline">
            Clear
          </Button>
        </div>

        {decodedData && (
          <>
            <Separator className="my-6" />
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Card className="p-4 bg-gradient-to-br from-card to-card/50 border-primary/20">
                  <div className="flex flex-wrap gap-2">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button onClick={handleDownload} variant="default" className="bg-gradient-to-r from-primary to-primary/80">
                        <Download className="h-4 w-4 mr-2" /> Download
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button onClick={handleCopyToClipboard} variant="outline">
                        <Clipboard className="h-4 w-4 mr-2" /> Copy
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button onClick={() => { setSaveInput(encodeAntimatterSave(decodedData)); toast({ title: "Encoded", description: "Encoded as Antimatter save." }); }} variant="ghost">
                        Export Antimatter
                      </Button>
                    </motion.div>
                  </div>
                  <div className="mt-3">
                    <PresetManager data={decodedData} onApplyPreset={applyPreset} />
                  </div>
                </Card>
              </motion.div>

              <motion.div
                className="md:col-span-2"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card className="p-4 bg-gradient-to-br from-card to-card/50 border-primary/20">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold">Editor</h3>
                    <div className="flex gap-2">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button onClick={resetToDecoded} variant="outline">Reset Editor</Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button onClick={() => { const encoded = encodeAntimatterSave(decodedData); navigator.clipboard.writeText(encoded); toast({ title: "Copied", description: "Encoded save copied." }); }} variant="ghost">Copy Encoded</Button>
                      </motion.div>
                    </div>
                  </div>

                  <Tabs value={selectedTab} onValueChange={(v: any) => setSelectedTab(v)} className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                      <TabsTrigger value="view">View JSON</TabsTrigger>
                      <TabsTrigger value="edit">Tree Edit</TabsTrigger>
                      <TabsTrigger value="form">Form Edit</TabsTrigger>
                      <TabsTrigger value="chart">Charts</TabsTrigger>
                      <TabsTrigger value="stats">Stats</TabsTrigger>
                    </TabsList>

                    <AnimatePresence mode="wait">
                      <TabsContent value="view" className="mt-4">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <JsonViewer title="Decoded Save Data" data={decodedData} />
                        </motion.div>
                      </TabsContent>

                      <TabsContent value="edit" className="mt-4">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <SearchableTreeEditor data={decodedData} onChange={applyEditorChanges} />
                          <div className="flex justify-end gap-2 mt-4">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button onClick={handleDownload} variant="default">Download Save</Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button onClick={() => { setSaveInput(encodeAntimatterSave(decodedData)); toast({ title: "Encoded", description: "Encoded save placed in input box." }); }} variant="outline">Place Encoded in Input</Button>
                            </motion.div>
                          </div>
                        </motion.div>
                      </TabsContent>

                      <TabsContent value="form" className="mt-4">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ValueEditor data={decodedData} onSave={applyEditorChanges} />
                        </motion.div>
                      </TabsContent>

                      <TabsContent value="chart" className="mt-4">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <StatChart data={decodedData} />
                        </motion.div>
                      </TabsContent>

                      <TabsContent value="stats" className="mt-4">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <StatsDisplay data={decodedData} />
                        </motion.div>
                      </TabsContent>
                    </AnimatePresence>
                  </Tabs>
                </Card>
              </motion.div>
            </motion.div>
          </>
        )}
      </main>
    </div>
  );
}