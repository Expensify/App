// Re-elevates disable-comment bypasses of the Onyx.connect() ban, so oxlint can do what
// scripts/checkOnyxConnectBypass.ts does today.
//
// `rulesdir/no-onyx-connect` is an ordinary rule, so `// eslint-disable-next-line
// rulesdir/no-onyx-connect` silences it, and neither linter's CLI fails on a silenced violation.
// ESLint's answer is a second ESLint boot over every file containing both `Onyx.connect` and an
// `eslint-disable`, reading `result.suppressedMessages`. oxlint exposes no such list: a suppressed
// diagnostic simply disappears from the report.
//
// It does not need one. This wraps the ban a SECOND time, under its own rule id, with the directive
// predicate inverted: report only what a directive hid. Registering it costs nothing, because the
// two ids are independent, so `rulesdir/no-onyx-connect` keeps reporting the unsuppressed
// violations exactly as before and stays at parity with ESLint.
//
// Why a different id is what makes this work: oxlint honors `eslint-disable` comments for any rule
// id it knows, and `rulesdir/no-onyx-connect` is one of them, so a comment naming it silences that
// rule here too. It does not name THIS rule, so this one still reports.
//
// Known difference from the ESLint script, and the only one: a bare `// eslint-disable-next-line`
// with no rule ids disables every rule on that line, including this one, whereas ESLint's
// `suppressedMessages` still records the violation. A bare disable over an `Onyx.connect` call is a
// much louder thing in review than a targeted one, and the ESLint script keeps running until the
// flip, so this is documented rather than worked around.
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {isSuppressed, parseDirectives, reportLine} from './eslintDirectives.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/** The id the repo's disable comments name, i.e. the one this rule is the shadow of. */
const BANNED_ESLINT_RULE_ID = 'rulesdir/no-onyx-connect';

/**
 * Disables of the ban that predate it, keyed by repo-relative path with the number of occurrences
 * allowed in each file. Kept identical to GRANDFATHERED_BYPASSES in scripts/onyxConnectBypass.ts,
 * which is the one this replaces; when that script goes, this becomes the only copy.
 *
 * Measured 2026-08-21: the repo currently has ZERO suppressed `no-onyx-connect` violations, so both
 * copies of this map are allowances for call sites that have already been migrated to useOnyx().
 */
const GRANDFATHERED_BYPASSES = new Map([
    ['src/libs/NextStepUtils.ts', 1],
    ['src/libs/ReportNameUtils.ts', 2],
]);

function relativePath(filename) {
    return path.relative(repoRoot, filename).split(path.sep).join('/');
}

/**
 * Wraps the ban so the copy reports only the violations a disable comment hid, beyond the
 * grandfathered allowance for the file. `grandfathered` is a parameter so a probe can build the same
 * rule with an empty map and see what the allowance is hiding.
 */
function withBypassReporting(rule, {grandfathered = GRANDFATHERED_BYPASSES, eslintRuleId = BANNED_ESLINT_RULE_ID} = {}) {
    return {
        ...rule,
        create(context) {
            const sourceCode = context.sourceCode ?? context.getSourceCode();
            const filename = context.filename ?? context.getFilename();
            const hidden = [];
            let directives;

            const collectingContext = Object.create(context, {
                report: {
                    value(...args) {
                        const line = reportLine(args);
                        if (line == null) {
                            return;
                        }
                        directives ??= parseDirectives(sourceCode.getAllComments());
                        if (isSuppressed(directives, eslintRuleId, line)) {
                            hidden.push({line, args});
                        }
                    },
                },
            });

            const visitors = rule.create(collectingContext) ?? {};
            const existingExit = visitors['Program:exit'];
            return {
                ...visitors,
                'Program:exit': function (node) {
                    existingExit?.call(this, node);
                    const allowed = grandfathered.get(relativePath(filename)) ?? 0;
                    // Sorted by line and sliced the same way findNewBypasses does, so which
                    // occurrence counts as grandfathered matches the script it replaces.
                    const hiddenToReport = hidden.sort((first, second) => first.line - second.line).slice(allowed);
                    for (const {args} of hiddenToReport) {
                        context.report(...args);
                    }
                },
            };
        },
    };
}

export {withBypassReporting};
