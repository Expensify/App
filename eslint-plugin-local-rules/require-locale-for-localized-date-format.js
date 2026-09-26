const name = 'require-locale-for-localized-date-format';

/** @type {import('eslint').Rule.RuleMetaData} */
const meta = {
    type: 'problem',
    docs: {
        description:
            "Ban date-fns from user-visible date rendering. Use the `DateUtils` `formatTo*`/`formatIn*` helpers so `Intl.DateTimeFormat` picks the locale's native structure (day/month order, 12h/24h clock, ordinals), not just translated tokens.",
        recommended: 'error',
    },
    schema: [],
    messages: {
        preferIntl:
            'This date format contains {{tokens}}, which render differently per language. Use the matching `DateUtils.formatTo*`/`formatIn*` helper, e.g. `DateUtils.formatToMediumDate(date, preferredLocale)`; they cover the shapes in `CONST.DATE.INTL_FORMATS`.\n\n' +
            'If the output is never read by a user, use a format without these tokens or `DateUtils.formatMachineDateWithUTCTimeZone`.',
    },
};

/**
 * A date-fns token: an ordinal (`do`) or a run of one letter (`MMMM`), which are the shapes its own formatter reads.
 */
const TOKEN_PATTERN = /[a-zA-Z]o|([a-zA-Z])\1*/g;

/**
 * The tokens that render the same text in every language: numeric fields, ISO-style offsets and epoch counters. Every
 * other token is treated as localized, so one this set does not name is guarded by default rather than escaping the
 * rule. Listing the localized tokens instead is what let a zone name render in the device's language for every reader.
 * @type {ReadonlySet<string>}
 */
const MACHINE_TOKENS = new Set([
    // Years
    'y',
    'yy',
    'yyy',
    'yyyy',
    'yyyyy',
    'R',
    'RR',
    'RRR',
    'RRRR',
    'u',
    'uu',
    'uuu',
    'uuuu',
    // Numeric quarters and months
    'Q',
    'QQ',
    'q',
    'qq',
    'M',
    'MM',
    'L',
    'LL',
    // Days, and the ISO week and weekday, which do not move with the locale's first day
    'd',
    'dd',
    'D',
    'DD',
    'DDD',
    'DDDD',
    'I',
    'II',
    'i',
    'ii',
    // Clock
    'h',
    'hh',
    'H',
    'HH',
    'K',
    'KK',
    'k',
    'kk',
    'm',
    'mm',
    's',
    'ss',
    'S',
    'SS',
    'SSS',
    'SSSS',
    // Offsets and epoch counters
    'X',
    'XX',
    'XXX',
    'XXXX',
    'XXXXX',
    'x',
    'xx',
    'xxx',
    'xxxx',
    'xxxxx',
    'O',
    'OO',
    'OOO',
    'OOOO',
    't',
    'T',
]);

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
 * date-fns packages whose `format` exports this rule follows through import aliases.
 * @type {ReadonlySet<string>}
 */
const DATE_FNS_PACKAGES = new Set(['date-fns', 'date-fns-tz']);

/**
 * Deep paths count: `import {format} from 'date-fns/format'` is how several modules here already import it, and an
 * exact-match check would leave the whole file unguarded.
 *
 * @param {unknown} source
 * @returns {boolean}
 */
function isDateFnsModule(source) {
    return typeof source === 'string' && [...DATE_FNS_PACKAGES].some((packageName) => source === packageName || source.startsWith(`${packageName}/`));
}

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
 * @returns {string[]} the pattern's tokens whose text depends on the language
 */
function findLocalizedTokens(pattern) {
    const tokens = stripEscapedLiterals(pattern).match(TOKEN_PATTERN) ?? [];
    return [...new Set(tokens.filter((token) => !MACHINE_TOKENS.has(token)))].map((token) => `\`${token}\``);
}

/**
 * @param {import('eslint').Scope.Scope | null} scope
 * @param {string} variableName
 * @returns {import('eslint').Scope.Variable | undefined}
 */
function findVariable(scope, variableName) {
    for (let current = scope; current; current = current.upper) {
        const variable = current.set.get(variableName);
        if (variable) {
            return variable;
        }
    }
    return undefined;
}

/**
 * Resolves a format argument to a literal pattern, following `CONST.DATE.*` references, ternaries and aliases.
 * Returns null when the pattern cannot be determined statically.
 *
 * @param {import('estree').Node} node
 * @param {import('eslint').SourceCode} sourceCode
 * @param {Set<import('estree').Node>} visited
 * @returns {string | null}
 */
function resolvePattern(node, sourceCode, visited = new Set()) {
    if (!node || visited.has(node)) {
        return null;
    }
    visited.add(node);
    // Each hop resolves a name to its initializer in its declaring scope, not the call's, else hoisting a format string to a `const` exempts its call site; a parameter stays unknown.
    if (node.type === 'Identifier') {
        const variable = findVariable(sourceCode.getScope(node), node.name);
        const definition = variable?.defs?.length === 1 ? variable.defs.at(0) : undefined;
        // Its literal is in another file, so it is guarded like an unknown `CONST.DATE` name rather than skipped.
        if (definition?.type === 'ImportBinding') {
            return UNKNOWN_LOCALIZED;
        }
        if (definition?.type === 'Variable' && definition.node.init) {
            return resolvePattern(definition.node.init, sourceCode, visited);
        }
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
    // `isPastYear ? A : B`, flagged if either branch is localized.
    if (node.type === 'ConditionalExpression') {
        const consequent = resolvePattern(node.consequent, sourceCode, visited);
        const alternate = resolvePattern(node.alternate, sourceCode, visited);
        // Before joining, because the joined string no longer equals the marker below and its own letters would be scanned for tokens.
        if (consequent === UNKNOWN_LOCALIZED || alternate === UNKNOWN_LOCALIZED) {
            return UNKNOWN_LOCALIZED;
        }
        if (consequent === null && alternate === null) {
            return null;
        }
        return `${consequent ?? ''} ${alternate ?? ''}`;
    }
    return null;
}

/**
 * Flags date-fns calls whose output is locale-sensitive, so callers are pushed to the `DateUtils` Intl helpers.
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
            if (!isDateFnsModule(node.source.value)) {
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

            // Relative-time helpers like formatDistance are always locale-sensitive, so flag on presence.
            if (formatArgIndex === undefined) {
                context.report({node, messageId: 'preferIntl', data: {tokens: `\`${calleeName}\` output`}});
                return;
            }

            const pattern = resolvePattern(node.arguments.at(formatArgIndex), context.sourceCode);
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

export {name, meta, create, MACHINE_DATE_CONSTANTS};
