import MiscClipboardFunctions from './miscClipboardFunctions';

const canSetHtml = MiscClipboardFunctions.canSetHtml;
const setString = MiscClipboardFunctions.setString;

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

export default {
    setString,
    canSetHtml,
    setHtml,
};
