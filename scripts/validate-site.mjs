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
  "assets/icon-192.png",
  "assets/icon-512.png",
  "assets/og-cover.png",
  ".github/workflows/ci.yml",
  ".github/workflows/pages.yml"
];

await Promise.all(requiredFiles.map((file) => access(resolve(root, file))));

const html = await readFile(resolve(root, "index.html"), "utf8");
assert.match(html, /<html[^>]+lang="zh-Hant-TW"/);
assert.match(html, /name="viewport"/);
assert.match(html, /id="quiz-view"/);
assert.match(html, /id="result-view"/);
assert.match(html, /id="privacy"/);
assert.match(html, /aria-live="polite"/);
assert.match(html, /manifest\.webmanifest/);

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

console.log("Static site validation passed");
