// oxlint drops a suppressed diagnostic from its report entirely and exposes no equivalent of ESLint's
// `result.suppressedMessages`, so the ban is wrapped a second time under its own rule id with the
// directive predicate inverted: report only what an `eslint-disable` naming the ban hid. A bare
// `eslint-disable-next-line` with no ids silences this copy too, which ESLint would still have recorded.
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {isSuppressed, parseDirectives, reportLine} from './eslintDirectives.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const BANNED_ESLINT_RULE_ID = 'rulesdir/no-onyx-connect';

const GRANDFATHERED_BYPASSES = new Map([
    ['src/libs/NextStepUtils.ts', 1],
    ['src/libs/ReportNameUtils.ts', 2],
]);

function relativePath(filename) {
    return path.relative(repoRoot, filename).split(path.sep).join('/');
}

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
