import fs from "fs";
import pako from "pako";

const PREFIX = "AntimatterDimensionsSavefileFormatAAB";
const SUFFIX = "EndOfSavefile";

const saveString = fs.readFileSync("antimatter_savefile2.txt", "utf8").trim();
if (!saveString.startsWith(PREFIX) || !saveString.endsWith(SUFFIX)) {
  console.error("Save file format is invalid.");
  process.exit(1);
}

// Extract base64 section
const base64Raw = saveString.slice(PREFIX.length, saveString.lastIndexOf(SUFFIX)).replace(/[\r\n\s]/g, "");

// Convert to binary
let bin = Buffer.from(base64Raw, "base64");

// Decompress
let inflated;
try {
  inflated = pako.inflate(bin);
} catch (err) {
  console.log("Failed to decompress – trying base64 replacements used in official code...");
  // Try again, with official AD substitutions
  let repairedBase64 = base64Raw.replace(/0b/g, "+").replace(/0c/g, "/").replace(/0a/g, "0");
  bin = Buffer.from(repairedBase64, "base64");
  inflated = pako.inflate(bin);
}

// Convert to UTF-8 string
const text = new TextDecoder("utf-8").decode(inflated);

// Parse as JSON
const saveObj = JSON.parse(text);

console.log("Decoded save file:");
console.log(JSON.stringify(saveObj, null, 2));