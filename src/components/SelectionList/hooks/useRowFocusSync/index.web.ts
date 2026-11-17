import CONST from '@src/CONST';

import {useEffect, useEffectEvent} from 'react';

import type UseRowFocusSyncOptions from './types';

const ROW_SELECTOR = `[data-testid^="${CONST.BASE_LIST_ITEM_TEST_ID}"]`;

/**
 * Keeps the highlight with the keyboard focus. A row can take the focus from a key the list does not listen to, like
 * Enter in a pane next to it, and a list the focus has left would otherwise keep a row lit.
 */
function useRowFocusSync({containerRef, showKeyboardHighlight, setFocusedIndex}: UseRowFocusSyncOptions) {
    const handleFocusIn = useEffectEvent((event: FocusEvent) => {
        // A click focuses a row too, but only the keyboard makes it match `:focus-visible`.
        if (!(event.target instanceof HTMLElement) || !event.target.matches(ROW_SELECTOR) || !event.target.matches(':focus-visible')) {
            return;
        }
        showKeyboardHighlight();
    });

    // A list driven from a search input outside it never holds the focus, so this only clears a list the focus was in.
    const handleFocusOut = useEffectEvent((event: FocusEvent, container: HTMLElement) => {
        if (event.relatedTarget instanceof Node && container.contains(event.relatedTarget)) {
            return;
        }
        setFocusedIndex(-1);
    });

    useEffect(() => {
        const container = containerRef.current;
        if (!(container instanceof HTMLElement)) {
            return;
        }
        const onFocusIn = (event: FocusEvent) => handleFocusIn(event);
        const onFocusOut = (event: FocusEvent) => handleFocusOut(event, container);
        container.addEventListener('focusin', onFocusIn);
        container.addEventListener('focusout', onFocusOut);
        return () => {
            container.removeEventListener('focusin', onFocusIn);
            container.removeEventListener('focusout', onFocusOut);
        };
    }, [containerRef]);
}

export default useRowFocusSync;
