import type {AppStateStatus} from 'react-native';

import {useEffect, useSyncExternalStore} from 'react';
import {AppState} from 'react-native';

import type AppStateType from './types';
import type {UseAppStateProps} from './types';

// One object per status, so a re-render that reads the same status hands consumers the same object back.
const APP_STATE_BY_STATUS: Record<AppStateStatus, AppStateType> = {
    active: {isForeground: true, isInactive: false, isBackground: false},
    inactive: {isForeground: false, isInactive: true, isBackground: false},
    background: {isForeground: false, isInactive: false, isBackground: true},
    unknown: {isForeground: false, isInactive: false, isBackground: false},
    extension: {isForeground: false, isInactive: false, isBackground: false},
};

function subscribeToAppStateStatus(onStatusChange: () => void) {
    const subscription = AppState.addEventListener('change', onStatusChange);
    return () => subscription.remove();
}

function getAppStateStatus(): AppStateStatus {
    return AppState.currentState;
}

function useAppState({onAppStateChange}: UseAppStateProps = {}): AppStateType {
    // The status is read back from AppState instead of being mirrored into state, so a screen that heard no event
    // because <Activity> had hidden it still reports the truth as soon as it is revealed.
    const status = useSyncExternalStore(subscribeToAppStateStatus, getAppStateStatus);

    useEffect(() => {
        if (!onAppStateChange) {
            return;
        }

        const subscription = AppState.addEventListener('change', onAppStateChange);
        return () => subscription.remove();
    }, [onAppStateChange]);

    return APP_STATE_BY_STATUS[status];
}

export default useAppState;
