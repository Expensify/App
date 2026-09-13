import type {Rule} from 'eslint';

import {RuleTester} from 'eslint';
import {parser as tsParser} from 'typescript-eslint';

type LocalRuleModule = Rule.RuleModule & {
    name: string;
};

function isLocalRuleModule(ruleModule: unknown): ruleModule is LocalRuleModule {
    if (typeof ruleModule !== 'object' || ruleModule === null) {
        return false;
    }

    const ruleName: unknown = Reflect.get(ruleModule, 'name');
    const create: unknown = Reflect.get(ruleModule, 'create');
    const meta: unknown = Reflect.get(ruleModule, 'meta');

    return typeof ruleName === 'string' && typeof create === 'function' && typeof meta === 'object' && meta !== null;
}

const ruleModule: unknown = require('../../eslint-plugin-local-rules/require-locale-for-localized-date-format');

if (!isLocalRuleModule(ruleModule)) {
    throw new TypeError('Expected require-locale-for-localized-date-format to export an ESLint rule module.');
}

const ruleTester = new RuleTester({
    languageOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        parser: tsParser,
    },
});

const IMPORT_FORMAT = "import {format} from 'date-fns';";

describe('require-locale-for-localized-date-format', () => {
    ruleTester.run(ruleModule.name, ruleModule, {
        valid: [
            `${IMPORT_FORMAT} format(date, 'yyyy-MM-dd');`,
            `${IMPORT_FORMAT} const FORMAT = 'yyyy-MM-dd'; format(date, FORMAT);`,
            `${IMPORT_FORMAT} function render(pattern) { return format(date, pattern); }`,
            // A cycle cannot be a format string, and following it must terminate.
            `${IMPORT_FORMAT} const A = B; const B = A; format(date, A);`,
            // Not the date-fns export, so its arguments are not a date-fns format.
            "function format(date, pattern) { return pattern; } format(date, 'MMM d');",
        ],
        invalid: [
            {
                code: `${IMPORT_FORMAT} format(date, 'MMM d');`,
                errors: [{messageId: 'preferIntl'}],
            },
            {
                code: `${IMPORT_FORMAT} const FORMAT = 'MMM d'; format(date, FORMAT);`,
                errors: [{messageId: 'preferIntl'}],
            },
            {
                code: `${IMPORT_FORMAT} const BASE = 'MMM d'; const FORMAT = BASE; format(date, FORMAT);`,
                errors: [{messageId: 'preferIntl'}],
            },
            {
                code: `${IMPORT_FORMAT} const BASE = 'MMM d'; const FORMAT = BASE; function render() { return format(date, FORMAT); }`,
                errors: [{messageId: 'preferIntl'}],
            },
            {
                code: `${IMPORT_FORMAT} import {FORMAT} from './formats'; format(date, FORMAT);`,
                errors: [{messageId: 'preferIntl'}],
            },
            {
                code: "import {formatDistance} from 'date-fns'; formatDistance(date, now);",
                errors: [{messageId: 'preferIntl'}],
            },
        ],
    });
});
