import _ from 'underscore';

/**
 * Is the virtual keyboard open?
 *
 * @returns {Boolean|null} – null if the VirtualKeyboard API is unavailable
 */
function isOpen() {
    if (!_.has(navigator, 'virtualKeyboard')) {
        return null;
    }
    return navigator.virtualKeyboard.boundingRect.y > 0;
}

export {
    // eslint-disable-next-line import/prefer-default-export
    isOpen,
};
