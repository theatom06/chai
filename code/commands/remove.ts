/// <reference types="bun-types" />
import { Command } from 'commander';

export function register(program: Command) {
	program
		.command('remove <name>')
		.description('remove an installed package')
		.option('--force', 'bypass prompts')
		.action((name, opts) => {
			console.log('remove placeholder', name, opts);
		});
}
