import {MutableRefObject, RefCallback} from 'react';

/**
 * Assigns an element to ref, either by setting the `current` property of the ref object or by calling the ref function
 *
 * @param ref The ref object or function.
 * @param element The element to assign the ref to.
 */
export default function assignRef<E extends HTMLElement>(ref: RefCallback<E> | MutableRefObject<E | null> | undefined, element: E) {
    if (!ref) {
        return;
    }
    if (typeof ref === 'function') {
        ref(element);
    } else if ('current' in ref) {
        // eslint-disable-next-line no-param-reassign
        ref.current = element;
    }
}
