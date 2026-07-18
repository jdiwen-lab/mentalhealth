import { cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "dist");
const entries = [
  "index.html",
  "404.html",
  "styles.css",
  "manifest.webmanifest",
  "service-worker.js",
  "robots.txt",
  "sitemap.xml",
  "assets",
  "js"
];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

for (const entry of entries) {
  await cp(resolve(root, entry), resolve(output, entry), { recursive: true });
}

console.log(`Built static site in ${output}`);
