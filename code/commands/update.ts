/// <reference types="bun-types" />
import { Command } from 'commander';

export function register(program: Command) {
  program
    .command('update [pkg]')
    .description('update a package to highest compatible version')
    .option('--patch', 'limit to patch updates')
    .action((pkg, opts) => {
      console.log('update placeholder', pkg, opts);
    });
}
