/**
 * Drops focus from whatever currently holds it.
 *
 * `elementToPreserve` opts a single element out. A closing modal blurs focus so it can't be left on content that is
 * about to unmount — but by then its focus trap may have already returned focus to the launcher that opened it, and
 * that element is outside the modal. Blurring it would silently undo the return.
 */
const blurActiveElement = (elementToPreserve?: unknown) => {
    if (!(document.activeElement instanceof HTMLElement)) {
        return;
    }
    if (elementToPreserve === document.activeElement) {
        return;
    }
    document.activeElement.blur();
};

export default blurActiveElement;
