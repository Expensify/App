import {useCallback, useEffect} from 'react';
import useDebouncedState from '@hooks/useDebouncedState';

export default function useIsInputFocus(enable = false): boolean {
    const [, isInputFocusDebounced, setIsInputFocus] = useDebouncedState(false);

    const handleFocusIn = useCallback(
        (event: FocusEvent) => {
            const targetElement = event.target as HTMLElement;
            if (targetElement.tagName === 'INPUT') {
                setIsInputFocus(true);
            }
        },
        [setIsInputFocus],
    );

    const handleFocusOut = useCallback(
        (event: FocusEvent) => {
            const targetElement = event.target as HTMLElement;
            if (targetElement.tagName === 'INPUT') {
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
