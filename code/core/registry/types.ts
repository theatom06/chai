export type RegistryKind = 'npm' | 'python' | 'github' | 'system' | 'chai';

export interface PackageMetadata {
  name: string;
  version?: string;
  description?: string;
  homepage?: string;
  dist?: { tarball?: string; shasum?: string };
  repository?: { type?: string; url?: string } | string;
  keywords?: string[];
}

export interface RegistryAdapter {
  kind: RegistryKind;
  /** Resolve an identifier like npm:chalk or gh:user/repo or plain name scoped to this registry */
  resolveIdentifier(identifier: string): { name: string; scope?: string };
  /** Fetch metadata about a package; range can be semver or tag like latest */
  getMetadata(name: string, range?: string): Promise<PackageMetadata>;
  /** List versions, optionally filtered by a semver range */
  listVersions?(name: string, range?: string): Promise<string[]>;
  /** Download a tarball or resource and return a local file path (placeholder for now) */
  download?(meta: PackageMetadata): Promise<string>;
}
