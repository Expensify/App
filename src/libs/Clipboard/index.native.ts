import Clipboard from '@react-native-clipboard/clipboard';
import {CanSetHtml, SetHtml, SetString} from './types';

/**
 * Sets a string on the Clipboard object via @react-native-clipboard/clipboard
 */
const setString: SetString = (text) => {
    Clipboard.setString(text);
};

// We don't want to set HTML on native platforms so noop them.
const canSetHtml: CanSetHtml = () => false;
const setHtml: SetHtml = () => {};

export default {
    setString,
    canSetHtml,
    setHtml,
};
