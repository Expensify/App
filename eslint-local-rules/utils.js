const lodashGet = require('lodash/get');

/**
 * @param {String} filename
 * @returns {Boolean}
 */
function isReactViewFile(filename) {
    return filename.includes('/src/pages/') || filename.includes('/src/components');
}

/**
 * @param {Object} node
 * @returns {Boolean}
 */
function isOnyxMethodCall(node) {
    return lodashGet(node, 'object.name') === 'Onyx';
}

/**
 * @param {String} filename
 * @returns {Boolean}
 */
function isInActionFile(filename) {
    return filename.includes('/src/libs/actions/');
}

module.exports = {
    isReactViewFile,
    isOnyxMethodCall,
    isInActionFile,
};
