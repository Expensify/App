// Resolve both linters' configs for the same files, from authored values.
//
//     node oxlint-migration/resolveConfigs.mjs <file> [<file> ...]
//
// Not `eslint --print-config`: that fills in each rule's schema defaults, so `import/order` comes back
// carrying options nothing in any config authored, and every rule with defaults reads as drift.
import minimatchPackage from 'minimatch';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
// Byte-for-byte the options @eslint/config-array uses (dist/cjs/index.cjs, MINIMATCH_OPTIONS), against
// the same hoisted minimatch ^3.1.2 it pins. minimatch 3 is CommonJS and exports the matcher as
// `module.exports` itself, so the default import IS the function.
const minimatch = minimatchPackage;
const MINIMATCH_OPTIONS = {dot: true, allowWindowsEscape: true};

// The predicate form is what ESLint's `FlatCompat` bridge emits
// (`files: [["**/*.ts", absoluteFilePath => criteria.test(absoluteFilePath)]]`), and it takes the
// ABSOLUTE path. Handing it to minimatch instead throws `invalid pattern`.
function matchesPattern(paths, pattern) {
    if (Array.isArray(pattern)) {
        return pattern.every((inner) => matchesPattern(paths, inner));
    }
    if (typeof pattern === 'function') {
        return Boolean(pattern(paths.absolute));
    }
    return minimatch(paths.relative, pattern, MINIMATCH_OPTIONS);
}

function blockApplies(paths, block) {
    if (block.ignores?.some((pattern) => matchesPattern(paths, pattern))) {
        return false;
    }
    if (!block.files) {
        // In ESLint, a block with only `ignores` is a global ignore, not a global rule block.
        return !block.ignores;
    }
    return block.files.some((pattern) => matchesPattern(paths, pattern));
}

function resolve(paths, blocks) {
    const rules = {};
    for (const block of blocks) {
        if (!block?.rules || !blockApplies(paths, block)) {
            continue;
        }
        Object.assign(rules, block.rules);
    }
    return rules;
}

// oxlint's config is JSONC, so `JSON.parse` cannot read it. A `//` inside a string is not a comment.
function parseJsonc(source) {
    let out = '';
    let inString = false;
    let index = 0;
    while (index < source.length) {
        const char = source[index];
        if (inString) {
            out += char;
            if (char === '\\') {
                out += source[index + 1] ?? '';
                index += 2;
                continue;
            }
            if (char === '"') {
                inString = false;
            }
            index += 1;
            continue;
        }
        if (char === '"') {
            inString = true;
            out += char;
            index += 1;
            continue;
        }
        if (char === '/' && source[index + 1] === '/') {
            while (index < source.length && source[index] !== '\n') {
                index += 1;
            }
            continue;
        }
        out += char;
        index += 1;
    }
    return JSON.parse(out);
}

const eslintBlocks = (await import(path.join(ROOT, 'config/eslint/eslint.config.mjs'))).default;

const oxlintConfig = parseJsonc(fs.readFileSync(path.join(ROOT, '.oxlintrc.json'), 'utf8'));
const oxlintBlocks = [{rules: oxlintConfig.rules ?? {}}, ...(oxlintConfig.overrides ?? []).map((override) => ({files: override.files, rules: override.rules ?? {}}))];

const out = {};
for (const arg of process.argv.slice(2)) {
    const absolute = path.resolve(ROOT, arg);
    const paths = {absolute, relative: path.relative(ROOT, absolute)};
    out[paths.relative] = {eslint: resolve(paths, eslintBlocks), oxlint: resolve(paths, oxlintBlocks)};
}
console.log(JSON.stringify(out));
