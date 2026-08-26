/**
 * Drops focus from whatever currently holds it.
 *
 * Pass `container` to limit the blur to focus that lives inside it. A closing modal only wants to drop focus from
 * content that is about to unmount. By then its focus trap may have already returned focus to the launcher that
 * opened it, which sits outside, and blurring that would silently undo the return.
 */
const blurActiveElement = (container?: unknown) => {
    if (!(document.activeElement instanceof HTMLElement)) {
        return;
    }
    if (container instanceof HTMLElement && !container.contains(document.activeElement)) {
        return;
    }
    document.activeElement.blur();
};

export default blurActiveElement;
