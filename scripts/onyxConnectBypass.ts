/**
 * Detection logic for new `eslint-disable` bypasses of the Onyx.connect() ban and `rulesdir/no-unsafe-onyx-read`.
 *
 * `rulesdir/no-onyx-connect` (shipped by eslint-config-expensify) is a normal lint rule, so an
 * inline `eslint-disable` can silence it. The lint runner re-elevates those disables by scanning
 * source for disable directives that name the ban or blanket directives that cover a real call. No
 * disable directive can reach this check because it does not go through ESLint's message pipeline.
 *
 * Blanket `eslint-disable` / `eslint-disable-next-line` with no rule list counts only when it
 * covers a real banned call: Onyx.connect(), or Onyx.get() and Onyx.multiGet() for the read rule. Unrelated blanket comments (e.g. around ReportUtils) remain
 * ignored. Call sites are found via the Babel AST so comments and grouping parens cannot hide a
 * banned member access from a source scan.
 */

import {parse} from '@babel/parser';

import type {ASTNode} from './utils/BabelASTUtils';

import BabelASTUtils from './utils/BabelASTUtils';

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

type BannedRule = {
    id: string;
    name: string;
    objects: Set<string>;
    methods: Set<string>;
    grandfathered: Map<string, number>;
    appliesTo: (file: string) => boolean;
    searchTerms: string[];
    message: string;
};

const ONYX_CONNECT_BAN: BannedRule = {
    id: BANNED_RULE_ID,
    name: BANNED_RULE_NAME,
    objects: new Set(['Onyx']),
    methods: new Set(['connect']),
    grandfathered: GRANDFATHERED_BYPASSES,
    appliesTo: () => true,
    searchTerms: ['Onyx', 'connect', 'eslint-disable'],
    message: 'Onyx.connect() is banned and the ban cannot be bypassed with eslint-disable. Use the useOnyx() hook to read Onyx data instead.',
};

const ONYX_READ_BAN: BannedRule = {
    id: 'rulesdir/no-unsafe-onyx-read',
    name: 'no-unsafe-onyx-read',
    objects: new Set(['Onyx']),
    methods: new Set(['get', 'multiGet']),
    grandfathered: new Map<string, number>([['src/setup/addUtilsToWindow.ts', 1]]),
    appliesTo: (file) => file.startsWith('src/'),
    searchTerms: ['Onyx', 'eslint-disable'],
    message:
        'Onyx reads checked by no-unsafe-onyx-read cannot be silenced with eslint-disable. Fix the read instead: use useOnyx() for data a component renders or reacts to, and call Onyx.get() or Onyx.multiGet() only from event handlers or useCallback bodies in components, pages and hooks.',
};

const BANNED_RULES: BannedRule[] = [ONYX_CONNECT_BAN, ONYX_READ_BAN];

/** A banned-rule violation that an inline disable directive silenced. */
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

type BabelComment = {
    type: string;
    value: string;
    start: number | null;
    end: number | null;
};

