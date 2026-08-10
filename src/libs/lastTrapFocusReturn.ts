/**
 * The element a focus trap just handed focus back to when it closed.
 *
 * A closing modal blurs whatever holds focus so it can't be left on content that is about to unmount. But the trap
 * returns focus to the launcher — an element *outside* the modal — and depending on how the modal was dismissed that
 * return can happen first, in which case the blur silently undoes it. Escape is the clearest case: focus-trap
 * deactivates on Escape (its `escapeDeactivates` default) before the app closes the modal, so the order is
 * return-then-blur, where a button press gives blur-then-return.
 *
 * Set on a successful return, cleared when the next trap activates, so it only shields focus during that window.
 */
let lastReturnedElement: HTMLElement | null = null;

function setLastTrapFocusReturn(element: HTMLElement): void {
    lastReturnedElement = element;
}

function clearLastTrapFocusReturn(): void {
    lastReturnedElement = null;
}

function getLastTrapFocusReturn(): HTMLElement | null {
    return lastReturnedElement;
}

export {setLastTrapFocusReturn, clearLastTrapFocusReturn, getLastTrapFocusReturn};
