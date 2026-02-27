import React from 'react';
import type {AppStateStatus} from 'react-native';
import {AppState} from 'react-native';
import type AppStateType from './types';
import type {UseAppStateProps} from './types';

function useAppState({onAppStateChange}: UseAppStateProps = {}) {
    const [appState, setAppState] = React.useState<AppStateType>({
        isForeground: AppState.currentState === 'active',
        isInactive: AppState.currentState === 'inactive',
        isBackground: AppState.currentState === 'background',
    });

    React.useEffect(() => {
        function handleAppStateChange(nextAppState: AppStateStatus) {
            setAppState({
                isForeground: nextAppState === 'active',
                isInactive: nextAppState === 'inactive',
                isBackground: nextAppState === 'background',
            });

            onAppStateChange?.(nextAppState);
        }
        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => subscription.remove();
    }, [onAppStateChange]);

    return appState;
}

export default useAppState;
