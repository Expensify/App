import RNCClipboard from '@react-native-community/clipboard';
import {SetString, Clipboard} from './types';

/**
 * Sets a string on the Clipboard object via @react-native-community/clipboard
 */
const setString: SetString = (text) => {
    RNCClipboard.setString(text);
};

const clipboard: Clipboard = {
    setString,

    // We don't want to set HTML on native platforms so noop them.
    canSetHtml: () => false,
    setHtml: () => {},
};

export default clipboard;
