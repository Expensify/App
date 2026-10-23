/**
 * Finds inline `eslint-disable` directives of the rules in `REASONED_RULES` that give no reason.
 * Unlike the bans in `onyxLintBypass.ts`, these rules may be disabled, but only one line at a time
 * and only with a reason after `--`. The reason then sits next to the exception, where a reviewer
 * can judge it.
 *
 * A directive counts when it names the rule, in the `-line` or `-next-line` form, and its text after
 * `--` holds fewer than `MIN_REASON_LENGTH` letters or digits. A block `eslint-disable` that names the
 * rule always counts, even with a reason: one sentence cannot vouch for every read under it. Blanket
 * directives that name no rule are left to `onyxLintBypass.ts`. A file Babel cannot parse fails closed:
 * every disable naming the rule counts. An `eslint` config comment naming the rule always counts.
 */

import {
    collectDirectiveMatches,
    configDirectiveNamesBan,
    directiveDescription,
    directiveTargetsBan,
    extractCommentsByRegex,
    isCheckedSourceFile,
    lineNumberAtOffset,
    parseSource,
} from './onyxLintBypass';

/** Fewest letters and digits after `--` that count as a reason, so `-- ok`, `-- todo` or a row of dashes does not pass. */
const MIN_REASON_LENGTH = 12;

type ReasonedRule = {
    id: string;
    name: string;
    appliesTo: (file: string) => boolean;
    searchTerms: string[];
    message: string;
};

const ONYX_SNAPSHOT_KEY_RULE: ReasonedRule = {
    id: 'rulesdir/no-onyx-get-snapshot-key',
    name: 'no-onyx-get-snapshot-key',
    appliesTo: isCheckedSourceFile,
    searchTerms: ['no-onyx-get-snapshot-key', 'eslint'],
    message: `A disable of rulesdir/no-onyx-get-snapshot-key gives no reason, or is a block eslint-disable or an eslint config comment. Each exception must say, on the line it covers, why live data is right for this Search snapshot key, so a reviewer can judge it. Use eslint-disable-next-line or eslint-disable-line with a reason of at least ${MIN_REASON_LENGTH} letters or digits after \`--\`, for example: \`// eslint-disable-next-line rulesdir/no-onyx-get-snapshot-key -- replaces a module-level Onyx.connect used only by handlers, never read a snapshot\`.`,
};

const REASONED_RULES: ReasonedRule[] = [ONYX_SNAPSHOT_KEY_RULE];

type UnreasonedDisable = {
    file: string;
    line: number;
};

function hasReason(args: string): boolean {
    return (directiveDescription(args).match(/[\p{L}\p{N}]/gu) ?? []).length >= MIN_REASON_LENGTH;
}

/** Every disable of `rule` in `source` that lacks an acceptable reason. Lines are 1-based. */
function collectUnreasonedDisables(source: string, filePath: string, rule: ReasonedRule = ONYX_SNAPSHOT_KEY_RULE): UnreasonedDisable[] {
    const parsed = parseSource(source, filePath);
    // Fail closed: when Babel cannot parse the file, comments come from a regex and every directive naming the rule counts
    const comments = parsed ? parsed.comments : extractCommentsByRegex(source);
    const unreasoned: UnreasonedDisable[] = [];
    for (const match of collectDirectiveMatches(comments, source, 'disable')) {
        if (!directiveTargetsBan(match.args, rule)) {
            continue;
        }
        const isLineForm = match.kind === '-line' || match.kind === '-next-line';
        if (parsed && isLineForm && hasReason(match.args)) {
            continue;
        }
        unreasoned.push({file: filePath, line: lineNumberAtOffset(source, match.index)});
    }
    // A config comment turns the rule off for the whole file, so no reason can cover it
    for (const match of collectDirectiveMatches(comments, source, 'config')) {
        if (configDirectiveNamesBan(match.args, rule)) {
            unreasoned.push({file: filePath, line: lineNumberAtOffset(source, match.index)});
        }
    }
    return unreasoned.sort((a, b) => a.line - b.line);
}

export {MIN_REASON_LENGTH, ONYX_SNAPSHOT_KEY_RULE, REASONED_RULES, collectUnreasonedDisables};
export type {ReasonedRule};
