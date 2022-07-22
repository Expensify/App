// on Web/desktop this import will be replaced with `react-native-web`
import _ from 'lodash';
import {Clipboard} from 'react-native-web';

const canSetHtml = () => _.get(navigator, 'clipboard.write');

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
        throw new Error('HTML is not supported on this platform');
    }

    navigator.clipboard.write([
        // eslint-disable-next-line no-undef
        new ClipboardItem({
            'text/html': new Blob([html], {type: 'text/html'}),
            'text/plain': new Blob([text], {type: 'text/plain'}),
        }),
    ]);
};

export default {
    ...Clipboard,
    canSetHtml,
    setHtml,
};
