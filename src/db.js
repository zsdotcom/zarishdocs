// IndexedDB promise wrapper (Tech Design §10.1). Raw IDB — no dependency.
// Stores: sessions, projects, settings, embeddings. The API key never touches
// this DB (sessionStorage only, ADR-001).

const DB_NAME = "zarishdocs";
const DB_VERSION = 1;

let dbPromise = null;

export function openDB() {
  if (dbPromise) return dbPromise;
  if (typeof indexedDB === "undefined") {
    dbPromise = Promise.reject(new Error("IndexedDB is unavailable in this browser."));
    return dbPromise;
  }
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("sessions")) {
        db.createObjectStore("sessions", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("projects")) {
        db.createObjectStore("projects", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings", { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains("embeddings")) {
        db.createObjectStore("embeddings", { keyPath: ["projectId", "textHash"] });
      }
    };
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
  return dbPromise;
}

function run(storeName, mode, operation) {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, mode);
        const store = transaction.objectStore(storeName);
        const request = operation(store);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        transaction.onerror = () => reject(transaction.error);
      }),
  );
}

export function put(storeName, value) {
  return run(storeName, "readwrite", (store) => store.put(value));
}

export function get(storeName, key) {
  return run(storeName, "readonly", (store) => store.get(key));
}

export function getAll(storeName) {
  return run(storeName, "readonly", (store) => store.getAll());
}

export function remove(storeName, key) {
  return run(storeName, "readwrite", (store) => store.delete(key));
}

export function saveSession(session) {
  return put("sessions", session);
}

export function saveProject(project) {
  return put("projects", project);
}

export function listSessions() {
  return getAll("sessions");
}

export async function incrementSessionCount() {
  const row = await get("settings", "sessionCount").catch(() => null);
  const next = (row?.value || 0) + 1;
  await put("settings", { key: "sessionCount", value: next });
  return next;
}

// Reduce eviction risk (per code_patterns.md).
export function persistStorage() {
  return navigator.storage?.persist?.() ?? Promise.resolve(false);
}
