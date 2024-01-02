const useSubmitEditing = (multiline, autoGrowHeight, submitOnEnter) => {
    const isMultiline = multiline || autoGrowHeight;
    if (!isMultiline) {
        return true;
    }
    return Boolean(submitOnEnter);
};

export default useSubmitEditing;