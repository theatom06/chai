import os from 'os';
import path from 'path';
import fs from 'fs/promises';

/**
 * Core path helpers for the Chai sandbox (~/.chai).
 * Provides path resolution and directory initialization.
 */
export function getSandboxRoot(): string {
  const home = os.homedir();
  return path.join(home, '.chai');
}

export function getPackagesDir(): string {
  return path.join(getSandboxRoot(), 'packages');
}

export function getBinDir(): string {
  return path.join(getSandboxRoot(), 'bin');
}

export function getCacheDir(): string {
  return path.join(getSandboxRoot(), 'cache');
}

export function getTmpDir(): string {
  return path.join(getSandboxRoot(), 'tmp');
}

export function getLogsDir(): string {
  return path.join(getSandboxRoot(), 'logs');
}

export function getConfigPath(): string {
  return path.join(getSandboxRoot(), 'config.json');
}

/**
 * Ensure a directory exists (create recursively if missing).
 * @param {string} dir absolute path
 */
export async function ensureDirAsync(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

/**
 * Ensure the core sandbox directories exist: root, packages, bin, cache, tmp, logs.
 */
export async function ensureSandboxDirsAsync(): Promise<void> {
  await ensureDirAsync(getSandboxRoot());
  await Promise.all([
    ensureDirAsync(getPackagesDir()),
    ensureDirAsync(getBinDir()),
    ensureDirAsync(getCacheDir()),
    ensureDirAsync(getTmpDir()),
    ensureDirAsync(getLogsDir()),
  ]);
}
