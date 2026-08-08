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

/** date-fns entry points that take a format string and accept a `locale` option. */
const FORMATTERS = new Set(['format', 'formatInTimeZone', 'formatInTimeZoneWithFallback', 'tzFormat', 'formatDate', 'dateFnsFormat']);

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
 * @param {Record<string, string>} dateConstants
 * @returns {string | null}
 */
function resolvePattern(node, dateConstants) {
    if (!node) {
        return null;
    }
    if (node.type === 'Literal' && typeof node.value === 'string') {
        return node.value;
    }
    // `CONST.DATE.MONTH_DAY_YEAR_FORMAT`
    if (node.type === 'MemberExpression' && !node.computed && node.property.type === 'Identifier') {
        const {object} = node;
        if (object.type === 'MemberExpression' && !object.computed && object.property.type === 'Identifier' && object.property.name === 'DATE') {
            return dateConstants[node.property.name] ?? null;
        }
    }
    // `isPastYear ? A : B` — flag if either branch is localized.
    if (node.type === 'ConditionalExpression') {
        const consequent = resolvePattern(node.consequent, dateConstants);
        const alternate = resolvePattern(node.alternate, dateConstants);
        if (consequent === null && alternate === null) {
            return null;
        }
        return `${consequent ?? ''} ${alternate ?? ''}`;
    }
    return null;
}

/**
 * @param {import('estree').Node[]} args
 * @returns {boolean} whether any argument supplies a `locale`
 */
function hasLocaleOption(args) {
    return args.some((arg) => {
        if (arg.type === 'ObjectExpression') {
            return arg.properties.some((property) => property.type === 'Property' && !property.computed && property.key.type === 'Identifier' && property.key.name === 'locale');
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
    // CONST.DATE values are resolved from the settings so the rule can follow named formats.
    const dateConstants = context.options.at(0)?.dateConstants ?? {
        MONTH_FORMAT: 'MMMM',
        WEEKDAY_TIME_FORMAT: 'eeee',
        MONTH_DAY_ABBR_FORMAT: 'MMM d',
        MONTH_DAY_YEAR_ABBR_FORMAT: 'MMM d, yyyy',
        MONTH_DAY_YEAR_FORMAT: 'MMMM d, yyyy',
        LONG_DATE_FORMAT_WITH_WEEKDAY: 'eeee, MMMM d, yyyy',
        MONTH_DAY_YEAR_ORDINAL_FORMAT: 'MMMM do, yyyy',
        LOCAL_TIME_FORMAT: 'h:mm a',
        ORDINAL_DAY_OF_MONTH: 'do',
    };

    return {
        CallExpression(node) {
            const {callee} = node;
            let calleeName = null;
            if (callee.type === 'Identifier') {
                calleeName = callee.name;
            } else if (callee.type === 'MemberExpression' && callee.property.type === 'Identifier') {
                calleeName = callee.property.name;
            }

            if (!calleeName || !FORMATTERS.has(calleeName)) {
                return;
            }

            if (hasLocaleOption(node.arguments)) {
                return;
            }

            // The format string is the 2nd argument, except for formatInTimeZone(date, timeZone, format).
            const isTimeZoneFormatter = calleeName === 'formatInTimeZone' || calleeName === 'formatInTimeZoneWithFallback';
            const pattern = resolvePattern(node.arguments.at(isTimeZoneFormatter ? 2 : 1), dateConstants);
            if (pattern === null) {
                return;
            }

            const tokens = findLocalizedTokens(pattern);
            if (tokens.length === 0) {
                return;
            }

            context.report({node, messageId: 'missingLocale', data: {tokens: tokens.join(', ')}});
        },
    };
}

export {name, meta, create};
