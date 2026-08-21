// Harvests the upstream RuleTester cases for the custom rules and materializes them as real files,
// so both linters can be pointed at the same tree.
//
//     node oxlint-migration/rule-tester/buildTree.mjs <treeDir> <rulesJson>
//
// `rulesJson` is written by compareRuleTester.py: the rules to test, keyed by name, with the exact
// severity/options value the production .oxlintrc.json uses.
//
// Writes into <treeDir>:
//   <rule>/{invalid,valid}-<n>.<ext>   one file per case, code verbatim so line numbers survive
//   cases.json                         the case index, consumed by compareRuleTester.py
//   rules.json                         the rule config, consumed by eslint.ruleTester.config.mjs
//   oxlint.json                        generated oxlint config for the tree
import fs from 'node:fs';
import {registerHooks} from 'node:module';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

import {RULES_SUPPRESSED_BY_REACT_COMPILER} from '../../config/eslint/processors/eslint-processor-react-compiler-compat.mjs';
import {didBothCompilersMemoizeFile} from '../../config/reactCompiler/checkBoth.mjs';
import {resolve} from './resolveHook.mjs';
import {captured} from './ruleTesterStub.mjs';

registerHooks({resolve});

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const RULE_DIRS = [path.join(REPO, 'node_modules/eslint-config-expensify/eslint-plugin-expensify'), path.join(REPO, 'eslint-plugin-local-rules')];

// Cases this repo owns for rules it does not: a rule that lives in node_modules and has no upstream
// test cannot be given one where it lives, because node_modules is not committed. The rule module is
// still resolved from RULE_DIRS, so a case here tests exactly the module both linters load.
const EXTRA_TEST_DIRS = [path.join(HERE, 'cases')];

const treeDir = path.resolve(process.argv[2]);
const ruleConfig = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
const wanted = new Set(Object.keys(ruleConfig));

/** Every rule module name the two directories provide, i.e. the valid `rulesdir/<name>` ids. */
function knownRuleNames() {
    const names = new Set();
    for (const dir of RULE_DIRS) {
        if (!fs.existsSync(dir)) {
            continue;
        }
        for (const file of fs.readdirSync(dir)) {
            if (file.endsWith('.js') && file !== 'CONST.js') {
                names.add(file.replace(/\.js$/, ''));
            }
        }
    }
    return names;
}

/**
 * The name a test file's cases belong to.
 *
 * Three candidates, because upstream is not consistent: `use-periods-error-messages.test.js` tests
 * `use-periods-for-error-messages`, and `use-double-negation-instead-of-boolean.js` is run under the
 * name `use-double-negation-instead-of-Boolean()`. Guessing wrong would silently attribute cases to
 * a rule that is not under test, so an unresolvable name is a hard failure.
 */
function ruleNameFor(runName, testFile, known) {
    const candidates = [runName, runName.replace(/\(\)$/, '').replace(/Boolean$/, 'boolean'), path.basename(testFile, '.test.js')];
    for (const candidate of candidates) {
        if (known.has(candidate)) {
            return candidate;
        }
    }
    throw new Error(`cannot map test file ${path.basename(testFile)} (run name "${runName}") onto a rule module`);
}

/** JSX needs .tsx, but .tsx would reinterpret `<T>(x) => x` in the rest, so decide per case. */
function extensionFor(code) {
    return /<[A-Za-z][^>]*>|<\/|\/>/.test(code) ? 'tsx' : 'ts';
}

function normalizeCase(entry) {
    return typeof entry === 'string' ? {code: entry} : entry;
}

/** The expectation the upstream case itself states, used to check our materialization. */
function expectationOf(testCase) {
    const errors = testCase.errors;
    if (typeof errors === 'number') {
        return {count: errors, messages: []};
    }
    if (!Array.isArray(errors)) {
        return {count: null, messages: []};
    }
    return {
        count: errors.length,
        messages: errors.map((error) => (typeof error === 'string' ? error : (error?.message ?? null))),
    };
}

async function harvest(known) {
    const byRule = new Map();
    const missing = [];
    for (const testsDir of [...RULE_DIRS.map((dir) => path.join(dir, 'tests')), ...EXTRA_TEST_DIRS]) {
        if (!fs.existsSync(testsDir)) {
            missing.push(path.relative(REPO, testsDir));
            continue;
        }
        for (const file of fs.readdirSync(testsDir).filter((name) => name.endsWith('.test.js'))) {
            const before = captured.length;
            // No try/catch: a test file that stops importing must break this harness loudly rather
            // than quietly shrink the set of rules under test.
            await import(pathToFileURL(path.join(testsDir, file)).href);
            for (const run of captured.slice(before)) {
                const rule = ruleNameFor(run.name, file, known);
                if (!wanted.has(rule)) {
                    continue;
                }
                byRule.set(rule, {cases: run.cases, testFile: path.relative(REPO, path.join(testsDir, file))});
            }
        }
    }
    return {byRule, missingTestDirs: missing};
}

