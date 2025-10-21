function resolveIdentifier(identifier) {
    const id = identifier.startsWith('npm:') ? identifier.slice(4) : identifier;
    // If there's a version suffix, it's after the last '@' (but not the leading '@' of a scope)
    const at = id.lastIndexOf('@');
    let name = id;
    let range
    if (at > 0) {
      name = id.slice(0, at);
      range = id.slice(at + 1);
    }
    name = name.trim();
    if (!name) throw new Error(`Invalid npm identifier: ${identifier}`);
    return { name, range };
}

console.log(resolveIdentifier('npm:@scope/package@^1.2.3')); // { name: '@scope/package', range: '^1.2.3' }
console.log(resolveIdentifier('npm:package@latest')); // { name: 'package', range: 'latest' }
console.log(resolveIdentifier('npm:package')); // { name: 'package', range: undefined }
console.log(resolveIdentifier('package@^2.0.0')); // { name: 'package', range: '^2.0.0' }
console.log(resolveIdentifier('package')); // { name: 'package', range: undefined }