import GetActiveElement from './types';

const getActiveElement: GetActiveElement = () => document.activeElement;

/**
 * Checks if there is a text selection within the currently focused input or textarea element.
 *
 * This function determines whether the currently focused element is an input or textarea,
 * and if so, it checks whether there is a text selection (i.e., whether the start and end
 * of the selection are at different positions). It assumes that only inputs and textareas
 * can have text selections.
 * Works only on web. Throws an error on native.
 *
 * @returns True if there is a text selection within the focused element, false otherwise.
 */
const isActiveTextSelection = (): boolean => {
    const focused = document.activeElement as HTMLInputElement | HTMLTextAreaElement | null;
    if (!focused) {
        return false;
    }
    if (typeof focused.selectionStart === 'number' && typeof focused.selectionEnd === 'number') {
        return focused.selectionStart !== focused.selectionEnd;
    }
    return false;
};

export default {
    getActiveElement,
    isActiveTextSelection,
    requestAnimationFrame: window.requestAnimationFrame.bind(window),
};
