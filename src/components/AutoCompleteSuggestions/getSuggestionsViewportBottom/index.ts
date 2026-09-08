/**
 * The menu's `bottom` counts up from the `html` box, so that box has to be measured with the same `getBoundingClientRect`
 * the caret position comes from. A window height is not interchangeable: iOS scrolls the page to reveal the keyboard.
 */
function getSuggestionsViewportBottom(windowHeight: number): number {
    return document.documentElement?.getBoundingClientRect().bottom ?? windowHeight;
}

export default getSuggestionsViewportBottom;
