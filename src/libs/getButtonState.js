import CONST from '../CONST';

/**
 * Get the string representation of a button's state.
 *
 * @param {Boolean} [isHovered]
 * @param {Boolean} [isPressed]
 * @param {Boolean} [isComplete]
 * @param {Boolean} [isDisabled]
 * @returns {String}
 */
export default function (isHovered = false, isPressed = false, isComplete = false, isDisabled = false) {
    if (isDisabled) {
        return CONST.BUTTON_STATES.DISABLED;
    }

    if (isComplete) {
        return CONST.BUTTON_STATES.COMPLETE;
    }

    if (isPressed) {
        return CONST.BUTTON_STATES.PRESSED;
    }

    if (isHovered) {
        return CONST.BUTTON_STATES.HOVERED;
    }

    return CONST.BUTTON_STATES.DEFAULT;
}
