/// <reference types="bun-types" />

import { Command } from 'commander';
import { ensureSandboxDirsAsync } from '../core/config/paths.ts';
import { cleanAsync } from '../core/cache/clean.ts';

export function register(program: Command) {
  program
    .command('clean')
    .description('clean cache and temp files')
    .option('--cache', 'clear cache')
    .option('--tmp', 'remove temp files')
    .option('--all', 'garbage-collect unreferenced files')
    .action(async (opts) => {
      await ensureSandboxDirsAsync();
      const res = await cleanAsync({ cache: !!opts.cache, tmp: !!opts.tmp, all: !!opts.all });
      console.log('cleaned:', res.cleaned.join(', ') || 'nothing');
    });
}
