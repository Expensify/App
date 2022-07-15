// on Web/desktop this import will be replaced with `react-native-web`
import _ from 'lodash';
import {Clipboard} from 'react-native-web';

/**
 * Writes the content as rich types if provided and the web client supports it, otherwise as a string.
 * @param {Object} content Platfrom-specific content to write
 * @param {String} content.text Text representation of the content for web
 * @param {String} [content.html] Html representation of the content for web
 */
const setContent = (content) => {
    if (!content) {
        return;
    }

    // If HTML is present, try to write rich types.
    if (content.html) {
        if (!_.get(navigator, 'clipboard.write')) {
            Clipboard.setString(content.text);
            throw new Error('Rich types are not supported on this platform');
        }

        navigator.clipboard.write([
            // eslint-disable-next-line no-undef
            new ClipboardItem({
                'text/html': new Blob([content.html], {type: 'text/html'}),
                'text/plain': new Blob([content.text], {type: 'text/plain'}),
            }),
        ]);
    } else {
        Clipboard.setString(content.text);
    }
};

export default {
    ...Clipboard,
    setContent,
};
