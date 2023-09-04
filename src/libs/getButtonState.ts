import {ValueOf} from 'type-fest';
import CONST from '../CONST';

type GetButtonState = (isActive: boolean, isPressed: boolean, isComplete: boolean, isDisabled: boolean, isInteractive: boolean) => ValueOf<typeof CONST.BUTTON_STATES>;

/**
 * Get the string representation of a button's state.
 */
const getButtonState: GetButtonState = (isActive = false, isPressed = false, isComplete = false, isDisabled = false, isInteractive = true) => {
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
};

export default getButtonState;
