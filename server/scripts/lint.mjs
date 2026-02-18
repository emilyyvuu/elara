import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const targets = [join(root, "index.js"), join(root, "src")];
const rules = [
  { name: "debugger statement", pattern: /\bdebugger\b/g },
  { name: "TODO marker", pattern: /\bTODO\b/gi },
  { name: "FIXME marker", pattern: /\bFIXME\b/gi },
];

function walk(path) {
  const stat = statSync(path);
  if (stat.isFile()) return [path];

  const files = [];
  for (const entry of readdirSync(path)) {
    files.push(...walk(join(path, entry)));
  }
  return files;
}

const files = targets
  .flatMap((target) => walk(target))
  .filter((filePath) => filePath.endsWith(".js"));

const findings = [];
for (const filePath of files) {
  const text = readFileSync(filePath, "utf8");
  for (const rule of rules) {
    const matches = text.match(rule.pattern);
    if (!matches?.length) continue;
    findings.push(`${relative(root, filePath)}: found ${matches.length} ${rule.name}(s)`);
  }
}

if (findings.length) {
  console.error("Lint checks failed:");
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}

console.log(`Lint checks passed (${files.length} files scanned).`);
