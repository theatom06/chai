import type { RegistryAdapter, PackageMetadata } from './types.ts';
import { downloadToFileAsync } from './util.ts';
import { getCacheDir } from '../config/paths.ts';
import path from 'path';

/**
 * GitHub registry adapter (skeleton).
 * Handles identifiers like `gh:user/repo` or `github:user/repo`.
 */
const githubAdapter: RegistryAdapter = {
  kind: 'github',
  resolveIdentifier(identifier: string) {
    const id = identifier.replace(/^github:|^gh:/, '');
    const name = id;
    return { name };
  },
  async getMetadata(name: string, range?: string): Promise<PackageMetadata> {
    // name is `user/repo`
    const api = `https://api.github.com/repos/${name}/releases/latest`;
    const res = await fetch(api, { headers: { 'User-Agent': 'chai-cli' } });
    if (!res.ok) {
      // fallback to source tarball of default branch
      return {
        name,
        version: 'latest',
        description: 'GitHub latest source (no releases)',
        dist: { tarball: `https://github.com/${name}/archive/refs/heads/main.tar.gz` },
        homepage: `https://github.com/${name}`,
      };
    }
    const data = (await res.json()) as any;
    const tag = data.tag_name || 'latest';
    const tarball =
      data.tarball_url || `https://github.com/${name}/archive/refs/tags/${tag}.tar.gz`;
    return {
      name,
      version: tag,
      description: data.name,
      dist: { tarball },
      homepage: `https://github.com/${name}`,
    };
  },
  async download(meta: PackageMetadata): Promise<string> {
    if (!meta?.dist?.tarball) throw new Error('No tarball URL in GitHub metadata');
    const cache = getCacheDir();
    const safe = meta.name.replace('/', '-');
    const file = path.join(cache, 'github', `${safe}-${meta.version || 'latest'}.tar.gz`);
    return downloadToFileAsync(meta.dist.tarball, file);
  },
};

export default githubAdapter;