function parseSource(source: string): {root: ASTNode; comments: BabelComment[]} | null {
    try {
        const parsed: unknown = parse(source, {sourceType: 'unambiguous', plugins: ['typescript', 'jsx'], errorRecovery: true, attachComment: true});
        if (!BabelASTUtils.isASTNode(parsed) || !BabelASTUtils.isRecord(parsed)) {
            return null;
        }
        const rawComments = parsed.comments;
        const comments = Array.isArray(rawComments)
            ? rawComments.filter((comment): comment is BabelComment => {
                  return (
                      BabelASTUtils.isRecord(comment) &&
                      typeof comment.type === 'string' &&
                      typeof comment.value === 'string' &&
                      typeof comment.start === 'number' &&
                      typeof comment.end === 'number'
                  );
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
        // ESLint only supports -line / -next-line on disable. `eslint-enable-line` and
        // `eslint-enable-next-line` are not real directives, so treating them as enables
        // would reopen a blanket disable that ESLint still honors.
        const pattern = directive === 'disable' ? '^\\s*eslint-disable(?<kind>-next-line|-line)?(?<args>[\\s\\S]*)$' : '^\\s*eslint-enable(?!-)(?<args>[\\s\\S]*)$';
        const directiveMatch = comment.value.match(new RegExp(pattern));
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

function unwrapExpression(node: ASTNode): ASTNode {
    let current = node;
    while (WRAPPER_TYPES.has(current.type) && BabelASTUtils.isASTNode(current.expression)) {
        current = current.expression;
    }
    return current;
}

function isBannedCall(node: ASTNode, ban: BannedRule): boolean {
    // Optional chaining anywhere in the call (`Onyx?.connect(...)`, `Onyx.connect?.(...)`) produces
    // `OptionalCallExpression`/`OptionalMemberExpression` nodes instead of their non-optional
    // counterparts, so a blanket disable directive over one would otherwise silently bypass the ban.
    if ((node.type !== 'CallExpression' && node.type !== 'OptionalCallExpression') || !BabelASTUtils.isASTNode(node.callee)) {
        return false;
    }
    const callee = node.callee;
    if ((callee.type !== 'MemberExpression' && callee.type !== 'OptionalMemberExpression') || callee.computed === true) {
        return false;
    }
    if (!BabelASTUtils.isASTNode(callee.property) || callee.property.type !== 'Identifier' || typeof callee.property.name !== 'string' || !ban.methods.has(callee.property.name)) {
        return false;
    }
    if (!BabelASTUtils.isASTNode(callee.object)) {
        return false;
    }
    const object = unwrapExpression(callee.object);
    return object.type === 'Identifier' && typeof object.name === 'string' && ban.objects.has(object.name);
}

function collectBannedCallOffsets(root: ASTNode, ban: BannedRule): number[] {
    const offsets: number[] = [];
    const visit = (node: ASTNode) => {
        if (isBannedCall(node, ban)) {
            offsets.push(node.start);
        }
        for (const child of BabelASTUtils.children(node, NON_CHILD_KEYS)) {
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

function directiveTargetsBan(args: string, ban: BannedRule): boolean {
    const trimmed = normalizedDirectiveArgs(args);
    if (trimmed.length === 0) {
        return false;
    }
    return trimmed.split(',').some((part) => {
        const rule = part.trim();
        return rule === ban.id || rule === ban.name || rule.endsWith(`/${ban.name}`);
    });
}

function isBlanketDirective(args: string): boolean {
    return normalizedDirectiveArgs(args).length === 0;
}

function lineNumberAtOffset(source: string, offset: number): number {
    let line = 1;
    let index = 0;
    const end = Math.min(Math.max(offset, 0), source.length);
    while (index < end) {
        const code = source.charCodeAt(index);
        if (code === 0x0d) {
            line++;
            index += source.charCodeAt(index + 1) === 0x0a ? 2 : 1;
            continue;
        }
        if (code === 0x0a || code === 0x2028 || code === 0x2029) {
            line++;
        }
        index++;
    }
    return line;
}

function blanketDirectiveCoversCall(source: string, match: DirectiveMatch, callOffsets: number[], enableMatches: DirectiveMatch[], ban: BannedRule): boolean {
    const directiveLine = lineNumberAtOffset(source, match.index);
    const kind = directiveKind(match);
    const directiveEnd = match.index + match.text.length;
    const directiveEndLine = lineNumberAtOffset(source, Math.max(match.index, directiveEnd - 1));
    return callOffsets.some((callOffset) => {
        const callLine = lineNumberAtOffset(source, callOffset);
        if (kind === '-line') {
            return callLine === directiveLine;
        }
        if (kind === '-next-line') {
            return callLine === directiveEndLine + 1;
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
            return isBlanketDirective(enableArgs) || directiveTargetsBan(enableArgs, ban);
        });
        return !reenabled;
    });
}

/**
 * Find disable directives in `source` that suppress `ban`.
 * Line numbers are 1-based. Matches both full-line and trailing `eslint-disable-line`.
 */
function collectDisableDirectivesFromSource(source: string, file: string, ban: BannedRule = ONYX_CONNECT_BAN): SuppressedBan[] {
    const parsed = parseSource(source);
    if (!parsed) {
        return [];
    }
    const bans: SuppressedBan[] = [];
    const callOffsets = collectBannedCallOffsets(parsed.root, ban);
    const enableMatches = collectDirectiveMatches(parsed.comments, source, 'enable');
    for (const match of collectDirectiveMatches(parsed.comments, source, 'disable')) {
        const args = directiveArgs(match);
        const targetsBan = directiveTargetsBan(args, ban);
        const coversBan = isBlanketDirective(args) && blanketDirectiveCoversCall(source, match, callOffsets, enableMatches, ban);
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
function findNewBypasses(suppressedBans: readonly SuppressedBan[], rule: BannedRule = ONYX_CONNECT_BAN): SuppressedBan[] {
    const byFile = new Map<string, SuppressedBan[]>();
    for (const ban of suppressedBans) {
        const list = byFile.get(ban.file) ?? [];
        list.push(ban);
        byFile.set(ban.file, list);
    }

    const newBypasses: SuppressedBan[] = [];
    for (const [file, bans] of byFile) {
        const allowed = rule.grandfathered.get(file) ?? 0;
        if (bans.length <= allowed) {
            continue;
        }
        const sortedByLine = [...bans].sort((a, b) => a.line - b.line);
        newBypasses.push(...sortedByLine.slice(allowed));
    }
    return newBypasses;
}

export {BANNED_RULE_ID, BANNED_RULE_NAME, BANNED_RULES, GRANDFATHERED_BYPASSES, ONYX_CONNECT_BAN, ONYX_READ_BAN, collectDisableDirectivesFromSource, findNewBypasses};
export type {BannedRule, SuppressedBan};
