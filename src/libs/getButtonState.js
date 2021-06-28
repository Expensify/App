import CONST from '../CONST';

/**
 * Get the string representation of a button's state.
 *
 * @param {Boolean} [isActive]
 * @param {Boolean} [isPressed]
 * @param {Boolean} [isComplete]
 * @param {Boolean} [isDisabled]
 * @returns {String}
 */
export default function (isActive = false, isPressed = false, isComplete = false, isDisabled = false) {
    if (isDisabled) {
        return CONST.BUTTON_STATES.DISABLED;
    }

    if (isComplete) {
        return CONST.BUTTON_STATES.COMPLETE;
    }

    if (isPressed) {
        return CONST.BUTTON_STATES.PRESSED;
    }

    if (isActive) {
        return CONST.BUTTON_STATES.ACTIVE;
    }

    return CONST.BUTTON_STATES.DEFAULT;
}
