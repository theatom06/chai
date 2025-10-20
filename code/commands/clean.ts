/// <reference types="bun-types" />

import { Command } from 'commander';

export function register(program: Command) {
	program
		.command('clean')
		.description('clean cache and temp files')
		.option('--cache', 'clear cache')
		.option('--tmp', 'remove temp files')
		.option('--all', 'garbage-collect unreferenced files')
		.action((opts) => {
			console.log('clean placeholder', opts);
		});
}
