import path, { join } from 'path';
import { homedir } from 'os';
import { mkdirSync, existsSync } from 'fs'

const root = path.join(homedir(), '.chai');
const packages = path.join(root, 'packages');
const cache = path.join(root, 'cache');
const logs = path.join(root, 'logs');

const registryPackages = {
    npm: join(packages, 'npm'),
    python: join(packages, 'python'),
    github: join(packages, 'github'),
    system: join(packages, 'system'),
};

export function ensureDir(dir: string) {
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
    }
}

ensureDir(root);
ensureDir(packages);
ensureDir(cache);
ensureDir(logs);
Object.values(registryPackages).forEach(ensureDir);

export const PATHS = {
    root,
    packages,
    cache,
    logs,
    registryPackages,
};