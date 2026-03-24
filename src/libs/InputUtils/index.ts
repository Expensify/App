import type {MoveSelectionToEnd, ScrollInput} from './types';

const scrollToBottom: ScrollInput = (input) => {
    if (!('scrollTop' in input)) {
        return;
    }
    // eslint-disable-next-line no-param-reassign
    (input as HTMLInputElement).scrollTop = input.scrollHeight;
};

const scrollToRight: ScrollInput = (input) => {
    if (!('scrollLeft' in input)) {
        return;
    }
    // Scroll to the far right
    // eslint-disable-next-line no-param-reassign
    (input as HTMLInputElement).scrollLeft = input.scrollWidth;
};

const moveSelectionToEnd: MoveSelectionToEnd = (input) => {
    if (!('setSelectionRange' in input)) {
        return;
    }
    const length = input.value.length;
    input.setSelectionRange(length, length);
};

export {scrollToBottom, moveSelectionToEnd, scrollToRight};
