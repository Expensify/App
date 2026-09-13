/**
 * There is no DOM to measure on native, and the portal re-bases the menu's `bottom` onto its host's frame, which
 * already sits above the keyboard, so the window height is used as-is.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getSuggestionsViewportBottom(windowHeight: number, keyboardHeight: number): number {
    return windowHeight;
}

export default getSuggestionsViewportBottom;
