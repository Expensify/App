import {screen} from '@testing-library/react-native';

import Text from '@components/Text';

import useAppState from '@hooks/useAppState/index.native';

import type {AppStateStatus} from 'react-native';

import React from 'react';
import {AppState} from 'react-native';

import renderScreenWithCover from '../../utils/ScreenCoverHarness';

const appStateListeners = new Set<(status: AppStateStatus) => void>();
let currentAppState: AppStateStatus = 'active';

/** Moves the app state the way the platform does: the value the hook can read changes, and whoever listens hears it. */
function emitAppState(status: AppStateStatus) {
    currentAppState = status;
    for (const listener of appStateListeners) {
        listener(status);
    }
}

function AppStateProbe({onAppStateChange}: {onAppStateChange?: (status: AppStateStatus) => void}) {
    const {isForeground} = useAppState({onAppStateChange});
    return <Text testID="app-state">{isForeground ? 'foreground' : 'not-foreground'}</Text>;
}

/**
 * Home renders a Lottie animation through the insights section, and Lottie reads this hook to drop the animation for a
 * plain view while the app is not in the foreground. A hidden screen holds no AppState subscription, so a change that
 * lands while an RHP or a modal covers Home is never heard, and a reveal that only resubscribes leaves the hook
 * claiming a foreground the app has left.
 */
describe('useAppState on native', () => {
    beforeEach(() => {
        appStateListeners.clear();
        currentAppState = 'active';
        jest.spyOn(AppState, 'currentState', 'get').mockImplementation(() => currentAppState);
        jest.spyOn(AppState, 'addEventListener').mockImplementation((type, listener) => {
            appStateListeners.add(listener);
            return {
                remove: () => {
                    appStateListeners.delete(listener);
                },
            };
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('reports the app state that changed while the screen was covered', async () => {
        const screenCover = renderScreenWithCover(<AppStateProbe />);
        expect(screen.getByTestId('app-state')).toHaveTextContent('foreground');

        await screenCover.hide();
        emitAppState('background');
        await screenCover.reveal();

        expect(screen.getByTestId('app-state')).toHaveTextContent('not-foreground');
        screenCover.unmount();
    });

    it('hands a change to the callback the caller passed in', async () => {
        const onAppStateChange = jest.fn();
        const screenCover = renderScreenWithCover(<AppStateProbe onAppStateChange={onAppStateChange} />);

        emitAppState('background');

        expect(onAppStateChange).toHaveBeenCalledTimes(1);
        expect(onAppStateChange).toHaveBeenCalledWith('background');
        screenCover.unmount();
    });

    it('keeps reporting changes that arrive after a reveal', async () => {
        const screenCover = renderScreenWithCover(<AppStateProbe />);

        await screenCover.hide();
        await screenCover.reveal();
        emitAppState('background');
        await screenCover.reveal();

        expect(screen.getByTestId('app-state')).toHaveTextContent('not-foreground');
        screenCover.unmount();
    });
});
