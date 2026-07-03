import useCallbackRef from '@hooks/useCallbackRef';

import {useEffect} from 'react';

type UseEscapeKeydownOptions = {
    isActive?: boolean;
    ownerWindow?: Window;
};

const defaultWindow = typeof window === 'undefined' ? undefined : window;

function useEscapeKeydown(callback: (event: KeyboardEvent) => void, options: UseEscapeKeydownOptions = {}): void {
    const {isActive = true, ownerWindow = defaultWindow} = options;
    const stableCallback = useCallbackRef(callback);

    useEffect(() => {
        if (!isActive || !ownerWindow) {
            return undefined;
        }
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') {
                return;
            }
            if (event.isComposing) {
                return;
            }
            stableCallback(event);
        };
        // window capture so we beat react-native-key-command's document listener.
        ownerWindow.addEventListener('keydown', handleKeyDown, {capture: true});
        return () => ownerWindow.removeEventListener('keydown', handleKeyDown, {capture: true});
    }, [isActive, ownerWindow, stableCallback]);
}

export default useEscapeKeydown;
