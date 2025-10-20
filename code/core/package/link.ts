import fs from 'fs/promises';
import path from 'path';
import { NormalizedManifest } from './manifest.ts';

export interface BinMap {
  [name: string]: string;
}

/**
 * Resolve a package's bin mapping from its manifest or embedded package.json.
 * Supports string or object forms of the `bin` field.
 */
export async function resolveBinMapAsync(
  pkgDir: string,
  manifest?: NormalizedManifest
): Promise<BinMap> {
  const bins: BinMap = {};

  // Prefer explicit manifest bin (if present)
  const manifestAny = manifest as any;
  if (manifestAny?.bin) {
    if (typeof manifestAny.bin === 'string' && manifest?.name) {
      bins[manifest.name] = manifestAny.bin;
      return bins;
    }
    if (typeof manifestAny.bin === 'object' && manifestAny.bin) {
      Object.assign(bins, manifestAny.bin);
      return bins;
    }
  }

  // Fallback to package.json bin
  try {
    const raw = await fs.readFile(path.join(pkgDir, 'package.json'), 'utf-8');
    const pkg = JSON.parse(raw);
    const bin = (pkg as any).bin;
    if (!bin) return bins;
    if (typeof bin === 'string' && pkg.name) bins[pkg.name] = bin;
    else if (typeof bin === 'object') Object.assign(bins, bin);
  } catch {
    // ignore if no package.json
  }

  return bins;
}

/**
 * Create symlinks in binDir for each bin entry mapping name->relativePath inside package dir.
 * If a link already exists, it will be replaced.
 */
export async function linkBinariesAsync(
  pkgDir: string,
  binDir: string,
  manifest?: NormalizedManifest
): Promise<{ linked: string[] }> {
  const bins = await resolveBinMapAsync(pkgDir, manifest);
  const linked: string[] = [];

  await fs.mkdir(binDir, { recursive: true });

  for (const [name, rel] of Object.entries(bins)) {
    const target = path.resolve(pkgDir, rel);
    const linkPath = path.join(binDir, name);
    try {
      // Remove existing link/file if present
      await fs.rm(linkPath, { force: true });
      await fs.symlink(target, linkPath);
      linked.push(name);
    } catch (err) {
      // Fallback: try to copy file if symlink not permitted
      try {
        const data = await fs.readFile(target);
        await fs.writeFile(linkPath, data, { mode: 0o755 });
        linked.push(name);
      } catch (e) {
        // skip on failure
      }
    }
  }

  return { linked };
}

export default linkBinariesAsync;
/// <reference types="bun-types" />
