import type {HostInstance} from 'react-native';

import type CaptureInputScrolledToEnd from './types';

function isCaretAtEnd(input: HTMLElement): boolean {
    if (input instanceof HTMLTextAreaElement || input instanceof HTMLInputElement) {
        return input.selectionStart === input.value.length && input.selectionEnd === input.value.length;
    }

    const selection = document.getSelection();
    if (!selection?.isCollapsed || !selection.focusNode || !input.contains(selection.focusNode)) {
        return false;
    }
    const textAfterCaret = document.createRange();
    textAfterCaret.selectNodeContents(input);
    textAfterCaret.setStart(selection.focusNode, selection.focusOffset);
    return textAfterCaret.toString().trim() === '';
}

// A browser keeps an input's scrollTop when its height changes, and can reset it to 0 when the box grows. Autofocus places the caret at the end of the value,
// so a cap change, such as the mobile keyboard shrinking the slot, could leave that end and the caret below the box. The container captures that state before
// it changes the cap. An input that overflows counts when it is scrolled to the end, so a user reading the middle keeps their place. One that fits counts when the caret is at the end.
const captureInputScrolledToEnd: CaptureInputScrolledToEnd = (content: HostInstance | null) => {
    const input = document.activeElement;
    if (!(content instanceof HTMLElement) || !(input instanceof HTMLElement) || !content.contains(input)) {
        return undefined;
    }

    const maxScrollTop = input.scrollHeight - input.clientHeight;
    const isShowingEnd = maxScrollTop < 1 ? isCaretAtEnd(input) : input.scrollTop >= maxScrollTop - 1;
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
