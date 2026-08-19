/**
 * Detection logic for new `eslint-disable` bypasses of the Onyx.connect() ban.
 *
 * `rulesdir/no-onyx-connect` (shipped by eslint-config-expensify) is a normal lint rule, so an
 * inline `eslint-disable` can silence it. ESLint records such silenced violations as "suppressed
 * messages". This module finds suppressed `rulesdir/no-onyx-connect` violations and flags any that
 * go beyond the disables already present on `main`, so a new bypass can be re-elevated to an error
 * at the runner level — where no disable directive can reach it.
 */
import type {ESLint} from 'eslint';

import path from 'node:path';

/** Rule id of the Onyx.connect() ban, as exposed through eslint-plugin-rulesdir. */
const BANNED_RULE_ID = 'rulesdir/no-onyx-connect';

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

/** The fields of an ESLint result this module reads; real `ESLint.LintResult`s satisfy it. */
type ResultWithSuppressed = Pick<ESLint.LintResult, 'filePath' | 'suppressedMessages'>;

/** Pull suppressed `no-onyx-connect` violations out of ESLint results, keyed by repo-relative path. */
function collectSuppressedBans(results: readonly ResultWithSuppressed[], projectRoot: string): SuppressedBan[] {
    const bans: SuppressedBan[] = [];
    for (const result of results) {
        for (const message of result.suppressedMessages ?? []) {
            if (message.ruleId !== BANNED_RULE_ID) {
                continue;
            }
            const file = path.relative(projectRoot, result.filePath).split(path.sep).join('/');
            bans.push({file, line: message.line});
        }
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

export {BANNED_RULE_ID, GRANDFATHERED_BYPASSES, collectSuppressedBans, findNewBypasses};
export type {SuppressedBan, ResultWithSuppressed};
