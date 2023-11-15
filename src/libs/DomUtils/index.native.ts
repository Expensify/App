import GetActiveElement from './types';

const getActiveElement: GetActiveElement = () => null;

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
const isActiveTextSelection = () => {
    throw new Error('Not implemented in React Native. Use only for web.');
}

const requestAnimationFrame = (callback: () => void) => {
    if (!callback) {
        return;
    }

    callback();
};

export default {
    getActiveElement,
    isActiveTextSelection,
    requestAnimationFrame,
};
