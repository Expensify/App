// Makes a jsPlugin-hosted rule answer to the rule id ESLint uses in disable comments.
//
// A rule hosted through `jsPlugins` gets whatever prefix we give it (`hosted/naming-convention`,
// `rc/refs`), because `react-hooks`, `@typescript-eslint`, `react` and `import` are
// reserved for oxlint's native plugins. So an existing `// eslint-disable-next-line
// @typescript-eslint/naming-convention` does not suppress `hosted/naming-convention`. Without this
// module, 1173 directives in the repo hid 7378 findings from ESLint that oxlint still reported, and
// each one needed a hand-written `oxlint-disable` twin next to it. Native rules need none of this:
// oxlint's own directive handling already knows its native ids, which is why the repo's other 5188
// directives always worked untouched.
//
// The seam is the one config/oxlint/reactCompilerGate.mjs already uses: wrap `context.report` and
// drop the reports ESLint would have dropped. This layer is additive, since a report dropped here is
// one oxlint never sees, so `oxlint-disable` keeps working exactly as before.
//
// Line granularity, deliberately: a directive suppresses whole lines rather than source ranges. The
// one place that differs from ESLint is code sharing a line with an `eslint-enable` and sitting
// after it, which the fixtures would catch if it ever occurred.

/** ESLint's own justification separator: whitespace, two or more dashes, whitespace. */
const JUSTIFICATION = /\s-{2,}\s/;
/** Longest first, so `eslint-disable` does not match `eslint-disable-line`. */
const KINDS = ['eslint-disable-next-line', 'eslint-disable-line', 'eslint-disable', 'eslint-enable'];
/** Stands in for "every rule", i.e. a bare `eslint-disable` with no ids. */
const ALL_RULES = ' all';

const cache = new Map();

/** `eslint-disable a/b, c/d -- why` to {kind, ruleIds}, or null when the comment is prose. */
function parseComment(comment) {
    const text = String(comment.value ?? '').trim();
    const kind = KINDS.find((candidate) => text === candidate || (text.startsWith(candidate) && /^\s/.test(text.slice(candidate.length))));
    if (!kind) {
        return null;
    }
    const body = text.slice(kind.length).split(JUSTIFICATION)[0];
    const ruleIds = body
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);
    return {kind, ruleIds: ruleIds.length ? ruleIds : [ALL_RULES]};
}

function add(map, key, value) {
    if (!map.has(key)) {
        map.set(key, []);
    }
    map.get(key).push(value);
}

/**
 * Comments to {lines, ranges}, both keyed by rule id.
 *   lines   rule id to a Set of single suppressed lines (the -next-line and -line forms)
 *   ranges  rule id to [[from, to]] (the block form; an unclosed disable runs to end of file)
 */
function parseDirectives(comments) {
    const lines = new Map();
    const ranges = new Map();
    const open = new Map();

    for (const comment of comments) {
        const parsed = parseComment(comment);
        const start = comment.loc?.start?.line;
        const end = comment.loc?.end?.line;
        if (!parsed || start == null || end == null) {
            continue;
        }
        for (const ruleId of parsed.ruleIds) {
            if (parsed.kind === 'eslint-disable-next-line' || parsed.kind === 'eslint-disable-line') {
                // ESLint rejects a multi-line -next-line/-line directive and does not apply it.
                if (start !== end) {
                    continue;
                }
                if (!lines.has(ruleId)) {
                    lines.set(ruleId, new Set());
                }
                lines.get(ruleId).add(parsed.kind === 'eslint-disable-line' ? start : start + 1);
            } else if (parsed.kind === 'eslint-disable') {
                if (!open.has(ruleId)) {
                    open.set(ruleId, start);
                }
            } else {
                const from = open.get(ruleId);
                if (from != null) {
                    add(ranges, ruleId, [from, start]);
                    open.delete(ruleId);
                }
                // A bare `eslint-enable` closes every range still open.
                if (ruleId === ALL_RULES) {
                    for (const [openRule, openFrom] of open) {
                        add(ranges, openRule, [openFrom, start]);
                    }
                    open.clear();
                }
            }
        }
    }

    for (const [ruleId, from] of open) {
        add(ranges, ruleId, [from, Number.POSITIVE_INFINITY]);
    }
    return {lines, ranges};
}

function directivesFor(filename, comments) {
    const key = filename ?? '<unknown>';
    if (!cache.has(key)) {
        cache.set(key, parseDirectives(comments));
    }
    return cache.get(key);
}

function suppressedFor(directives, ruleId, line) {
    if (directives.lines.get(ruleId)?.has(line)) {
        return true;
    }
    return (directives.ranges.get(ruleId) ?? []).some(([from, to]) => line >= from && line <= to);
}

/** True when an ESLint directive naming `eslintRuleId` (or every rule) covers `line`. */
function isSuppressed(directives, eslintRuleId, line) {
    if (line == null) {
        return false;
    }
    return suppressedFor(directives, eslintRuleId, line) || suppressedFor(directives, ALL_RULES, line);
}

/**
 * The line a report lands on, or null when it cannot be resolved. Null means "let it through":
 * suppressing on a guess loses coverage silently, which is the failure mode this layer exists to
 * avoid. Covers the descriptor forms and the legacy positional report(node, message).
 */
function reportLine(args) {
    const first = args[0];
    const candidates = [first?.loc?.start?.line, first?.loc?.line, first?.node?.loc?.start?.line, first?.node?.loc?.line];
    return candidates.find((line) => typeof line === 'number') ?? null;
}

/**
 * Wraps a hosted rule so a disable comment naming its ESLint id suppresses it, the way that comment
 * already suppresses ESLint's copy of the same rule.
 */
function withEslintDirectiveIds(rule, eslintRuleId) {
    return {
        ...rule,
        create(context) {
            const filteredContext = Object.create(context, {
                report: {
                    // Forwarded as-is rather than as a single descriptor: ESLint also accepts the
                    // legacy report(node, message) form, and dropping the extra arguments would
                    // silently change a rule's message.
                    value(...args) {
                        const line = reportLine(args);
                        if (line != null) {
                            const sourceCode = context.sourceCode ?? context.getSourceCode();
                            const filename = context.filename ?? context.getFilename();
                            if (isSuppressed(directivesFor(filename, sourceCode.getAllComments()), eslintRuleId, line)) {
                                return;
                            }
                        }
                        return context.report(...args);
                    },
                },
            });
            return rule.create(filteredContext);
        },
    };
}

/**
 * Wraps every rule in a plugin's rule map. `toEslintId` maps the rule's oxlint name to the id
 * ESLint uses, which is derived per plugin rather than hand-listed, so a rule added upstream is
 * covered without touching a table here.
 *
 * Composition with config/oxlint/reactCompilerGate.mjs: put this wrapper on the INSIDE, i.e.
 * `withFullGating(withEslintDirectiveIds(rule, id))`. The innermost wrapper's check runs first, and
 * this one is a cached comment lookup while the gate runs both React compilers on first report in a
 * file. Both only drop reports, so the result is the same either way; the order is about cost.
 */
function withEslintDirectiveIdsFor(rules, toEslintId) {
    return Object.fromEntries(Object.entries(rules).map(([name, rule]) => [name, withEslintDirectiveIds(rule, toEslintId(name))]));
}

export {isSuppressed, parseDirectives, reportLine, withEslintDirectiveIds, withEslintDirectiveIdsFor};
