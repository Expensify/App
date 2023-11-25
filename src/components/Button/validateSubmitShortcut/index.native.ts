import ValidateSubmitShortcut from './types';

/**
 * Validate if the submit shortcut should be triggered depending on the button state
 *
 * @param isFocused Whether Button is on active screen
 * @param isDisabled Indicates whether the button should be disabled
 * @param isLoading Indicates whether the button should be disabled and in the loading state
 * @return Returns `true` if the shortcut should be triggered
 */

const validateSubmitShortcut: ValidateSubmitShortcut = (isFocused, isDisabled, isLoading) => {
    if (!isFocused || isDisabled || isLoading) {
        return false;
    }

    return true;
};

export default validateSubmitShortcut;
