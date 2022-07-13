import Clipboard from '@react-native-community/clipboard';

/**
 * Writes the content as text on native.
 * @param {Object} content Types to write.
 * @param {String} content.markdown MD representation of the content.
 */
const writeTypes = (content) => {
    Clipboard.setString(content.markdown);
};

export default {
    ...Clipboard,
    writeTypes,
};
