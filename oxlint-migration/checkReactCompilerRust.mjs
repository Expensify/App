#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';

import {IGNORED_CATEGORIES, RULE_BY_CATEGORY, reactCompilerDiagnostics} from '../config/oxlint/reactCompilerRust.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FIXTURE_DIR = path.join(repoRoot, 'oxlint-migration/port-probe/fixtures');
const PROBE_DIR = path.join(repoRoot, 'oxlint-migration/native-vs-sidecar-probe');
const PLUGIN_BUNDLE = path.join(repoRoot, 'node_modules/eslint-config-expensify/node_modules/eslint-plugin-react-hooks/cjs/eslint-plugin-react-hooks.development.js');

const FIXTURES = [
    ['rhRefs.tsx', 'refs', 1],
    ['rhSetStateInEffect.tsx', 'set-state-in-effect', 1],
    ['rhSetStateInRender.tsx', 'set-state-in-render', 1],
    ['rhPreserveManualMemoization.tsx', 'preserve-manual-memoization', 1],
    ['rhImmutability.tsx', 'immutability', 2],
    ['rhStaticComponents.tsx', 'static-components', 1],
    ['rhUseMemo.tsx', 'use-memo', 1],
    ['rhGlobals.tsx', 'globals', 1],
    ['rhErrorBoundaries.tsx', 'error-boundaries', 1],
    ['rhPurity.tsx', 'purity', 1],
    ['rhIncompatibleLibrary.tsx', 'incompatible-library', 1],
    ['rhUnsupportedSyntax.tsx', 'unsupported-syntax', 1],
];

let failed = false;

