const _ = require('underscore');
const lodashGet = require('lodash/get');
const {isOnyxMethodCall, isInActionFile} = require('../utils');

const message = 'Only actions should directly set or modify Onyx data. Please move this logic into a suitable action.';

/**
 * @param {String} methodName
 * @returns {Boolean}
 */
function isDataSettingMethod(methodName) {
    return _.includes(['set', 'merge', 'mergeCollection'], methodName);
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
                if (!isDataSettingMethod(methodName) || isInActionFile(context.getFilename(filename))) {
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
