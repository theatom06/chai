import { cleanCacheAsync, cleanTmpAsync } from './index.js';

export interface CleanOptions {
  cache?: boolean;
  tmp?: boolean;
  all?: boolean;
}

export async function cleanAsync(options: CleanOptions) {
  const results: string[] = [];
  if (options.all || options.cache) {
    await cleanCacheAsync();
    results.push('cache');
  }
  if (options.all || options.tmp) {
    await cleanTmpAsync();
    results.push('tmp');
  }
  return { cleaned: results };
}
/// <reference types="bun-types" />
