/// <reference types="bun-types" />

import { Command } from 'commander';

export function register(program: Command) {
	program
		.command('doctor')
		.description('run environment diagnostics')
		.action(() => {
			console.log('doctor placeholder: checks would run here');
		});
}
