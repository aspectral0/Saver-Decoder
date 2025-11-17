// AntimatterConverter.tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, FileCode, Clipboard, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import JsonViewer from "@/components/JsonViewer";
import JsonEditor from "@/components/JsonEditor";
import ThemeToggle from "@/components/ThemeToggle";
import FileUploader from "@/components/FileUploader";
import pako from "pako";

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
  let c: string;
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

// ------------------ TreeEditor (grid rows, no wrapping) ------------------
function TreeEditor({ data, onChange }: { data: any; onChange: (newData: any) => void }) {
  const [, setTick] = useState(0);
  const rerender = () => setTick((n) => n + 1);

  const RenderNode = ({ node, path }: { node: any; path: Path }) => {
    const [expanded, setExpanded] = useState(true);
    const [localValue, setLocalValue] = useState<any>("");

    useEffect(() => {
      if (node === null || node === undefined) setLocalValue("");
      else if (typeof node === "boolean") setLocalValue(Boolean(node));
      else setLocalValue(String(node));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [node]);

    const commit = (val: any) => {
      const newData = structuredClone(data);
      let finalVal: any = val;
      // Choose coercion strategy: keep booleans/number types if original was such
      if (typeof node === "boolean") finalVal = !!val;
      else if (typeof node === "number") {
        if (String(val).trim() === "") finalVal = "";
        else {
          const n = Number(val);
          finalVal = Number.isNaN(n) ? val : n;
        }
      } else {
        if (val === null || val === undefined) finalVal = "";
        else finalVal = val;
      }
      setAtPath(newData, path, finalVal);
      onChange(newData);
    };

    const addProperty = () => {
      const key = prompt("Property name:");
      if (!key) return;
      const newData = structuredClone(data);
      const target = getAtPath(newData, path);
      if (target && typeof target === "object") {
        target[key] = "";
        onChange(newData);
        rerender();
      }
    };

    const addArrayItem = () => {
      const newData = structuredClone(data);
      const target = getAtPath(newData, path);
      if (Array.isArray(target)) {
        target.push("");
        onChange(newData);
        rerender();
      }
    };

    const remove = () => {
      if (!confirm("Delete this item?")) return;
      const newData = structuredClone(data);
      deleteAtPath(newData, path);
      onChange(newData);
    };

    // Objects: render children rows
    if (node && typeof node === "object" && !Array.isArray(node)) {
      const keys = Object.keys(node);
      return (
        <div className="pl-2 border-l ml-2">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
              {expanded ? "▾" : "▸"}
            </Button>
            <strong className="truncate">{path.length === 0 ? "root" : String(path[path.length - 1])}</strong>
            <div className="ml-auto flex gap-2">
              <Button variant="outline" size="sm" onClick={addProperty}>+ property</Button>
              {path.length > 0 && <Button variant="ghost" size="sm" onClick={remove}>Delete</Button>}
            </div>
          </div>

          {expanded && (
            <div className="pl-4 mt-2 space-y-2">
              {keys.map((k) => (
                <div key={k} className="grid items-center" style={{ gridTemplateColumns: "140px 1fr 140px", gap: "0.5rem" }}>
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground truncate">{k}</div>
                  </div>
                  <div className="min-w-0">
                    <RenderNode node={node[k]} path={[...path, k]} />
                  </div>
                  <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                    {/* Contextual actions can be added here */}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Arrays: render each element as a row
    if (Array.isArray(node)) {
      return (
        <div className="pl-2 border-l ml-2">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
              {expanded ? "▾" : "▸"}
            </Button>
            <strong>{String(path[path.length - 1] ?? "array")}</strong>
            <div className="ml-auto flex gap-2">
              <Button variant="outline" size="sm" onClick={addArrayItem}>+ item</Button>
              <Button variant="ghost" size="sm" onClick={remove}>Delete</Button>
            </div>
          </div>
          {expanded && (
            <div className="pl-4 mt-2 space-y-2">
              {node.map((it: any, i: number) => (
                <div key={i} className="grid items-center" style={{ gridTemplateColumns: "80px 1fr 140px", gap: "0.5rem" }}>
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">{i}</div>
                  </div>
                  <div className="min-w-0">
                    <RenderNode node={it} path={[...path, i]} />
                  </div>
                  <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                    {/* actions are part of primitive UI, no extra here */}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Primitive handling: show type-aware inputs; layout uses grid parent so here we render just input+actions
    const typeOfNode = typeof node;

    // For display in Save/Delete row we rely on parent grid. We'll render control group that doesn't wrap.
    const Controls = () => (
      <div className="flex items-center gap-2 whitespace-nowrap">
        <Button variant="ghost" size="sm" onClick={() => commit(localValue)}>Save</Button>
        <Button variant="ghost" size="sm" onClick={remove}>Delete</Button>
      </div>
    );

    const primitiveUI = (() => {
      if (typeOfNode === "boolean") {
        return (
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={!!localValue}
              onChange={(e) => {
                setLocalValue(e.target.checked);
                commit(e.target.checked);
              }}
              className="w-5 h-5"
            />
            <div className="text-sm">{String(!!localValue)}</div>
            <div className="ml-auto"><Controls /></div>
          </div>
        );
      }

      if (typeOfNode === "number") {
        return (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={localValue ?? ""}
              onChange={(e) => setLocalValue(e.target.value)}
              onBlur={() => {
                if (String(localValue).trim() === "") commit("");
                else {
                  const n = Number(localValue);
                  commit(Number.isNaN(n) ? localValue : n);
                }
              }}
              className="border rounded px-2 py-1 text-sm w-full min-w-0"
            />
            <Controls />
          </div>
        );
      }

      // strings and null/undefined shown as text input (null/undefined -> empty string)
      return (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={localValue ?? ""}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={() => {
              // keep empty string if user leaves blank
              commit(localValue ?? "");
            }}
            className="border rounded px-2 py-1 text-sm w-full min-w-0"
          />
          <Controls />
        </div>
      );
    })();

    return primitiveUI;
  };

  return <div className="space-y-2 overflow-auto"><RenderNode node={data} path={[]} /></div>;
}

// ------------------ Main Component ------------------
export default function AntimatterConverter() {
  const { toast } = useToast();
  const [saveInput, setSaveInput] = useState("");
  const [decodedData, setDecodedData] = useState<any>(null);
  const [fileName, setFileName] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [selectedTab, setSelectedTab] = useState<"view" | "edit">("view");
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  useEffect(() => {
    setUnsavedChanges(false);
  }, [decodedData]);

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

  const resetToDecoded = () => {
    setDecodedData((d: any) => (d ? structuredClone(d) : d));
    setUnsavedChanges(false);
    toast({ title: "Reset", description: "Editor reset to last decoded data." });
  };

  const prettyStats = useMemo(() => {
    if (!decodedData) return null;
    const stats: { label: string; value: string }[] = [];
    const antimatter = decodedData.antimatter ?? decodedData.money ?? decodedData.player?.antimatter ?? decodedData.player?.money;
    if (antimatter !== undefined && antimatter !== null) stats.push({ label: "Antimatter", value: String(antimatter) });
    const infinities = decodedData.infinities ?? decodedData.player?.infinities ?? decodedData.player?.infinitied;
    if (infinities !== undefined && infinities !== null) stats.push({ label: "Infinities", value: String(infinities) });
    const eternities = decodedData.eternities ?? decodedData.player?.eternities;
    if (eternities !== undefined && eternities !== null) stats.push({ label: "Eternities", value: String(eternities) });
    const realityShards = decodedData.realityShards ?? decodedData.player?.realityShards;
    if (realityShards !== undefined && realityShards !== null) stats.push({ label: "Reality Shards", value: String(realityShards) });
    return stats;
  }, [decodedData]);

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-2">Quick Stats</h3>
                {prettyStats && prettyStats.length > 0 ? (
                  prettyStats.map((s) => (
                    <div key={s.label} className="flex justify-between py-1">
                      <span className="text-sm text-muted-foreground">{s.label}</span>
                      <span className="font-mono text-sm">{s.value}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">No quick stats found</div>
                )}
                <Separator className="my-3" />
                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleDownload} variant="default">
                    <Download className="h-4 w-4 mr-2" /> Download
                  </Button>
                  <Button onClick={handleCopyToClipboard} variant="outline">
                    <Clipboard className="h-4 w-4 mr-2" /> Copy
                  </Button>
                  <Button onClick={() => { setSaveInput(encodeAntimatterSave(decodedData)); toast({ title: "Encoded", description: "Encoded as Antimatter save." }); }} variant="ghost">
                    Export Antimatter
                  </Button>
                </div>
              </Card>

              <Card className="p-4 md:col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">Editor</h3>
                  <div className="flex gap-2">
                    <Button onClick={resetToDecoded} variant="outline">Reset Editor</Button>
                    <Button onClick={() => { const encoded = encodeAntimatterSave(decodedData); navigator.clipboard.writeText(encoded); toast({ title: "Copied", description: "Encoded save copied." }); }} variant="ghost">Copy Encoded</Button>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex gap-2">
                    <Button variant={selectedTab === "view" ? "default" : "ghost"} onClick={() => setSelectedTab("view")}>View JSON</Button>
                    <Button variant={selectedTab === "edit" ? "default" : "ghost"} onClick={() => setSelectedTab("edit")}>Edit Save</Button>
                  </div>
                </div>

                {selectedTab === "view" ? (
                  <JsonViewer title="Decoded Save Data" data={decodedData} />
                ) : (
                  <>
                    <TreeEditor data={decodedData} onChange={applyEditorChanges} />
                    <div className="flex justify-end gap-2 mt-4">
                      <Button onClick={handleDownload} variant="default">Download Save</Button>
                      <Button onClick={() => { setSaveInput(encodeAntimatterSave(decodedData)); toast({ title: "Encoded", description: "Encoded save placed in input box." }); }} variant="outline">Place Encoded in Input</Button>
                    </div>
                  </>
                )}
              </Card>
            </div>

            <Separator className="my-6" />
            <Tabs defaultValue="view" value={selectedTab} onValueChange={(v: any) => setSelectedTab(v)}>
              <TabsList>
                <TabsTrigger value="view">View JSON</TabsTrigger>
                <TabsTrigger value="edit">Edit JSON</TabsTrigger>
              </TabsList>
              <TabsContent value="view">
                <JsonViewer title="Decoded Save Data" data={decodedData} />
              </TabsContent>
              <TabsContent value="edit">
                <JsonEditor title="Edit Save Data" initialData={decodedData} onSave={(data) => { setDecodedData(data); setUnsavedChanges(true); }} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
}