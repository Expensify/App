function validateSubmitShortcut(isFocused, isDisabled, isLoading, event) {
    if (!isFocused || isDisabled || isLoading || (event && event.target.nodeName === 'TEXTAREA')) {
        return false;
    }

    event.preventDefault();
    return true;
}

export default validateSubmitShortcut;
