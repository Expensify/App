import {useCallback, useEffect} from 'react';
import useDebouncedState from '@hooks/useDebouncedState';
import useSidePanelState from '@hooks/useSidePanelState';
import {isChromeIOS} from '@libs/Browser';
import CONST from '@src/CONST';

/**
 * Detects input or text area focus on browsers, to avoid scrolling on virtual viewports
 */
export default function useTackInputFocus(enable = false): boolean {
    const [, isInputFocusDebounced, setIsInputFocus] = useDebouncedState(false);
    const {shouldHideSidePanel} = useSidePanelState();

    const handleFocusIn = useCallback(
        (event: FocusEvent) => {
            const targetElement = event.target as HTMLElement;
            if (targetElement.tagName === CONST.ELEMENT_NAME.INPUT || targetElement.tagName === CONST.ELEMENT_NAME.TEXTAREA) {
                setIsInputFocus(true);
            }
        },
        [setIsInputFocus],
    );

    const handleFocusOut = useCallback(
        (event: FocusEvent) => {
            const targetElement = event.target as HTMLElement;
            if (targetElement.tagName === CONST.ELEMENT_NAME.INPUT || targetElement.tagName === CONST.ELEMENT_NAME.TEXTAREA) {
                setIsInputFocus(false);
            }
        },
        [setIsInputFocus],
    );

    useEffect(() => {
        if (!enable || !shouldHideSidePanel) {
            return;
        }
        // Putting the function here so a new instance of the function is created for each usage of the hook
        const resetScrollPositionOnVisualViewport = () => {
            if (isChromeIOS() && window.visualViewport?.offsetTop) {
                // On Chrome iOS, the visual viewport triggers a scroll event when the keyboard is opened, but some time the scroll position is not correct.
                // So this change is specific to Chrome iOS, helping to reset the viewport position correctly.
                window.scrollTo({top: -window.visualViewport.offsetTop});
            } else {
                window.scrollTo({top: 0});
            }
        };
        window.addEventListener('focusin', handleFocusIn);
        window.addEventListener('focusout', handleFocusOut);
        window.visualViewport?.addEventListener('scroll', resetScrollPositionOnVisualViewport);
        return () => {
            window.removeEventListener('focusin', handleFocusIn);
            window.removeEventListener('focusout', handleFocusOut);
            window.visualViewport?.removeEventListener('scroll', resetScrollPositionOnVisualViewport);
        };
    }, [enable, handleFocusIn, handleFocusOut, shouldHideSidePanel]);

    return isInputFocusDebounced;
}
