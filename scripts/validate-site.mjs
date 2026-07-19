import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { questions, roleOrder, roles } from "../js/quiz-data.js";

const root = resolve(import.meta.dirname, "..");
const requiredFiles = [
  "index.html",
  "styles.css",
  "manifest.webmanifest",
  "service-worker.js",
  "js/app.js",
  "js/quiz-data.js",
  "js/scoring.js",
  "js/result-card.js",
  "assets/app-icon.svg",
  "assets/fonts/fonts.css",
  "assets/fonts/OFL.txt",
  "assets/icon-192.png",
  "assets/icon-512.png",
  "assets/og-cover.png",
  "assets/og-cover.svg",
  "assets/cards/harbor.png",
  "assets/cards/lighthouse.png",
  "assets/cards/breeze.png",
  "assets/cards/coral.png",
  "assets/cards/wave.png",
  "assets/cards/harbor-preview.webp",
  "assets/cards/lighthouse-preview.webp",
  "assets/cards/breeze-preview.webp",
  "assets/cards/coral-preview.webp",
  "assets/cards/wave-preview.webp",
  ".github/workflows/ci.yml",
  ".github/workflows/pages.yml"
];

await Promise.all(requiredFiles.map((file) => access(resolve(root, file))));

const html = await readFile(resolve(root, "index.html"), "utf8");
const css = await readFile(resolve(root, "styles.css"), "utf8");
assert.match(html, /<html[^>]+lang="zh-Hant-TW"/);
assert.match(html, /name="viewport"/);
assert.match(html, /name="color-scheme" content="only light"/);
assert.match(html, /id="quiz-view"/);
assert.match(html, /id="result-view"/);
assert.match(html, /id="other-roles"/);
assert.match(html, /class="compact-notice/);
assert.match(html, /aria-live="polite"/);
assert.match(html, /manifest\.webmanifest/);
assert.match(html, /styles\.css\?v=20260719-b-flow/);
assert.match(html, /js\/app\.js\?v=20260719-b-flow/);
assert.match(html, /data-font-size="large"/);
assert.match(html, /id="result-card-image"/);
assert.doesNotMatch(html, /id="about"/);
assert.doesNotMatch(html, /id="privacy"/);
assert.doesNotMatch(html, /id="quit-button"/);
assert.doesNotMatch(html, /id="progress-percent"/);
assert.doesNotMatch(html, /id="question-context"/);
assert.doesNotMatch(html, /id="share-support-note"/);
assert.match(css, /color-scheme:\s*only light/);
assert.match(css, /html\s*\{[^}]*background-color:\s*#efe3cc/s);
assert.match(css, /body\s*\{[^}]*background-color:\s*#efe3cc/s);
assert.doesNotMatch(css, /prefers-color-scheme:\s*dark/);

assert.equal(questions.length, 5);
assert.equal(roleOrder.length, 5);
for (const roleId of roleOrder) {
  assert.ok(roles[roleId]);
}
for (const question of questions) {
  assert.equal(question.options.length, 5);
}

const manifest = JSON.parse(await readFile(resolve(root, "manifest.webmanifest"), "utf8"));
assert.equal(manifest.lang, "zh-Hant-TW");
assert.ok(manifest.icons.length >= 2);

const pngDimensions = (buffer) => ({
  width: buffer.readUInt32BE(16),
  height: buffer.readUInt32BE(20)
});

for (const roleId of roleOrder) {
  const original = await readFile(resolve(root, `assets/cards/${roleId}.png`));
  assert.equal(original.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
  assert.deepEqual(pngDimensions(original), { width: 1024, height: 1536 });

  const preview = await readFile(resolve(root, `assets/cards/${roleId}-preview.webp`));
  assert.equal(preview.subarray(0, 4).toString("ascii"), "RIFF");
  assert.equal(preview.subarray(8, 12).toString("ascii"), "WEBP");
}

const socialCover = await readFile(resolve(root, "assets/og-cover.png"));
assert.deepEqual(pngDimensions(socialCover), { width: 1200, height: 630 });

console.log("Static site validation passed");
