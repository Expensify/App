// on Web/desktop this import will be replaced with `react-native-web`
import _ from 'lodash';
import {Clipboard} from 'react-native-web';

/**
 * Writes the content as types if available, otherwise as text.
 * @param {Object} content Types to write.
 * @param {String} content.text Plain text representation of the content.
 * @param {String} content.html HTML representation of the content.
 * @param {String} content.markdown MD representation of the content.
 */
const writeTypes = (content) => {
    if (!content) {
        return;
    }
    if (!_.get(navigator, 'clipboard.write')) {
        Clipboard.setString(content.markdown);
        return;
    }
    navigator.clipboard.write([
        // eslint-disable-next-line no-undef
        new ClipboardItem({
            'text/html': new Blob([content.html], {type: 'text/html'}),
            'text/plain': new Blob([content.text], {type: 'text/plain'}),
        }),
    ]);
};

export default {
    ...Clipboard,
    writeTypes,
};
