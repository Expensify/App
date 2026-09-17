const name = 'require-locale-for-localized-date-format';

const meta = {
    type: 'problem',
    docs: {
        description: "Require an explicit `locale` when formatting a date with tokens whose output depends on the user's language.",
        recommended: 'error',
    },
    schema: [],
    messages: {
        missingLocale:
            'This date format contains {{tokens}}, which render differently in each language, but no `locale` is passed.\n\n' +
            'date-fns resolves the language from a mutable global that React cannot track, so the formatted date will not re-render when the user switches language, ' +
            'and can display in the wrong one (https://github.com/Expensify/App/issues/97781).\n\n' +
            'Pass the locale explicitly:\n' +
            '- In a component or hook, take `dateFnsLocale` from `useLocalize()`.\n' +
            '- In a library, accept it as a parameter alongside the `translate` function.\n' +
            '- Then pass it as `{locale: dateFnsLocale}`, or as the `dateFnsLocale` argument of the matching `DateUtils` helper.\n\n' +
            'If the output is never read by a user (a key, an API payload, a value that gets parsed back), use a format without these tokens ' +
            'or `DateUtils.formatMachineDateWithUTCTimeZone`.',
    },
};

/** date-fns tokens whose output differs between languages. */
const LOCALIZED_TOKENS = [
    {token: 'MMMMM', label: 'MMMMM (narrow month)'},
    {token: 'MMMM', label: 'MMMM (month name)'},
    {token: 'MMM', label: 'MMM (short month)'},
    {token: 'LLLL', label: 'LLLL (standalone month)'},
    {token: 'LLL', label: 'LLL (standalone short month)'},
    {token: 'EEEE', label: 'EEEE (weekday name)'},
    {token: 'EEE', label: 'EEE (short weekday)'},
    {token: 'eeee', label: 'eeee (weekday name)'},
    {token: 'eee', label: 'eee (short weekday)'},
    {token: 'do', label: 'do (ordinal day)'},
    {token: 'aaaa', label: 'aaaa (AM/PM)'},
    {token: 'aaa', label: 'aaa (AM/PM)'},
    {token: 'aa', label: 'aa (AM/PM)'},
    {token: 'a', label: 'a (AM/PM)'},
];

/** Marks a format this rule cannot resolve but must still treat as localized. */
const UNKNOWN_LOCALIZED = '\u0000unknown-localized';

/** date-fns exports that take a format string and accept a `locale` option, mapped to the index of the format argument. */
const FORMATTER_FORMAT_ARG_INDEX = {format: 1, formatInTimeZone: 2};

/** Local wrappers around those exports, which keep the same argument order. */
const LOCAL_FORMATTER_FORMAT_ARG_INDEX = {formatInTimeZoneWithFallback: 2};

/** date-fns modules whose `format` exports this rule follows through import aliases. */
const DATE_FNS_MODULES = new Set(['date-fns', 'date-fns-tz']);

/**
 * `CONST.DATE.*` formats with no language-dependent tokens. Anything else in `CONST.DATE` is treated as localized, so a
 * newly added format is guarded by default rather than silently escaping this rule.
 */
const MACHINE_DATE_CONSTANTS = new Set([
    'FNS_FORMAT_STRING',
    'FNS_DATE_TIME_FORMAT_STRING',
    'FNS_DB_FORMAT_STRING',
    'FNS_TIMEZONE_FORMAT_STRING',
    'YEAR_MONTH_FORMAT',
    'SHORT_DATE_FORMAT',
    'LOCAL_TIME_FORMAT_WITHOUT_PERIOD',
    'TIME_FORMAT_WITHOUT_PERIOD',
]);

/**
 * Strips the single-quoted escaped literals date-fns supports (e.g. the "T" in `yyyy-MM-dd'T'HH:mm`)
 * so that letters inside them are not mistaken for tokens.
 *
 * @param {string} pattern
 * @returns {string}
 */
function stripEscapedLiterals(pattern) {
    return pattern.replaceAll(/'[^']*'/g, '');
}

/**
 * @param {string} pattern
 * @returns {string[]} labels of the localized tokens the pattern contains
 */
function findLocalizedTokens(pattern) {
    let remaining = stripEscapedLiterals(pattern);
    const found = [];

    // Longest tokens first so that MMMM is not reported as MMM. Consuming each match keeps
    // overlapping tokens (MMM inside MMMM) from being counted twice.
    for (const {token, label} of LOCALIZED_TOKENS) {
        if (!remaining.includes(token)) {
            continue;
        }
        found.push(label);
        remaining = remaining.split(token).join('');
    }

    return found;
}

