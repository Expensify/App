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
    // Given calls that format a timezone name or a GMT offset, through date-fns-tz and through plain date-fns
    // When the rule checks each call
    // Then a date-fns-tz timezone name needs a locale, because `Intl` names the zone in the user's language, while a GMT
    // offset, or a `z` token in plain date-fns, which writes a GMT offset for it, reads the same in every language
    tsRuleTester.run(ruleModule.name, ruleModule, {
        valid: [
            `${IMPORT_FORMAT_IN_TIME_ZONE} formatInTimeZone(date, timeZone, 'zzz', {locale: dateFnsLocale});`,
            `${IMPORT_FORMAT_IN_TIME_ZONE} formatInTimeZone(date, timeZone, 'O');`,
            `${IMPORT_FORMAT_IN_TIME_ZONE} formatInTimeZone(date, timeZone, 'OOOO');`,
            `${IMPORT_FORMAT_IN_TIME_ZONE} formatInTimeZone(date, timeZone, "yyyy-MM-dd'T'HH:mm:ssXXX");`,
            "import {format} from 'date-fns'; format(date, 'zzz');",
            "import {format} from 'date-fns'; format(date, 'HH:mm zzzz');",
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
            {
                code: "import {format as tzFormat} from 'date-fns-tz'; tzFormat(date, 'zzz', {timeZone});",
                errors: [{messageId: 'missingLocale'}],
            },
            {
                code: "DateUtils.formatInTimeZoneWithFallback(date, timeZone, 'zzz');",
                errors: [{messageId: 'missingLocale'}],
            },
            {
                // A single-function import of date-fns-tz names timezones like the package itself
                code: "import {formatInTimeZone} from 'date-fns-tz/formatInTimeZone'; formatInTimeZone(date, timeZone, 'zzz');",
                errors: [{messageId: 'missingLocale'}],
            },
        ],
    });
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
            // An escaped literal must not join `M` and `MM` into `MMM` either
            `${IMPORT_FORMAT} format(date, "M'-'MM");`,
            // Letters inside a quote, including one left open, are literal text
            `${IMPORT_FORMAT} format(date, "h 'o''clock'");`,
            `${IMPORT_FORMAT} format(date, "yyyy 'at");`,
            // Numeric tokens that read the same in every language
            `${IMPORT_FORMAT} format(date, 'yyyy-MM-dd HH:mm:ss i II R u x');`,
            // A locale wrapped in a TypeScript type assertion or written as a string key still counts
            `${IMPORT_FORMAT} format(date, 'MMMM', {locale: dateFnsLocale} as FormatOptions);`,
            `${IMPORT_FORMAT} format(date, 'MMMM', {locale: dateFnsLocale} satisfies FormatOptions);`,
            `${IMPORT_FORMAT} format(date, 'MMMM', {'locale': dateFnsLocale});`,
            // Only the date-fns format functions are followed
            "import {formatDistance} from 'date-fns/formatDistance'; formatDistance(date, 'MMMM');",
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
                // Each ternary branch is its own string at runtime, so an unclosed quote in one does not hide the other
                code: `${IMPORT_FORMAT} format(date, isPastYear ? "yyyy 'at" : 'MMM');`,
                errors: [{messageId: 'missingLocale'}],
            },
            ...['E', 'EE', 'EEEEE', 'e', 'eeeee', 'c', 'cccc', 'iii', 'w', 'Y', 'G', 'B', 'b', 'Mo', 'yo', 'wo', 'Do', 'ho'].map((token) => ({
                // Weekday names, week-based numbers, eras, day periods and ordinals all change with the language
                code: `${IMPORT_FORMAT} format(date, '${token}');`,
                errors: [{messageId: 'missingLocale'}],
            })),
            {
                // A single-function import of date-fns is followed like the package itself
                code: "import {format} from 'date-fns/format'; format(date, 'MMMM');",
                errors: [{messageId: 'missingLocale'}],
            },
            {
                code: "import {formatInTimeZone} from 'date-fns-tz/formatInTimeZone'; formatInTimeZone(date, timeZone, 'MMMM');",
                errors: [{messageId: 'missingLocale'}],
            },
            {
                // A format behind a TypeScript type assertion or built with `+` is still checked
                code: `${IMPORT_FORMAT} format(date, 'MMMM' as const);`,
                errors: [{messageId: 'missingLocale'}],
            },
            {
                code: `${IMPORT_FORMAT} format(date, CONST.DATE.MONTH_DAY_YEAR_FORMAT as string);`,
                errors: [{messageId: 'missingLocale'}],
            },
            {
                code: `${IMPORT_FORMAT} format(date, 'MMMM ' + 'd');`,
                errors: [{messageId: 'missingLocale', data: {tokens: 'MMMM (month name)'}}],
            },
            {
                // `{locale: undefined}` leaves date-fns on its global default language
                code: `${IMPORT_FORMAT} format(date, 'MMMM', {locale: undefined});`,
                errors: [{messageId: 'missingLocale'}],
            },
            {
                // A known token next to an unknown format reports both
                code: `${IMPORT_FORMAT} format(date, \`\${CONST.DATE.SHORT_DATE_FORMAT} MMM\`);`,
                errors: [{messageId: 'missingLocale', data: {tokens: 'MMM (short month), a format from CONST.DATE that may be localized'}}],
            },
        ],
    });
});
