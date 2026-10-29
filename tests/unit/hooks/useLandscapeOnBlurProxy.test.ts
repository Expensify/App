import {act, renderHook} from '@testing-library/react-native';

import useLandscapeOnBlurProxy from '@hooks/useLandscapeOnBlurProxy/index.android';

import type {FocusEvent, HostInstance, ScaledSize} from 'react-native';
import type {KeyboardEventData} from 'react-native-keyboard-controller';

import {Dimensions, TextInput} from 'react-native';

const mockKeyboardState = {isKeyboardActive: false, isKeyboardAnimatingRef: {current: false}};
let mockIsInLandscapeMode = false;

jest.mock('@hooks/useKeyboardState', () => () => mockKeyboardState);
jest.mock('@hooks/useIsInLandscapeMode', () => () => mockIsInLandscapeMode);

const mockKeyboardListeners = new Map<string, Array<(e: KeyboardEventData) => void>>();
const mockKeyboardListenerRemove = jest.fn();

jest.mock('react-native-keyboard-controller', () => ({
    KeyboardEvents: {
        addListener: jest.fn((event: string, handler: (e: KeyboardEventData) => void) => {
            mockKeyboardListeners.set(event, [...(mockKeyboardListeners.get(event) ?? []), handler]);
            return {remove: mockKeyboardListenerRemove};
        }),
    },
}));

// The react-native manual mock (__mocks__/react-native.ts) replaces Dimensions with an inert addEventListener,
// so the tests fire the window changes through the handler the hook registers there.
// eslint-disable-next-line @typescript-eslint/unbound-method
const mockedDimensionsAddEventListener = jest.mocked(Dimensions.addEventListener);

const PORTRAIT_WINDOW = Dimensions.get('window');
const LANDSCAPE_WINDOW: ScaledSize = {...PORTRAIT_WINDOW, width: PORTRAIT_WINDOW.height, height: PORTRAIT_WINDOW.width};
const REFOCUS_DELAY_MS = 100;
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the proxy only forwards the event, it never reads it
const blurEvent = {} as FocusEvent;

function setWindow(window: ScaledSize) {
    mockedDimensionsAddEventListener.mock.calls.at(-1)?.[1]({window, screen: window});
}

function emitKeyboardEvent(event: string, duration: number) {
    const eventData: KeyboardEventData = {height: 0, duration, timestamp: 0, target: -1, type: 'default', appearance: 'light'};
    for (const handler of mockKeyboardListeners.get(event) ?? []) {
        handler(eventData);
    }
}

function startKeyboardHide(duration: number) {
    emitKeyboardEvent('keyboardWillHide', duration);
}

function hideKeyboard(duration: number) {
    emitKeyboardEvent('keyboardDidHide', duration);
}

function advance(ms: number) {
    act(() => {
        jest.advanceTimersByTime(ms);
    });
}

function renderProxy() {
    const focus = jest.fn();
    const onBlur = jest.fn();
    const {result, unmount} = renderHook(() => useLandscapeOnBlurProxy({current: {focus}}, onBlur));
    return {focus, onBlur, unmount, blur: () => result.current?.(blurEvent)};
}

