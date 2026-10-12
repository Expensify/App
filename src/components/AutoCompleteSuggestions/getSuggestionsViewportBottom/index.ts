/**
 * The menu's `bottom` counts up from the bottom edge of the `html` box, so it has to be measured with the same
 * `getBoundingClientRect` the caret position comes from - a window height is not interchangeable, because iOS
 * scrolls the page to reveal the keyboard. The box is then raised by the keyboard so the menu is not covered by it.
 */
function getSuggestionsViewportBottom(windowHeight: number, keyboardHeight: number): number {
    return (document.documentElement?.getBoundingClientRect().bottom ?? windowHeight) - keyboardHeight;
}

export default getSuggestionsViewportBottom;
