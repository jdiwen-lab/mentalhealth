const ASSET_VERSION = "__ASSET_VERSION__";
const CACHE_PREFIX = "mentalhealth-quiz-";
const CACHE_VERSION = `${CACHE_PREFIX}${ASSET_VERSION}`;
const LEGACY_CACHE_PATTERN = /^mentalhealth-\d{4}-\d{2}-\d{2}-/;
const versioned = (path) => `${path}?v=${ASSET_VERSION}`;

const APP_SHELL = [
  "./",
  "./index.html",
  versioned("./styles.css"),
  versioned("./manifest.webmanifest"),
  versioned("./js/app.js"),
  versioned("./js/quiz-data.js"),
  versioned("./js/scoring.js"),
  versioned("./js/result-card.js"),
  versioned("./assets/app-icon.svg"),
  versioned("./assets/fonts/fonts.css"),
  versioned("./assets/icon-192.png"),
  versioned("./assets/icon-512.png"),
  versioned("./assets/og-cover.png"),
  versioned("./assets/cards/harbor-preview.webp"),
  versioned("./assets/cards/lighthouse-preview.webp"),
  versioned("./assets/cards/breeze-preview.webp"),
  versioned("./assets/cards/coral-preview.webp"),
  versioned("./assets/cards/wave-preview.webp")
];

function scopedUrl(path) {
  return new URL(path, self.registration.scope).href;
}

function isOwnedCache(cacheName) {
  return cacheName.startsWith(CACHE_PREFIX) || LEGACY_CACHE_PATTERN.test(cacheName);
}

async function putInCurrentCache(request, response) {
  if (!response.ok) return;
  const cache = await caches.open(CACHE_VERSION);
  await cache.put(request, response.clone());
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL.map(scopedUrl)))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => isOwnedCache(key) && key !== CACHE_VERSION)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);
  const scopeUrl = new URL(self.registration.scope);
  const isInAppScope = requestUrl.origin === scopeUrl.origin
    && requestUrl.pathname.startsWith(scopeUrl.pathname);
  if (event.request.method !== "GET" || !isInAppScope) return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then(async (response) => {
          await putInCurrentCache(event.request, response).catch(() => undefined);
          return response;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_VERSION);
          return (await cache.match(event.request)) || cache.match(scopedUrl("./index.html"));
        })
    );
    return;
  }

  event.respondWith(
    caches.open(CACHE_VERSION).then(async (cache) => {
      const cached = await cache.match(event.request);
      if (cached) return cached;

      const response = await fetch(event.request);
      await putInCurrentCache(event.request, response).catch(() => undefined);
      return response;
    })
  );
});
