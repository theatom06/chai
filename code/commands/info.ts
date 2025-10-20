/// <reference types="bun-types" />
import { Command } from 'commander';
import { loadManifest } from '../core/package/manifest.js';

export function register(program: Command) {
	program
		.command('info [pkg]')
		.description('display package metadata (local or remote)')
		.option('--json', 'output JSON')
		.action(async (pkg, opts) => {
			if (!pkg) return console.log('Please provide a package identifier or path.');
			try {
				const manifest = await loadManifest(pkg);
				if (opts.json) console.log(JSON.stringify(manifest, null, 2));
				else console.log('manifest:', manifest.name, manifest.version, manifest.type || 'unknown');
			} catch (err) {
				console.error('info error:', err?.message || err);
			}
		});
}
