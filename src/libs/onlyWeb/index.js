/**
 * Only run the callback on Web and return the result as Boolean.
 *
 * @param {Function} callback
 * @return {Boolean} Always false on native platforms
 */
function onlyWeb(callback) {
    return Boolean(callback());
}

export default onlyWeb;
