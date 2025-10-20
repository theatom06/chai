/// <reference types="bun-types" />
import { Command } from 'commander';
import fs from 'fs/promises';
import path from 'path';
import { ensureSandboxDirsAsync, getPackagesDir } from '../core/config/paths.ts';

export function register(program: Command) {
  program
    .command('list')
    .description('show installed packages')
    .option('--json', 'output JSON')
    .action(async (opts) => {
      await ensureSandboxDirsAsync();
      const dir = getPackagesDir();
      const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
      const packages = entries.filter((e) => e.isDirectory()).map((e) => e.name);
      if (opts.json) console.log(JSON.stringify({ packages }, null, 2));
      else console.log(packages.length ? packages.join('\n') : '(no packages)');
    });
}
