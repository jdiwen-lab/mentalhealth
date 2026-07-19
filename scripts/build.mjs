import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { extname, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "dist");
const versionToken = "__ASSET_VERSION__";
const packageMetadata = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));
const assetVersion = packageMetadata.version;
const versionedTextExtensions = new Set([".css", ".html", ".js", ".webmanifest", ".xml"]);

if (!/^\d+\.\d+\.\d+$/.test(assetVersion)) {
  throw new Error(`package.json version 格式不正確：${assetVersion}`);
}
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

async function injectAssetVersion(directory) {
  const children = await readdir(directory, { withFileTypes: true });
  await Promise.all(children.map(async (child) => {
    const path = resolve(directory, child.name);
    if (child.isDirectory()) {
      await injectAssetVersion(path);
      return;
    }
    if (!versionedTextExtensions.has(extname(child.name))) return;

    const source = await readFile(path, "utf8");
    if (!source.includes(versionToken)) return;
    await writeFile(path, source.replaceAll(versionToken, assetVersion));
  }));
}

await injectAssetVersion(output);

console.log(`Built static site ${assetVersion} in ${output}`);
