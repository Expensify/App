// oxlint's JS plugins get no type information, so the type query ESLint's
// rulesdir/prefer-locale-compare-from-context makes (`isString(getTypeAtLocation(...))`) cannot be made
// here. `localeCompare` exists on exactly one built-in prototype, so the receiver check is dropped
// rather than approximated. The resulting divergence on an object with its own `localeCompare` is
// covered by oxlint-migration/checkLocaleComparePort.py.
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

            if (!node.callee.object) {
                return;
            }

            context.report({node, message});
        },
    };
}

export {meta, create};
