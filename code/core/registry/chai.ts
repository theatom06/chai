import type { RegistryAdapter, PackageMetadata } from './types.ts';

/**
 * Chai native registry adapter (skeleton).
 * Handles identifiers like `chai:pkg`.
 */
const chaiAdapter: RegistryAdapter = {
  kind: 'chai',
  resolveIdentifier(identifier: string) {
    const id = identifier.replace(/^chai:/, '');
    return { name: id };
  },
  async getMetadata(name: string): Promise<PackageMetadata> {
    return {
      name,
      version: 'latest',
      description: 'chai adapter placeholder metadata',
    };
  },
};

export default chaiAdapter;
