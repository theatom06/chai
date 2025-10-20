/// <reference types="bun-types" />
import { Command } from 'commander';

export function register(program: Command) {
	program
		.command('list')
		.description('show installed packages')
		.option('--json', 'output JSON')
		.action((opts) => {
			console.log('list placeholder', opts);
		});
}
