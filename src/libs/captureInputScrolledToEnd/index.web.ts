import type {HostInstance} from 'react-native';

import type CaptureInputScrolledToEnd from './types';

function isCaretAtEnd(input: HTMLElement): boolean {
    if (input instanceof HTMLTextAreaElement || input instanceof HTMLInputElement) {
        return input.selectionStart === input.value.length && input.selectionEnd === input.value.length;
    }

    // Markdown inputs render as a contenteditable element, so the caret comes from the selection. Trailing whitespace after it, such as the line break
    // the editor keeps at the end, still counts as the end of the text.
    const selection = document.getSelection();
    if (!selection?.isCollapsed || !selection.focusNode || !input.contains(selection.focusNode)) {
        return false;
    }
    const textAfterCaret = document.createRange();
    textAfterCaret.selectNodeContents(input);
    textAfterCaret.setStart(selection.focusNode, selection.focusOffset);
    return textAfterCaret.toString().trim() === '';
}

// Chrome can stop a few pixels short of the end when it scrolls the caret into view, for example after a paste. Within this distance the input still
// counts as showing the end of its text; a user reading the middle is much further away.
const END_OF_TEXT_TOLERANCE_PX = 4;

// A browser keeps an input's scrollTop when its height changes, and can reset it to 0 when the box grows. Autofocus places the caret at the end of the value,
// so a cap change, such as the mobile keyboard shrinking the slot, could leave that end and the caret below the box. The container captures that state before
// it changes the cap. An input that overflows counts when it is scrolled to the end, so a user reading the middle keeps their place. One that fits counts when the caret is at the end.
const captureInputScrolledToEnd: CaptureInputScrolledToEnd = (content: HostInstance | null) => {
    const input = document.activeElement;
    if (!(content instanceof HTMLElement) || !(input instanceof HTMLElement) || !content.contains(input)) {
        return undefined;
    }

    const maxScrollTop = input.scrollHeight - input.clientHeight;
    const isShowingEnd = maxScrollTop < 1 ? isCaretAtEnd(input) : input.scrollTop >= maxScrollTop - END_OF_TEXT_TOLERANCE_PX;
    if (!isShowingEnd) {
        return undefined;
    }

    return () => {
        if (!input.isConnected) {
            return;
        }
        input.scrollTop = input.scrollHeight;
    };
};

export default captureInputScrolledToEnd;
