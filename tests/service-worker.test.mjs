import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const source = await readFile(resolve(import.meta.dirname, "../service-worker.js"), "utf8");

function createHarness(cacheKeys = []) {
  const listeners = {};
  const deleted = [];
  const precached = [];
  let claimed = false;

  const cache = {
    async addAll(urls) { precached.push(...urls); },
    async match() { return undefined; },
    async put() {}
  };
  const caches = {
    async open() { return cache; },
    async keys() { return cacheKeys; },
    async delete(key) { deleted.push(key); return true; }
  };
  const self = {
    registration: { scope: "https://example.test/mentalhealth/" },
    clients: { async claim() { claimed = true; } },
    addEventListener(type, listener) { listeners[type] = listener; },
    async skipWaiting() {}
  };

  vm.runInNewContext(source, {
    URL,
    caches,
    fetch: async () => { throw new Error("network unavailable"); },
    self
  });

  return {
    listeners,
    deleted,
    precached,
    get claimed() { return claimed; }
  };
}

function dispatchExtendable(listener, event = {}) {
  let completion;
  listener({
    ...event,
    waitUntil(promise) { completion = Promise.resolve(promise); }
  });
  return completion;
}

test("啟用新版時只刪除本專案的新舊快取", async () => {
  const current = "mentalhealth-quiz-__ASSET_VERSION__";
  const harness = createHarness([
    current,
    "mentalhealth-quiz-older",
    "mentalhealth-2026-07-19-streamlined-flow-r2",
    "mentalhealth-other-product",
    "another-pages-app-cache"
  ]);

  await dispatchExtendable(harness.listeners.activate);

  assert.deepEqual(harness.deleted.sort(), [
    "mentalhealth-2026-07-19-streamlined-flow-r2",
    "mentalhealth-quiz-older"
  ]);
  assert.equal(harness.claimed, true);
});

test("安裝快取使用同一版號涵蓋所有程式模組", async () => {
  const harness = createHarness();
  await dispatchExtendable(harness.listeners.install);

  for (const modulePath of ["app.js", "quiz-data.js", "scoring.js", "result-card.js"]) {
    const url = harness.precached.find((entry) => entry.includes(modulePath));
    assert.ok(url, `缺少 ${modulePath} 預先快取`);
    assert.match(url, /\?v=__ASSET_VERSION__$/);
  }
});

test("不攔截測驗路徑以外的同網域請求", () => {
  const harness = createHarness();
  let responded = false;
  harness.listeners.fetch({
    request: {
      method: "GET",
      mode: "cors",
      url: "https://example.test/another-project/app.js"
    },
    respondWith() { responded = true; }
  });

  assert.equal(responded, false);
});
