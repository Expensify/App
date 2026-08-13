// Type-free rewrite of rulesdir/prefer-locale-compare-from-context for oxlint.
//
// ESLint's version (node_modules/eslint-config-expensify/eslint-plugin-expensify/
// prefer-locale-compare-from-context.js) asks the type checker one question:
//
//     const objectType = typeChecker.getTypeAtLocation(objectTsNode);
//     return isString(objectType);
//
// oxlint's JS plugins get no type information, so that call cannot be made. It also does not need
// to be: `localeCompare` exists on exactly one built-in prototype, String. So "the receiver is a
// string" and "the member is named localeCompare" agree on every value the standard library can
// produce, and the rewrite drops the type query rather than approximating it.
//
// Known divergence, deliberately not papered over: an object that defines its OWN localeCompare
// method. ESLint stays silent there (the receiver is not a string), this rule reports. Measured
// 2026-08-12: `src/` contains 4 occurrences of `.localeCompare(`, one of them inside a JSDoc
// block, and all 3 real call sites have a string receiver. The divergence is covered as an
// expected difference by oxlint-migration/checkLocaleComparePort.py, so it fails loudly if the shape
// ever stops being the only one.
//
// The message and the test-file skip are imported from the real rule's own modules rather than
// copied, so neither can drift.
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const require = createRequire(import.meta.url);
const pluginDir = path.dirname(fileURLToPath(import.meta.url));
const expensifyPlugin = path.resolve(pluginDir, '../../node_modules/eslint-config-expensify/eslint-plugin-expensify');

/** These modules are ESM; `require` hands back the namespace, so unwrap a default if there is one. */
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

            // Guard kept from the original: a receiver-less call cannot be judged.
            if (!node.callee.object) {
                return;
            }

            context.report({node, message});
        },
    };
}

export {meta, create};
