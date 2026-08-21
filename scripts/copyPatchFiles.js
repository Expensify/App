#!/usr/bin/env bun

// Stage all patches in one process instead of spawning a separate `cp` process for each file.
const {Glob, file, write} = globalThis.Bun;
const [destination, ...patchDirectories] = process.argv.slice(2);
const patchGlob = new Glob('**/*.patch');

for (const patchDirectory of patchDirectories) {
    const writes = [];
    for await (const source of patchGlob.scan({cwd: patchDirectory, absolute: true})) {
        const filename = source.slice(source.lastIndexOf('/') + 1);
        writes.push(write(`${destination}/${filename}`, file(source)));
    }
    await Promise.all(writes);
}
