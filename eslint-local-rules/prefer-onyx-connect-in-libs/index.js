const lodashGet = require('lodash/get');
const {isOnyxMethodCall} = require('../utils');

const message = 'Only call Onyx.connect() from inside a /src/libs/** file. React components and non-library code should not use Onyx.connect()';

/**
 * @param {String} filename
 * @returns {Boolean}
 */
function isInLibs(filename) {
    return filename.includes('/src/libs/');
}

module.exports = {
    message,
    rule: {
        create: context => ({
            MemberExpression(node) {
                const filename = context.getFilename();

                if (!isOnyxMethodCall(node)) {
                    return;
                }

                const methodName = lodashGet(node, 'property.name');
                if (methodName !== 'connect' || isInLibs(filename)) {
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