describe('useLandscapeOnBlurProxy', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        mockedDimensionsAddEventListener.mockClear();
        mockKeyboardListeners.clear();
        mockKeyboardListenerRemove.mockClear();
        mockKeyboardState.isKeyboardActive = false;
        mockKeyboardState.isKeyboardAnimatingRef.current = false;
        mockIsInLandscapeMode = false;
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.restoreAllMocks();
    });

    it('forwards every blur to the caller and does not re-focus a plain blur', () => {
        // Given an input that is not rotating and has no keyboard opening
        const {focus, onBlur, blur} = renderProxy();

        // When it is blurred and the re-focus delay passes
        blur();
        advance(REFOCUS_DELAY_MS);

        // Then the caller still hears about the blur, while the input is left blurred because nothing explains it
        expect(onBlur).toHaveBeenCalledWith(blurEvent);
        expect(focus).not.toHaveBeenCalled();
    });

    it.each<[name: string, window: ScaledSize]>([
        ['portrait to landscape', LANDSCAPE_WINDOW],
        ['landscape to portrait', {...PORTRAIT_WINDOW, width: PORTRAIT_WINDOW.width - 1}],
    ])('re-focuses when the %s width change lands after the blur', (_name, window) => {
        // Given an input blurred by a rotation whose width change has not reached JS yet
        const {focus, blur} = renderProxy();
        blur();

        // When the width change arrives inside the re-focus delay
        setWindow(window);
        advance(REFOCUS_DELAY_MS);

        // Then the input gets its focus back, because render-time orientation could not have caught this rotation
        expect(focus).toHaveBeenCalledTimes(1);
    });

    it('re-focuses when the width change shortly preceded the blur', () => {
        // Given a rotation that already changed the window width
        const {focus, blur} = renderProxy();
        setWindow(LANDSCAPE_WINDOW);
        advance(200);

        // When the layout catch-up blurs the input soon after
        blur();
        advance(REFOCUS_DELAY_MS);

        // Then the input is re-focused, because the blur is still attributed to that rotation
        expect(focus).toHaveBeenCalledTimes(1);
    });

    it('does not re-focus a blur that comes long after a rotation', () => {
        // Given a rotation that finished well before
        const {focus, blur} = renderProxy();
        setWindow(LANDSCAPE_WINDOW);
        advance(1000);

        // When the user blurs the input
        blur();
        advance(REFOCUS_DELAY_MS);

        // Then the blur is respected, because the rotation no longer explains it
        expect(focus).not.toHaveBeenCalled();
    });

    it('does not take focus back from another input the user moved to right after a rotation', () => {
        // Given an input that a rotation blurred and that got its focus back
        const {focus, blur} = renderProxy();
        setWindow(LANDSCAPE_WINDOW);
        advance(50);
        blur();
        advance(REFOCUS_DELAY_MS);
        expect(focus).toHaveBeenCalledTimes(1);

        // When the user taps another input while the rotation is still recent
        advance(150);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- only its presence matters to the proxy
        jest.spyOn(TextInput.State, 'currentlyFocusedInput').mockReturnValue({} as HostInstance);
        blur();
        advance(REFOCUS_DELAY_MS);

        // Then the other input keeps its focus, because the user moved it there on purpose
        expect(focus).toHaveBeenCalledTimes(1);
    });

    it('does not re-focus after the user dismisses the keyboard right after a rotation', () => {
        // Given a rotation that just changed the window width
        const {focus, blur} = renderProxy();
        setWindow(LANDSCAPE_WINDOW);
        advance(200);

        // When the user dismisses the keyboard with a back press, which hides it with an animation and blurs the input
        startKeyboardHide(250);
        advance(250);
        hideKeyboard(250);
        blur();
        advance(REFOCUS_DELAY_MS);

        // Then the input stays blurred, because the dismissal, not the rotation, explains this blur
        expect(focus).not.toHaveBeenCalled();
    });

    it('does not re-focus after the user dismisses the keyboard and a rotation lands during the hide animation', () => {
        // Given the user dismissed the keyboard with a back press, and its animated hide has started
        const {focus, blur} = renderProxy();
        startKeyboardHide(250);

        // When a rotation changes the window width before the hide animation ends, and the input is blurred once it does
        advance(100);
        setWindow(LANDSCAPE_WINDOW);
        advance(150);
        hideKeyboard(250);
        blur();
        advance(REFOCUS_DELAY_MS);

        // Then the input stays blurred, because the end of the animated hide still marks it as a user dismissal
        expect(focus).not.toHaveBeenCalled();
    });

    it('does not re-focus when the input is dismissed right after a rotation and the hide animation is still running', () => {
        // Given a rotation that just changed the window width
        const {focus, blur} = renderProxy();
        setWindow(LANDSCAPE_WINDOW);
        advance(200);

        // When Keyboard.dismiss() blurs the input first and the animated hide starts, but has not finished, before the re-focus delay passes
        blur();
        startKeyboardHide(250);
        advance(REFOCUS_DELAY_MS);

        // Then the input stays blurred, because the start of an animated hide already marks it as a user dismissal
        expect(focus).not.toHaveBeenCalled();
    });

    it('still re-focuses when the rotation tears the keyboard down without an animation', () => {
        // Given a rotation that just changed the window width
        const {focus, blur} = renderProxy();
        setWindow(LANDSCAPE_WINDOW);

        // When the keyboard disappears instantly, as it does on rotation, and the input is blurred
        hideKeyboard(0);
        blur();
        advance(REFOCUS_DELAY_MS);

        // Then the input is re-focused, because an instant hide is part of the rotation rather than a user dismissal
        expect(focus).toHaveBeenCalledTimes(1);
    });

    it('does not treat a height-only window change as a rotation', () => {
        // Given a blurred input
        const {focus, blur} = renderProxy();
        blur();

        // When only the window height changes, as the soft keyboard does on Android
        setWindow({...PORTRAIT_WINDOW, height: PORTRAIT_WINDOW.height - 300});
        advance(REFOCUS_DELAY_MS);

        // Then the input stays blurred
        expect(focus).not.toHaveBeenCalled();
    });

    it('re-focuses a blur that happens while the keyboard is opening in landscape', () => {
        // Given an input in landscape whose keyboard is still animating open
        mockIsInLandscapeMode = true;
        mockKeyboardState.isKeyboardActive = true;
        mockKeyboardState.isKeyboardAnimatingRef.current = true;
        const {focus, blur} = renderProxy();

        // When native blurs it before the keyboard finishes opening
        blur();
        advance(REFOCUS_DELAY_MS);

        // Then it is re-focused, because the blur came from the input being pushed behind the opening keyboard
        expect(focus).toHaveBeenCalledTimes(1);
    });

    it('removes the Dimensions and keyboard listeners on unmount', () => {
        // Given a mounted proxy
        const {unmount} = renderProxy();

        // When it unmounts
        unmount();

        // Then its window and keyboard listeners are detached
        const subscription = mockedDimensionsAddEventListener.mock.results.at(-1);
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(subscription?.type === 'return' && subscription.value.remove).toHaveBeenCalledTimes(1);
        expect(mockKeyboardListenerRemove).toHaveBeenCalledTimes(2);
    });

    it('cancels a pending re-focus on unmount', () => {
        // Given an input blurred by a rotation, with its re-focus still pending
        const {focus, blur, unmount} = renderProxy();
        setWindow(LANDSCAPE_WINDOW);
        blur();

        // When the proxy unmounts before the re-focus delay passes
        unmount();
        advance(REFOCUS_DELAY_MS);

        // Then the re-focus never runs, because the input it targets is gone
        expect(focus).not.toHaveBeenCalled();
    });
});
