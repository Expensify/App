export default function getFailedPatchPackages(output: string): string[] {
    const packages = new Set<string>();
    for (const match of output.matchAll(/(?:The patches for|Failed to apply patch for package)\s+(\S+)/g)) {
        packages.add(match[1]);
    }
    return [...packages];
}
