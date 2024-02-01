import {useCallback, useEffect} from 'react';
import useDebouncedState from '@hooks/useDebouncedState';

/**
 * This hook to detech input or text area focus on browser
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

    useEffect(() => {
        if (!enable) {
            return;
        }
        window.addEventListener('focusin', handleFocusIn);
        window.addEventListener('focusout', handleFocusOut);
        return () => {
            window.removeEventListener('focusin', handleFocusIn);
            window.removeEventListener('focusout', handleFocusOut);
        };
    }, [enable, handleFocusIn, handleFocusOut]);

    return isInputFocusDebounced;
}
