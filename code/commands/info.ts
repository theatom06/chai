/// <reference types="bun-types" />
import { Command } from 'commander';
import { loadManifest } from '../core/package/manifest.ts';
import { getAdapter } from '../core/registry/index.ts';

export function register(program: Command) {
  program
    .command('info [pkg]')
    .description('display package metadata (local or remote)')
    .option('--json', 'output JSON')
    .option('--remote', 'force remote registry lookup')
    .action(async (pkg, opts) => {
      if (!pkg) return console.log('Please provide a package identifier or path.');
      try {
        const looksLikePath = pkg.includes('/') || pkg.startsWith('.');
        if (looksLikePath && !opts.remote) {
          const manifest = await loadManifest(pkg);
          if (opts.json) console.log(JSON.stringify(manifest, null, 2));
          else
            console.log('manifest:', manifest.name, manifest.version, manifest.type || 'unknown');
        } else {
          const adapter = getAdapter(pkg);
          // Reuse parseIdentifier logic for ranges
          const { parseIdentifier } = await import('../core/registry/util.ts');
          const parsed = parseIdentifier(pkg);
          const { name } = adapter.resolveIdentifier(pkg);
          const meta = await adapter.getMetadata(name, parsed.range);
          if (opts.json) console.log(JSON.stringify(meta, null, 2));
          else console.log('remote:', meta.name, meta.version || 'latest', adapter.kind);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('info error:', message);
      }
    });
}
