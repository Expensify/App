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

const EXTRA_TEST_DIRS = [path.join(HERE, 'cases')];

const treeDir = path.resolve(process.argv[2]);
const ruleConfig = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
const wanted = new Set(Object.keys(ruleConfig));

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

// Three candidates, because upstream is not consistent: `use-periods-error-messages.test.js` tests
// `use-periods-for-error-messages`, and `use-double-negation-instead-of-boolean.js` runs under the name
// `use-double-negation-instead-of-Boolean()`.
function ruleNameFor(runName, testFile, known) {
    const candidates = [runName, runName.replace(/\(\)$/, '').replace(/Boolean$/, 'boolean'), path.basename(testFile, '.test.js')];
    for (const candidate of candidates) {
        if (known.has(candidate)) {
            return candidate;
        }
    }
    throw new Error(`cannot map test file ${path.basename(testFile)} (run name "${runName}") onto a rule module`);
}

// JSX needs .tsx, but .tsx reinterprets `<T>(x) => x` as JSX, so the extension is decided per case.
function extensionFor(code) {
    return /<[A-Za-z][^>]*>|<\/|\/>/.test(code) ? 'tsx' : 'ts';
}

function normalizeCase(entry) {
    return typeof entry === 'string' ? {code: entry} : entry;
}

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
                jsPlugins: [{name: 'rulesdir', specifier: plugin.startsWith('.') ? plugin : `./${plugin}`}],
                // Off, or oxlint's default correctness set reports over the top of the cases.
                categories: {correctness: 'off'},
                rules,
            },
            null,
            4,
        )}\n`,
    );
    fs.writeFileSync(path.join(treeDir, 'rules.json'), `${JSON.stringify(ruleConfig, null, 4)}\n`);

    // The two type-aware rules under test throw at create() time without a TS program.
    // `moduleDetection: force` is load-bearing: as scripts, the snippets would share one global scope,
    // collide on names like `function test()`, and resolve to `error` types.
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
