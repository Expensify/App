import type * as ActiveSpans from '@libs/telemetry/activeSpans';

import type {AppStateStatus} from 'react-native';

import {AppState} from 'react-native';

// Shared across the isolated module registries, since each one builds its own instance of the mocks below.
const mockCallOrder: string[] = [];

jest.mock('@libs/telemetry/flushTelemetry', () => jest.fn(() => mockCallOrder.push('flushTelemetry')));

jest.mock('@libs/telemetry/activeSpans', () => {
    const actual = jest.requireActual<typeof ActiveSpans>('@libs/telemetry/activeSpans');
    return {
        ...actual,
        cancelAllSpans: jest.fn(() => mockCallOrder.push('cancelAllSpans')),
    };
});

type AppStateListener = (state: AppStateStatus) => void;

/** Loads App actions in isolation and returns the AppState listener the module registers on import. */
function loadAppStateListener(): AppStateListener {
    const listeners: AppStateListener[] = [];
    const addEventListenerSpy = jest.spyOn(AppState, 'addEventListener').mockImplementation((type, listener) => {
        if (type === 'change') {
            listeners.push(listener);
        }
        return {remove: jest.fn()};
    });

    jest.isolateModules(() => {
        require('@libs/actions/App');
    });
    addEventListenerSpy.mockRestore();

    // App.ts registers its listener in its own module body, which runs after every import it pulls in has registered theirs.
    const listener = listeners.at(-1);
    if (!listener) {
        throw new Error('App actions did not register an AppState change listener');
    }
    return listener;
}

describe('Telemetry flush on AppState change', () => {
    let onAppStateChange: AppStateListener;

    beforeEach(() => {
        onAppStateChange = loadAppStateListener();
        onAppStateChange('active');
        mockCallOrder.length = 0;
    });

    it.each<AppStateStatus>(['background', 'inactive'])('flushes after canceling spans when the app goes %s', (nextState) => {
        // Given the app is active

        // When the OS moves the app to a state where it can be suspended or killed
        onAppStateChange(nextState);

        // Then the Sentry queue is drained once, after the spans are canceled so they are included in the flush
        expect(mockCallOrder).toEqual(['cancelAllSpans', 'flushTelemetry']);
    });

    it('does not flush when the app comes to the foreground', () => {
        // Given the app went to the background
        onAppStateChange('background');
        mockCallOrder.length = 0;

        // When it returns to the foreground
        onAppStateChange('active');

        // Then nothing is flushed, since the app is not about to be suspended
        expect(mockCallOrder).not.toContain('flushTelemetry');
    });
});
