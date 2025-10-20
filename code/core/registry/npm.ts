import type { RegistryAdapter, PackageMetadata } from './types.ts';
import { pickVersion, downloadToFileAsync } from './util.ts';
import { getCacheDir } from '../config/paths.ts';
import path from 'path';

/**
 * NPM registry adapter (skeleton).
 * Handles identifiers like `npm:chalk` or bare names like `chalk` (via fallback selection in index).
 */
const npmAdapter: RegistryAdapter = {
  kind: 'npm',
  resolveIdentifier(identifier: string) {
    const id = identifier.startsWith('npm:') ? identifier.slice(4) : identifier;
    const [maybeName] = id.split('@');
    const name = maybeName || id;
    return { name };
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
  async download(meta: PackageMetadata): Promise<string> {
    if (!meta?.dist?.tarball) throw new Error('No tarball URL in npm metadata');
    const cache = getCacheDir();
    const file = path.join(cache, 'npm', `${meta.name}-${meta.version}.tgz`);
    return downloadToFileAsync(meta.dist.tarball, file);
  },
};

export default npmAdapter;
