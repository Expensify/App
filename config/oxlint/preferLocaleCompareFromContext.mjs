/**
 * oxlint version of rulesdir/prefer-locale-compare-from-context. The ESLint rule uses type info to check
 * that `localeCompare` is called on a string. oxlint's JS plugins don't get type info, so this copy
 * skips that check. Only strings have `localeCompare`, so the one difference is an object with its own
 * `localeCompare`, which this copy also reports.
 */
import {CONST, isInTestFile} from './vendor/expensify-rules.mjs';

const message = CONST.MESSAGE.PREFER_LOCALE_COMPARE_FROM_CONTEXT;

const meta = {
    type: 'problem',
    docs: {
        description: message,
    },
    schema: [],
};

/**
 * Reports every `x.localeCompare(...)` outside tests.
 * @param {import('eslint').Rule.RuleContext} context
 * @returns {import('eslint').Rule.RuleListener}
 */
function create(context) {
    return {
        CallExpression(node) {
            const filename = context.filename ?? context.getFilename();
            if (isInTestFile(filename)) {
                return;
            }

            if (node.callee?.type !== 'MemberExpression' || node.callee.property?.name !== 'localeCompare') {
                return;
            }

            if (!node.callee.object) {
                return;
            }

            context.report({node, message});
        },
    };
}

export {meta, create};
