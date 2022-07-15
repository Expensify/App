import Clipboard from '@react-native-community/clipboard';

/**
 * Writes the content as a string on native.
 * @param {Object} content Platfrom-specific content to write
 * @param {String} content.text Text representation of the content for native
 */
const setContent = (content) => {
    if (!content) {
        return;
    }
    Clipboard.setString(content.text);
};

export default {
    ...Clipboard,
    setContent,
};
