// on Web/desktop this import will be replaced with `react-native-web`
import {Clipboard} from 'react-native-web';
import lodashGet from 'lodash/get';

const canSetHtml = () => lodashGet(navigator, 'clipboard.write');

/**
 * Writes the content as HTML if the web client supports it.
 * @param {String} html HTML representation
 * @param {String} text Plain text representation
 */
const setHtml = (html, text) => {
    if (!html || !text) {
        return;
    }

    if (!canSetHtml()) {
        throw new Error('clipboard.write is not supported on this platform, thus HTML cannot be copied.');
    }

    navigator.clipboard.write([
        // eslint-disable-next-line no-undef
        new ClipboardItem({
            'text/html': new Blob([html], {type: 'text/html'}),
            'text/plain': new Blob([text], {type: 'text/plain'}),
        }),
    ]);
};

/**
 * Sets a string on the Clipboard object via react-native-web
 *
 * @param {String} text
 */
const setString = (text) => {
    Clipboard.setString(text);
};

export default {
    setString,
    canSetHtml,
    setHtml,
};
