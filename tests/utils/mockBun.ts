import {existsSync, readFileSync, writeFileSync} from 'node:fs';

const bun = {
    env: process.env,
    file: (path: string) => ({
        exists: async () => existsSync(path),
        json: async (): Promise<unknown> => JSON.parse(readFileSync(path, 'utf8')),
        text: async () => readFileSync(path, 'utf8'),
    }),
    write: async (path: string, contents: string) => {
        writeFileSync(path, contents);
        return Buffer.byteLength(contents);
    },
};

Object.defineProperty(globalThis, 'Bun', {configurable: true, value: bun});
