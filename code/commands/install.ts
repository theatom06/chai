/// <reference types="bun-types" />
import { Command } from 'commander';
import { getAdapter } from '../core/registry/index.ts';
import {
  ensureSandboxDirsAsync,
  getTmpDir,
  getPackagesDir,
  getBinDir,
} from '../core/config/paths.ts';
import { parseIdentifier } from '../core/registry/util.ts';
import { extractTarballAsync } from '../core/package/extract.ts';
import { linkBinariesAsync } from '../core/package/link.ts';
import path from 'path';

export function register(program: Command) {
  program
    .command('install <identifier>')
    .description('install a package by identifier (npm:pkg, gh:user/repo, py:pkg)')
    .option('--from <src>', 'override source')
    .option('--dry-run', 'do not perform any writes')
    .option('--yes, -y', 'confirm extraction to packages dir')
    .option('--link', 'link binaries after extraction')
    .action(async (identifier, opts) => {
      await ensureSandboxDirsAsync();
      const parsed = parseIdentifier(identifier);
      const adapter = getAdapter(identifier);
      const { name } = adapter.resolveIdentifier(identifier);
      const meta = await adapter.getMetadata(name, parsed.range);
      if (opts.dryRun) {
        console.log(
          '[dry-run] would install',
          meta.name,
          meta.version || 'latest',
          'from',
          adapter.kind
        );
        return;
      }
      const artifactPath = adapter.download ? await adapter.download(meta) : undefined;
      const tmpDir = getTmpDir();
      const extractDir = opts.yes ? getPackagesDir() : tmpDir;
      const target = path.join(extractDir, `${meta.name}@${meta.version || 'latest'}`);
      console.log('downloaded artifact:', artifactPath || '(none)');
      console.log('extracting to:', target);
      if (!artifactPath) {
        console.log('no artifact to extract.');
        return;
      }
      await extractTarballAsync(artifactPath, target);
      if (opts.yes) {
        console.log('installed to packages dir.');
        if (opts.link) {
          const binDir = getBinDir();
          const res = await linkBinariesAsync(target, binDir);
          console.log('linked bins:', res.linked.join(', ') || '(none)');
        }
      } else {
        console.log('extracted to tmp (use --yes to install to packages).');
      }
    });
}
