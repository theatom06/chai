import fs from 'fs/promises';
import path from 'path';
import sort from '../../lib/semver/sort.js';
import satisfies from '../../lib/semver/satisfies.js';

/**
 * Picks a version from a list given an optional semver range and dist-tags.
 * Prefers dist-tag (e.g., latest) when no range is provided; otherwise highest satisfying.
 */
export function pickVersion(versions: string[], range?: string, distTags?: Record<string, string>): string | undefined {
  if (!versions?.length) return undefined;

  if (!range) {
    if (distTags?.latest && versions.includes(distTags.latest)) return distTags.latest;
    const sorted = sort(versions, false) as unknown as string[];
    return sorted[sorted.length - 1];
  }

  const candidates = versions.filter((v) => {
    try {
      return satisfies(v, range as string);
    } catch {
      return false;
    }
  });
  if (!candidates.length) return undefined;
  const sorted = sort(candidates, false) as unknown as string[];
  return sorted[sorted.length - 1];
}

/**
 * Parses identifiers like `npm:chalk@^5`, `gh:user/repo@v1.2.3`, `py:requests`, or bare `chalk`.
 */
export function parseIdentifier(identifier: string): {
  prefix?: string;
  name: string;
  range?: string;
} {
  let id = identifier.trim();
  let prefix: string | undefined;
  const m = id.match(/^([a-z]+):(.+)$/i);
  if (m && m[1] && m[2]) {
    prefix = m[1].toLowerCase();
    id = m[2] as string;
  }
  let name = id;
  let range: string | undefined;
  const at = id.lastIndexOf('@');
  if (at > 0) {
    name = id.slice(0, at);
    range = id.slice(at + 1);
  }
  return { prefix, name, range };
}

export function createSymlink(from: string, to: string): Promise<void> {
  return fs.symlink(from, to, 'junction').catch(async (err) => {
    if (err.code === 'EEXIST') {
      await fs.unlink(to);
      return fs.symlink(from, to, 'junction');
    }
    throw err;
  });
}