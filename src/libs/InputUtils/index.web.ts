function scrollToBottom(input: HTMLInputElement) {
    // eslint-disable-next-line no-param-reassign
    input.scrollTop = input.scrollHeight;
}

function moveSelectionToEnd(input: HTMLInputElement) {
    const length = input.value.length;
    input.setSelectionRange(length, length);
}

export {scrollToBottom, moveSelectionToEnd};
