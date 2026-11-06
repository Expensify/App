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

const IMPORT_FORMAT = "import {format} from 'date-fns';";

describe('require-locale-for-localized-date-format', () => {
    // Given date-fns `format` calls whose format argument is a template literal built from `CONST.DATE` names
    // When the rule checks each call
    // Then a template that interpolates a display format needs a locale, just like the format passed on its own, while a
    // template made only of machine formats, or one that already passes a locale, is left alone
    tsRuleTester.run(ruleModule.name, ruleModule, {
        valid: [
            `${IMPORT_FORMAT} format(date, \`\${CONST.DATE.FNS_FORMAT_STRING} \${CONST.DATE.SHORT_DATE_FORMAT}\`, {locale: dateFnsLocale});`,
            `${IMPORT_FORMAT} format(date, \`\${CONST.DATE.FNS_FORMAT_STRING}'T'\${CONST.DATE.FNS_TIMEZONE_FORMAT_STRING}\`);`,
            `${IMPORT_FORMAT} format(date, \`yyyy-MM-dd \${timePattern}\`);`,
            // An unresolved separator must not join `M` and `MM` into the short month token `MMM`
            `${IMPORT_FORMAT} format(date, \`M\${separator}MM\`);`,
        ],
        invalid: [
            {
                code: `${IMPORT_FORMAT} format(date, \`\${CONST.DATE.SHORT_DATE_FORMAT} \${CONST.DATE.LOCAL_TIME_FORMAT}\`);`,
                errors: [{messageId: 'missingLocale'}],
            },
            {
                code: `${IMPORT_FORMAT} format(date, \`\${CONST.DATE.FNS_FORMAT_STRING} \${CONST.DATE.SHORT_DATE_FORMAT}\`);`,
                errors: [{messageId: 'missingLocale'}],
            },
            {
                code: `${IMPORT_FORMAT} format(date, \`\${CONST.DATE.FNS_FORMAT_STRING} MMM\`);`,
                errors: [{messageId: 'missingLocale'}],
            },
            {
                // A ternary inside the template carries the unknown-format marker, which is reported as such rather than
                // scanned as date-fns text, where the `a` in its name would be reported as an AM/PM token
                code: `${IMPORT_FORMAT} format(date, \`\${isShort ? CONST.DATE.SHORT_DATE_FORMAT : CONST.DATE.LOCAL_TIME_FORMAT} HH\`);`,
                errors: [{messageId: 'missingLocale', data: {tokens: 'a format from CONST.DATE that may be localized'}}],
            },
            {
                // A known token next to an unknown format reports both
                code: `${IMPORT_FORMAT} format(date, \`\${CONST.DATE.SHORT_DATE_FORMAT} MMM\`);`,
                errors: [{messageId: 'missingLocale', data: {tokens: 'MMM (short month), a format from CONST.DATE that may be localized'}}],
            },
        ],
    });
});
