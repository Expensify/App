import CONST from '@src/CONST';

import type {Rule} from 'eslint';

import {RuleTester} from 'eslint';
import {parser as tsParser} from 'typescript-eslint';

type LocalRuleModule = Rule.RuleModule & {
    name: string;
    MACHINE_DATE_CONSTANTS: ReadonlySet<string>;
};

function isLocalRuleModule(ruleModule: unknown): ruleModule is LocalRuleModule {
    if (typeof ruleModule !== 'object' || ruleModule === null) {
        return false;
    }

    const ruleName: unknown = Reflect.get(ruleModule, 'name');
    const create: unknown = Reflect.get(ruleModule, 'create');
    const meta: unknown = Reflect.get(ruleModule, 'meta');
    const machineDateConstants: unknown = Reflect.get(ruleModule, 'MACHINE_DATE_CONSTANTS');

    return typeof ruleName === 'string' && typeof create === 'function' && typeof meta === 'object' && meta !== null && machineDateConstants instanceof Set;
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

/** Each allowlisted name paired with the literal it exempts, read from `CONST.DATE` rather than restated, so the two cannot drift apart. */
const allowlistedDateFormats: Array<[name: string, format: unknown]> = [...ruleModule.MACHINE_DATE_CONSTANTS].map((name) => [name, Reflect.get(CONST.DATE, name)]);

const allowlistedDateLiterals = allowlistedDateFormats.map(([, format]) => format).filter((format): format is string => typeof format === 'string');

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
            // Given a format named by a `CONST.DATE` constant the rule allowlists as machine-readable
            // When it reaches a formatter through that name rather than as a literal
            // Then it is accepted, so the shared wire formats are usable without every call site restating them
            `${IMPORT_FORMAT} format(date, CONST.DATE.FNS_FORMAT_STRING);`,
            // Given a pattern whose `T` sits inside date-fns single-quote escaping, where it is output text and not a token
            // When the pattern is scanned
            // Then no token is found, so escaped punctuation cannot be mistaken for a localized field
            `${IMPORT_FORMAT} format(date, "yyyy-MM-dd'T'HH:mm:ssXXX");`,
            // Given a locale object taken from a deep `date-fns/locale/*` path, which matches the same package prefix the formatter imports do
            // When a machine format is rendered with it
            // Then nothing is reported, so recognizing deep paths does not turn every deep export into a formatter
            `import {enUS} from 'date-fns/locale/en-US'; ${IMPORT_FORMAT} format(date, 'yyyy-MM-dd', {locale: enUS});`,
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
            {
                // Given a zoned formatter, whose format argument sits third rather than second
                // When it renders a month name
                // Then the month is reported, so a timezone-aware call is scanned like a plain one
                code: "import {formatInTimeZone} from 'date-fns-tz'; formatInTimeZone(date, tz, 'MMM d');",
                errors: [{messageId: 'preferIntl', data: {tokens: '`MMM`'}}],
            },
            {
                // Given the local zoned wrapper rendering a zone name, which German writes `MEZ` and English `GMT+1`
                // When the pattern is scanned
                // Then `zzz` is reported, because a token the allowlist does not name is treated as localized rather than skipped
                code: "formatInTimeZoneWithFallback(date, tz, 'zzz');",
                errors: [{messageId: 'preferIntl', data: {tokens: '`zzz`'}}],
            },
            {
                // Given a ternary with one branch this file cannot resolve, because its literal lives in another module
                // When the rule reports the call
                // Then it names the unresolvable format itself. Joining the branches would scan the marker's own letters and report tokens the source never wrote
                code: `${IMPORT_FORMAT} import {FALLBACK_FORMAT} from './formats'; format(date, isPastYear ? FALLBACK_FORMAT : 'yyyy-MM-dd');`,
                errors: [{messageId: 'preferIntl', data: {tokens: 'a dynamic format string that may be localized'}}],
            },
            {
                // Given date-fns pulled in whole rather than by named export
                // When a month name is rendered off the namespace
                // Then it is reported, so the import style cannot decide whether the rule applies
                code: "import * as df from 'date-fns'; df.format(date, 'MMM d');",
                errors: [{messageId: 'preferIntl', data: {tokens: '`MMM`'}}],
            },
            {
                // Given `format` imported from its own deep path, which several modules here already do
                // When a month name is rendered
                // Then it is reported, because an exact package-name match would leave every such file unguarded
                code: "import {format} from 'date-fns/format'; format(date, 'MMM d');",
                errors: [{messageId: 'preferIntl', data: {tokens: '`MMM`'}}],
            },
            {
                // Given a format added to `CONST.DATE` that the allowlist does not name
                // When it reaches a formatter
                // Then it is reported: an unrecognized constant is guarded by default, so a new localized format cannot ship unnoticed
                code: `${IMPORT_FORMAT} format(date, CONST.DATE.SOMETHING_NEW);`,
                errors: [{messageId: 'preferIntl', data: {tokens: 'a dynamic format string that may be localized'}}],
            },
        ],
    });

    describe('machine-format allowlist', () => {
        it.each(allowlistedDateFormats)('%s still names a format string in CONST.DATE', (name, format) => {
            // Given a name the rule exempts from the localized-token scan
            // When `CONST.DATE` is read for it
            // Then it resolves to a format string, so a rename there cannot leave the allowlist exempting a name nothing defines
            expect(typeof format).toBe('string');
        });

        ruleTester.run(`${ruleModule.name} (allowlisted CONST.DATE literals)`, ruleModule, {
            // Given the literal behind each allowlisted name, with the name itself resolved away
            // When the rule scans it as a plain format string
            // Then it is still accepted, so an allowlisted constant cannot quietly grow a localized token and keep its exemption
            valid: allowlistedDateLiterals.map((format) => `${IMPORT_FORMAT} format(date, ${JSON.stringify(format)});`),
            invalid: [],
        });
    });
});
