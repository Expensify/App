/**
 * Detection logic for new `eslint-disable` bypasses of the Onyx.connect() ban.
 *
 * `rulesdir/no-onyx-connect` (shipped by eslint-config-expensify) is a normal lint rule, so an
 * inline `eslint-disable` can silence it. The lint runner re-elevates those disables by scanning
 * source for disable directives that name the ban or blanket directives that cover a real call. No
 * disable directive can reach this check because it does not go through ESLint's message pipeline.
 *
 * Blanket `eslint-disable` / `eslint-disable-next-line` with no rule list counts only when it
 * covers a real Onyx.connect() call. Unrelated blanket comments (e.g. around ReportUtils) remain
 * ignored. Call sites are found via the Babel AST so comments and grouping parens cannot hide a
 * banned member access from a source scan.
 */

import {parse} from '@babel/parser';

/** Rule id of the Onyx.connect() ban, as exposed through eslint-plugin-rulesdir. */
const BANNED_RULE_ID = 'rulesdir/no-onyx-connect';

const BANNED_RULE_NAME = 'no-onyx-connect';

/**
 * Disables of the ban that already exist on `main`, keyed by repo-relative path with the number of
 * occurrences in each file. Migrating these call sites to useOnyx() is already in progress; any
 * suppressed violation beyond these counts is treated as a new bypass.
 */
const GRANDFATHERED_BYPASSES = new Map<string, number>([
    ['src/libs/NextStepUtils.ts', 1],
    ['src/libs/ReportNameUtils.ts', 2],
]);

/** A `no-onyx-connect` violation that an inline disable directive silenced. */
type SuppressedBan = {
    file: string;
    line: number;
};

type DirectiveMatch = {
    index: number;
    text: string;
    kind?: string;
    args: string;
};

type ASTNode = {
    type: string;
    start: number;
    end: number;
    [key: string]: unknown;
};

