import ValidateSubmitShortcut from './types';

/**
 * Validate if the submit shortcut should be triggered depending on the button state
 *
 * @param isFocused Whether Button is on active screen
 * @param isDisabled Indicates whether the button should be disabled
 * @param isLoading Indicates whether the button should be disabled and in the loading state
 * @param event Focused input event
 * @returns Returns `true` if the shortcut should be triggered
 */

const validateSubmitShortcut: ValidateSubmitShortcut = (isFocused, isDisabled, isLoading, event) => {
    const eventTarget = event?.target as HTMLElement;
    if (!isFocused || isDisabled || isLoading || eventTarget.nodeName === 'TEXTAREA') {
        return false;
    }

    event?.preventDefault();
    return true;
};

export default validateSubmitShortcut;
