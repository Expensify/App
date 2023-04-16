function blurActiveElement() {
    document.activeElement.blur();
}

function isMouseInsideElement(mouseEvent, element) {
    const rect = element.getBoundingClientRect();
    return (mouseEvent.x >= rect.left && mouseEvent.x <= rect.right)
        && (mouseEvent.y >= rect.top && mouseEvent.y <= rect.bottom);
}

export default {
    blurActiveElement,
    isMouseInsideElement,
};
