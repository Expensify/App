/**
 * Detection logic for new `eslint-disable` bypasses of the Onyx.connect() ban.
 *
 * `rulesdir/no-onyx-connect` (shipped by eslint-config-expensify) is a normal lint rule, so an
 * inline `eslint-disable` can silence it. The lint runner re-elevates those disables by scanning
 * source for disable directives that name the ban. No disable directive can reach this check
 * because it does not go through ESLint's message pipeline.
 *
 * Blanket `eslint-disable` / `eslint-disable-next-line` with no rule list is ignored: those
 * comments are used for other rules (e.g. ReportUtils) and must not count as a ban bypass.
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

const DISABLE_DIRECTIVE_REGEX = /(?:\/\/|\/\*)\s*eslint-disable(?:-next-line|-line)?(?<args>[^\n*]*)/g;

function directiveTargetsBan(args: string): boolean {
    const trimmed = args.replace(/--.*$/, '').trim();
    if (trimmed.length === 0) {
        return false;
    }
    return trimmed.split(',').some((part) => {
        const rule = part.trim();
        return rule === BANNED_RULE_ID || rule === BANNED_RULE_NAME || rule.endsWith(`/${BANNED_RULE_NAME}`);
    });
}

/**
 * Find disable directives in `source` that name `rulesdir/no-onyx-connect`.
 * Line numbers are 1-based. Matches both full-line and trailing `eslint-disable-line`.
 */
function collectDisableDirectivesFromSource(source: string, file: string): SuppressedBan[] {
    const bans: SuppressedBan[] = [];
    for (const match of source.matchAll(DISABLE_DIRECTIVE_REGEX)) {
        if (!directiveTargetsBan(match.groups?.args ?? '')) {
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
