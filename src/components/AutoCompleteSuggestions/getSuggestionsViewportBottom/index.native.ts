/**
 * On native the window height already describes the block the suggestion menu is positioned against.
 */
function getSuggestionsViewportBottom(windowHeight: number): number {
    return windowHeight;
}

export default getSuggestionsViewportBottom;
