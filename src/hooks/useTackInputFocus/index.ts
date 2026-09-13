import useDebouncedState from '@hooks/useDebouncedState';
import useSidePanelState from '@hooks/useSidePanelState';

import isHTMLElement from '@libs/isHTMLElement';

import CONST from '@src/CONST';

import {useCallback, useEffect} from 'react';

/**
 * Detects input or text area focus on browsers, to avoid scrolling on virtual viewports
 */
export default function useTackInputFocus(enable = false): boolean {
    const [, isInputFocusDebounced, setIsInputFocus] = useDebouncedState(false);
    const {shouldHideSidePanel} = useSidePanelState();

    const handleFocusIn = useCallback(
        (event: FocusEvent) => {
            const targetElement = event.target;
            if (!isHTMLElement(targetElement)) {
                return;
            }
            if (targetElement.tagName === CONST.ELEMENT_NAME.INPUT || targetElement.tagName === CONST.ELEMENT_NAME.TEXTAREA) {
                setIsInputFocus(true);
            }
        },
        [setIsInputFocus],
    );

    const handleFocusOut = useCallback(
        (event: FocusEvent) => {
            const targetElement = event.target;
            if (!isHTMLElement(targetElement)) {
                return;
            }
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
        window.addEventListener('focusin', handleFocusIn);
        window.addEventListener('focusout', handleFocusOut);
        return () => {
            window.removeEventListener('focusin', handleFocusIn);
            window.removeEventListener('focusout', handleFocusOut);
        };
    }, [enable, handleFocusIn, handleFocusOut, shouldHideSidePanel]);

    return isInputFocusDebounced;
}
