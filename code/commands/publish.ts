/// <reference types="bun-types" />
import { Command } from 'commander';

export function register(program: Command) {
	program
		.command('publish [path]')
		.description('publish a package')
		.option('--private', 'publish as private')
		.action((path, opts) => {
			console.log('publish placeholder', path, opts);
		});
}
