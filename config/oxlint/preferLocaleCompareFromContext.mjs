// oxlint's JS plugins get no type information, so this drops the `isString(getTypeAtLocation(...))`
// receiver check of ESLint's rulesdir/prefer-locale-compare-from-context. Only String.prototype has
// `localeCompare`; an object defining its own is the one divergence.
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const require = createRequire(import.meta.url);
const pluginDir = path.dirname(fileURLToPath(import.meta.url));
const expensifyPlugin = path.resolve(pluginDir, '../../node_modules/eslint-config-expensify/eslint-plugin-expensify');

/** `require` of these ESM modules returns the namespace, so unwrap `default`. */
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
