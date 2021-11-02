const _ = require('underscore');
const lodashGet = require('lodash/get');

const message = 'Do not import individual exports from local modules. Prefer \'import * as\' syntax.';

/**
 * @param {String} source
 * @returns {Boolean}
 */
function isFromNodeModules(source) {
    return !source.startsWith('.') && !source.startsWith('..');
}

/**
 * @param {Array} specifiers
 * @returns {Boolean}
 */
function isEverySpecifierImport(specifiers = []) {
    return _.every(specifiers, specifier => specifier.type === 'ImportSpecifier');
}

module.exports = {
    message,
    rule: {
        create: context => ({
            ImportDeclaration(node) {
                const sourceValue = lodashGet(node, 'source.value');
                if (!sourceValue) {
                    return;
                }

                if (isFromNodeModules(sourceValue)) {
                    return;
                }

                if (!isEverySpecifierImport(node.specifiers)) {
                    return;
                }

                context.report({
                    node,
                    message,
                });
            },
        }),
    },
};
