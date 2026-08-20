#!/usr/bin/env node

// Stage all patches in one process instead of spawning a separate `cp` process for each file.
const fs = require('node:fs');
const path = require('node:path');

const [destination, ...patchDirectories] = process.argv.slice(2);

for (const patchDirectory of patchDirectories) {
    const pendingDirectories = [patchDirectory];
    while (pendingDirectories.length > 0) {
        const directory = pendingDirectories.pop();
        for (const entry of fs.readdirSync(directory, {withFileTypes: true})) {
            const source = path.join(directory, entry.name);
            if (entry.isDirectory()) {
                pendingDirectories.push(source);
            } else if (entry.name.endsWith('.patch')) {
                fs.copyFileSync(source, path.join(destination, entry.name));
            }
        }
    }
}
