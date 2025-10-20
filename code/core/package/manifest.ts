/// <reference types="bun-types" />
import fs from 'fs/promises';
import path from 'path';

export interface NormalizedManifest {
  name: string;
  version?: string;
  type?: string;
  raw?: unknown;
}

/**
 * Load a package manifest from a local path.
 * If `input` looks like a path (contains '/' or starts with '.'), read files from disk.
 * Otherwise, throw to indicate remote resolution is needed.
 * @param {string} input - path to package dir or package identifier
 */
/**
 * Loads a package manifest from a local path.
 * @param {string} input - Path to a directory containing manifest.chai.json or package.json
 * @returns {Promise<NormalizedManifest>} normalized manifest data
 */
export async function loadManifest(input: string): Promise<NormalizedManifest> {
  // naive path detection
  if (!input || (!input.includes('/') && !input.startsWith('.'))) {
    throw new Error('Remote identifiers are not supported by manifest loader yet: ' + input);
  }

  const dir = path.resolve(process.cwd(), input);
  const chaiPath = path.join(dir, 'manifest.chai.json');
  const pkgPath = path.join(dir, 'package.json');

  try {
    const raw = await fs.readFile(chaiPath, 'utf-8');
    const json = JSON.parse(raw);
    return json as NormalizedManifest;
  } catch (e) {
    // fallback to package.json
  }

  try {
    const raw = await fs.readFile(pkgPath, 'utf-8');
    const pkg = JSON.parse(raw);
    return { name: pkg.name, version: pkg.version, type: (pkg as any).type || 'node', raw: pkg };
  } catch (e) {
    throw new Error('No manifest found in ' + dir);
  }
}

export default loadManifest;
