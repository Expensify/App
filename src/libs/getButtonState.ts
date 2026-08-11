import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type GetButtonStateParams = {
    /** Whether the button is active, e.g. hovered or selected */
    isActive?: boolean;

    /** Whether the button is currently pressed */
    isPressed?: boolean;

    /** Whether the action behind the button completed successfully */
    isComplete?: boolean;

    /** Whether the button is disabled */
    isDisabled?: boolean;

    /** Whether the button reacts to user interaction at all */
    isInteractive?: boolean;
};

/**
 * Get the string representation of a button's state.
 */
function getButtonState({isActive = false, isPressed = false, isComplete = false, isDisabled = false, isInteractive = true}: GetButtonStateParams = {}): ValueOf<typeof CONST.BUTTON_STATES> {
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
