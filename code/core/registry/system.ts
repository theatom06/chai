import type { RegistryAdapter, PackageMetadata } from './types.ts';

/**
 * System packages adapter (skeleton).
 * Handles identifiers like `sys:/usr/bin/tool` or `system:apt:curl` (future work).
 */
const systemAdapter: RegistryAdapter = {
  kind: 'system',
  resolveIdentifier(identifier: string) {
    const id = identifier.replace(/^system:|^sys:/, '');
    return { name: id };
  },
  async getMetadata(name: string): Promise<PackageMetadata> {
    return { name, description: 'system adapter placeholder metadata' };
  },
};

export default systemAdapter;
