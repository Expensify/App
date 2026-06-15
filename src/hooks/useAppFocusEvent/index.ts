import {useEffect, useEffectEvent} from 'react';
import type {UseAppFocusEvent, UseAppFocusEventCallback} from './types';

/**
 * Runs the given callback when the app is focused (eg: after re-opening the app, switching tabs, or focusing the window)
 */
const useAppFocusEvent: UseAppFocusEvent = (callback: UseAppFocusEventCallback) => {
    const callbackEvent = useEffectEvent(callback);

    useEffect(() => {
        window.addEventListener('focus', callbackEvent);

        return () => {
            window.removeEventListener('focus', callbackEvent);
        };
    }, []);
};

export default useAppFocusEvent;
