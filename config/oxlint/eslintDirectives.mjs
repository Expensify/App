// A rule hosted through oxlint's `jsPlugins` cannot take a native plugin's prefix (`react-hooks`,
// `@typescript-eslint`, `react`, `import` are reserved), so an existing `eslint-disable-next-line
// @typescript-eslint/naming-convention` does not suppress `hosted/naming-convention`. This makes a
// hosted rule answer to the id ESLint uses, by dropping the reports ESLint would have dropped.

const JUSTIFICATION = /\s-{2,}\s/;
const KINDS = ['eslint-disable-next-line', 'eslint-disable-line', 'eslint-disable', 'eslint-enable'];
const ALL_RULES = ' all';

const cache = new Map();

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

function parseDirectives(comments) {
    const lines = new Map();
    const blocks = [];

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
            } else {
                blocks.push({line: start, ruleId, disable: parsed.kind === 'eslint-disable'});
            }
        }
    }

    return {lines, blocks};
}

function directivesFor(filename, comments) {
    const key = filename ?? '<unknown>';
    if (!cache.has(key)) {
        cache.set(key, parseDirectives(comments));
    }
    return cache.get(key);
}

// Mirrors ESLint: the last block directive at or before the line that names the rule (or no rule)
// decides. A bare `eslint-disable` followed by `eslint-enable foo` therefore re-enables `foo` alone,
// and a bare `eslint-enable` re-enables every rule.
function isSuppressed(directives, eslintRuleId, line) {
    if (line == null) {
        return false;
    }
    if (directives.lines.get(eslintRuleId)?.has(line) || directives.lines.get(ALL_RULES)?.has(line)) {
        return true;
    }
    let disabled = false;
    for (const block of directives.blocks) {
        if (block.line > line || (block.ruleId !== ALL_RULES && block.ruleId !== eslintRuleId)) {
            continue;
        }
        // A report on the `eslint-enable` line itself stays suppressed, as with the previous inclusive range.
        if (block.disable) {
            disabled = true;
        } else if (block.line < line) {
            disabled = false;
        }
    }
    return disabled;
}

function reportLine(args) {
    const first = args[0];
    const candidates = [first?.loc?.start?.line, first?.loc?.line, first?.node?.loc?.start?.line, first?.node?.loc?.line];
    return candidates.find((line) => typeof line === 'number') ?? null;
}

function withEslintDirectiveIds(rule, eslintRuleId) {
    return {
        ...rule,
        create(context) {
            const filteredContext = Object.create(context, {
                report: {
                    // Forwarded as-is rather than as one descriptor: ESLint also accepts the legacy
                    // `report(node, message)` form, and dropping the extra arguments would change the message.
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

function withEslintDirectiveIdsFor(rules, toEslintId) {
    return Object.fromEntries(Object.entries(rules).map(([name, rule]) => [name, withEslintDirectiveIds(rule, toEslintId(name))]));
}

export {withEslintDirectiveIds, withEslintDirectiveIdsFor};
