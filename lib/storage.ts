/**
 * File storage helpers
 * Local filesystem now, S3/R2-ready via the same interface
 */

import { existsSync } from "fs";
import { readdir, unlink } from "fs/promises";
import path from "path";

const UPLOAD_DIR = process.env.TEMP_UPLOAD_DIR || "./uploads";

export function getUploadPath(fileId: string, ext: string) {
  return path.join(UPLOAD_DIR, `${fileId}.${ext}`);
}

export function getMasterPath(masterId: string, format: string, ext: string) {
  return path.join(UPLOAD_DIR, "masters", `${masterId}_${format}.${ext}`);
}

export async function findFileById(fileId: string): Promise<string | null> {
  if (!existsSync(UPLOAD_DIR)) return null;
  const files = await readdir(UPLOAD_DIR);
  const match = files.find((f) => f.startsWith(fileId) && !f.includes("_"));
  return match ? path.join(UPLOAD_DIR, match) : null;
}

export async function cleanupFile(filePath: string) {
  try {
    if (existsSync(filePath)) await unlink(filePath);
  } catch {
    // ignore
  }
}

export async function cleanupOldFiles(maxAgeMs = 24 * 60 * 60 * 1000) {
  if (!existsSync(UPLOAD_DIR)) return;
  const now = Date.now();
  const files = await readdir(UPLOAD_DIR, { withFileTypes: true });

  for (const file of files) {
    if (!file.isFile()) continue;
    const filePath = path.join(UPLOAD_DIR, file.name);
    try {
      const { mtimeMs } = await import("fs").then((fs) =>
        new Promise<{ mtimeMs: number }>((res, rej) =>
          fs.stat(filePath, (e, s) => e ? rej(e) : res(s))
        )
      );
      if (now - mtimeMs > maxAgeMs) await unlink(filePath);
    } catch {
      // ignore
    }
  }
}
