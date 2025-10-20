/// <reference types="bun-types" />
import { Command } from 'commander';

export function register(program: Command) {
	program
		.command('install <identifier>')
		.description('install a package by identifier (npm:pkg, gh:user/repo, py:pkg)')
		.option('--from <src>', 'override source')
		.option('--dry-run', 'do not perform any writes')
		.action((identifier, opts) => {
			console.log('install placeholder', identifier, opts);
		});
}
