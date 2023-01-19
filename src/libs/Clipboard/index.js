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
    let originalSelection = null;
    const firstAnchorChild = selection.anchorNode.firstChild;

    if(firstAnchorChild && isTextElement(firstAnchorChild))
        originalSelection = getInputSelection(firstAnchorChild);
    else
        originalSelection = saveSelection(selection);

    selection.removeAllRanges();
    const range = document.createRange();
    range.selectNodeContents(node);
    selection.addRange(range);

    try {
        document.execCommand('copy');
    } catch (e) {
        // The 'copy' command can throw a SecurityError exception, we ignore this exception on purpose.
        // See https://dvcs.w3.org/hg/editing/raw-file/tip/editing.html#the-copy-command for more details.
    }

    selection.removeAllRanges();

    if(firstAnchorChild && isTextElement(firstAnchorChild))
        firstAnchorChild.setSelectionRange(originalSelection.start, originalSelection.end, originalSelection.direction);
    else
        restoreSelection(selection, originalSelection);

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

const isTextElement = (el) => {
    if (el instanceof HTMLInputElement) {
        // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#input_types
        if (/|text|email|number|password|search|tel|url/.test(el.type || '')) {
            return true;
        }
    }
    if (el instanceof HTMLTextAreaElement)
        return true;

    return false;
}

// ref: https://stackoverflow.com/a/4931963/1174657
const getInputSelection = (el) => {
    var start = 0, end = 0, normalizedValue, range,
        textInputRange, len, endRange;

    if (typeof el.selectionStart == "number" && typeof el.selectionEnd == "number") {
        start = el.selectionStart;
        end = el.selectionEnd;
    } else {
        range = document.selection.createRange();

        if (range && range.parentElement() == el) {
            len = el.value.length;
            normalizedValue = el.value.replace(/\r\n/g, "\n");

            // Create a working TextRange that lives only in the input
            textInputRange = el.createTextRange();
            textInputRange.moveToBookmark(range.getBookmark());

            // Check if the start and end of the selection are at the very end
            // of the input, since moveStart/moveEnd doesn't return what we want
            // in those cases
            endRange = el.createTextRange();
            endRange.collapse(false);

            if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
                start = end = len;
            } else {
                start = -textInputRange.moveStart("character", -len);
                start += normalizedValue.slice(0, start).split("\n").length - 1;

                if (textInputRange.compareEndPoints("EndToEnd", endRange) > -1) {
                    end = len;
                } else {
                    end = -textInputRange.moveEnd("character", -len);
                    end += normalizedValue.slice(0, end).split("\n").length - 1;
                }
            }
        }
    }

    return {
        start: start,
        end: end,
        direction: el.selectionDirection,
    };
}

const saveSelection = (selection) => {
    return [selection.anchorNode, selection.anchorOffset, selection.focusNode, selection.focusOffset];
}

const restoreSelection = (selection, savedSelection) => {
    selection.setBaseAndExtent(savedSelection[0], savedSelection[1], savedSelection[2], savedSelection[3]);
}

export default {
    setString,
    canSetHtml,
    setHtml,
};