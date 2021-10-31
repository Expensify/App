const message = 'Do not update Onyx values from inside React components. Only actions should update Onyx data.';
const isReactViewFile = require('../utils').isReactViewFile;

module.exports = {
    message,
    rule: {
        create: context => ({
            Identifier(node) {
                if (!isReactViewFile(context.getFilename())) {
                    return;
                }

                if (node.name !== 'Onyx') {
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
