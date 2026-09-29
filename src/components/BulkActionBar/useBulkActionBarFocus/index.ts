import FOCUSABLE_SELECTOR from '@libs/focusableSelector';
import isHTMLElement from '@libs/isHTMLElement';
import markProgrammaticFocus from '@libs/programmaticFocus';

import CONST from '@src/CONST';

import type {RefObject} from 'react';

import {useEffect, useRef} from 'react';

import type UseBulkActionBarFocus from './types';

const HOME_KEY = 'Home';
const END_KEY = 'End';

function getBarElement(barRef: RefObject<unknown>): HTMLElement | null {
    return isHTMLElement(barRef.current) ? barRef.current : null;
}

function getItems(bar: HTMLElement): HTMLElement[] {
    return Array.from(bar.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
}

/**
 * Whether the browser is already drawing a focus ring on this element. Browsers that cannot be asked are assumed to be
 * drawing one, so a ring is never taken away from someone who navigated there with the keyboard.
 */
function isShowingFocusRing(element: HTMLElement): boolean {
    try {
        return element.matches(':focus-visible');
    } catch {
        return true;
    }
}

/**
 * Makes the bar a single stop in the tab order, the way the ARIA toolbar pattern asks for, and settles where focus goes
 * when the selection is cleared.
 *
 * Tab moves onto the bar and straight off it again, while Left, Right, Home and End move between its actions. Giving
 * every action its own tab stop would otherwise make a four-action bar five stops between the list and whatever follows
 * it.
 */
const useBulkActionBarFocus: UseBulkActionBarFocus = (barRef) => {
    // What Tab lands on, kept in step with wherever focus actually went, so returning to the bar comes back to the
    // action last used rather than to the first one.
    const tabStopRef = useRef<HTMLElement | null>(null);

    // Where focus was before the bar took it. The bar goes away with the selection, so focus has to be handed back.
    const lastFocusedOutsideRef = useRef<HTMLElement | null>(null);

    // The fitting pass changes which actions have a button of their own, and React restores each new button's own tab
    // stop, so the roving one is reapplied after every render rather than once on mount.
    useEffect(() => {
        const bar = getBarElement(barRef);
        if (!bar) {
            return;
        }

        const items = getItems(bar);
        const tabStop = tabStopRef.current && items.includes(tabStopRef.current) ? tabStopRef.current : items.at(0);
        tabStopRef.current = tabStop ?? null;

        for (const item of items) {
            item.tabIndex = item === tabStop ? 0 : -1;
        }
    });

    useEffect(() => {
        const handleFocusIn = (event: FocusEvent) => {
            const target = event.target;
            if (!isHTMLElement(target)) {
                return;
            }

            const bar = getBarElement(barRef);
            if (bar?.contains(target)) {
                tabStopRef.current = target;
                return;
            }

            lastFocusedOutsideRef.current = target;
        };

        document.addEventListener('focusin', handleFocusIn);

        return () => document.removeEventListener('focusin', handleFocusIn);
    }, [barRef]);

    useEffect(() => {
        const bar = getBarElement(barRef);
        if (!bar) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            const items = getItems(bar);
            if (items.length === 0) {
                return;
            }

            const currentIndex = isHTMLElement(document.activeElement) ? items.indexOf(document.activeElement) : -1;
            if (currentIndex === -1) {
                return;
            }

            let nextIndex: number;
            if (event.key === CONST.KEYBOARD_SHORTCUTS.ARROW_LEFT.shortcutKey) {
                nextIndex = (currentIndex - 1 + items.length) % items.length;
            } else if (event.key === CONST.KEYBOARD_SHORTCUTS.ARROW_RIGHT.shortcutKey) {
                nextIndex = (currentIndex + 1) % items.length;
            } else if (event.key === HOME_KEY) {
                nextIndex = 0;
            } else if (event.key === END_KEY) {
                nextIndex = items.length - 1;
            } else {
                return;
            }

            // Left and Right scroll the page horizontally, and Home and End jump it, so the bar has to claim them.
            event.preventDefault();
            items.at(nextIndex)?.focus();
        };

        bar.addEventListener('keydown', handleKeyDown);

        return () => bar.removeEventListener('keydown', handleKeyDown);
    }, [barRef]);

    const handleFocusBeforeClose = () => {
        const active = document.activeElement;
        if (!isHTMLElement(active)) {
            return;
        }

        const bar = getBarElement(barRef);
        if (bar?.contains(active)) {
            const previous = lastFocusedOutsideRef.current;
            if (!previous?.isConnected) {
                active.blur();
                return;
            }

            // Focus is being put back where the user left it rather than moved somewhere new, so it arrives without a ring.
            markProgrammaticFocus(previous);
            previous.focus();
            return;
        }

        // Esc makes whatever holds focus match `:focus-visible`, so a checkbox clicked with the mouse would light up
        // with a focus ring just as the selection it belongs to disappears.
        if (!isShowingFocusRing(active)) {
            markProgrammaticFocus(active);
        }
    };

    return {handleFocusBeforeClose};
};

export default useBulkActionBarFocus;
