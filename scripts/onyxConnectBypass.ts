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
 * ignored. Call sites are found via the TypeScript AST so comments and grouping parens cannot
 * hide a banned member access from a source scan.
 */

import ts from 'typescript';

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

function collectDirectiveMatches(source: string, directive: 'disable' | 'enable'): DirectiveMatch[] {
    const matches: DirectiveMatch[] = [];
    const scanner = ts.createScanner(ts.ScriptTarget.Latest, false, ts.LanguageVariant.Standard, source);
    while (scanner.scan() !== ts.SyntaxKind.EndOfFileToken) {
        const token = scanner.getToken();
        if (token !== ts.SyntaxKind.SingleLineCommentTrivia && token !== ts.SyntaxKind.MultiLineCommentTrivia) {
            continue;
        }
        const index = scanner.getTokenStart();
        const text = scanner.getTokenText();
        const body = text.startsWith('//') ? text.slice(2) : text.slice(2, -2);
        const directiveMatch = body.match(new RegExp(`^\\s*eslint-${directive}(?<kind>-next-line|-line)?(?<args>[\\s\\S]*)$`));
        if (!directiveMatch) {
            continue;
        }
        matches.push({index, text, kind: directiveMatch.groups?.kind, args: directiveMatch.groups?.args ?? ''});
    }
    return matches;
}

function directiveKind(match: DirectiveMatch): string | undefined {
    return match.kind;
}

function directiveArgs(match: DirectiveMatch): string {
    return match.args;
}

function unwrapExpression(node: ts.Expression): ts.Expression {
    let current = node;
    while (ts.isParenthesizedExpression(current) || ts.isAsExpression(current) || ts.isSatisfiesExpression(current) || ts.isNonNullExpression(current)) {
        current = current.expression;
    }
    return current;
}

function collectOnyxConnectCallOffsets(source: string, file: string): number[] {
    const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const offsets: number[] = [];
    const visit = (node: ts.Node) => {
        if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) && !node.expression.questionDotToken && node.expression.name.text === 'connect') {
            const object = unwrapExpression(node.expression.expression);
            if (ts.isIdentifier(object) && object.text === 'Onyx') {
                offsets.push(node.getStart(sourceFile));
            }
        }
        ts.forEachChild(node, visit);
    };
    visit(sourceFile);
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
    const bans: SuppressedBan[] = [];
    const callOffsets = collectOnyxConnectCallOffsets(source, file);
    const enableMatches = collectDirectiveMatches(source, 'enable');
    for (const match of collectDirectiveMatches(source, 'disable')) {
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
