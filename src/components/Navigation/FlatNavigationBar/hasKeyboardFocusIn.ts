import isHTMLElement from '@libs/isHTMLElement';

// Only keyboard focus counts: an item clicked with the mouse keeps focus too, and must not hold anything open after the pointer leaves.
function hasKeyboardFocusIn(element: unknown) {
    return isHTMLElement(element) && !!element.querySelector(':focus-visible');
}

export default hasKeyboardFocusIn;
