import type { RegistryAdapter, PackageMetadata } from './types.ts';
import { pickVersion } from './util.ts';
import { getCacheDir } from '../config/paths.ts';
import path from 'path';
import { createHash } from "crypto";
import { PATHS } from '../../constants.ts';

async function downloadTarballAsync(url: string, dest: string, expectedIntegrity?: string): Promise<string> {
  const res = await fetch(url, { headers: { "Accept-Encoding": "identity" } });
  if (!res.ok) throw new Error(`Failed to download tarball: ${res.status} ${res.statusText}`);

  const file = Bun.file(dest);
  const writer = file.writer();

  const hash = createHash("sha512");
  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body to read from");

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        hash.update(value);
        await writer.write(value);
      }
    }
    await writer.end();
  } finally {
    reader.releaseLock();
  }

  // 🔒 Verify integrity if provided
  if (expectedIntegrity) {
    const actual = `sha512-${hash.digest("base64")}`;
    if (actual !== expectedIntegrity) {
      throw new Error(`Integrity mismatch:\nExpected: ${expectedIntegrity}\nActual:   ${actual}`);
    }
  }

  return dest;
}


/**
 * NPM registry adapter
 * Handles identifiers like `npm:chalk` or bare names like `chalk` (via fallback selection in index).
 */
const npmAdapter: RegistryAdapter = {
  kind: 'npm',

  // Resolve identifiers like npm:chalk or chalk@^4.0.0
  resolveIdentifier(identifier: string) {
    const id = identifier.startsWith('npm:') ? identifier.slice(4) : identifier;
    // If there's a version suffix, it's after the last '@' (but not the leading '@' of a scope)
    const at = id.lastIndexOf('@');
    let name = id;
    let range: string | undefined;
    if (at > 0) {
      name = id.slice(0, at);
      range = id.slice(at + 1);
    }
    name = name.trim();
    if (!name) throw new Error(`Invalid npm identifier: ${identifier}`);
    return { name, range };
  },

  async getMetadata(name: string, range?: string): Promise<PackageMetadata> {
    const url = `https://registry.npmjs.org/${encodeURIComponent(name)}`;
    const res = await fetch(url);
    
    if (!res.ok) throw new Error(`npm metadata fetch failed: ${res.status} ${res.statusText}`);
    const data = (await res.json()) as any;
    const versions = Object.keys(data.versions || {});
    const version = pickVersion(versions, range, data['dist-tags']);
    if (!version) throw new Error(`No version found for ${name} (range: ${range || 'latest'})`);
    const entry = data.versions[version];
    const dist = entry?.dist || {};
    const meta: PackageMetadata = {
      name,
      version,
      description: data.description || entry?.description,
      repository: entry?.repository || data.repository,
      dist: { tarball: dist.tarball, shasum: dist.shasum },
      keywords: data.keywords || entry?.keywords,
    };
    return meta;
  },
  async listVersions(name: string): Promise<string[]> {
    const url = `https://registry.npmjs.org/${encodeURIComponent(name)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`npm metadata fetch failed: ${res.status} ${res.statusText}`);
    const data = (await res.json()) as any;
    return Object.keys(data.versions || {});
  },

  async download(meta: PackageMetadata): Promise<void> {
    if (!meta?.dist?.tarball) throw new Error('No tarball URL in npm metadata');
    const cache = getCacheDir();
    const file = path.join(cache, 'npm', `${meta.name}-${meta.version}.tgz`);
    await downloadTarballAsync(meta.dist.tarball, file, meta.dist.shasum);

    return;    
  },

};

export default npmAdapter;