/// <reference types="bun-types" />
import { Command } from 'commander';

export function register(program: Command) {
	program
		.command('sip <identifier>')
		.description('run a package in a temporary sandbox')
		.option('--allow <perms>', 'comma-separated permissions')
		.action((identifier, opts) => {
			console.log('sip placeholder', identifier, opts);
		});
}
