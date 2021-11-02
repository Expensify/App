const lodashGet = require('lodash/get');

const message = 'compose() is not necessary when passed a single argument';

module.exports = {
    message,
    rule: {
        create: context => ({
            CallExpression(node) {
                const name = lodashGet(node, 'callee.name');
                if (!name) {
                    return;
                }

                if (name !== 'compose') {
                    return;
                }

                if (node.arguments.length !== 1) {
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
