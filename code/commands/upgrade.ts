/// <reference types="bun-types" />
import { Command } from 'commander';

export function register(program: Command) {
	program
		.command('upgrade [pkg]')
		.description('force major version upgrade')
		.option('--interactive', 'show changelog/diff and confirm')
		.action((pkg, opts) => {
			console.log('upgrade placeholder', pkg, opts);
		});
}
