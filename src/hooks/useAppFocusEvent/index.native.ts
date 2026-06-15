import {useEffect, useEffectEvent} from 'react';
import {AppState} from 'react-native';
import type {UseAppFocusEvent, UseAppFocusEventCallback} from './types';

const useAppFocusEvent: UseAppFocusEvent = (callback: UseAppFocusEventCallback) => {
    const callbackEvent = useEffectEvent(callback);

    useEffect(() => {
        const subscription = AppState.addEventListener('change', (appState) => {
            if (appState !== 'active') {
                return;
            }
            callbackEvent();
        });

        return () => {
            subscription.remove();
        };
    }, []);
};

export default useAppFocusEvent;
