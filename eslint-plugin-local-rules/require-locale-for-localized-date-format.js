const name = 'require-locale-for-localized-date-format';

/** @type {import('eslint').Rule.RuleMetaData} */
const meta = {
    type: 'problem',
    docs: {
        description:
            "Ban date-fns from user-visible date rendering. Use `DateUtils.formatIntl` and the `CONST.DATE.INTL_FORMATS` presets so `Intl.DateTimeFormat` picks the locale's native structure (day/month order, 12h/24h clock, ordinals), not just translated tokens.",
        recommended: 'error',
    },
    schema: [],
    messages: {
        preferIntl:
            'This date format contains {{tokens}}, which render differently per language. Use `DateUtils.formatIntl(preferredLocale, PRESET, date)` (or the matching `formatIn*`/`formatTo*` helper); the presets in `CONST.DATE.INTL_FORMATS` cover the standard shapes.\n\n' +
            'If the output is never read by a user, use a format without these tokens or `DateUtils.formatMachineDateWithUTCTimeZone`.',
    },
};

/**
 * date-fns tokens whose output differs between languages. Longer patterns come first so that overlapping matches
 * (e.g. `LLLLL` inside `LLLL`) are counted once.
 * @type {ReadonlyArray<{token: string; label: string}>}
 */
const LOCALIZED_TOKENS = [
    {token: 'PPPP', label: 'PPPP (localized long date)'},
    {token: 'PPP', label: 'PPP (localized medium date)'},
    {token: 'PP', label: 'PP (localized short date)'},
    {token: 'pppp', label: 'pppp (localized long time)'},
    {token: 'ppp', label: 'ppp (localized medium time)'},
    {token: 'pp', label: 'pp (localized short time)'},
    {token: 'MMMMM', label: 'MMMMM (narrow month)'},
    {token: 'MMMM', label: 'MMMM (month name)'},
    {token: 'MMM', label: 'MMM (short month)'},
    {token: 'LLLLL', label: 'LLLLL (narrow standalone month)'},
    {token: 'LLLL', label: 'LLLL (standalone month)'},
    {token: 'LLL', label: 'LLL (standalone short month)'},
    {token: 'EEEEE', label: 'EEEEE (narrow weekday)'},
    {token: 'EEEE', label: 'EEEE (weekday name)'},
    {token: 'EEE', label: 'EEE (short weekday)'},
    {token: 'eeeee', label: 'eeeee (narrow weekday)'},
    {token: 'eeee', label: 'eeee (weekday name)'},
    {token: 'eee', label: 'eee (short weekday)'},
    {token: 'ccccc', label: 'ccccc (narrow standalone weekday)'},
    {token: 'cccc', label: 'cccc (standalone weekday name)'},
    {token: 'ccc', label: 'ccc (standalone short weekday)'},
    {token: 'cc', label: 'cc (standalone weekday number, locale-formatted)'},
    {token: 'do', label: 'do (ordinal day)'},
    {token: 'aaaa', label: 'aaaa (AM/PM lowercase)'},
    {token: 'aaa', label: 'aaa (AM/PM lowercase short)'},
    {token: 'aa', label: 'aa (AM/PM)'},
    {token: 'a', label: 'a (AM/PM)'},
    {token: 'bbbb', label: 'bbbb (localized day period)'},
    {token: 'BBBB', label: 'BBBB (extended day period)'},
    {token: 'b', label: 'b (localized day period)'},
    {token: 'P', label: 'P (localized short date)'},
    {token: 'p', label: 'p (localized short time)'},
];

/** Marks a format this rule cannot resolve but must still treat as localized. */
const UNKNOWN_LOCALIZED = '\u0000unknown-localized';

/**
 * date-fns exports that take a format string and accept a `locale` option, mapped to the index of the format argument.
 * @type {Record<string, number>}
 */
const FORMATTER_FORMAT_ARG_INDEX = {format: 1, formatInTimeZone: 2};

/**
 * Local wrappers around those exports, which keep the same argument order.
 * @type {Record<string, number>}
 */
const LOCAL_FORMATTER_FORMAT_ARG_INDEX = {formatInTimeZoneWithFallback: 2};

/**
 * Relative-time helpers whose output is locale-sensitive without a format string.
 * @type {ReadonlySet<string>}
 */
const LOCALE_SENSITIVE_NO_FORMAT = new Set(['formatDistance', 'formatDistanceStrict', 'formatDistanceToNow', 'formatDistanceToNowStrict', 'formatRelative']);

/**
 * date-fns modules whose `format` exports this rule follows through import aliases.
 * @type {ReadonlySet<string>}
 */
const DATE_FNS_MODULES = new Set(['date-fns', 'date-fns-tz']);

/**
 * `CONST.DATE.*` formats with no language-dependent tokens. Anything else in `CONST.DATE` is treated as localized, so a
 * newly added format is guarded by default rather than silently escaping this rule.
 * @type {ReadonlySet<string>}
 */
