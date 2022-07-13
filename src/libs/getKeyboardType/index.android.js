import CONST from '../../CONST';

/**
 * Return visible-password keyboard type when secure text is visible on Android,
 * otherwise return keyboardType prop provided by parent component
 * @param {Boolean} secureTextEntry
 * @param {Boolean} passwordHidden
 * @param {String} keyboardType
 * @return {String}
 */
function getSecureEntryKeyboardType(secureTextEntry, passwordHidden, keyboardType) {
    return secureTextEntry && !passwordHidden ? CONST.KEYBOARD_TYPE.VISIBLE_PASSWORD : keyboardType;
}

export default getSecureEntryKeyboardType;
