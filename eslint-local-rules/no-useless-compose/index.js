const message = 'compose() is not necessary when passed a single argument';

module.exports = {
    message,
    rule: {
        create: context => ({
            CallExpression(node) {
                if (node.callee.name !== 'compose') {
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
