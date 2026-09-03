type GlobScanOptions = {
    cwd: string;
    onlyFiles: boolean;
};

type Glob = {
    scanSync: (options: GlobScanOptions) => IterableIterator<string>;
};

declare const Bun: {
    Glob: new (pattern: string) => Glob;
};

function matchingFiles(directory: string, pattern: string): string[] {
    return [...new Bun.Glob(pattern).scanSync({cwd: directory, onlyFiles: true})];
}

export default matchingFiles;
