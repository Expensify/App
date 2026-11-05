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

const tsRuleTester = new RuleTester({
    languageOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        parser: tsParser,
    },
});

const IMPORT_FORMAT_IN_TIME_ZONE = "import {formatInTimeZone} from 'date-fns-tz';";

describe('require-locale-for-localized-date-format timezone tokens', () => {
    // Given date-fns-tz calls that format a timezone name or a GMT offset
    // When the rule checks each call
    // Then a timezone name needs a locale, because `Intl` names the zone in the user's language, while a GMT offset,
    // which reads the same in every language, does not
    tsRuleTester.run(ruleModule.name, ruleModule, {
        valid: [
            `${IMPORT_FORMAT_IN_TIME_ZONE} formatInTimeZone(date, timeZone, 'zzz', {locale: dateFnsLocale});`,
            `${IMPORT_FORMAT_IN_TIME_ZONE} formatInTimeZone(date, timeZone, 'O');`,
            `${IMPORT_FORMAT_IN_TIME_ZONE} formatInTimeZone(date, timeZone, 'OOOO');`,
            `${IMPORT_FORMAT_IN_TIME_ZONE} formatInTimeZone(date, timeZone, "yyyy-MM-dd'T'HH:mm:ssXXX");`,
        ],
        invalid: [
            {
                code: `${IMPORT_FORMAT_IN_TIME_ZONE} formatInTimeZone(date, timeZone, 'zzz');`,
                errors: [{messageId: 'missingLocale'}],
            },
            {
                code: `${IMPORT_FORMAT_IN_TIME_ZONE} formatInTimeZone(date, timeZone, 'HH:mm zzzz');`,
                errors: [{messageId: 'missingLocale'}],
            },
        ],
    });
});
