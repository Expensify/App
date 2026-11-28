/** Android reserves a row for its bar and the web tab bar stays above the keyboard, so nothing of a footer goes under it. */
function useTabRootKeyboardVerticalOffset(): number {
    return 0;
}

export default useTabRootKeyboardVerticalOffset;
