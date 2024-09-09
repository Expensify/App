const blurActiveElement = () => {
    if (!(document.activeElement instanceof HTMLElement)) {
        return;
    }
    document.activeElement.blur();
};

export default blurActiveElement;
