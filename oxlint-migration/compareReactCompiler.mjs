// B2 verification: exact file:line:rule match between ESLint's react-hooks compiler rules and
// oxlint's native react/* per-check rules. Oxlint 1.79.0 split the old aggregate rule
// react/react-compiler into 22 per-check ids; 12 of them are exact kebab-case twins of the
// react-hooks/* rules ESLint runs (react-hooks/refs <-> react/refs, and so on), so the rule id
// itself is the join key. No category translation table is needed any more.
//
// Usage:
//   npx oxlint -c oxlint-migration/rc-probe.oxlintrc.json --format json <paths> \
//     | awk 'found{print;next} /^[\[{]/{found=1;print}' > /tmp/oxlint-rc.json
//   SEATBELT_DISABLE=1 npx eslint --no-cache --format json -o /tmp/eslint.json <paths>
//   node oxlint-migration/compareReactCompiler.mjs /tmp/eslint.json /tmp/oxlint-rc.json
import fs from 'node:fs';

// All 12 rh/* rules with an exact native twin. Widened from the 7 names the aggregate-era
// version covered (refs, set-state-in-effect, set-state-in-render, preserve-manual-memoization,
// purity, immutability, globals): once the join key is the bare rule name instead of a
// hand-picked message-prefix category, every twin costs the same to add, so there is no reason
// to leave static-components, error-boundaries, incompatible-library, unsupported-syntax or
// use-memo out.
const TWIN_RULE_NAMES = new Set([
    'refs',
    'set-state-in-effect',
    'set-state-in-render',
    'preserve-manual-memoization',
    'purity',
    'immutability',
    'globals',
    'static-components',
    'error-boundaries',
    'incompatible-library',
    'unsupported-syntax',
    'use-memo',
]);

const [eslintPath, oxlintPath] = process.argv.slice(2);
const eslintResults = JSON.parse(fs.readFileSync(eslintPath, 'utf8'));
const oxlintResults = JSON.parse(fs.readFileSync(oxlintPath, 'utf8'));

const eslintSet = new Set();
for (const result of eslintResults) {
    for (const message of result.messages) {
        const name = message.ruleId?.startsWith('react-hooks/') ? message.ruleId.slice('react-hooks/'.length) : undefined;
        if (name && TWIN_RULE_NAMES.has(name)) {
            eslintSet.add(`${result.filePath.replace(/^.*?(src|tests)\//, '$1/')}:${message.line}:${name}`);
        }
    }
}

const oxlintSet = new Set();
for (const diagnostic of oxlintResults.diagnostics) {
    const match = /^react\((.+)\)$/.exec(diagnostic.code ?? '');
    const name = match?.[1];
    if (name && TWIN_RULE_NAMES.has(name)) {
        oxlintSet.add(`${diagnostic.filename}:${diagnostic.labels?.[0]?.span?.line ?? 0}:${name}`);
    }
}

const matched = [...eslintSet].filter((key) => oxlintSet.has(key));
const eslintOnly = [...eslintSet].filter((key) => !oxlintSet.has(key));
const oxlintOnly = [...oxlintSet].filter((key) => !eslintSet.has(key));

console.log(`ESLint (deduped): ${eslintSet.size} | oxlint (deduped): ${oxlintSet.size} | exact match: ${matched.length}`);
console.log(`recall (oxlint finds ESLint's findings): ${eslintSet.size ? ((100 * matched.length) / eslintSet.size).toFixed(1) : 'n/a'}%`);
if (eslintOnly.length) {
    console.log(`\nESLint-only (MISSED by oxlint — must be 0 before switching):\n  ${eslintOnly.join('\n  ')}`);
}
if (oxlintOnly.length) {
    console.log(`\noxlint-only (spot-check: inline-disabled lines or new catches):\n  ${oxlintOnly.join('\n  ')}`);
}
process.exit(eslintOnly.length ? 1 : 0);
