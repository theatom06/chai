import type { RegistryAdapter, RegistryKind } from './types.ts';
import npmAdapter from './npm.ts';
import pythonAdapter from './python.ts';
import githubAdapter from './github.ts';
import systemAdapter from './system.ts';
import chaiAdapter from './chai.ts';

const adapters: Record<RegistryKind, RegistryAdapter> = {
  npm: npmAdapter,
  python: pythonAdapter,
  github: githubAdapter,
  system: systemAdapter,
  chai: chaiAdapter,
};

export function getAdapter(identifier: string): RegistryAdapter {
  if (identifier.startsWith('npm:')) return adapters.npm;
  if (identifier.startsWith('py:') || identifier.startsWith('python:')) return adapters.python;
  if (identifier.startsWith('gh:') || identifier.startsWith('github:')) return adapters.github;
  if (identifier.startsWith('sys:') || identifier.startsWith('system:')) return adapters.system;
  if (identifier.startsWith('chai:')) return adapters.chai;
  // default to npm for bare names
  return adapters.npm;
}

export default adapters;
