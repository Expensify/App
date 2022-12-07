import CONST from '../../CONST';
import * as Browser from '../Browser';
import MiscClipboardFunctions from './miscClipboardFunctions';

const canSetHtml = MiscClipboardFunctions.canSetHtml;
const setString = MiscClipboardFunctions.setString;

/**
 * Deprecated method to write the content as HTML to clipboard.
 * @param {String} html HTML representation
 * @param {String} text Plain text representation
 */
const copyToClipboardDeprecated = (html, text) => {
    const node = document.createElement('span');
    node.textContent = html;
    node.style.all = 'unset';
    node.style.opacity = '0';
    node.style.position = 'absolute';
    node.style.whiteSpace = 'pre-wrap';
    node.style.userSelect = 'text';
    node.addEventListener('copy', (e) => {
        e.stopPropagation();
        e.preventDefault();
        e.clipboardData.clearData();
        e.clipboardData.setData('text/html', html);
        e.clipboardData.setData('text/plain', text);
    });
    document.body.appendChild(node);

    const selection = window.getSelection();
    selection.removeAllRanges();
    const range = document.createRange();
    range.selectNodeContents(node);
    selection.addRange(range);

    try {
        document.execCommand('copy');
        // eslint-disable-next-line no-empty
    } catch (e) {}

    selection.removeAllRanges();
    document.body.removeChild(node);
};

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

    if (CONST.BROWSER.SAFARI === Browser.getBrowser()) {
        // Safari sanitize "text/html" data before writing to the pasteboard when using Clipboard API,
        // whitespaces in the start of line are stripped away. We use the deprecated method to copy
        // contents as HTML and keep whitespaces in the start of line on Safari.
        // See https://webkit.org/blog/10855/async-clipboard-api/ for more details.
        copyToClipboardDeprecated(html, text);
    } else {
        navigator.clipboard.write([
            // eslint-disable-next-line no-undef
            new ClipboardItem({
                'text/html': new Blob([html], {type: 'text/html'}),
                'text/plain': new Blob([text], {type: 'text/plain'}),
            }),
        ]);
    }
};

export default {
    setString,
    canSetHtml,
    setHtml,
};
