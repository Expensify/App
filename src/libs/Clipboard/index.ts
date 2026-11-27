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

const canSetHtml: CanSetHtml = () => (!!navigator?.clipboard?.write && typeof ClipboardItem !== 'undefined') || CONST.BROWSER.SAFARI === Browser.getBrowser();

/**
 * Deprecated method to write the content as HTML to clipboard.
 */
function setHTMLSync(html: string | undefined, text: string): boolean {
    const selection = window?.getSelection();
    if (!selection || !document.body) {
        return false;
    }
    const node = document.createElement('span');
    let didPopulateClipboard = false;
    node.className = CONST.FULLSTORY.CLASS.MASK;
    node.textContent = html ?? text;
    node.style.all = 'unset';
    node.style.opacity = '0';
    node.style.position = 'absolute';
    node.style.whiteSpace = 'pre-wrap';
    node.style.userSelect = 'text';
    node.addEventListener('copy', (e) => {
        if (!e.clipboardData) {
            return;
        }
        e.stopPropagation();
        e.preventDefault();
        e.clipboardData.clearData();
        if (html !== undefined) {
            e.clipboardData.setData('text/html', html);
        }
        e.clipboardData.setData('text/plain', text);
        didPopulateClipboard = true;
    });
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

    try {
        document.body.appendChild(node);
        selection.removeAllRanges();
        const range = document.createRange();
        range.selectNodeContents(node);
        selection.addRange(range);
        return document.execCommand('copy') && didPopulateClipboard;
    } catch {
        // Browsers can reject the legacy copy command too; callers must not report success.
        return false;
    } finally {
        node.remove();
        selection.removeAllRanges();
        const anchorSelection = originalSelection as AnchorSelection;
        if (isComposer && 'start' in originalSelection) {
            firstAnchorChild.setSelectionRange(originalSelection.start, originalSelection.end, originalSelection.direction);
        } else if (anchorSelection.anchorNode && anchorSelection.focusNode) {
            selection.setBaseAndExtent(anchorSelection.anchorNode, anchorSelection.anchorOffset, anchorSelection.focusNode, anchorSelection.focusOffset);
        }
    }
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
            .replaceAll(/<mention-report reportID="(\d+)" *\/>/gi, '<mention-report reportID="$1"></mention-report>')
            .replaceAll(/<mention-user accountID="(\d+)" *\/>/gi, '<mention-user accountID="$1"></mention-user>');

        navigator.clipboard
            .write([
                new ClipboardItem({
                    /* eslint-disable @typescript-eslint/naming-convention */
                    'text/html': new Blob([htmlNonClosingTags], {type: 'text/html'}),
                    'text/plain': new Blob([text], {type: 'text/plain'}),
                }),
            ])
            .catch(() => {
                try {
                    setHTMLSync(html, text);
                } catch {
                    // A failed selection restoration must not create another rejected promise.
                }
            });
    }
};

/**
 * Copies text without exposing rejected browser writes to fire-and-forget callers.
 */
const setString: SetString = async (text) => {
    try {
        if (navigator?.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch {
        // A denied async write may still permit the legacy copy command.
    }
    try {
        return setHTMLSync(undefined, text);
    } catch {
        // Selection APIs may fail too. Never log text, which can contain recovery codes.
        return false;
    }
};

export default {
    setString,
    canSetHtml,
    setHtml,
};
