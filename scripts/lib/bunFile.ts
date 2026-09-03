type BunFile = {
    exists: () => Promise<boolean>;
    json: () => Promise<unknown>;
    text: () => Promise<string>;
};

declare const Bun: {
    file: (path: string) => BunFile;
    write: (path: string, contents: string) => Promise<number>;
};

function readTextFile(path: string): Promise<string> {
    return Bun.file(path).text();
}

function readJSONFile(path: string): Promise<unknown> {
    return Bun.file(path).json();
}

async function writeTextFile(path: string, contents: string): Promise<void> {
    await Bun.write(path, contents);
}

function fileExists(path: string): Promise<boolean> {
    return Bun.file(path).exists();
}

export {fileExists, readJSONFile, readTextFile, writeTextFile};
