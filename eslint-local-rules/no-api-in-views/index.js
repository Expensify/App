const {isInActionFile} = require('../utils');

const message = 'Do not call API directly outside of actions methods. Only actions should make API requests.';

module.exports = {
    message,
    rule: {
        create: context => ({
            Identifier(node) {
                if (isInActionFile(context.getFilename())) {
                    return;
                }

                if (node.name !== 'API') {
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
