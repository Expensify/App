/**
 * Detection logic for new `eslint-disable` bypasses of the Onyx lint bans.
 *
 * Two rules are policed here: `rulesdir/no-onyx-connect` (shipped by eslint-config-expensify) and this
 * repo's own `no-unsafe-onyx-read` (in `eslint-plugin-local-rules/`), which covers all three unsafe read
 * positions. Both are normal lint rules, so an inline `eslint-disable` can silence either. ESLint records
 * such silenced violations as "suppressed messages". This module finds suppressed violations of those
 * rules and flags any that go beyond the disables already present on `main`, so a new bypass can be
 * re-elevated to an error at the runner level, where no disable directive can reach it.
 */
import type {ESLint} from 'eslint';

import path from 'node:path';

/** Rule id of the Onyx.connect() ban, as exposed through eslint-plugin-rulesdir. */
const BANNED_RULE_ID = 'rulesdir/no-onyx-connect';

/**
 * Rule id of the ban on unsafe synchronous Onyx reads: during render, at module scope, and after an
 * un-awaited write in the same body. One disable of it silences all three, which is why it is policed here.
 */
const UNSAFE_READ_RULE_ID = 'rulesdir/no-unsafe-onyx-read';

/** Every rule whose inline disables are policed. A suppressed violation of anything else is ignored. */
const POLICED_RULE_IDS: ReadonlySet<string> = new Set([BANNED_RULE_ID, UNSAFE_READ_RULE_ID]);

/**
 * Disables that already exist on `main`, per rule, keyed by repo-relative path with the number of
 * occurrences in each file. Migrating the Onyx.connect() call sites to useOnyx() is already in
 * progress; any suppressed violation beyond these counts is treated as a new bypass.
 *
 * The read rule starts with no allowance at all, which is the point of adding it before any read is
 * converted: there is nothing to grandfather, so every disable of it is new.
 */
const GRANDFATHERED_BYPASSES: ReadonlyMap<string, ReadonlyMap<string, number>> = new Map<string, ReadonlyMap<string, number>>([
    [
        BANNED_RULE_ID,
        new Map([
            ['src/libs/NextStepUtils.ts', 1],
            ['src/libs/ReportNameUtils.ts', 2],
        ]),
    ],
    [UNSAFE_READ_RULE_ID, new Map()],
]);

/** A violation of a policed rule that an inline disable directive silenced. */
type SuppressedBan = {
    ruleId: string;
    file: string;
    line: number;
};

/** The fields of an ESLint result this module reads; real `ESLint.LintResult`s satisfy it. */
type ResultWithSuppressed = Pick<ESLint.LintResult, 'filePath' | 'suppressedMessages'>;

/** Pull suppressed violations of the policed rules out of ESLint results, keyed by repo-relative path. */
function collectSuppressedBans(results: readonly ResultWithSuppressed[], projectRoot: string): SuppressedBan[] {
    const bans: SuppressedBan[] = [];
    for (const result of results) {
        for (const message of result.suppressedMessages ?? []) {
            if (!message.ruleId || !POLICED_RULE_IDS.has(message.ruleId)) {
                continue;
            }
            const file = path.relative(projectRoot, result.filePath).split(path.sep).join('/');
            bans.push({ruleId: message.ruleId, file, line: message.line});
        }
    }
    return bans;
}

/** Return the suppressed bans that exceed the grandfathered allowance for their rule and file. */
function findNewBypasses(suppressedBans: readonly SuppressedBan[]): SuppressedBan[] {
    const byRuleAndFile = new Map<string, SuppressedBan[]>();
    for (const ban of suppressedBans) {
        const groupKey = `${ban.ruleId} ${ban.file}`;
        const list = byRuleAndFile.get(groupKey) ?? [];
        list.push(ban);
        byRuleAndFile.set(groupKey, list);
    }

    const newBypasses: SuppressedBan[] = [];
    for (const bans of byRuleAndFile.values()) {
        // Every ban in a group shares its rule and file, so the first one carries the group's identity.
        const first = bans.at(0);
        if (!first) {
            continue;
        }
        const allowed = GRANDFATHERED_BYPASSES.get(first.ruleId)?.get(first.file) ?? 0;
        if (bans.length <= allowed) {
            continue;
        }
        const sortedByLine = [...bans].sort((a, b) => a.line - b.line);
        newBypasses.push(...sortedByLine.slice(allowed));
    }
    return newBypasses;
}

export {BANNED_RULE_ID, UNSAFE_READ_RULE_ID, POLICED_RULE_IDS, GRANDFATHERED_BYPASSES, collectSuppressedBans, findNewBypasses};
export type {SuppressedBan, ResultWithSuppressed};
