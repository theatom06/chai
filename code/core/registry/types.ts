export type RegistryKind = 'npm' | 'python' | 'github' | 'system'; //| 'chai' (Upcoming)

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
  // The kind of registry (npm, python, github, etc)
  kind: RegistryKind;

  // Resolve identifiers like npm:chalk or gh:user/repo
  resolveIdentifier(identifier: string): {
    name: string;
    scope?: string 
  };

  // Fetch metadata about a package; range can be semver or tag like latest
  getMetadata(name: string, range?: string): Promise<PackageMetadata>;

  // List versions, optionally filtered by a semver range
  listVersions?(name: string, range?: string): Promise<string[]>;

  //Download a tarball or resource and return a local file path
  download?(meta: PackageMetadata): Promise<void>;
}
