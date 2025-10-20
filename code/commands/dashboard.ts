/// <reference types="bun-types" />
import { Command } from 'commander';

export function register(program: Command) {
  program
    .command('dashboard')
    .description('show dashboard summary or launch TUI')
    .option('--open', 'open TUI')
    .action((opts) => {
      console.log('dashboard placeholder', opts);
    });
}