const MACHINE_DATE_CONSTANTS = new Set(['FNS_FORMAT_STRING', 'FNS_DATE_TIME_FORMAT_STRING', 'FNS_DB_FORMAT_STRING', 'FNS_TIMEZONE_FORMAT_STRING', 'YEAR_MONTH_FORMAT']);

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
    /** @type {string[]} */
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
    // Template literals: scan the static quasis for known tokens. If none match, an interpolation makes the pattern unknown.
    if (node.type === 'TemplateLiteral') {
        const staticPart = node.quasis.map((q) => q.value.cooked ?? '').join('');
        const foundTokens = findLocalizedTokens(staticPart);
        if (foundTokens.length > 0) {
            return staticPart;
        }
        return node.expressions.length > 0 ? UNKNOWN_LOCALIZED : staticPart;
    }
    // `CONST.DATE.MONTH_DAY_YEAR_FORMAT`. Unknown names fall through to UNKNOWN_LOCALIZED so that a format added to
    // CONST.DATE later is guarded by default rather than silently skipped.
    if (node.type === 'MemberExpression' && !node.computed && node.property.type === 'Identifier') {
        const {object} = node;
        if (object.type === 'MemberExpression' && !object.computed && object.property.type === 'Identifier' && object.property.name === 'DATE') {
            return MACHINE_DATE_CONSTANTS.has(node.property.name) ? '' : UNKNOWN_LOCALIZED;
        }
    }
    // `isPastYear ? A : B`; flag if either branch is localized.
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
 * Flags date-fns calls whose output is locale-sensitive, so callers are pushed to `DateUtils.formatIntl`.
 *
 * @param {import('eslint').Rule.RuleContext} context
 * @returns {import('eslint').Rule.RuleListener}
 */
function create(context) {
    /** @type {Map<string, number | undefined>} Local name to format-arg index, or undefined for relative-time helpers with no format arg. Populated from date-fns imports below so a local wrapper with the same name is not flagged. */
    const formatters = new Map(Object.entries(LOCAL_FORMATTER_FORMAT_ARG_INDEX));
    /** @type {Set<string>} Local names of `import * as X from 'date-fns'`. Any call on such a namespace like `X.format(...)` is treated as if it came from a direct named import. */
    const namespaceImports = new Set();

    return {
        ImportDeclaration(node) {
            if (!DATE_FNS_MODULES.has(node.source.value)) {
                return;
            }
            for (const specifier of node.specifiers) {
                if (specifier.type === 'ImportNamespaceSpecifier') {
                    namespaceImports.add(specifier.local.name);
                    continue;
                }
                if (specifier.type !== 'ImportSpecifier') {
                    continue;
                }
                const imported = specifier.imported.name;
                if (Object.hasOwn(FORMATTER_FORMAT_ARG_INDEX, imported)) {
                    formatters.set(specifier.local.name, FORMATTER_FORMAT_ARG_INDEX[imported]);
                } else if (LOCALE_SENSITIVE_NO_FORMAT.has(imported)) {
                    formatters.set(specifier.local.name, undefined);
                }
            }
        },
        CallExpression(node) {
            const {callee} = node;
            /** @type {string | null} */
            let calleeName = null;
            /** @type {number | undefined} */
            let formatArgIndex;
            if (callee.type === 'Identifier') {
                calleeName = callee.name;
                if (!formatters.has(calleeName)) {
                    return;
                }
                formatArgIndex = formatters.get(calleeName);
            } else if (callee.type === 'MemberExpression' && !callee.computed && callee.property.type === 'Identifier') {
                const propName = callee.property.name;
                // Handle `import * as df from 'date-fns'; df.format(...)` as a direct call on the imported name.
                if (callee.object.type === 'Identifier' && namespaceImports.has(callee.object.name)) {
                    // `Object.hasOwn`, not `in`. Inherited members like `toString` would otherwise resolve to a function that `arguments.at()` coerces to index 0.
                    if (Object.hasOwn(FORMATTER_FORMAT_ARG_INDEX, propName)) {
                        calleeName = propName;
                        formatArgIndex = FORMATTER_FORMAT_ARG_INDEX[propName];
                    } else if (LOCALE_SENSITIVE_NO_FORMAT.has(propName)) {
                        calleeName = propName;
                        formatArgIndex = undefined;
                    } else {
                        return;
                    }
                } else if (Object.hasOwn(LOCAL_FORMATTER_FORMAT_ARG_INDEX, propName)) {
                    // Member calls on non-namespace objects can only be local wrappers (e.g. `DateUtils.formatInTimeZoneWithFallback`).
                    calleeName = propName;
                    formatArgIndex = LOCAL_FORMATTER_FORMAT_ARG_INDEX[propName];
                } else {
                    return;
                }
            } else {
                return;
            }

            // Relative-time helpers (formatDistance et al) are always locale-sensitive; flag on presence.
            if (formatArgIndex === undefined) {
                context.report({node, messageId: 'preferIntl', data: {tokens: `\`${calleeName}\` output`}});
                return;
            }

            const pattern = resolvePattern(node.arguments.at(formatArgIndex));
            if (pattern === null) {
                return;
            }

            const tokens = pattern === UNKNOWN_LOCALIZED ? ['a dynamic format string that may be localized'] : findLocalizedTokens(pattern);
            if (tokens.length === 0) {
                return;
            }

            context.report({node, messageId: 'preferIntl', data: {tokens: tokens.join(', ')}});
        },
    };
}

export {name, meta, create};
