import Clipboard from '@react-native-clipboard/clipboard';

/**
 * Sets a string on the Clipboard object via @react-native-clipboard/clipboard
 *
 * @param {String} text
 */
const setString = (text) => {
    Clipboard.setString(text);
};

export default {
    setString,

    // We don't want to set HTML on native platforms so noop them.
    canSetHtml: () => false,
    setHtml: () => {},
};
