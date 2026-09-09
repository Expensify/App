/**
 * The menu's `bottom` counts up from the `html` box, so on web that box has to be measured with the same
 * `getBoundingClientRect` the caret position comes from. A window height is not interchangeable: iOS scrolls the page
 * to reveal the keyboard. There is no DOM on native, so just use windowHeight;
 */
function getSuggestionsViewportBottom(windowHeight: number): number {
    if (typeof document === 'undefined') {
        return windowHeight;
    }

    return document.documentElement?.getBoundingClientRect().bottom ?? windowHeight;
}

export default getSuggestionsViewportBottom;
