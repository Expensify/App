import type {MoveSelectionToEnd, ScrollInput} from './types';

const scrollToBottom: ScrollInput = (input) => {
    // Native inputs also expose scroll offsets, but only DOM offsets are writable.
    if (!(input instanceof HTMLElement)) {
        return;
    }
    // eslint-disable-next-line no-param-reassign
    input.scrollTop = input.scrollHeight;
};

const scrollToRight: ScrollInput = (input) => {
    if (!(input instanceof HTMLElement)) {
        return;
    }
    // Scroll to the far right
    // eslint-disable-next-line no-param-reassign
    input.scrollLeft = input.scrollWidth;
};

const moveSelectionToEnd: MoveSelectionToEnd = (input) => {
    if (!('setSelectionRange' in input)) {
        return;
    }
    const length = input.value.length;
    input.setSelectionRange(length, length);
};

export {scrollToBottom, moveSelectionToEnd, scrollToRight};
