import {useEffect} from 'react';
import {AppState} from 'react-native';
import {UseWindowFocusEvent, UseWindowFocusEventCallback} from './types';

const useWindowFocusEvent: UseWindowFocusEvent = (callback: UseWindowFocusEventCallback) => {
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

export default useWindowFocusEvent;
