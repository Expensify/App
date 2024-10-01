import Clipboard from '@react-native-clipboard/clipboard';
import * as Browser from '@libs/Browser';
import CONST from '@src/CONST';
import type {CanSetHtml, SetHtml, SetString} from './types';

type ComposerSelection = {
    start: number;
    end: number;
    direction: 'forward' | 'backward' | 'none';
};

type AnchorSelection = {
    anchorOffset: number;
    focusOffset: number;
    anchorNode: Node;
    focusNode: Node;
};

type NullableObject<T> = {[K in keyof T]: T[K] | null};

type OriginalSelection = ComposerSelection | NullableObject<AnchorSelection>;

const canSetHtml: CanSetHtml =
    () =>
    (...args: ClipboardItems) =>
        navigator?.clipboard?.write([...args]);

/**
 * Deprecated method to write the content as HTML to clipboard.
 */
function setHTMLSync(html: string, text: string) {
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
        e.clipboardData?.clearData();
        e.clipboardData?.setData('text/html', html);
        e.clipboardData?.setData('text/plain', text);
    });
    document.body.appendChild(node);

    const selection = window?.getSelection();

    if (selection === null) {
        return;
    }

    const firstAnchorChild = selection.anchorNode?.firstChild;
    const isComposer = firstAnchorChild instanceof HTMLTextAreaElement;
    let originalSelection: OriginalSelection | null = null;
    if (isComposer) {
        originalSelection = {
            start: firstAnchorChild.selectionStart,
            end: firstAnchorChild.selectionEnd,
            direction: firstAnchorChild.selectionDirection,
        };
    } else {
        originalSelection = {
            anchorNode: selection.anchorNode,
            anchorOffset: selection.anchorOffset,
            focusNode: selection.focusNode,
            focusOffset: selection.focusOffset,
        };
    }

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

    const anchorSelection = originalSelection as AnchorSelection;

    if (isComposer && 'start' in originalSelection) {
        firstAnchorChild.setSelectionRange(originalSelection.start, originalSelection.end, originalSelection.direction);
    } else if (anchorSelection.anchorNode && anchorSelection.focusNode) {
        // When copying to the clipboard here, the original values of anchorNode and focusNode will be null since there will be no user selection.
        // We are adding a check to prevent null values from being passed to setBaseAndExtent, in accordance with the standards of the Selection API as outlined here: https://w3c.github.io/selection-api/#dom-selection-setbaseandextent.
        selection.setBaseAndExtent(anchorSelection.anchorNode, anchorSelection.anchorOffset, anchorSelection.focusNode, anchorSelection.focusOffset);
    }

    document.body.removeChild(node);
}

/**
 * Writes the content as HTML if the web client supports it.
 */
const setHtml: SetHtml = (html: string, text: string) => {
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
        const htmlNonClosingTags = html
            .replace(/<mention-report reportID="(\d+)" *\/>/gi, '<mention-report reportID="$1"></mention-report>')
            .replace(/<mention-user accountID="(\d+)" *\/>/gi, '<mention-user accountID="$1"></mention-user>');

        navigator.clipboard.write([
            new ClipboardItem({
                /* eslint-disable @typescript-eslint/naming-convention */
                'text/html': new Blob([htmlNonClosingTags], {type: 'text/html'}),
                'text/plain': new Blob([text], {type: 'text/plain'}),
            }),
        ]);
    }
};

/**
 * Sets a string on the Clipboard object via react-native-web
 */
const setString: SetString = (text) => {
    Clipboard.setString(text);
};

export default {
    setString,
    canSetHtml,
    setHtml,
};
