import type {MoveSelectiontoEnd, ScrollToBottom} from './types';

const scrollToBottom: ScrollToBottom = (input) => {
    if (!('scrollTop' in input)) {
        return;
    }
    // eslint-disable-next-line no-param-reassign
    input.scrollTop = input.scrollHeight;
};

const moveSelectionToEnd: MoveSelectiontoEnd = (input) => {
    if (!('setSelectionRange' in input)) {
        return;
    }
    const inputElement = input as HTMLInputElement;
    const length = inputElement.value.length;
    inputElement.setSelectionRange(length, length);
};

export {scrollToBottom, moveSelectionToEnd};