type BabelComment = {
    type: string;
    value: string;
    start: number | null;
    end: number | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

const isASTNode = (value: unknown): value is ASTNode => {
    if (!isRecord(value)) {
        return false;
    }
    return typeof value.type === 'string' && typeof value.start === 'number' && typeof value.end === 'number';
};

function parseSource(source: string): {root: ASTNode; comments: BabelComment[]} | null {
    try {
        const parsed: unknown = parse(source, {sourceType: 'unambiguous', plugins: ['typescript', 'jsx'], errorRecovery: true, attachComment: true});
        if (!isASTNode(parsed) || !isRecord(parsed)) {
            return null;
        }
        const rawComments = parsed.comments;
        const comments = Array.isArray(rawComments)
            ? rawComments.filter((comment): comment is BabelComment => {
                  return isRecord(comment) && typeof comment.type === 'string' && typeof comment.value === 'string' && typeof comment.start === 'number' && typeof comment.end === 'number';
              })
            : [];
        return {root: parsed, comments};
    } catch {
        return null;
    }
}

function collectDirectiveMatches(comments: readonly BabelComment[], source: string, directive: 'disable' | 'enable'): DirectiveMatch[] {
    const matches: DirectiveMatch[] = [];
    for (const comment of comments) {
        if (comment.start === null || comment.end === null) {
            continue;
        }
        const directiveMatch = comment.value.match(new RegExp(`^\\s*eslint-${directive}(?<kind>-next-line|-line)?(?<args>[\\s\\S]*)$`));
        if (!directiveMatch) {
            continue;
        }
        matches.push({index: comment.start, text: source.slice(comment.start, comment.end), kind: directiveMatch.groups?.kind, args: directiveMatch.groups?.args ?? ''});
    }
    return matches;
}

function directiveKind(match: DirectiveMatch): string | undefined {
    return match.kind;
}

function directiveArgs(match: DirectiveMatch): string {
    return match.args;
}

const NON_CHILD_KEYS = new Set(['loc', 'start', 'end', 'extra', 'leadingComments', 'trailingComments', 'innerComments', 'comments']);
const WRAPPER_TYPES = new Set(['ParenthesizedExpression', 'TSAsExpression', 'TSSatisfiesExpression', 'TSNonNullExpression', 'TSTypeAssertion']);

function* astChildren(node: ASTNode): Generator<ASTNode> {
    for (const [key, value] of Object.entries(node)) {
        if (NON_CHILD_KEYS.has(key)) {
            continue;
        }
        for (const child of Array.isArray(value) ? value : [value]) {
            if (isASTNode(child)) {
                yield child;
            }
        }
    }
}

function unwrapExpression(node: ASTNode): ASTNode {
    let current = node;
    while (WRAPPER_TYPES.has(current.type) && isASTNode(current.expression)) {
        current = current.expression;
    }
    return current;
}

function isOnyxConnectCall(node: ASTNode): boolean {
    if (node.type !== 'CallExpression' || !isASTNode(node.callee)) {
        return false;
    }
    const callee = node.callee;
    if (callee.type !== 'MemberExpression' || callee.optional === true || callee.computed === true) {
        return false;
    }
    if (!isASTNode(callee.property) || callee.property.type !== 'Identifier' || callee.property.name !== 'connect') {
        return false;
    }
    if (!isASTNode(callee.object)) {
        return false;
    }
    const object = unwrapExpression(callee.object);
    return object.type === 'Identifier' && object.name === 'Onyx';
}

function collectOnyxConnectCallOffsets(root: ASTNode): number[] {
    const offsets: number[] = [];
    const visit = (node: ASTNode) => {
        if (isOnyxConnectCall(node)) {
            offsets.push(node.start);
        }
        for (const child of astChildren(node)) {
            visit(child);
        }
    };
    visit(root);
    return offsets;
}

function normalizedDirectiveArgs(args: string): string {
    return args
        .replace(/--[\s\S]*$/, '')
        .replaceAll(/[\s*]+/g, ' ')
        .trim();
}

function directiveTargetsBan(args: string): boolean {
    const trimmed = normalizedDirectiveArgs(args);
    if (trimmed.length === 0) {
        return false;
    }
    return trimmed.split(',').some((part) => {
        const rule = part.trim();
        return rule === BANNED_RULE_ID || rule === BANNED_RULE_NAME || rule.endsWith(`/${BANNED_RULE_NAME}`);
    });
}

function isBlanketDirective(args: string): boolean {
    return normalizedDirectiveArgs(args).length === 0;
}

function lineNumberAtOffset(source: string, offset: number): number {
    return source.slice(0, offset).split('\n').length;
}

function blanketDirectiveCoversCall(source: string, match: DirectiveMatch, callOffsets: number[], enableMatches: DirectiveMatch[]): boolean {
    const directiveLine = lineNumberAtOffset(source, match.index ?? 0);
    const kind = directiveKind(match);
    const directiveEnd = match.index + match.text.length;
    return callOffsets.some((callOffset) => {
        const callLine = lineNumberAtOffset(source, callOffset);
        if (kind === '-line') {
            return callLine === directiveLine;
        }
        if (kind === '-next-line') {
            return callLine === directiveLine + 1;
        }
        if (callOffset <= directiveEnd) {
            return false;
        }
        const reenabled = enableMatches.some((enableMatch) => {
            const enableOffset = enableMatch.index;
            if (enableOffset <= directiveEnd || enableOffset >= callOffset) {
                return false;
            }
            const enableArgs = directiveArgs(enableMatch);
            return isBlanketDirective(enableArgs) || directiveTargetsBan(enableArgs);
        });
        return !reenabled;
    });
}

/**
 * Find disable directives in `source` that suppress `rulesdir/no-onyx-connect`.
 * Line numbers are 1-based. Matches both full-line and trailing `eslint-disable-line`.
 */
function collectDisableDirectivesFromSource(source: string, file: string): SuppressedBan[] {
    const parsed = parseSource(source);
    if (!parsed) {
        return [];
    }
    const bans: SuppressedBan[] = [];
    const callOffsets = collectOnyxConnectCallOffsets(parsed.root);
    const enableMatches = collectDirectiveMatches(parsed.comments, source, 'enable');
    for (const match of collectDirectiveMatches(parsed.comments, source, 'disable')) {
        const args = directiveArgs(match);
        const targetsBan = directiveTargetsBan(args);
        const coversBan = isBlanketDirective(args) && blanketDirectiveCoversCall(source, match, callOffsets, enableMatches);
        if (!targetsBan && !coversBan) {
            continue;
        }
        const prefix = source.slice(0, match.index);
        const line = prefix.split('\n').length;
        bans.push({file, line});
    }
    return bans;
}

/** Return the suppressed bans that exceed the grandfathered allowance for their file. */
function findNewBypasses(suppressedBans: readonly SuppressedBan[]): SuppressedBan[] {
    const byFile = new Map<string, SuppressedBan[]>();
    for (const ban of suppressedBans) {
        const list = byFile.get(ban.file) ?? [];
        list.push(ban);
        byFile.set(ban.file, list);
    }

    const newBypasses: SuppressedBan[] = [];
    for (const [file, bans] of byFile) {
        const allowed = GRANDFATHERED_BYPASSES.get(file) ?? 0;
        if (bans.length <= allowed) {
            continue;
        }
        const sortedByLine = [...bans].sort((a, b) => a.line - b.line);
        newBypasses.push(...sortedByLine.slice(allowed));
    }
    return newBypasses;
}

export {BANNED_RULE_ID, BANNED_RULE_NAME, GRANDFATHERED_BYPASSES, collectDisableDirectivesFromSource, findNewBypasses};
export type {SuppressedBan};
