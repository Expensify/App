import {ESLint} from 'eslint';
/**
 * Every rule the real ESLint config enables, over whatever file list arrives on stdin.
 *
 * One process for the whole repo. `npx eslint --print-config` spends ~1.3s of node startup per
 * file, so resolving 9k files that way is a three-hour job; the same work through the ESLint API
 * in a single process takes about five seconds.
 *
 * Reads one path per line on stdin, writes {"files": N, "rules": [...]} on stdout.
 */
import {readFileSync} from 'node:fs';

const files = readFileSync(0, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

const eslint = new ESLint({cwd: process.cwd()});
const enabled = new Set();
let resolved = 0;

for (const file of files) {
    // Returns undefined (older ESLint threw) for a path the config does not cover, which over a
    // whole-repo sweep just means the file is not linted.
    // eslint-disable-next-line no-await-in-loop
    const config = await eslint.calculateConfigForFile(file).catch(() => null);
    if (!config) {
        continue;
    }
    resolved++;
    for (const [ruleID, value] of Object.entries(config.rules ?? {})) {
        const severity = Array.isArray(value) ? value[0] : value;
        if (severity !== 'off' && severity !== 0) {
            enabled.add(ruleID);
        }
    }
}

process.stdout.write(JSON.stringify({files: resolved, rules: [...enabled].sort()}));
