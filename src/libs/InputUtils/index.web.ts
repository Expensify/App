function scrollToBottom(input: HTMLInputElement) {
    input.scrollTop = input.scrollHeight;
}

function moveSelectionToEnd(input: HTMLInputElement) {
    const length = input.value.length;
    input.setSelectionRange(length, length);
}

export {scrollToBottom, moveSelectionToEnd};
