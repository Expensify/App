function getPasswordAutocompleteType() {
    return 'current-password';
}

/**
 * Set input Native Props on Web Platform
 *
 * @param {Object} input
 * @param {String} prop
 * @param {any} value
 */
function setNativePropsWeb(input, prop, value) {
    if (input) {
        input.setNativeProps({
            [prop]: value,
        });
    }
}

export {
    getPasswordAutocompleteType,
    setNativePropsWeb,
};
