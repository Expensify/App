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

/**
 * date-fns tokens whose output differs between languages. An entry is either a literal token or a `pattern` for a whole
 * family of tokens. Longer tokens come first, so a narrower one is not reported for a wider token that contains it.
 */
const LOCALIZED_TOKENS = [
    {token: 'MMMMM', label: 'MMMMM (narrow month)'},
    {token: 'MMMM', label: 'MMMM (month name)'},
    {token: 'MMM', label: 'MMM (short month)'},
    {token: 'LLLL', label: 'LLLL (standalone month)'},
    {token: 'LLL', label: 'LLL (standalone short month)'},
    {token: 'EEEEEE', label: 'EEEEEE (shortest weekday)'},
    {token: 'EEEEE', label: 'EEEEE (narrow weekday)'},
    {token: 'EEEE', label: 'EEEE (weekday name)'},
    {token: 'EEE', label: 'EEE (short weekday)'},
    // `E` and `EE` are the short weekday too, not a number
    {token: 'E', label: 'E (short weekday)'},
    {token: 'eeeeee', label: 'eeeeee (shortest weekday)'},
    {token: 'eeeee', label: 'eeeee (narrow weekday)'},
    {token: 'eeee', label: 'eeee (weekday name)'},
    {token: 'eee', label: 'eee (short weekday)'},
    {token: 'cccccc', label: 'cccccc (standalone shortest weekday)'},
    {token: 'ccccc', label: 'ccccc (standalone narrow weekday)'},
    {token: 'cccc', label: 'cccc (standalone weekday name)'},
    {token: 'ccc', label: 'ccc (standalone short weekday)'},
    {token: 'iiiiii', label: 'iiiiii (ISO shortest weekday)'},
    {token: 'iiiii', label: 'iiiii (ISO narrow weekday)'},
    {token: 'iiii', label: 'iiii (ISO weekday name)'},
    {token: 'iii', label: 'iii (ISO short weekday)'},
    {token: 'do', label: 'do (ordinal day)'},
    // Quarters. `Q` and `QQ` are plain numbers, but everything wider is a locale's own label such as `Q1`, `T1`,
    // `K1` or `I kw.`
    {token: 'QQQQQ', label: 'QQQQQ (narrow quarter)'},
    {token: 'QQQQ', label: 'QQQQ (quarter name)'},
    {token: 'QQQ', label: 'QQQ (short quarter)'},
    {token: 'Qo', label: 'Qo (ordinal quarter)'},
    {token: 'qqqqq', label: 'qqqqq (standalone narrow quarter)'},
    {token: 'qqqq', label: 'qqqq (standalone quarter name)'},
    {token: 'qqq', label: 'qqq (standalone short quarter)'},
    {token: 'qo', label: 'qo (standalone ordinal quarter)'},
    // Every other ordinal, such as `Mo`, `yo` or `wo`: `1st` in English, `1.` in German and `1er` in French
    {pattern: /[A-Za-z]o/, label: 'an ordinal number such as Mo'},
    // Numbers that count from the locale's first day of the week, which is Sunday in English and Monday in German
    {token: 'e', label: 'e (local day of week)'},
    {token: 'c', label: 'c (standalone local day of week)'},
    {token: 'w', label: 'w (local week of year)'},
    {token: 'Y', label: 'Y (local week-numbering year)'},
    {token: 'G', label: 'G (era)'},
    {token: 'B', label: 'B (day period)'},
    {token: 'b', label: 'b (AM, PM, noon or midnight)'},
    // date-fns' localized date/time formats. These exist precisely to defer the clock convention, ordering and
    // separators to the locale, so they are meaningless without one.
    {token: 'PPPP', label: 'PPPP (localized long date with weekday)'},
    {token: 'PPP', label: 'PPP (localized long date)'},
    {token: 'PP', label: 'PP (localized medium date)'},
    {token: 'P', label: 'P (localized short date)'},
    {token: 'pppp', label: 'pppp (localized full time)'},
    {token: 'ppp', label: 'ppp (localized long time)'},
    {token: 'pp', label: 'pp (localized medium time)'},
    {token: 'p', label: 'p (localized short time)'},
    // Timezone names. date-fns-tz takes them from `Intl` in the locale's language, so New York reads `EDT` in English,
    // `GMT-4` in German and `UTC−4` in French. Plain date-fns always writes a GMT offset for them, the same in every
    // language, so they only count for date-fns-tz formatters. The `O` offset tokens are left out because they read
    // `GMT-4` in every language with either library.
    {token: 'zzzz', label: 'zzzz (long timezone name)', isTimeZoneName: true},
    {token: 'zzz', label: 'zzz (timezone name)', isTimeZoneName: true},
    {token: 'zz', label: 'zz (timezone name)', isTimeZoneName: true},
    {token: 'z', label: 'z (timezone name)', isTimeZoneName: true},
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

/**
 * date-fns modules whose `format` exports this rule follows through import aliases, including the single-function
 * imports date-fns supports, such as `date-fns/format` and `date-fns-tz/formatInTimeZone`.
 */
const DATE_FNS_MODULE_PATTERN = /^date-fns(?:-tz)?(?:\/(?:format|formatInTimeZone))?$/;

/**
 * Returns the expression inside TypeScript-only wrappers such as `as`, `satisfies` and `!`, which do not change the value.
 *
 * @param {import('estree').Node} node
 * @returns {import('estree').Node}
 */
function unwrapTypeScriptExpression(node) {
    let unwrapped = node;
    while (unwrapped && ['TSAsExpression', 'TSSatisfiesExpression', 'TSNonNullExpression', 'TSTypeAssertion'].includes(unwrapped.type)) {
        unwrapped = unwrapped.expression;
    }
    return unwrapped;
}

/**
 * The module whose formatters name timezones through `Intl`, so only its formatters localize the `z` tokens. Its
 * single-function imports, such as `date-fns-tz/formatInTimeZone`, count too.
 */
const TIME_ZONE_NAMING_MODULE_PATTERN = /^date-fns-tz(?:\/|$)/;

/**
 * `CONST.DATE.*` machine formats with no language-dependent tokens. Anything else in `CONST.DATE` is treated as localized,
 * so a newly added format is guarded by default rather than silently escaping this rule. `SHORT_DATE_FORMAT` (`MM-dd`)
 * has no such tokens either, but it is only ever shown to users, so it is left out and needs the user's locale like any
 * other display format.
 */
const MACHINE_DATE_CONSTANTS = new Set(['FNS_FORMAT_STRING', 'FNS_DATE_TIME_FORMAT_STRING', 'FNS_DB_FORMAT_STRING', 'FNS_TIMEZONE_FORMAT_STRING', 'YEAR_MONTH_FORMAT']);

/**
 * Replaces the single-quoted escaped literals date-fns supports (e.g. the "T" in `yyyy-MM-dd'T'HH:mm`) with a space, so
 * that letters inside them are not mistaken for tokens and the text on either side is not joined into a token it never
 * forms, such as `M'-'MM` into `MMM`. `''` inside a literal is an escaped quote, and a literal left open runs to the end.
 *
 * @param {string} pattern
 * @returns {string}
 */
function stripEscapedLiterals(pattern) {
    return pattern.replaceAll(/'(?:[^']|'')*(?:'|$)/g, ' ');
}

/**
 * @param {string} pattern
 * @param {boolean} isTimeZoneNaming whether the formatter comes from date-fns-tz, which localizes timezone names
 * @returns {string[]} labels of the localized tokens the pattern contains
 */
function findLocalizedTokens(pattern, isTimeZoneNaming) {
    let remaining = stripEscapedLiterals(pattern);
    const found = [];

    // Longest tokens first so that MMMM is not reported as MMM. Consuming each match keeps overlapping tokens (MMM inside
    // MMMM) from being counted twice. A consumed token becomes a space, so what is left on either side stays apart.
    for (const {token, pattern: tokenPattern, label, isTimeZoneName} of LOCALIZED_TOKENS) {
        if (isTimeZoneName && !isTimeZoneNaming) {
            continue;
        }
        if (tokenPattern) {
            if (!tokenPattern.test(remaining)) {
                continue;
            }
            remaining = remaining.replaceAll(new RegExp(tokenPattern.source, 'g'), ' ');
        } else {
            if (!remaining.includes(token)) {
                continue;
            }
            remaining = remaining.split(token).join(' ');
        }
        found.push(label);
    }

    return found;
}

/**
 * Resolves a format argument to a literal pattern, following `CONST.DATE.*` references, ternaries, template literals and
 * `+` concatenation, through TypeScript-only wrappers. Returns null when the pattern cannot be determined statically.
 *
 * @param {import('estree').Node} maybeWrappedNode
 * @returns {string | null}
 */
function resolvePattern(maybeWrappedNode) {
    const node = unwrapTypeScriptExpression(maybeWrappedNode);
    if (!node) {
        return null;
    }
    if (node.type === 'Literal' && typeof node.value === 'string') {
        return node.value;
    }
    // `CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT`. Unknown names fall through to UNKNOWN_LOCALIZED so that a format added to
    // CONST.DATE later is guarded by default rather than silently skipped.
    if (node.type === 'MemberExpression' && !node.computed && node.property.type === 'Identifier') {
        const {object} = node;
        if (object.type === 'MemberExpression' && !object.computed && object.property.type === 'Identifier' && object.property.name === 'DATE') {
            return MACHINE_DATE_CONSTANTS.has(node.property.name) ? '' : UNKNOWN_LOCALIZED;
        }
    }
    // `isPastYear ? A : B` — flag if either branch is localized. The branches are separate strings at runtime, so each
    // has its escaped text stripped on its own, and an unclosed quote in one cannot hide the tokens of the other.
    if (node.type === 'ConditionalExpression') {
        const consequent = resolvePattern(node.consequent);
        const alternate = resolvePattern(node.alternate);
        if (consequent === null && alternate === null) {
            return null;
        }
        return `${stripEscapedLiterals(consequent ?? '')} ${stripEscapedLiterals(alternate ?? '')}`;
    }
    // `${CONST.DATE.SHORT_DATE_FORMAT} ${CONST.DATE.LOCAL_TIME_FORMAT}` — check the literal text and every interpolated
    // format. An interpolated value that cannot be resolved becomes a space, like a missing ternary branch above, so the
    // text on either side of it is not joined into a token it never forms, such as `M${separator}MM` into `MMM`.
    if (node.type === 'TemplateLiteral') {
        const expressions = node.expressions.map(resolvePattern);
        return node.quasis.map((quasi, index) => `${quasi.value.cooked ?? ''}${index < expressions.length ? (expressions.at(index) ?? ' ') : ''}`).join('');
    }
    // `'MMMM ' + 'd'` — joined like a template literal, with a side that cannot be resolved becoming a space.
    if (node.type === 'BinaryExpression' && node.operator === '+') {
        const left = resolvePattern(node.left);
        const right = resolvePattern(node.right);
        if (left === null && right === null) {
            return null;
        }
        return `${left ?? ' '}${right ?? ' '}`;
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
    return args.slice(formatArgIndex + 1).some((maybeWrappedArg) => {
        const arg = unwrapTypeScriptExpression(maybeWrappedArg);
        if (arg.type === 'ObjectExpression') {
            return arg.properties.some((property) => {
                if (property.type === 'SpreadElement') {
                    return true;
                }
                if (property.type !== 'Property' || property.computed) {
                    return false;
                }
                const isLocaleKey = (property.key.type === 'Identifier' && property.key.name === 'locale') || (property.key.type === 'Literal' && property.key.value === 'locale');
                // `{locale: undefined}` leaves date-fns on its global default language, which is what this rule guards against
                const isUndefined = property.value.type === 'Identifier' && property.value.name === 'undefined';
                return isLocaleKey && !isUndefined;
            });
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
    // Local names of the formatters that come from date-fns-tz. The local wrappers all wrap date-fns-tz.
    const timeZoneNamingFormatters = new Set(Object.keys(LOCAL_FORMATTER_FORMAT_ARG_INDEX));

    return {
        ImportDeclaration(node) {
            if (typeof node.source.value !== 'string' || !DATE_FNS_MODULE_PATTERN.test(node.source.value)) {
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
                if (TIME_ZONE_NAMING_MODULE_PATTERN.test(node.source.value)) {
                    timeZoneNamingFormatters.add(specifier.local.name);
                }
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

            // A ternary or template literal can carry the unknown-format marker inside a longer pattern. The marker is not
            // date-fns text, so it is reported on its own and replaced with a space before the rest is scanned for tokens.
            const tokens = findLocalizedTokens(pattern.replaceAll(UNKNOWN_LOCALIZED, ' '), timeZoneNamingFormatters.has(calleeName));
            if (pattern.includes(UNKNOWN_LOCALIZED)) {
                tokens.push('a format from CONST.DATE that may be localized');
            }
            if (tokens.length === 0) {
                return;
            }

            context.report({node, messageId: 'missingLocale', data: {tokens: tokens.join(', ')}});
        },
    };
}

export {name, meta, create};
