const lodashGet = require('lodash/get');

/**
 * @param {String} name
 * @returns {Boolean}
 */
function isNegatedVariableName(name) {
    if (!name) {
        return;
    }

    return name.includes('Not')
      || name.includes('isNot')
      || name.includes('cannot')
      || name.includes('shouldNot')
      || name.includes('cant')
      || name.includes('dont');
}

const message = 'Do not use negated variable names';

module.exports = {
    message,
    rule: {
        create: context => ({
            FunctionDeclaration(node) {
                const name = lodashGet(node, 'id.name');
                if (!name) {
                    return;
                }

                if (!isNegatedVariableName(name)) {
                    return;
                }

                context.report({
                    node,
                    message,
                });
            },
            VariableDeclarator(node) {
                const name = lodashGet(node, 'id.name');
                if (!name) {
                    return;
                }

                if (!isNegatedVariableName(node.id.name)) {
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