function check(ok, label, detail = '') {
    failed ||= !ok;
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? `  ${detail}` : ''}`);
}

function diagnose(file) {
    return reactCompilerDiagnostics(file, fs.readFileSync(file, 'utf8'));
}

function countsByRule(diagnostics) {
    const counts = new Map();
    for (const {ruleName} of diagnostics) {
        counts.set(ruleName, (counts.get(ruleName) ?? 0) + 1);
    }
    return counts;
}

// Does the Rust engine hand back diagnostics at all? oxc-transform-react 0.148.0 narrowed
// `result.errors` to fatal React Compiler diagnostics (oxc-project/oxc#26128) and `should_panic`
// answers false unconditionally for the default `panicThreshold: 'none'`, so on 0.148.0 and 0.149.0
// it analyzes every file and returns nothing. All twelve rc/* rules are `off` in .oxlintrc.json
// because of it; the reasoning and the measured numbers live there, and it is tracked upstream as
// oxc-project/oxc#26318.
//
// Rather than hardcode zeroes, every assertion below reads this flag and checks the real expectation
// or the blocked one. So the day upstream exposes non-fatal diagnostics, this script starts
// enforcing the real numbers on its own, and the last check fails to say the config needs flipping
// back on. No false green in either direction, and nothing to remember to edit.
const ENGINE_REPORTS = diagnose(path.join(FIXTURE_DIR, 'rhRefs.tsx')).length > 0;
if (!ENGINE_REPORTS) {
    console.log('NOTE: the Rust engine reports nothing on this oxc-transform-react. Checking the blocked expectations.');
    console.log('      See the rc/* block in .oxlintrc.json. Fixed upstream? This script will tell you.\n');
}

console.log("1. one fixture per rule, and no rule reporting another rule's fixture");
const ALL_RULES = Object.values(RULE_BY_CATEGORY);
for (const [fixture, rule, reportingExpected] of FIXTURES) {
    const expected = ENGINE_REPORTS ? reportingExpected : 0;
    const counts = countsByRule(diagnose(path.join(FIXTURE_DIR, fixture)));
    const own = counts.get(rule) ?? 0;
    const strays = ALL_RULES.filter((other) => other !== rule && (counts.get(other) ?? 0) > 0);
    check(own === expected && strays.length === 0, `${fixture} -> rc/${rule}`, `got ${own}, expected ${expected}${strays.length ? `, STRAY ${strays.join(',')}` : ''}`);
}
check(FIXTURES.length === ALL_RULES.length, 'every rule in RULE_BY_CATEGORY has a fixture', `${FIXTURES.length} fixtures, ${ALL_RULES.length} rules`);

console.log('\n2. the category tables cover the whole ErrorCategory enum in eslint-plugin-react-hooks');
const bundle = fs.readFileSync(PLUGIN_BUNDLE, 'utf8');
const enumCategories = [...bundle.matchAll(/ErrorCategory\["(\w+)"] = "\1"/g)].map((match) => match[1]);
const known = new Set([...Object.keys(RULE_BY_CATEGORY), ...IGNORED_CATEGORIES]);
const unmapped = enumCategories.filter((category) => !known.has(category));
const phantom = [...known].filter((category) => !enumCategories.includes(category));
check(enumCategories.length > 0, 'ErrorCategory enum found in the plugin bundle', `${enumCategories.length} categories`);
check(unmapped.length === 0, 'every upstream category is mapped or explicitly ignored', unmapped.length ? `UNMAPPED ${unmapped.join(',')}` : '');
check(phantom.length === 0, 'no table entry names a category upstream dropped', phantom.length ? `STALE ${phantom.join(',')}` : '');

console.log('\n3. an unrecognized category throws');
const refsFixture = path.join(FIXTURE_DIR, 'rhRefs.tsx');
const unmappedCopy = path.join(PROBE_DIR, 'rhRefs.unmapped-probe.tsx');
fs.copyFileSync(refsFixture, unmappedCopy);
const savedRule = RULE_BY_CATEGORY.Refs;
delete RULE_BY_CATEGORY.Refs;
let threw = false;
try {
    diagnose(unmappedCopy);
} catch (error) {
    threw = /Unknown React Compiler category 'Refs'/.test(String(error.message));
}
RULE_BY_CATEGORY.Refs = savedRule;
fs.rmSync(unmappedCopy);
// The throw needs a categorized diagnostic to trip over, so it is unobservable while the engine
// returns nothing. Asserted in the negative rather than skipped, so the pair still says something.
check(threw === ENGINE_REPORTS, 'a category missing from both tables throws', ENGINE_REPORTS ? '' : 'unobservable while the engine reports nothing, and it did not throw');

console.log('\n4. a file the compiler cannot parse reports nothing');
const brokenFile = path.join(PROBE_DIR, 'broken.probe.tsx');
fs.writeFileSync(brokenFile, 'export function Broken( {\n');
let broken;
try {
    broken = diagnose(brokenFile);
} catch (error) {
    broken = `threw: ${error.message}`;
}
fs.rmSync(brokenFile);
check(Array.isArray(broken) && broken.length === 0, 'a syntactically broken file yields []', String(broken));

console.log('\n5. the analysis is cached per filename');
const cachedFirst = diagnose(refsFixture);
const cachedSecond = reactCompilerDiagnostics(refsFixture, 'export const nothing = 1;\n');
check(cachedSecond === cachedFirst, 'a second call for the same filename returns the cached array', `${cachedFirst.length} diagnostics`);

console.log('\n6. suppression comments no longer hide the analysis (the reason this module exists)');
const counter = diagnose(path.join(PROBE_DIR, 'Counter.tsx'));
const counterLines = counter.map((diagnostic) => diagnostic.loc.start.line).sort((first, second) => first - second);
check(
    JSON.stringify(counterLines) === JSON.stringify(ENGINE_REPORTS ? [8, 12] : []),
    'Counter.tsx reports the ref read and the setState-in-effect',
    `lines ${counterLines.join(',') || '(none)'}`,
);
const twoComponents = diagnose(path.join(PROBE_DIR, 'TwoComponents.tsx'));
const twoLines = twoComponents.map((diagnostic) => diagnostic.loc.start.line).sort((first, second) => first - second);
check(
    JSON.stringify(twoLines) === JSON.stringify(ENGINE_REPORTS ? [7, 21, 24] : []),
    'TwoComponents.tsx reports all three, including the one in the component holding the comment',
    `lines ${twoLines.join(',') || '(none)'}`,
);

console.log('\n7. the one recorded anchor divergence stays where it was measured');
// ESLint anchors the second immutability finding on the escape site, the `onClick={onSelect}` line
// (measured 2026-08-21, column 29); the Rust compiler has no label there and anchors both on the
// modification site.
const anchorFile = path.join(PROBE_DIR, 'rhImmutabilityAnchor.tsx');
const anchorLines = fs.readFileSync(anchorFile, 'utf8').split('\n');
const modificationLine = anchorLines.findLastIndex((line) => line.includes('latest = 1;')) + 1;
const escapeLine = anchorLines.findLastIndex((line) => line.includes('onClick={onSelect}')) + 1;
const anchorPoints = diagnose(anchorFile)
    .map((diagnostic) => `${diagnostic.loc.start.line}:${diagnostic.loc.start.column + 1}`)
    .sort();
const expectedPoints = ENGINE_REPORTS ? [`${modificationLine}:9`, `${modificationLine}:9`] : [];
check(
    JSON.stringify(anchorPoints) === JSON.stringify(expectedPoints),
    'rhImmutabilityAnchor.tsx reports both immutability findings on the modification site',
    `got ${anchorPoints.join(' and ') || 'nothing'}, expected ${expectedPoints.join(' and ') || 'nothing'}; ESLint puts the second one at ${escapeLine}:29`,
);

console.log('\n8. the rc/* rules are enabled if and only if the engine can feed them');
// The tripwire. While the engine reports nothing the rules are `off` and this passes; the moment
// upstream exposes non-fatal diagnostics, every assertion above switches to the real expectations
// and this one fails until the twelve rules go back to "error" in .oxlintrc.json.
const oxlintrc = fs.readFileSync(path.join(repoRoot, '.oxlintrc.json'), 'utf8');
const enabledInConfig = ALL_RULES.filter((rule) => new RegExp(`"rc/${rule}":\\s*"error"`).test(oxlintrc));
check(
    ENGINE_REPORTS ? enabledInConfig.length === ALL_RULES.length : enabledInConfig.length === 0,
    'rc/* config matches what the engine can deliver',
    ENGINE_REPORTS
        ? `engine reports, so all ${ALL_RULES.length} must be "error"; ${enabledInConfig.length} are. Turn the rest back on in .oxlintrc.json`
        : `engine reports nothing, so all ${ALL_RULES.length} are "off"`,
);

console.log(failed ? '\nFAILED' : '\nAll assertions hold.');
process.exit(failed ? 1 : 0);
