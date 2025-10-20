/// <reference types="bun-types" />
import { Command } from 'commander';

export function register(program: Command) {
	program
		.command('init')
		.description('bootstrap a new manifest.chai.json')
		.option('--type <type>', 'package type (node|bun|python|system)')
		.action((opts) => {
			console.log('init placeholder', opts);
		});
}
