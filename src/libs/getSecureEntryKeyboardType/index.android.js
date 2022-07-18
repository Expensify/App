import CONST from '../../CONST';

/**
 * Return visible-password keyboard type when secure text is visible on Android,
 * otherwise return keyboardType passed as function parameter
 * @param {String} keyboardType
 * @param {Boolean} secureTextEntry
 * @param {Boolean} passwordHidden
 * @return {String}
 */
export default (keyboardType, secureTextEntry, passwordHidden) => (secureTextEntry && !passwordHidden ? CONST.KEYBOARD_TYPE.VISIBLE_PASSWORD : keyboardType);
