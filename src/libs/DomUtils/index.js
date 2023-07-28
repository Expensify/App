function blurActiveElement() {
    document.activeElement.blur();
}

function getActiveElement() {
    return document.activeElement;
}

export default {
    blurActiveElement,
    getActiveElement,
};
