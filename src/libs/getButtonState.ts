import {ValueOf} from 'type-fest';
import CONST from '@src/CONST';

/**
 * Get the string representation of a button's state.
 */
function getButtonState(isActive = false, isPressed = false, isComplete = false, isDisabled = false, isInteractive = true): ValueOf<typeof CONST.BUTTON_STATES> {
    if (!isInteractive) {
        return CONST.BUTTON_STATES.DEFAULT;
    }

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

export default getButtonState;
