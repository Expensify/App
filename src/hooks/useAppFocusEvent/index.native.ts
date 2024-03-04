import {useEffect} from 'react';
import {AppState} from 'react-native';
import type {UseAppFocusEvent, UseAppFocusEventCallback} from './types';

const useAppFocusEvent: UseAppFocusEvent = (callback: UseAppFocusEventCallback) => {
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (appState) => {
            if (appState !== 'active') {
                return;
            }
            callback();
        });

        return () => {
            subscription.remove();
        };
    }, [callback]);
};

export default useAppFocusEvent;
