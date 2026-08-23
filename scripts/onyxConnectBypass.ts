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
 * ignored.
 */

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

const DISABLE_DIRECTIVE_REGEX = /(?:\/\/|\/\*)\s*eslint-disable(?<kind>-next-line|-line)?(?<args>[^\n*]*)/g;
const ENABLE_DIRECTIVE_REGEX = /(?:\/\/|\/\*)\s*eslint-enable(?<args>[^\n*]*)/g;
const ONYX_CONNECT_CALL_REGEX = /\bOnyx\s*\.\s*connect\s*\(/g;

function normalizedDirectiveArgs(args: string): string {
    return args.replace(/--.*$/, '').trim();
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

function blanketDirectiveCoversCall(source: string, match: RegExpMatchArray, callOffsets: number[], enableMatches: RegExpMatchArray[]): boolean {
    const directiveLine = lineNumberAtOffset(source, match.index ?? 0);
    const kind = match.groups?.kind;
    const directiveEnd = (match.index ?? 0) + match[0].length;
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
            const enableOffset = enableMatch.index ?? -1;
            if (enableOffset <= directiveEnd || enableOffset >= callOffset) {
                return false;
            }
            const enableArgs = enableMatch.groups?.args ?? '';
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
    const callOffsets = [...source.matchAll(ONYX_CONNECT_CALL_REGEX)].map((match) => match.index ?? -1).filter((offset) => offset >= 0);
    const enableMatches = [...source.matchAll(ENABLE_DIRECTIVE_REGEX)];
    for (const match of source.matchAll(DISABLE_DIRECTIVE_REGEX)) {
        const args = match.groups?.args ?? '';
        const targetsBan = directiveTargetsBan(args);
        const coversBan = isBlanketDirective(args) && blanketDirectiveCoversCall(source, match, callOffsets, enableMatches);
        if (!targetsBan && !coversBan) {
            continue;
        }
        const prefix = source.slice(0, match.index ?? 0);
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
