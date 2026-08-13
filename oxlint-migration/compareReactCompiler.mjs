// B2 verification: exact file:line match between ESLint's split react-hooks
// compiler rules and oxlint's aggregate react/react-compiler diagnostics.
//
// Usage:
//   npx oxlint -c oxlint-migration/rc-probe.oxlintrc.json --format json <paths> \
//     | awk 'found{print;next} /^[\[{]/{found=1;print}' > /tmp/oxlint-rc.json
//   SEATBELT_DISABLE=1 npx eslint --no-cache --format json -o /tmp/eslint.json <paths>
//   node oxlint-migration/compareReactCompiler.mjs /tmp/eslint.json /tmp/oxlint-rc.json
import fs from 'node:fs';

// ESLint rule id -> oxlint message-prefix category
const CATEGORY_BY_RULE = {
    'react-hooks/refs': 'Refs',
    'react-hooks/set-state-in-effect': 'EffectSetState',
    'react-hooks/set-state-in-render': 'SetStateInRender',
    'react-hooks/preserve-manual-memoization': 'PreserveManualMemoization',
    'react-hooks/purity': 'Purity',
    'react-hooks/immutability': 'Immutability',
    'react-hooks/globals': 'Globals',
};
const CATEGORIES = new Set(Object.values(CATEGORY_BY_RULE));

const [eslintPath, oxlintPath] = process.argv.slice(2);
const eslintResults = JSON.parse(fs.readFileSync(eslintPath, 'utf8'));
const oxlintResults = JSON.parse(fs.readFileSync(oxlintPath, 'utf8'));

const eslintSet = new Set();
for (const result of eslintResults) {
    for (const message of result.messages) {
        const category = CATEGORY_BY_RULE[message.ruleId];
        if (category) {
            eslintSet.add(`${result.filePath.replace(/^.*?(src|tests)\//, '$1/')}:${message.line}:${category}`);
        }
    }
}

const oxlintSet = new Set();
for (const diagnostic of oxlintResults.diagnostics) {
    const category = diagnostic.message.split(':')[0];
    if (CATEGORIES.has(category)) {
        oxlintSet.add(`${diagnostic.filename}:${diagnostic.labels?.[0]?.span?.line ?? 0}:${category}`);
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
