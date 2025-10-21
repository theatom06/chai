import path from 'path';
import { homedir } from 'os';
import {mkd}

const root = path.join(homedir(), '.chai');
const packages = path.join(root, 'packages');
const cache = path.join(root, 'cache');
const logs = path.join(root, 'logs');

export const PATHS = {
    root,
    packages,
    cache,
    logs,
};