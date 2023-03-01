function validateSubmitShortcut(isFocused, isDisabled, isLoading) {
    if (!isFocused || isDisabled || isLoading) {
        return false;
    }

    return true;
}

export default validateSubmitShortcut;
