#!/usr/bin/env node
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONFIG = 'oxlint-migration/onyx-bypass-probe/probe.oxlintrc.json';
const FIXTURE = 'oxlint-migration/onyx-bypass-probe/fixture.ts';

function runProbe() {
    let stdout;
    try {
        stdout = execFileSync('npx', ['oxlint', '-c', CONFIG, '--format', 'json', FIXTURE], {cwd: repoRoot, encoding: 'utf8'});
    } catch (error) {
        // oxlint exits non-zero when it finds anything, which is the normal case here.
        stdout = error.stdout ?? '';
    }
    const byRule = new Map();
    for (const diagnostic of JSON.parse(stdout).diagnostics) {
        const rule = diagnostic.code;
        const line = diagnostic.labels?.[0]?.span?.line;
        byRule.set(rule, [...(byRule.get(rule) ?? []), line]);
    }
    for (const lines of byRule.values()) {
        lines.sort((first, second) => first - second);
    }
    return byRule;
}

const NO_COMMENT = 7;
const DISABLED_NEXT_LINE = 11;
const DISABLED_BY_BLOCK = 15;
const UNRELATED_DISABLE = 20;

const EXPECTED = [
    ['rulesdir(no-onyx-connect)', [NO_COMMENT, UNRELATED_DISABLE], 'the ban still reports every violation no directive hides'],
    ['probe(bypass)', [DISABLED_NEXT_LINE, DISABLED_BY_BLOCK], 'the shadow reports exactly the two a directive hid, and neither of the other two'],
    ['probe(bypass-grandfathered)', [DISABLED_BY_BLOCK], 'an allowance of 1 hides the first bypass by line order, the way findNewBypasses does'],
];

const found = runProbe();
let failed = false;

for (const [rule, expected, why] of EXPECTED) {
    const actual = found.get(rule) ?? [];
    const ok = JSON.stringify(actual) === JSON.stringify(expected);
    failed ||= !ok;
    console.log(`${ok ? 'ok  ' : 'FAIL'}  ${rule.padEnd(30)} lines ${JSON.stringify(actual).padEnd(10)} expected ${JSON.stringify(expected).padEnd(10)} ${why}`);
}

const banLines = found.get('rulesdir(no-onyx-connect)') ?? [];
const shadowLines = found.get('probe(bypass)') ?? [];
const union = new Set([...banLines, ...shadowLines]);
const overlap = banLines.filter((line) => shadowLines.includes(line));
const partitioned = union.size === 4 && overlap.length === 0;
failed ||= !partitioned;
console.log(`${partitioned ? 'ok  ' : 'FAIL'}  partition${' '.repeat(21)} the ban and its shadow cover all 4 call sites and share none`);

if (found.has('probe(bypass)') === false) {
    console.error('The shadow rule reported nothing at all, which means the probe proves nothing.');
    failed = true;
}

console.log(failed ? '\nThe Onyx.connect bypass port does NOT match the ESLint script.' : '\nThe Onyx.connect bypass port reports exactly the bypasses, on the ban unchanged.');
process.exit(failed ? 1 : 0);