/**
 * Resolves a format argument to a literal pattern, following `CONST.DATE.*` references and ternaries.
 * Returns null when the pattern cannot be determined statically.
 *
 * @param {import('estree').Node} node
 * @returns {string | null}
 */
function resolvePattern(node) {
    if (!node) {
        return null;
    }
    if (node.type === 'Literal' && typeof node.value === 'string') {
        return node.value;
    }
    // `CONST.DATE.MONTH_DAY_YEAR_FORMAT`. Unknown names fall through to UNKNOWN_LOCALIZED so that a format added to
    // CONST.DATE later is guarded by default rather than silently skipped.
    if (node.type === 'MemberExpression' && !node.computed && node.property.type === 'Identifier') {
        const {object} = node;
        if (object.type === 'MemberExpression' && !object.computed && object.property.type === 'Identifier' && object.property.name === 'DATE') {
            return MACHINE_DATE_CONSTANTS.has(node.property.name) ? '' : UNKNOWN_LOCALIZED;
        }
    }
    // `isPastYear ? A : B` — flag if either branch is localized.
    if (node.type === 'ConditionalExpression') {
        const consequent = resolvePattern(node.consequent);
        const alternate = resolvePattern(node.alternate);
        if (consequent === null && alternate === null) {
            return null;
        }
        return `${consequent ?? ''} ${alternate ?? ''}`;
    }
    return null;
}

/**
 * Whether an argument at or after the format position supplies a locale. Arguments before it are the date and time
 * zone, so a variable merely named like a locale there must not count as one.
 *
 * @param {import('estree').Node[]} args
 * @param {number} formatArgIndex
 * @returns {boolean}
 */
function hasLocaleOption(args, formatArgIndex) {
    return args.slice(formatArgIndex + 1).some((arg) => {
        if (arg.type === 'ObjectExpression') {
            return arg.properties.some(
                (property) =>
                    (property.type === 'Property' && !property.computed && property.key.type === 'Identifier' && property.key.name === 'locale') || property.type === 'SpreadElement',
            );
        }
        // A DateUtils helper takes the locale positionally, e.g. formatWithUTCTimeZone(date, format, dateFnsLocale).
        return arg.type === 'Identifier' && /locale/i.test(arg.name);
    });
}

/**
 * Flags date formatting that uses language-dependent tokens without an explicit locale.
 *
 * @param {import('eslint').Rule.RuleContext} context
 * @returns {import('eslint').Rule.RuleListener}
 */
function create(context) {
    // Local name -> index of the format argument, resolved from the imports so that aliases such as
    // `import {format as timezoneFormat}` are still checked.
    const formatters = new Map(Object.entries(LOCAL_FORMATTER_FORMAT_ARG_INDEX));

    return {
        ImportDeclaration(node) {
            if (!DATE_FNS_MODULES.has(node.source.value)) {
                return;
            }
            for (const specifier of node.specifiers) {
                if (specifier.type !== 'ImportSpecifier') {
                    continue;
                }
                const formatArgIndex = FORMATTER_FORMAT_ARG_INDEX[specifier.imported.name];
                if (formatArgIndex === undefined) {
                    continue;
                }
                formatters.set(specifier.local.name, formatArgIndex);
            }
        },
        CallExpression(node) {
            const {callee} = node;
            let calleeName = null;
            if (callee.type === 'Identifier') {
                calleeName = callee.name;
            } else if (callee.type === 'MemberExpression' && callee.property.type === 'Identifier') {
                // Member calls can only be the local wrappers; date-fns itself is imported by name.
                calleeName = LOCAL_FORMATTER_FORMAT_ARG_INDEX[callee.property.name] === undefined ? null : callee.property.name;
            }

            const formatArgIndex = calleeName === null ? undefined : formatters.get(calleeName);
            if (formatArgIndex === undefined) {
                return;
            }

            if (hasLocaleOption(node.arguments, formatArgIndex)) {
                return;
            }

            const pattern = resolvePattern(node.arguments.at(formatArgIndex));
            if (pattern === null) {
                return;
            }

            const tokens = pattern === UNKNOWN_LOCALIZED ? ['a format from CONST.DATE that may be localized'] : findLocalizedTokens(pattern);
            if (tokens.length === 0) {
                return;
            }

            context.report({node, messageId: 'missingLocale', data: {tokens: tokens.join(', ')}});
        },
    };
}

export {name, meta, create};
