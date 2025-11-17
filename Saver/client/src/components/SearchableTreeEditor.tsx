import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface SearchableTreeEditorProps {
  data: any;
  onChange: (newData: any) => void;
}

export default function SearchableTreeEditor({ data, onChange }: SearchableTreeEditorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

  const { filteredData, pathsToExpand } = useMemo(() => {
    if (!searchTerm.trim()) return { filteredData: data, pathsToExpand: new Set<string>() };

    const pathsToExpandSet = new Set<string>();

    const filterObject = (obj: any, path: string[] = []): any => {
      if (typeof obj !== "object" || obj === null) {
        const valueStr = String(obj).toLowerCase();
        const keyStr = path[path.length - 1]?.toLowerCase() || "";
        if (valueStr.includes(searchTerm.toLowerCase()) || keyStr.includes(searchTerm.toLowerCase())) {
          return obj;
        }
        return undefined;
      }

      if (Array.isArray(obj)) {
        const filtered = obj
          .map((item, index) => filterObject(item, [...path, index.toString()]))
          .filter(item => item !== undefined);
        return filtered.length > 0 ? filtered : undefined;
      }

      const filtered: any = {};
      let hasMatches = false;

      for (const [key, value] of Object.entries(obj)) {
        const currentPath = [...path, key];
        const pathStr = currentPath.join(".").toLowerCase();
        const keyStr = key.toLowerCase();

        if (keyStr.includes(searchTerm.toLowerCase()) || pathStr.includes(searchTerm.toLowerCase())) {
          filtered[key] = value;
          hasMatches = true;
          // Expand path to show matches
          pathsToExpandSet.add(currentPath.slice(0, -1).join("."));
        } else {
          const filteredValue = filterObject(value, currentPath);
          if (filteredValue !== undefined) {
            filtered[key] = filteredValue;
            hasMatches = true;
            // Expand path to show matches
            pathsToExpandSet.add(currentPath.join("."));
          }
        }
      }

      return hasMatches ? filtered : undefined;
    };

    const filtered = filterObject(data) || {};
    return { filteredData: filtered, pathsToExpand: pathsToExpandSet };
  }, [data, searchTerm]);

  // Update expanded paths when search changes
  useEffect(() => {
    setExpandedPaths(pathsToExpand);
  }, [pathsToExpand]);

  const clearSearch = () => {
    setSearchTerm("");
    setExpandedPaths(new Set());
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search keys, values, or paths..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {searchTerm && Object.keys(filteredData).length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No matches found for "{searchTerm}"
        </div>
      )}

      <TreeEditor
        data={searchTerm ? filteredData : data}
        onChange={onChange}
        expandedPaths={expandedPaths}
        setExpandedPaths={setExpandedPaths}
        isSearchActive={!!searchTerm}
      />
    </div>
  );
}

// Enhanced TreeEditor with expanded state management
function TreeEditor({
  data,
  onChange,
  expandedPaths,
  setExpandedPaths,
  isSearchActive
}: {
  data: any;
  onChange: (newData: any) => void;
  expandedPaths: Set<string>;
  setExpandedPaths: (setter: (prev: Set<string>) => Set<string>) => void;
  isSearchActive: boolean;
}) {

  const RenderNode = ({ node, path }: { node: any; path: (string | number)[] }) => {
    const pathStr = path.join(".");
    const isExpanded = expandedPaths.has(pathStr);
    const [localValue, setLocalValue] = useState<any>(() => {
      if (node === null || node === undefined) return "";
      if (typeof node === "boolean") return Boolean(node);
      return String(node);
    });

    useEffect(() => {
      if (node === null || node === undefined) setLocalValue("");
      else if (typeof node === "boolean") setLocalValue(Boolean(node));
      else setLocalValue(String(node));
    }, [node]);

    const toggleExpanded = () => {
      setExpandedPaths(prev => {
        const newSet = new Set(prev);
        if (newSet.has(pathStr)) {
          newSet.delete(pathStr);
        } else {
          newSet.add(pathStr);
        }
        return newSet;
      });
    };

    const commit = (val: any) => {
      const newData = structuredClone(data);
      let finalVal: any = val;
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
      }
    };

    const addArrayItem = () => {
      const newData = structuredClone(data);
      const target = getAtPath(newData, path);
      if (Array.isArray(target)) {
        target.push("");
        onChange(newData);
      }
    };

    const remove = () => {
      if (!confirm("Delete this item?")) return;
      const newData = structuredClone(data);
      deleteAtPath(newData, path);
      onChange(newData);
    };

    if (node && typeof node === "object" && !Array.isArray(node)) {
      const keys = Object.keys(node);
      return (
        <div className="pl-2 border-l ml-2">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={toggleExpanded}>
              {isExpanded ? "▾" : "▸"}
            </Button>
            <strong className="truncate">{path.length === 0 ? "root" : String(path[path.length - 1])}</strong>
            <div className="ml-auto flex gap-2">
              <Button variant="outline" size="sm" onClick={addProperty}>+ property</Button>
              {path.length > 0 && <Button variant="ghost" size="sm" onClick={remove}>Delete</Button>}
            </div>
          </div>

          {isExpanded && (
            <div className="pl-4 mt-2 space-y-2">
              {keys.map((k) => (
                <div key={k} className="save-row-grid">
                  <div className="label">
                    <div className="text-xs text-muted-foreground truncate">{k}</div>
                  </div>
                  <div className="value">
                    <RenderNode node={node[k]} path={[...path, k]} />
                  </div>
                  <div className="save-actions">
                    {/* Keep contextual actions here if needed */}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (Array.isArray(node)) {
      return (
        <div className="pl-2 border-l ml-2">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={toggleExpanded}>
              {isExpanded ? "▾" : "▸"}
            </Button>
            <strong>{String(path[path.length - 1] ?? "array")}</strong>
            <div className="ml-auto flex gap-2">
              <Button variant="outline" size="sm" onClick={addArrayItem}>+ item</Button>
              <Button variant="ghost" size="sm" onClick={remove}>Delete</Button>
            </div>
          </div>
          {isExpanded && (
            <div className="pl-4 mt-2 space-y-2">
              {node.map((it: any, i: number) => (
                <div key={i} className="save-row-grid array">
                  <div className="label">
                    <div className="text-xs text-muted-foreground">{i}</div>
                  </div>
                  <div className="value">
                    <RenderNode node={it} path={[...path, i]} />
                  </div>
                  <div className="save-actions">
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
      <div className="save-actions">
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

// Helper functions (copied from original)
function getAtPath(obj: any, path: (string | number)[]) {
  return path.reduce((acc, key) => (acc ? acc[key as any] : undefined), obj);
}
function setAtPath(obj: any, path: (string | number)[], value: any) {
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
function deleteAtPath(obj: any, path: (string | number)[]) {
  if (path.length === 0) return;
  const parentPath = path.slice(0, -1);
  const last = path[path.length - 1];
  const parent = parentPath.length ? getAtPath(obj, parentPath) : obj;
  if (parent && last !== undefined) {
    if (Array.isArray(parent) && typeof last === "number") parent.splice(last, 1);
    else delete parent[last as any];
  }
}
