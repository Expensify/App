import CONST from '../../CONST';

/**
 * Return visible-password keyboard type when secure text is visible,
 * otherwise return keyboardType prop provided by parent component
 * @param {Boolean} secureTextEntry
 * @param {Boolean} passwordHidden
 * @param {String} keyboardType
 * @return {String}
 */
function getKeyboardType(secureTextEntry, passwordHidden, keyboardType) {
    return secureTextEntry && !passwordHidden ? CONST.KEYBOARD_TYPE.VISIBLE_PASSWORD : keyboardType;
}

export default getKeyboardType;
