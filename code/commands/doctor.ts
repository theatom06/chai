/// <reference types="bun-types" />

import { Command } from 'commander';
import {
  ensureSandboxDirsAsync,
  getSandboxRoot,
  getCacheDir,
  getTmpDir,
  getBinDir,
  getPackagesDir,
} from '../core/config/paths.ts';

export function register(program: Command) {
  program
    .command('doctor')
    .description('run environment diagnostics')
    .action(async () => {
      await ensureSandboxDirsAsync();
      console.log('Chai doctor report');
      console.log('  sandbox:', getSandboxRoot());
      console.log('  packages:', getPackagesDir());
      console.log('  bin:', getBinDir());
      console.log('  cache:', getCacheDir());
      console.log('  tmp:', getTmpDir());
      console.log('  status: OK (basic dirs present)');
    });
}