function materialize(byRule) {
    const index = [];
    for (const [rule, {cases, testFile}] of byRule) {
        for (const kind of ['invalid', 'valid']) {
            (cases[kind] ?? []).forEach((raw, position) => {
                const testCase = normalizeCase(raw);
                const stem = `${kind}-${position}`;
                const relative = testCase.filename ? path.join(rule, stem, testCase.filename.replace(/^[/\\]+/, '')) : `${path.join(rule, stem)}.${extensionFor(testCase.code)}`;
                const absolute = path.join(treeDir, relative);
                fs.mkdirSync(path.dirname(absolute), {recursive: true});
                fs.writeFileSync(absolute, testCase.code);
                index.push({
                    rule,
                    kind,
                    position,
                    testFile,
                    file: relative.split(path.sep).join('/'),
                    expected: kind === 'invalid' ? expectationOf(testCase) : {count: 0, messages: []},
                    // Only the gated rules pay the compile: it answers whether an upstream case that
                    // both tools now stay silent on is being suppressed by the React Compiler, or is
                    // a rule that quietly stopped working. Recorded here because the tree is gone by
                    // the time the comparison runs.
                    memoizedByBoth: RULES_SUPPRESSED_BY_REACT_COMPILER.has(`rulesdir/${rule}`) ? didBothCompilersMemoizeFile(testCase.code, absolute) : null,
                });
            });
        }
    }
    return index;
}

function writeConfigs() {
    const plugin = path.relative(treeDir, path.join(REPO, 'config/oxlint/plugins/expensify-rules.mjs')).split(path.sep).join('/');
    const rules = Object.fromEntries(Object.entries(ruleConfig).map(([name, value]) => [`rulesdir/${name}`, value]));
    fs.writeFileSync(
        path.join(treeDir, 'oxlint.json'),
        `${JSON.stringify(
            {
                $schema: path.relative(treeDir, path.join(REPO, 'node_modules/oxlint/configuration_schema.json')).split(path.sep).join('/'),
                // The production plugin, not a copy: a failure here means the shipped config is wrong.
                jsPlugins: [{name: 'rulesdir', specifier: plugin.startsWith('.') ? plugin : `./${plugin}`}],
                // Off, or oxlint's default correctness set would report over the top of the cases.
                categories: {correctness: 'off'},
                rules,
            },
            null,
            4,
        )}\n`,
    );
    fs.writeFileSync(path.join(treeDir, 'rules.json'), `${JSON.stringify(ruleConfig, null, 4)}\n`);

    // ESLint needs a TS program for the two type-aware rules under test (no-object-keys-includes,
    // prefer-locale-compare-from-context); without one they throw at create() time and take the
    // whole run down. moduleDetection: force is the load-bearing setting: the cases are snippets,
    // many of them declaring `function test()`, and as scripts they would all share one global
    // scope and collide, which would resolve their types to `error` and quietly change what the
    // type-aware rules decide.
    fs.writeFileSync(
        path.join(treeDir, 'tsconfig.json'),
        `${JSON.stringify(
            {
                compilerOptions: {
                    target: 'esnext',
                    module: 'esnext',
                    moduleResolution: 'bundler',
                    moduleDetection: 'force',
                    jsx: 'react-jsx',
                    allowJs: true,
                    checkJs: false,
                    noEmit: true,
                    skipLibCheck: true,
                    types: [],
                },
                include: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs'],
            },
            null,
            4,
        )}\n`,
    );
}

const known = knownRuleNames();
const {byRule, missingTestDirs} = await harvest(known);
const index = materialize(byRule);
writeConfigs();
fs.writeFileSync(path.join(treeDir, 'cases.json'), `${JSON.stringify(index, null, 1)}\n`);

console.log(
    JSON.stringify({
        rulesWanted: wanted.size,
        rulesHarvested: byRule.size,
        rulesWithoutTests: [...wanted].filter((rule) => !byRule.has(rule)).sort(),
        missingTestDirs,
        files: index.length,
        invalid: index.filter((entry) => entry.kind === 'invalid').length,
        valid: index.filter((entry) => entry.kind === 'valid').length,
    }),
);
