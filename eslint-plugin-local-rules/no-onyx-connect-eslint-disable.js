const name = 'no-onyx-connect-eslint-disable';

// The ban itself lives in eslint-config-expensify's `rulesdir/no-onyx-connect` rule. That rule can be
// silenced with an inline eslint-disable directive, so this rule removes that escape hatch by making any
// such directive a lint error in its own right. New code must use the useOnyx() hook instead of Onyx.connect().
const BANNED_RULE_IDS = new Set(['no-onyx-connect', 'rulesdir/no-onyx-connect']);

// Matches the first token of an eslint-disable comment, capturing the kind suffix and the (optional) rule list.
const DISABLE_DIRECTIVE_REGEX = /^eslint-disable(-next-line|-line)?(?:\s+([\s\S]*))?$/;

const meta = {
    type: 'problem',
    docs: {
        description: 'Disallow silencing the Onyx.connect() ban (rulesdir/no-onyx-connect) with an inline eslint-disable directive.',
        recommended: 'error',
    },
    schema: [],
    messages: {
        noDisable: 'Onyx.connect() is banned and the ban cannot be bypassed with eslint-disable. Use the useOnyx() hook to read Onyx data instead.',
    },
};

// Onyx.connect() is still allowed in test setup, matching the eslint-config-expensify convention, so there is
// nothing to enforce there.
function isInTestFile(filename) {
    return filename.includes('/tests/');
}

// Parses an eslint-disable comment into its kind ('disable' | 'disable-line' | 'disable-next-line')
// and the list of rule ids it targets (an empty list means a blanket disable that targets every rule).
function parseDisableDirective(comment) {
    const text = comment.value.trim();
    const match = DISABLE_DIRECTIVE_REGEX.exec(text);
    if (!match) {
        return null;
    }

    const kind = match[1] ? `disable${match[1]}` : 'disable';
    // Strip any `-- description` suffix, then split the remaining rule list on commas/whitespace.
    const rulesPart = (match[2] ?? '').split('--').at(0)?.trim() ?? '';
    const rules = rulesPart ? rulesPart.split(/[\s,]+/).filter(Boolean) : [];

    return {kind, rules};
}

function create(context) {
    const sourceCode = context.getSourceCode();

    if (isInTestFile(context.getFilename())) {
        return {};
    }

    function lineHasOnyxConnect(lineNumber) {
        const line = sourceCode.lines.at(lineNumber - 1);
        return typeof line === 'string' && line.includes('Onyx.connect(');
    }

    return {
        Program() {
            for (const comment of sourceCode.getAllComments()) {
                const directive = parseDisableDirective(comment);
                if (!directive) {
                    continue;
                }

                // An explicit `no-onyx-connect` disable is always an attempt to bypass the ban.
                const namesBannedRule = directive.rules.some((rule) => BANNED_RULE_IDS.has(rule));

                // A blanket disable (no rule list) silences every rule, so it bypasses the ban too — but only
                // flag it when it actually neighbors an Onyx.connect() call, leaving unrelated blanket disables alone.
                let bypassesBan = namesBannedRule;
                if (!bypassesBan && directive.rules.length === 0) {
                    const commentLine = comment.loc.start.line;
                    if (directive.kind === 'disable-next-line') {
                        bypassesBan = lineHasOnyxConnect(commentLine + 1);
                    } else if (directive.kind === 'disable-line') {
                        bypassesBan = lineHasOnyxConnect(commentLine);
                    } else {
                        // Block `/* eslint-disable */` disables from here to the end of the file.
                        bypassesBan = sourceCode.lines.slice(commentLine).some((line) => line.includes('Onyx.connect('));
                    }
                }

                if (!bypassesBan) {
                    continue;
                }

                context.report({loc: comment.loc, messageId: 'noDisable'});
            }
        },
    };
}

export {name, meta, create};
