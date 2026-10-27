import {act, renderHook} from '@testing-library/react-native';

import useBlurOnKeyboardHide from '@hooks/useBlurOnKeyboardHide/index.android';

import type {AppStateStatus, ScaledSize} from 'react-native';
import type {KeyboardEventData} from 'react-native-keyboard-controller';

import {AppState, Dimensions} from 'react-native';

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

// eslint-disable-next-line @typescript-eslint/unbound-method
const mockedDimensionsAddEventListener = jest.mocked(Dimensions.addEventListener);

const ANIMATED_DURATION = 250;
const PORTRAIT_WINDOW = Dimensions.get('window');
const LANDSCAPE_WINDOW: ScaledSize = {...PORTRAIT_WINDOW, width: PORTRAIT_WINDOW.height, height: PORTRAIT_WINDOW.width};

const appStateListeners: Array<(state: AppStateStatus) => void> = [];

function emitKeyboardEvent(event: 'keyboardWillShow' | 'keyboardDidShow' | 'keyboardDidHide', height: number, duration = ANIMATED_DURATION) {
    const eventData: KeyboardEventData = {height, duration, timestamp: 0, target: -1, type: 'default', appearance: 'light'};
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

function setWindow(window: ScaledSize) {
    mockedDimensionsAddEventListener.mock.calls.at(-1)?.[1]({window, screen: window});
}

type Step = {appState: AppStateStatus} | {willShow: true} | {show: true} | {hide: number; duration?: number} | {window: ScaledSize} | {wait: number};

function runSteps(steps: Step[]) {
    for (const step of steps) {
        if ('appState' in step) {
            setAppState(step.appState);
        } else if ('willShow' in step) {
            emitKeyboardEvent('keyboardWillShow', 300);
        } else if ('show' in step) {
            emitKeyboardEvent('keyboardDidShow', 300);
        } else if ('window' in step) {
            setWindow(step.window);
        } else if ('wait' in step) {
            act(() => {
                jest.advanceTimersByTime(step.wait);
            });
        } else {
            emitKeyboardEvent('keyboardDidHide', step.hide, step.duration);
        }
    }
}

describe('useBlurOnKeyboardHide', () => {
    const appStateRemove = jest.fn();

    beforeEach(() => {
        jest.useFakeTimers();
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

    afterEach(() => {
        jest.useRealTimers();
    });

    it.each<[name: string, steps: Step[], expectedBlurCalls: number]>([
        ['blurs only on a zero-height hide while the app is active', [{hide: 100}, {hide: 0}], 1],
        ['does not blur when the keyboard hides because the app was backgrounded', [{appState: 'background'}, {hide: 0}], 0],
        ['does not blur on the re-sync hide emitted after returning to the foreground', [{appState: 'background'}, {appState: 'active'}, {hide: 0}], 0],
        ['blurs again once the keyboard reopens after a background trip', [{appState: 'background'}, {appState: 'active'}, {show: true}, {hide: 0}], 1],
        ['skips only one hide per background trip', [{appState: 'background'}, {appState: 'active'}, {hide: 0}, {show: true}, {hide: 0}], 1],
        ['does not consume the skip flag on a partial-height hide after a background trip', [{appState: 'background'}, {appState: 'active'}, {hide: 100}, {hide: 0}], 0],
        ['clears a stale skip flag on keyboard show even without a foreground hide', [{appState: 'background'}, {appState: 'active'}, {show: true}, {hide: 100}, {hide: 0}], 1],
        ['blurs right away on a predictive back hide, which reports no fixed duration', [{hide: 0, duration: -1}], 1],
        ['does not blur an instant hide before the rotation delay has passed', [{hide: 0, duration: 0}, {wait: 299}], 0],
        ['blurs an instant hide once no rotation explains it', [{hide: 0, duration: 0}, {wait: 300}], 1],
        ['does not blur when a rotation follows the instant hide', [{hide: 0, duration: 0}, {window: LANDSCAPE_WINDOW}, {wait: 300}], 0],
        ['does not blur when a rotation just preceded the instant hide', [{window: LANDSCAPE_WINDOW}, {wait: 50}, {hide: 0, duration: 0}, {wait: 300}], 0],
        ['blurs an instant hide that comes long after a rotation', [{window: LANDSCAPE_WINDOW}, {wait: 1000}, {hide: 0, duration: 0}, {wait: 300}], 1],
        ['does not blur when the keyboard comes back after an instant hide', [{hide: 0, duration: 0}, {show: true}, {wait: 300}], 0],
        ['does not blur when the keyboard starts coming back before the rotation delay has passed', [{hide: 0, duration: 0}, {wait: 100}, {willShow: true}, {wait: 300}], 0],
        ['does not blur when the app is backgrounded after an instant hide', [{hide: 0, duration: 0}, {appState: 'background'}, {wait: 300}], 0],
        ['does not treat a height-only window change as a rotation', [{hide: 0, duration: 0}, {window: {...PORTRAIT_WINDOW, height: 500}}, {wait: 300}], 1],
    ])('%s', (_name, steps, expectedBlurCalls) => {
        // Given an input whose blur is tracked
        const blur = jest.fn();
        renderHook(() => useBlurOnKeyboardHide({current: {blur}}));

        // When the keyboard, app state and window go through the steps of the scenario
        runSteps(steps);

        // Then the input is blurred only when the user dismissed the keyboard, and never when the app goes to the background or the device rotates
        expect(blur).toHaveBeenCalledTimes(expectedBlurCalls);
    });

    it('removes all subscriptions on unmount', () => {
        // Given a mounted hook
        const {unmount} = renderHook(() => useBlurOnKeyboardHide({current: {blur: jest.fn()}}));

        // When it unmounts
        unmount();

        // Then every listener it added is removed, so no blur can reach an unmounted input
        expect(appStateRemove).toHaveBeenCalledTimes(1);
        const dimensionsSubscription = mockedDimensionsAddEventListener.mock.results.at(-1);
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(dimensionsSubscription?.type === 'return' && dimensionsSubscription.value.remove).toHaveBeenCalledTimes(1);
        expect(mockRemove).toHaveBeenCalledTimes(3);
    });

    it('cancels a pending instant-hide blur on unmount', () => {
        // Given an instant hide that scheduled a blur
        const blur = jest.fn();
        const {unmount} = renderHook(() => useBlurOnKeyboardHide({current: {blur}}));
        emitKeyboardEvent('keyboardDidHide', 0, 0);

        // When the hook unmounts before the delay passes
        unmount();
        act(() => {
            jest.advanceTimersByTime(300);
        });

        // Then the blur never runs, because the input it targets is gone
        expect(blur).not.toHaveBeenCalled();
    });
});
