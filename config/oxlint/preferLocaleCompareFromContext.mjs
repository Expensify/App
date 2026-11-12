/**
 * oxlint version of rulesdir/prefer-locale-compare-from-context. The ESLint rule uses type info to check
 * that `localeCompare` is called on a string. oxlint's JS plugins don't get type info, so this copy
 * skips that check. Only strings have `localeCompare`, so the one difference is an object with its own
 * `localeCompare`, which this copy also reports.
 */
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const require = createRequire(import.meta.url);
const pluginDir = path.dirname(fileURLToPath(import.meta.url));
const expensifyPlugin = path.resolve(pluginDir, '../../node_modules/eslint-config-expensify/eslint-plugin-expensify');

/**
 * Loads a module from eslint-plugin-expensify, so this copy uses the same message as the original rule.
 * `require` of these ESM modules returns the namespace, so unwrap `default`.
 * @param {string} relative path inside eslint-plugin-expensify
 * @returns {any}
 */
function load(relative) {
    const module = require(path.join(expensifyPlugin, relative));
    return module?.default ?? module;
}

const CONST = load('CONST.js');
const {isInTestFile} = require(path.join(expensifyPlugin, 'utils/index.js'));

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
