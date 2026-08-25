/**
 * Resolve both linters' configs for the same files, from authored values.
 *
 *   node oxlint-migration/resolveConfigs.mjs <file> [<file> ...]
 *
 * Emits, per file, the rule map each linter would apply: `{<file>: {eslint: {...}, oxlint: {...}}}`.
 *
 * Not `eslint --print-config`. That fills in each rule's schema defaults, so `import/order` comes back
 * carrying `distinctGroup`, `sortTypesGroup` and `named` that nothing in any config authored. Comparing
 * those against a hand-mirrored oxlint config reports drift on every rule that has defaults, which is
 * noise. Reading the flat config array directly gives the values somebody actually wrote.
 *
 * Both sides are matched by the same code so a difference is never an artifact of two glob engines.
 * ESLint's semantics, reproduced here: blocks apply in order, a block with no `files` applies to
 * everything, `ignores` inside a block excludes, and the last block to set a rule wins.
 */
import minimatchPackage from 'minimatch';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
// Byte-for-byte the options @eslint/config-array uses (its dist/cjs/index.cjs, MINIMATCH_OPTIONS), and
// the same minimatch: that package pins ^3.1.2, which is the hoisted copy this import resolves to. So
// glob semantics here are ESLint's own, not an approximation of them.
// minimatch 3 is CommonJS and exports the matcher as `module.exports` itself, so the default import IS
// the function.
const minimatch = minimatchPackage;
const MINIMATCH_OPTIONS = {dot: true, allowWindowsEscape: true};

/**
 * One `files`/`ignores` entry against one file.
 *
 * Three forms, all of which this config actually uses: a glob string; a nested array meaning "every
 * one of these must match"; and a predicate taking the *absolute* path, which is what the `FlatCompat`
 * bridge emits (`files: [["**\/*.ts", absoluteFilePath => criteria.test(absoluteFilePath)]]`). Missing
 * the third form is not a silent wrong answer, it throws `invalid pattern` inside minimatch, which is
 * how it was found.
 */
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
        // A block with only `ignores` is a global ignore, not a global rule block.
        return !block.ignores;
    }
    return block.files.some((pattern) => matchesPattern(paths, pattern));
}

/** Last-wins merge of every applicable block's `rules`. */
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

/** `JSON.parse` for oxlint's config, which is JSONC. A `//` inside a string is not a comment. */
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
// oxlint's shape as ESLint blocks: the root `rules` is a block that applies to everything, then each
// override in order. Same last-wins merge, so one resolver serves both.
const oxlintBlocks = [{rules: oxlintConfig.rules ?? {}}, ...(oxlintConfig.overrides ?? []).map((override) => ({files: override.files, rules: override.rules ?? {}}))];

const out = {};
for (const arg of process.argv.slice(2)) {
    const absolute = path.resolve(ROOT, arg);
    const paths = {absolute, relative: path.relative(ROOT, absolute)};
    out[paths.relative] = {eslint: resolve(paths, eslintBlocks), oxlint: resolve(paths, oxlintBlocks)};
}
console.log(JSON.stringify(out));
