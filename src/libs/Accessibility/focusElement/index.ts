import type FocusElement from './types';

/** Moves keyboard focus to the element, which a web screen reader follows */
const focusElement: FocusElement = (element) => {
    element?.focus();
};

export default focusElement;
