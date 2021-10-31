const _ = require('underscore');
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
                if (isFromNodeModules(node.source.value)) {
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
