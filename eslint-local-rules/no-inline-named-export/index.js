const message = 'Do not inline named exports';

module.exports = {
    message,
    rule: {
        create: context => ({
            ExportNamedDeclaration(node) {
                if (!node.declaration) {
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
