/**
 * Return keyboardType prop provided by parent component on Web/Desktop/iOS
 * @param {Boolean} secureTextEntry
 * @param {Boolean} passwordHidden
 * @param {String} keyboardType
 * @return {String}
 */
function getSecureEntryKeyboardType(secureTextEntry, passwordHidden, keyboardType) {
    return keyboardType;
}

export default getSecureEntryKeyboardType;
