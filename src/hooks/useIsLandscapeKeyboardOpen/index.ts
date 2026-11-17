import isEditableElement from '@libs/isEditableElement';
import isInLandscapeMode from '@libs/isInLandscapeMode';

import {useSyncExternalStore} from 'react';

let isInputFocused = isEditableElement(document.activeElement);

function subscribe(callback: () => void) {
    // An input focused before subscribing, like one with `autoFocus`, sends no focusin to listen to
    isInputFocused = isEditableElement(document.activeElement);

    const handleFocusIn = (event: FocusEvent) => {
        isInputFocused = isEditableElement(event.target);
        callback();
    };
    // Moving straight to another input keeps it open
    const handleFocusOut = (event: FocusEvent) => {
        isInputFocused = isEditableElement(event.relatedTarget);
        callback();
    };

    window.addEventListener('focusin', handleFocusIn);
    window.addEventListener('focusout', handleFocusOut);
    window.addEventListener('resize', callback);
    return () => {
        window.removeEventListener('focusin', handleFocusIn);
        window.removeEventListener('focusout', handleFocusOut);
        window.removeEventListener('resize', callback);
    };
}

// Orientation is part of the snapshot, so focus changes re-render subscribers only in phone landscape
function getSnapshot() {
    return isInputFocused && isInLandscapeMode(window.innerWidth);
}

/**
 * Whether an input that opens the soft keyboard is focused on a phone browser in landscape. Focus counts as open, so
 * the layout is ready before the keyboard comes up. The keyboard can close while the input keeps focus, so check the
 * window height too where that matters.
 */
function useIsLandscapeKeyboardOpen(): boolean {
    return useSyncExternalStore(subscribe, getSnapshot);
}

export default useIsLandscapeKeyboardOpen;
