// Local folder writes (ADR-003), implemented with native browser APIs to keep
// the zero-dependency constraint: File System Access API on Chromium desktop,
// <a download> fallback everywhere else. Behavior parity with the design:
// `isSupported()` drives a first-load banner, filenames are identical either way.

import { AppError, messageForKind } from "./errors.js";

export function isSupported() {
  return typeof window !== "undefined" && typeof window.showDirectoryPicker === "function";
}

export async function pickFolder() {
  if (!isSupported()) {
    throw new AppError("unsupported", messageForKind("unsupported"));
  }
  return window.showDirectoryPicker({ mode: "readwrite" });
}

export async function writeSet(dirHandle, files) {
  if (!dirHandle) throw new Error("No folder selected.");
  for (const file of files || []) {
    const handle = await dirHandle.getFileHandle(file.name, { create: true });
    const writable = await handle.createWritable();
    await writable.write(file.content);
    await writable.close();
  }
}

export function downloadFallback(files) {
  for (const file of files || []) {
    const blob = new Blob([file.content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = file.name;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }
}

export async function saveFiles(files, { dirHandle, allowPick = false }) {
  if (dirHandle) {
    await writeSet(dirHandle, files);
    return { mode: "folder", count: files.length };
  }
  if (isSupported() && allowPick) {
    const handle = await pickFolder();
    await writeSet(handle, files);
    return { mode: "folder", count: files.length, dirHandle: handle };
  }
  downloadFallback(files);
  return { mode: "download", count: files.length };
}
