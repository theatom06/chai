import fs from 'fs/promises';
import path from 'path';
import { getCacheDir, getTmpDir } from '../config/paths.js';

export async function getCacheInfoAsync() {
  const cacheDir = getCacheDir();
  const tmpDir = getTmpDir();
  return { cacheDir, tmpDir };
}

export async function cleanCacheAsync(): Promise<void> {
  const cacheDir = getCacheDir();
  await fs.rm(cacheDir, { recursive: true, force: true });
  await fs.mkdir(cacheDir, { recursive: true });
}

export async function cleanTmpAsync(): Promise<void> {
  const tmpDir = getTmpDir();
  await fs.rm(tmpDir, { recursive: true, force: true });
  await fs.mkdir(tmpDir, { recursive: true });
}
/// <reference types="bun-types" />
