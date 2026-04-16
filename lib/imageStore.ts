// IndexedDB-backed image store — no size limits unlike localStorage
const DB_NAME = "portfolio_images";
const STORE   = "images";
const VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

/** Save a base64/blob URL and return a stable key */
export async function saveImage(key: string, dataUrl: string): Promise<string> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(STORE, "readwrite");
    const req = tx.objectStore(STORE).put(dataUrl, key);
    req.onsuccess = () => resolve(key);
    req.onerror   = () => reject(req.error);
  });
}

/** Retrieve a stored image by key */
export async function getImage(key: string): Promise<string | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(key);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror   = () => reject(req.error);
  });
}

/** Delete an image by key */
export async function deleteImage(key: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(STORE, "readwrite");
    const req = tx.objectStore(STORE).delete(key);
    req.onsuccess = () => resolve();
    req.onerror   = () => reject(req.error);
  });
}

/** Check if a string is an IDB key reference (not a raw data URL) */
export function isIdbKey(value: string): boolean {
  return value.startsWith("idb:");
}

/** Generate a unique IDB key */
export function makeKey(prefix = "img"): string {
  return `idb:${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
