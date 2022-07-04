/**
 * Return keyboardType prop provided by parent component on iOS
 * @param {Boolean} secureTextEntry
 * @param {Boolean} passwordHidden
 * @param {String} keyboardType
 * @return {String}
 */
function getKeyboardType(secureTextEntry, passwordHidden, keyboardType) {
    return keyboardType;
}

export default getKeyboardType;
