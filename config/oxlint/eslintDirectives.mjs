/**
 * oxlint runs some ESLint rules as JS plugins under a new name. For example,
 * `@typescript-eslint/naming-convention` becomes `hosted/naming-convention`. oxlint doesn't know the
 * two are the same rule, so an existing `eslint-disable-next-line @typescript-eslint/naming-convention`
 * comment wouldn't hide its report. The wrappers here read those comments and drop what ESLint would hide.
 */

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
        // ESLint reads `eslint-disable` and `eslint-enable` only from block comments.
        const isBlockKind = parsed.kind === 'eslint-disable' || parsed.kind === 'eslint-enable';
        if (isBlockKind && comment.type !== 'Block') {
            continue;
        }
        for (const ruleId of parsed.ruleIds) {
            if (parsed.kind === 'eslint-disable-next-line' || parsed.kind === 'eslint-disable-line') {
                // ESLint ignores a multi-line `-line` directive but applies a multi-line `-next-line`
                // to the line after the comment ends.
                if (parsed.kind === 'eslint-disable-line' && start !== end) {
                    continue;
                }
                if (!lines.has(ruleId)) {
                    lines.set(ruleId, new Set());
                }
                lines.get(ruleId).add(parsed.kind === 'eslint-disable-line' ? start : end + 1);
            } else {
                blocks.push({line: start, column: comment.loc.start.column ?? 0, ruleId, disable: parsed.kind === 'eslint-disable'});
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

// As in ESLint, the last block directive before the report, by line and then column, that names the
// rule (or no rule) wins.
function isSuppressed(directives, eslintRuleId, position) {
    if (position == null) {
        return false;
    }
    const {line, column} = position;
    if (directives.lines.get(eslintRuleId)?.has(line) || directives.lines.get(ALL_RULES)?.has(line)) {
        return true;
    }
    let disabled = false;
    for (const block of directives.blocks) {
        const isAfterReport = block.line > line || (block.line === line && block.column > column);
        if (isAfterReport || (block.ruleId !== ALL_RULES && block.ruleId !== eslintRuleId)) {
            continue;
        }
        disabled = block.disable;
    }
    return disabled;
}

function reportPosition(args) {
    const first = args[0];
    const candidates = [first?.loc?.start, first?.loc, first?.node?.loc?.start, first?.node?.loc];
    const point = candidates.find((candidate) => typeof candidate?.line === 'number');
    return point ? {line: point.line, column: typeof point.column === 'number' ? point.column : 0} : null;
}

function withEslintDirectiveIDs(rule, eslintRuleId) {
    return {
        ...rule,
        create(context) {
            const filteredContext = Object.create(context, {
                report: {
                    // Keeps every argument: ESLint also accepts the legacy `report(node, message)` form.
                    value(...args) {
                        const position = reportPosition(args);
                        if (position != null) {
                            const sourceCode = context.sourceCode ?? context.getSourceCode();
                            const filename = context.filename ?? context.getFilename();
                            if (isSuppressed(directivesFor(filename, sourceCode.getAllComments()), eslintRuleId, position)) {
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

function withEslintDirectiveIDsFor(rules, toEslintId) {
    return Object.fromEntries(Object.entries(rules).map(([name, rule]) => [name, withEslintDirectiveIDs(rule, toEslintId(name))]));
}

export {withEslintDirectiveIDs, withEslintDirectiveIDsFor};
