import Clipboard from '@react-native-community/clipboard';

/**
 * Sets a string on the Clipboard object via @react-native-community/clipboard
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
