/**
 * @param {String} filename
 * @returns {Boolean}
 */
function isReactViewFile(filename) {
    return filename.includes('/src/pages/') || filename.includes('/src/components');
}

module.exports = {
    isReactViewFile,
};
