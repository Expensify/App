/**
 * oxlint and ESLint name some rules differently. This maps between the two, so oxlint findings show up
 * under ESLint's rule IDs. The lists come from config/oxlint/derive.mjs.
 */
import {ESLINT_RULE_RENAMES, LOCAL_HOSTED_RULES, hostedRuleIDs, splitRuleID} from './derive.mjs';

const OXLINT_RULE_RENAMES = Object.fromEntries(Object.entries(ESLINT_RULE_RENAMES).map(([eslintName, oxlintName]) => [oxlintName, eslintName]));

// oxlint reserves native plugin prefixes (`react`, `import`, `react-hooks`, `@typescript-eslint`), so
// hosted rules register under `hosted` and this maps each back to its ESLint plugin.
const HOSTED_RULE_ORIGIN = Object.fromEntries(
    hostedRuleIDs.map((ruleID) => {
        const {prefix, name} = splitRuleID(ruleID);
        return [name, prefix];
    }),
);

const HOSTED_RULE_ESLINT_ID = LOCAL_HOSTED_RULES;

const OXLINT_DIAGNOSTIC_CODE = /^([\w@/.-]+)\((.+)\)$/;

/**
 * Converts oxlint's name for a finding, like `typescript(no-explicit-any)`, to ESLint's rule ID, like
 * `@typescript-eslint/no-explicit-any`, so the lint output and the oxlint seatbelt baseline use the
 * same rule names as ESLint. A code that does not look like `plugin(rule)` comes back unchanged.
 * @param {string} code
 * @returns {string}
 */
function oxlintCodeToESLintRuleID(code) {
    const match = OXLINT_DIAGNOSTIC_CODE.exec(code);
    if (!match) {
        return code;
    }
    const [, plugin, rule] = match;
    if (plugin === 'eslint' || plugin === 'core') {
        return OXLINT_RULE_RENAMES[rule] ?? rule;
    }
    if (plugin === 'typescript') {
        return `@typescript-eslint/${rule}`;
    }
    if (plugin === 'rc') {
        return `react-hooks/${rule}`;
    }
    if (plugin === 'hosted') {
        if (HOSTED_RULE_ESLINT_ID[rule]) {
            return HOSTED_RULE_ESLINT_ID[rule];
        }
        const origin = HOSTED_RULE_ORIGIN[rule];
        if (!origin) {
            throw new Error(`No HOSTED_RULE_ORIGIN entry for hosted rule "${rule}". Add it to config/oxlint/derive.mjs.`);
        }
        return `${origin}/${rule}`;
    }
    if (plugin === 'jsx_a11y') {
        return `jsx-a11y/${rule}`;
    }
    return `${plugin}/${rule}`;
}

export {HOSTED_RULE_ESLINT_ID, HOSTED_RULE_ORIGIN, OXLINT_RULE_RENAMES, oxlintCodeToESLintRuleID};
