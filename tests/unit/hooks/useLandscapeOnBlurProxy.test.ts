import {act, renderHook} from '@testing-library/react-native';

import useLandscapeOnBlurProxy from '@hooks/useLandscapeOnBlurProxy/index.android';

import type {FocusEvent, ScaledSize} from 'react-native';

import {Dimensions} from 'react-native';

const mockKeyboardState = {isKeyboardActive: false, isKeyboardAnimatingRef: {current: false}};
let mockIsInLandscapeMode = false;

jest.mock('@hooks/useKeyboardState', () => () => mockKeyboardState);
jest.mock('@hooks/useIsInLandscapeMode', () => () => mockIsInLandscapeMode);

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
        mockKeyboardState.isKeyboardActive = false;
        mockKeyboardState.isKeyboardAnimatingRef.current = false;
        mockIsInLandscapeMode = false;
    });

    afterEach(() => {
        jest.useRealTimers();
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

    it('removes the Dimensions listener on unmount', () => {
        // Given a mounted proxy
        const {unmount} = renderProxy();

        // When it unmounts
        unmount();

        // Then its window listener is detached
        const subscription = mockedDimensionsAddEventListener.mock.results.at(-1);
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(subscription?.type === 'return' && subscription.value.remove).toHaveBeenCalledTimes(1);
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
