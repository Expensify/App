import CONST from '../../CONST';
import GetSecureEntryKeyboardType from './types';

/**
 * Return visible-password keyboard type when secure text is visible on Android,
 * otherwise return keyboardType passed as function parameter
 */
const getSecureEntryKeyboardType: GetSecureEntryKeyboardType = (keyboardType, secureTextEntry, passwordHidden) =>
    secureTextEntry && !passwordHidden ? CONST.KEYBOARD_TYPE.VISIBLE_PASSWORD : keyboardType;

export default getSecureEntryKeyboardType;
