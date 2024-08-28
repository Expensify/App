import {useCallback, useEffect} from 'react';
import useDebouncedState from '@hooks/useDebouncedState';
import * as Browser from '@libs/Browser';

/**
 * Detects input or text area focus on browsers, to avoid scrolling on virtual viewports
 */
export default function useTackInputFocus(enable = false): boolean {
    const [, isInputFocusDebounced, setIsInputFocus] = useDebouncedState(false);

    const handleFocusIn = useCallback(
        (event: FocusEvent) => {
            const targetElement = event.target as HTMLElement;
            if (targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA') {
                setIsInputFocus(true);
            }
        },
        [setIsInputFocus],
    );

    const handleFocusOut = useCallback(
        (event: FocusEvent) => {
            const targetElement = event.target as HTMLElement;
            if (targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA') {
                setIsInputFocus(false);
            }
        },
        [setIsInputFocus],
    );

    const resetScrollPositionOnVisualViewport = useCallback(() => {
        if (Browser.isChromeIOS() && window.visualViewport?.offsetTop) {
            // On Chrome iOS, the visual viewport triggers a scroll event when the keyboard is opened, but some time the scroll position is not correct.
            // So this change is specific to Chrome iOS, helping to reset the viewport position correctly.
            window.scrollTo({top: -window.visualViewport.offsetTop});
        } else {
            window.scrollTo({top: 0});
        }
    }, []);

    useEffect(() => {
        if (!enable) {
            return;
        }
        window.addEventListener('focusin', handleFocusIn);
        window.addEventListener('focusout', handleFocusOut);
        window.visualViewport?.addEventListener('scroll', resetScrollPositionOnVisualViewport);
        return () => {
            window.removeEventListener('focusin', handleFocusIn);
            window.removeEventListener('focusout', handleFocusOut);
            window.visualViewport?.removeEventListener('scroll', resetScrollPositionOnVisualViewport);
        };
    }, [enable, handleFocusIn, handleFocusOut, resetScrollPositionOnVisualViewport]);

    return isInputFocusDebounced;
}
