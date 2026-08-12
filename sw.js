// ZarishDocs Service Worker — offline shell (Tech Design §10.2).
// shell-* : precached app shell, cache-first (immutable).
// runtime-*: same-origin runtime responses, stale-while-revalidate.
// Never intercept cross-origin requests (Gemini proxy, CDNs).
// Bump CACHE_V whenever the shell changes.

const CACHE_V = "2026-08-12a";
const SHELL_CACHE = `shell-${CACHE_V}`;
const RUNTIME_CACHE = `runtime-${CACHE_V}`;

const SHELL_ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./manifest.webmanifest",
  "./icon.svg",
  "./src/app.js",
  "./src/api.js",
  "./src/errors.js",
  "./src/db.js",
  "./src/file-writer.js",
  "./src/agents/prompts.js",
  "./src/agents/util.js",
  "./src/agents/profiler.js",
  "./src/agents/research.js",
  "./src/agents/architect.js",
  "./src/agents/writer.js",
  "./sources.config.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== SHELL_CACHE && key !== RUNTIME_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match("./index.html")),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
    }),
  );
});
