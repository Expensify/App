import type ValidateSubmitShortcut from './types';

/**
 * Validate if the submit shortcut should be triggered depending on the button state
 *
 * @param isDisabled Indicates whether the button should be disabled
 * @param isLoading Indicates whether the button should be disabled and in the loading state
 * @param event Focused input event
 * @returns Returns `true` if the shortcut should be triggered
 */

const validateSubmitShortcut: ValidateSubmitShortcut = (isDisabled, isLoading, event) => {
    const eventTarget = event?.target as HTMLElement;
    if (isDisabled || isLoading || eventTarget.nodeName === 'TEXTAREA' || (eventTarget?.contentEditable === 'true' && eventTarget.ariaMultiLine)) {
        return false;
    }

    event?.preventDefault();
    return true;
};

export default validateSubmitShortcut;
