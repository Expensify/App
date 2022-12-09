// on Web/desktop this import will be replaced with `react-native-web`
import {Clipboard} from 'react-native-web';
import lodashGet from 'lodash/get';
import CONST from '../../CONST';
import * as Browser from '../Browser';

const canSetHtml = () => lodashGet(navigator, 'clipboard.write');

/**
 * Deprecated method to write the content as HTML to clipboard.
 * @param {String} html HTML representation
 * @param {String} text Plain text representation
 */
function setHTMLSync(html, text) {
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

        // The 'copy' command can throw a SecurityError exception.
        // See https://dvcs.w3.org/hg/editing/raw-file/tip/editing.html#the-copy-command for more details.
        // eslint-disable-next-line no-empty
    } catch (e) {}

    selection.removeAllRanges();
    document.body.removeChild(node);
}

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
        setHTMLSync(html, text);
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
