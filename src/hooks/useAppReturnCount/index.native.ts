import {useEffect, useRef, useState} from 'react';
import {AppState} from 'react-native';

/**
 * Counts returns from the background. iOS also goes `inactive` for Control Center, the app switcher,
 * permission dialogs and the camera, and each of those comes back `active`, so require a real
 * background first.
 */
function useAppReturnCount(): number {
    const [returnCount, setReturnCount] = useState(0);
    const wasBackgroundedRef = useRef(false);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState === 'background') {
                wasBackgroundedRef.current = true;
                return;
            }
            if (nextAppState !== 'active' || !wasBackgroundedRef.current) {
                return;
            }
            wasBackgroundedRef.current = false;
            setReturnCount((count) => count + 1);
        });

        return () => subscription.remove();
    }, []);

    return returnCount;
}

export default useAppReturnCount;
