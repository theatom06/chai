import type { RegistryAdapter, PackageMetadata } from './types.ts';
import { pickVersion, createSymlink } from './util.ts';
import { getCacheDir } from '../config/paths.ts';
import path from 'path';
import { createHash } from "crypto";
import { PATHS, ensureDir } from '../../constants.ts';

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
        writer.write(value);
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

async function updatePackageDetails(targetDir: string, meta: PackageMetadata): Promise<void> {
  const pkgPath = path.join(targetDir, 'package.json');
  const pkg = Bun.file(pkgPath);

  if (await pkg.exists()) {
    const content = await Bun.file(pkgPath).json();
    content.dependencies = content.dependencies || {};
    content.dependencies[meta.name] = `^${meta.version}`;
    await Bun.write(pkgPath, JSON.stringify(content, null, 2));
  }

  let pkgLockPath = path.join(targetDir, 'package-lock.json');
  if(!await Bun.file(pkgLockPath).exists()) {
    return;
  }

  const lockContent = await Bun.file(pkgLockPath).json();
  lockContent.dependencies = lockContent.dependencies || {};
  lockContent.dependencies[meta.name] = {
    version: `^${meta.version}`,
    resolved: meta.dist?.tarball || '',
    integrity: meta.dist?.shasum || '',
  };
  await Bun.write(pkgLockPath, JSON.stringify(lockContent, null, 2));
  
  return;
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

    if (at > 0) { // ensure it's not the scope '@'
      name = id.slice(0, at);
      range = id.slice(at + 1);
    }

    name = name.trim();
    if (!name) throw new Error(`Invalid npm identifier: ${identifier}`);
    return { name, range };
  },

  // Fetch package metadata from npm registry
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

  // List all versions of a package
  async listVersions(name: string): Promise<string[]> {
    const url = `https://registry.npmjs.org/${encodeURIComponent(name)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`npm metadata fetch failed: ${res.status} ${res.statusText}`);
    const data = (await res.json()) as any;
    return Object.keys(data.versions || {});
  },

  // Download package tarball to cache
  async download(meta: PackageMetadata): Promise<void> {
    if (!meta?.dist?.tarball) throw new Error('No tarball URL in npm metadata');
    const cache = getCacheDir();
    const file = path.join(cache, 'npm', `${meta.name}-${meta.version}.tgz`);
    await downloadTarballAsync(meta.dist.tarball, file, meta.dist.shasum);

    const unzipDir = path.join(PATHS.registryPackages.npm, `${meta.name}/${meta.version}`);
    ensureDir(unzipDir);
    
    await Bun.$`tar -xzf ${file} -C ${unzipDir} --strip-components=1`;

    updatePackageDetails(process.cwd(), meta);

    return;    
  },

};

export default npmAdapter;