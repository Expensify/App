#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';

import {CONFIG_CATEGORY, IGNORED_CATEGORIES, RULE_BY_CATEGORY, reactCompilerDiagnostics} from '../config/oxlint/reactCompilerRust.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FIXTURE_DIR = path.join(repoRoot, 'oxlint-migration/port-probe/fixtures');
const PROBE_DIR = path.join(repoRoot, 'oxlint-migration/native-vs-sidecar-probe');
const PLUGIN_BUNDLE = path.join(repoRoot, 'node_modules/eslint-config-expensify/node_modules/eslint-plugin-react-hooks/cjs/eslint-plugin-react-hooks.development.js');

const FIXTURES = [
    ['rhRefs.tsx', 'refs', 1],
    ['rhSetStateInRender.tsx', 'set-state-in-render', 1],
    ['rhPreserveManualMemoization.tsx', 'preserve-manual-memoization', 1],
    ['rhImmutability.tsx', 'immutability', 2],
    ['rhUseMemo.tsx', 'use-memo', 1],
    ['rhGlobals.tsx', 'globals', 1],
    ['rhPurity.tsx', 'purity', 1],
    ['rhIncompatibleLibrary.tsx', 'incompatible-library', 1],
    ['rhUnsupportedSyntax.tsx', 'unsupported-syntax', 1],
];

// Three categories whose fixture cannot report, while the rule itself does fire in real code. All
// three are non-fatal on their own, and since oxc-transform-react 0.148.0 only fatal React Compiler
// diagnostics come back through `result.errors` (oxc-project/oxc#26128, tracked as #26318). Each of
// these fixtures is one component whose only problem is the non-fatal one, so nothing fails the
// compile and nothing is returned.
//
// They are still `error` in .oxlintrc.json, and correctly so: in real code the category usually
// shares a function with something fatal and rides along on the abort. Counter.tsx in section 6 is
// exactly that, reporting set-state-in-effect on line 12 because the ref read on line 8 fails the
// compile. Whole-repo that is set-state-in-effect 47 of ESLint's 127, and static-components 2 of 2.
//
// A tripwire, not an exemption: if a fixture starts reporting on its own, upstream has exposed
// non-fatal diagnostics and `panicThreshold` in config/oxlint/reactCompilerRust.mjs can go back to
// `none`, which removes the iterative reveal.
const NON_FATAL_IN_ISOLATION = [
    ['rhSetStateInEffect.tsx', 'set-state-in-effect'],
    ['rhStaticComponents.tsx', 'static-components'],
    ['rhErrorBoundaries.tsx', 'error-boundaries'],
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

console.log("1. one fixture per rule, and no rule reporting another rule's fixture");
const ALL_RULES = Object.values(RULE_BY_CATEGORY);
for (const [fixture, rule, expected] of FIXTURES) {
    const counts = countsByRule(diagnose(path.join(FIXTURE_DIR, fixture)));
    const own = counts.get(rule) ?? 0;
    const strays = ALL_RULES.filter((other) => other !== rule && (counts.get(other) ?? 0) > 0);
    check(own === expected && strays.length === 0, `${fixture} -> rc/${rule}`, `got ${own}, expected ${expected}${strays.length ? `, STRAY ${strays.join(',')}` : ''}`);
}
for (const [fixture, rule] of NON_FATAL_IN_ISOLATION) {
    const own = countsByRule(diagnose(path.join(FIXTURE_DIR, fixture))).get(rule) ?? 0;
    check(
        own === 0,
        `${fixture} -> rc/${rule} silent in isolation`,
        own === 0
            ? 'nothing fatal in the fixture to carry it out, as oxc-project/oxc#26318 leaves it'
            : `now reports ${own} alone: upstream exposed non-fatal diagnostics, revisit panicThreshold`,
    );
}
check(
    FIXTURES.length + NON_FATAL_IN_ISOLATION.length === ALL_RULES.length,
    'every rule in RULE_BY_CATEGORY has a fixture',
    `${FIXTURES.length} self-reporting + ${NON_FATAL_IN_ISOLATION.length} non-fatal in isolation, ${ALL_RULES.length} rules`,
);

console.log('\n2. the category tables cover the whole ErrorCategory enum in eslint-plugin-react-hooks');
const bundle = fs.readFileSync(PLUGIN_BUNDLE, 'utf8');
const enumCategories = [...bundle.matchAll(/ErrorCategory\["(\w+)"] = "\1"/g)].map((match) => match[1]);
// Config is in neither table on purpose: it is thrown on rather than mapped or ignored.
const known = new Set([...Object.keys(RULE_BY_CATEGORY), ...IGNORED_CATEGORIES, CONFIG_CATEGORY]);
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
check(threw, 'a category missing from both tables throws');

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
check(JSON.stringify(counterLines) === JSON.stringify([8, 12]), 'Counter.tsx reports the ref read and the setState-in-effect', `lines ${counterLines.join(',') || '(none)'}`);
// Only the first of the three, and that is the `all_errors` cost rather than a suppression bug.
// `Dirty` fails first, the fatal abort carries what was accumulated by then, and `Clean` is never
// analyzed on this pass. Fix line 7 and the next run surfaces 21, then 24. ESLint reports all three
// at once, which is the 129-finding gap `npm run compare-oxlint` prints per rule.
//
// Asserted as exactly [7] so this is a tripwire: if it ever returns all three, upstream stopped
// aborting at the first failure and .oxlintrc.json should be revisited.
const twoComponents = diagnose(path.join(PROBE_DIR, 'TwoComponents.tsx'));
const twoLines = twoComponents.map((diagnostic) => diagnostic.loc.start.line).sort((first, second) => first - second);
check(
    JSON.stringify(twoLines) === JSON.stringify([7]),
    'TwoComponents.tsx reports the first failing component, the rest on later passes',
    `lines ${twoLines.join(',') || '(none)'}; ESLint reports 7,21,24 in one pass`,
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
const expectedPoints = [`${modificationLine}:9`, `${modificationLine}:9`];
check(
    JSON.stringify(anchorPoints) === JSON.stringify(expectedPoints),
    'rhImmutabilityAnchor.tsx reports both immutability findings on the modification site',
    `got ${anchorPoints.join(' and ') || 'nothing'}, expected ${expectedPoints.join(' and ') || 'nothing'}; ESLint puts the second one at ${escapeLine}:29`,
);

console.log('\n8. every rc/* rule is enabled, including the ones that only report part of what ESLint does');
// A rule that under-reports shows up as a count in `npm run compare-oxlint`. A rule switched off
// reads exactly like a clean codebase, so none of them are switched off.
const oxlintrc = fs.readFileSync(path.join(repoRoot, '.oxlintrc.json'), 'utf8');
const severityOf = (rule) => oxlintrc.match(new RegExp(`"rc/${rule}":\\s*"(error|off)"`))?.[1];
const notEnabled = ALL_RULES.filter((rule) => severityOf(rule) !== 'error');
check(
    notEnabled.length === 0,
    'all rc/* rules are "error" in .oxlintrc.json',
    notEnabled.length === 0 ? `${ALL_RULES.length} of ${ALL_RULES.length}` : `not "error": ${notEnabled.map((rule) => `rc/${rule} (is ${severityOf(rule) ?? 'missing'})`).join(', ')}`,
);

console.log(failed ? '\nFAILED' : '\nAll assertions hold.');
process.exit(failed ? 1 : 0);
