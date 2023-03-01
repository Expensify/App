/**
 * Validate if the submit shortcut should be triggered depending on the button state
 *
 * @param {boolean} isFocused Whether Button is on active screen
 * @param {boolean} isDisabled Indicates whether the button should be disabled
 * @param {boolean} isLoading Indicates whether the button should be disabled and in the loading state
 * @returns {boolean} Returns `true` if the shortcut should be triggered
 */
function validateSubmitShortcut(isFocused, isDisabled, isLoading) {
    if (!isFocused || isDisabled || isLoading) {
        return false;
    }

    return true;
}

export default validateSubmitShortcut;
