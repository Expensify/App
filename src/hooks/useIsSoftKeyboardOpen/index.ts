import {isMobile as isMobileBrowser} from '@libs/Browser';

import CONST from '@src/CONST';

import {useEffect, useState} from 'react';

const keyboardOpeningTagNames = new Set<string>([CONST.ELEMENT_NAME.INPUT, CONST.ELEMENT_NAME.TEXTAREA]);

/**
 * How much of the viewport has to disappear while a text field holds focus before we call it a keyboard. Well below
 * the height of any soft keyboard, and well above the URL bar collapsing or a toolbar sliding in.
 */
const KEYBOARD_MIN_HEIGHT = 100;

function doesTargetOpenSoftKeyboard(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) {
        return false;
    }

    return keyboardOpeningTagNames.has(target.tagName) || target.isContentEditable;
}

function getViewportHeight(): number {
    return window.visualViewport?.height ?? window.innerHeight;
}

/**
 * Whether the soft keyboard is currently open on a mobile browser.
 *
 * Browsers expose no keyboard API, so this combines the two signals that are available. Focus on its own is not
 * enough — a focused text field with a hardware keyboard attached, or one focused programmatically, leaves the
 * viewport untouched — and a shrinking viewport on its own is not either, since `web/index.html` asks for
 * `interactive-widget=resizes-content` and an orientation change or the URL bar collapsing shrinks it just the same.
 * Requiring both means the keyboard is reported open only while a text field holds focus AND the viewport has lost
 * enough height for the keyboard to be what took it.
 *
 * The full viewport height is re-measured whenever no text field is focused, so it stays correct across orientation
 * changes and browser chrome appearing or disappearing.
 */
function useIsSoftKeyboardOpen(): boolean {
    const [isSoftKeyboardOpen, setIsSoftKeyboardOpen] = useState(false);

    useEffect(() => {
        if (!isMobileBrowser()) {
            return;
        }

        let isTextFieldFocused = false;
        let unobstructedHeight = getViewportHeight();

        const sync = () => {
            const height = getViewportHeight();

            if (!isTextFieldFocused) {
                // Nothing can be covering the viewport without focus, so whatever it measures now is its full height.
                unobstructedHeight = height;
                setIsSoftKeyboardOpen(false);
                return;
            }

            setIsSoftKeyboardOpen(unobstructedHeight - height >= KEYBOARD_MIN_HEIGHT);
        };

        const handleFocusIn = (event: FocusEvent) => {
            if (!doesTargetOpenSoftKeyboard(event.target)) {
                return;
            }
            isTextFieldFocused = true;
            // The viewport hasn't resized yet at this point; the resize listeners below flip the state if it does.
            sync();
        };

        // `relatedTarget` is the element about to receive focus. Moving between two text fields keeps the keyboard up,
        // so ignoring those blurs avoids a flicker between the focusout and the focusin that follows it.
        const handleFocusOut = (event: FocusEvent) => {
            if (!doesTargetOpenSoftKeyboard(event.target) || doesTargetOpenSoftKeyboard(event.relatedTarget)) {
                return;
            }
            isTextFieldFocused = false;
            sync();
        };

        window.addEventListener('focusin', handleFocusIn);
        window.addEventListener('focusout', handleFocusOut);
        window.addEventListener('resize', sync);
        // iOS Safari ignores `interactive-widget`, shrinking only the visual viewport, which fires no window resize.
        window.visualViewport?.addEventListener('resize', sync);

        return () => {
            window.removeEventListener('focusin', handleFocusIn);
            window.removeEventListener('focusout', handleFocusOut);
            window.removeEventListener('resize', sync);
            window.visualViewport?.removeEventListener('resize', sync);
        };
    }, []);

    return isSoftKeyboardOpen;
}

export default useIsSoftKeyboardOpen;
