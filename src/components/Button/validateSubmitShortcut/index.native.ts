import type ValidateSubmitShortcut from './types';

/**
 * Validate if the submit shortcut should be triggered depending on the button state
 *
 * @param isDisabled Indicates whether the button should be disabled
 * @param isLoading Indicates whether the button should be disabled and in the loading state
 * @return Returns `true` if the shortcut should be triggered
 */

const validateSubmitShortcut: ValidateSubmitShortcut = (isDisabled, isLoading) => {
    if (isDisabled || isLoading) {
        return false;
    }

    return true;
};

export default validateSubmitShortcut;
