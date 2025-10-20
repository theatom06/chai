import type { RegistryAdapter, PackageMetadata } from './types.ts';
import { pickVersion, downloadToFileAsync } from './util.ts';
import { getCacheDir } from '../config/paths.ts';
import path from 'path';

/**
 * Python (PyPI) registry adapter (skeleton).
 * Handles identifiers like `py:requests` or `python:requests`.
 */
const pythonAdapter: RegistryAdapter = {
  kind: 'python',
  resolveIdentifier(identifier: string) {
    const id = identifier.replace(/^python:|^py:/, '');
    return { name: id };
  },
  async getMetadata(name: string, range?: string): Promise<PackageMetadata> {
    const url = `https://pypi.org/pypi/${encodeURIComponent(name)}/json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`PyPI metadata fetch failed: ${res.status} ${res.statusText}`);
    const data = (await res.json()) as any;
    const versions = Object.keys(data.releases || {});
    const version = pickVersion(versions, range, { latest: data.info?.version });
    if (!version) throw new Error(`No version found for ${name} (range: ${range || 'latest'})`);
    const files = (data.releases?.[version] || []) as Array<any>;
    const sdist = files.find((f) => f.packagetype === 'sdist') || files[0];
    const meta: PackageMetadata = {
      name,
      version,
      description: data.info?.summary,
      homepage: data.info?.home_page,
      dist: { tarball: sdist?.url, shasum: sdist?.digests?.sha256 },
    };
    return meta;
  },
  async listVersions(name: string): Promise<string[]> {
    const url = `https://pypi.org/pypi/${encodeURIComponent(name)}/json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`PyPI metadata fetch failed: ${res.status} ${res.statusText}`);
    const data = (await res.json()) as any;
    return Object.keys(data.releases || {});
  },
  async download(meta: PackageMetadata): Promise<string> {
    if (!meta?.dist?.tarball) throw new Error('No sdist URL in PyPI metadata');
    const cache = getCacheDir();
    const file = path.join(cache, 'python', `${meta.name}-${meta.version}.tar.gz`);
    return downloadToFileAsync(meta.dist.tarball, file);
  },
};

export default pythonAdapter;
