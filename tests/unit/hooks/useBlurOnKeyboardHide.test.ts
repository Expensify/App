import {renderHook} from '@testing-library/react-native';

import useBlurOnKeyboardHide from '@hooks/useBlurOnKeyboardHide/index.android';

import type {AppStateStatus} from 'react-native';
import type {KeyboardEventData} from 'react-native-keyboard-controller';

import {AppState} from 'react-native';

const mockKeyboardListeners: Record<string, Array<(e: KeyboardEventData) => void>> = {};
const mockRemove = jest.fn();

jest.mock('react-native-keyboard-controller', () => ({
    KeyboardEvents: {
        addListener: jest.fn((event: string, handler: (e: KeyboardEventData) => void) => {
            (mockKeyboardListeners[event] ??= []).push(handler);
            return {remove: mockRemove};
        }),
    },
}));

const appStateListeners: Array<(state: AppStateStatus) => void> = [];

function emitKeyboardEvent(event: 'keyboardDidShow' | 'keyboardDidHide', height: number) {
    const eventData: KeyboardEventData = {height, duration: 0, timestamp: 0, target: -1, type: 'default', appearance: 'light'};
    for (const handler of mockKeyboardListeners[event] ?? []) {
        handler(eventData);
    }
}

function setAppState(state: AppStateStatus) {
    (AppState as {currentState: AppStateStatus}).currentState = state;
    for (const handler of appStateListeners) {
        handler(state);
    }
}

type Step = {appState: AppStateStatus} | {show: true} | {hide: number};

function runSteps(steps: Step[]) {
    for (const step of steps) {
        if ('appState' in step) {
            setAppState(step.appState);
        } else if ('show' in step) {
            emitKeyboardEvent('keyboardDidShow', 300);
        } else {
            emitKeyboardEvent('keyboardDidHide', step.hide);
        }
    }
}

describe('useBlurOnKeyboardHide', () => {
    const appStateRemove = jest.fn();

    beforeEach(() => {
        for (const key of Object.keys(mockKeyboardListeners)) {
            delete mockKeyboardListeners[key];
        }
        appStateListeners.length = 0;
        jest.clearAllMocks();
        jest.spyOn(AppState, 'addEventListener').mockImplementation((type, handler) => {
            appStateListeners.push(handler);
            return {remove: appStateRemove} as ReturnType<typeof AppState.addEventListener>;
        });
        setAppState('active');
    });

    it.each<[name: string, steps: Step[], expectedBlurCalls: number]>([
        ['blurs only on a zero-height hide while the app is active', [{hide: 100}, {hide: 0}], 1],
        ['does not blur when the keyboard hides because the app was backgrounded', [{appState: 'background'}, {hide: 0}], 0],
        ['does not blur on the re-sync hide emitted after returning to the foreground', [{appState: 'background'}, {appState: 'active'}, {hide: 0}], 0],
        ['blurs again once the keyboard reopens after a background trip', [{appState: 'background'}, {appState: 'active'}, {show: true}, {hide: 0}], 1],
        ['skips only one hide per background trip', [{appState: 'background'}, {appState: 'active'}, {hide: 0}, {show: true}, {hide: 0}], 1],
        ['does not consume the skip flag on a partial-height hide after a background trip', [{appState: 'background'}, {appState: 'active'}, {hide: 100}, {hide: 0}], 0],
        ['clears a stale skip flag on keyboard show even without a foreground hide', [{appState: 'background'}, {appState: 'active'}, {show: true}, {hide: 100}, {hide: 0}], 1],
    ])('%s', (_name, steps, expectedBlurCalls) => {
        const blur = jest.fn();
        renderHook(() => useBlurOnKeyboardHide({current: {blur}}));

        runSteps(steps);

        expect(blur).toHaveBeenCalledTimes(expectedBlurCalls);
    });

    it('removes all subscriptions on unmount', () => {
        const {unmount} = renderHook(() => useBlurOnKeyboardHide({current: {blur: jest.fn()}}));
        unmount();

        expect(appStateRemove).toHaveBeenCalledTimes(1);
        expect(mockRemove).toHaveBeenCalledTimes(2);
    });
});
