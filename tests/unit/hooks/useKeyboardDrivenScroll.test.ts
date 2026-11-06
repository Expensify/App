import {renderHook} from '@testing-library/react-native';

import type {KeyboardScrollable, KeyboardScrollTarget, UseKeyboardDrivenScroll} from '@hooks/useKeyboardDrivenScroll/types';

import type {RefObject} from 'react';
import type {KeyboardHandler} from 'react-native-keyboard-controller';

import {KeyboardController, useKeyboardHandler} from 'react-native-keyboard-controller';

type KeyboardEvent = Parameters<NonNullable<KeyboardHandler['onStart']>>[0];

const mockScrollTo = jest.fn();
let mockVisibleHeight = 0;
const mockAnimatedRef = jest.fn();
const mockSetFrameCallbackActive = jest.fn();
let mockFrameCallback: (() => void) | undefined;

jest.mock('react-native-reanimated', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-native-reanimated/mock'),
    useAnimatedRef: () => mockAnimatedRef,
    measure: () => ({x: 0, y: 0, width: 0, height: mockVisibleHeight, pageX: 0, pageY: 0}),
    scrollTo: (...args: unknown[]) => {
        mockScrollTo(...args);
    },
    useFrameCallback: (callback: () => void) => {
        mockFrameCallback = callback;
        return {callbackId: 1, isActive: false, setActive: mockSetFrameCallbackActive};
    },
}));

// Run UI thread work synchronously, without flushing timers
jest.mock('react-native-worklets', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-native-worklets/src/mock'),
    scheduleOnUI: (worklet: () => void) => worklet(),
    scheduleOnRN: (callback: () => void) => callback(),
}));

type HookModule = {default: UseKeyboardDrivenScroll};

const useKeyboardDrivenScroll = jest.requireActual<HookModule>('@hooks/useKeyboardDrivenScroll/index.native.ts').default;
const useKeyboardDrivenScrollWeb = jest.requireActual<HookModule>('@hooks/useKeyboardDrivenScroll/index.ts').default;

const KEYBOARD_HEIGHT = 300;

function createKeyboardEvent(height: number): KeyboardEvent {
    return {height, progress: height > 0 ? 1 : 0, duration: 250, target: 1};
}

function createScrollableRef(): RefObject<KeyboardScrollable | null> {
    // Only passed to the mocked animated ref
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- see the comment above
    return {current: {} as KeyboardScrollable};
}

/** Renders the hook and returns the keyboard handlers it registered, so tests can play keyboard frames. */
function renderKeyboardDrivenScroll(scrollableRef: RefObject<KeyboardScrollable | null> | undefined = createScrollableRef()) {
    const {result} = renderHook(() => useKeyboardDrivenScroll(scrollableRef));
    const handlers = jest.mocked(useKeyboardHandler).mock.lastCall?.[0] ?? {};
    return {
        scrollWithKeyboard: (target: KeyboardScrollTarget) => result.current(target),
        startKeyboard: (height: number) => handlers.onStart?.(createKeyboardEvent(height)),
        moveKeyboard: (height: number) => handlers.onMove?.(createKeyboardEvent(height)),
        endKeyboard: (height: number) => handlers.onEnd?.(createKeyboardEvent(height)),
        runFrame: () => mockFrameCallback?.(),
    };
}

describe('useKeyboardDrivenScroll', () => {
    beforeEach(() => {
        // Lets tests move Date.now forward
        jest.useFakeTimers();
        jest.clearAllMocks();
        mockVisibleHeight = 600;
        mockFrameCallback = undefined;
        jest.mocked(KeyboardController.isVisible).mockReturnValue(false);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('scrolls to the offset on every keyboard frame without animation, and once more when the keyboard stops', () => {
        // Given focus while the keyboard is closed
        const {scrollWithKeyboard, startKeyboard, moveKeyboard, endKeyboard} = renderKeyboardDrivenScroll();
        const isHandled = scrollWithKeyboard({offset: 120});
        startKeyboard(KEYBOARD_HEIGHT);

        // Then nothing scrolls before the keyboard moves
        expect(isHandled).toBe(true);
        expect(mockScrollTo).not.toHaveBeenCalled();

        // When the keyboard animates and then stops
        moveKeyboard(100);
        moveKeyboard(200);
        endKeyboard(KEYBOARD_HEIGHT);

        // Then each frame scrolls without animation, so it doesn't lag behind the keyboard
        expect(mockScrollTo).toHaveBeenCalledTimes(3);
        expect(mockScrollTo).toHaveBeenNthCalledWith(1, mockAnimatedRef, 0, 120, false);
        expect(mockScrollTo).toHaveBeenNthCalledWith(2, mockAnimatedRef, 0, 120, false);
        expect(mockScrollTo).toHaveBeenNthCalledWith(3, mockAnimatedRef, 0, 120, false);
    });

    it('points the animated ref at the scrollable the caller passed and starts the watcher', () => {
        // Given a caller's own scrollable ref
        const scrollableRef = createScrollableRef();
        const {scrollWithKeyboard} = renderKeyboardDrivenScroll(scrollableRef);

        // When a target is set
        scrollWithKeyboard({offset: 10});

        // Then the animated ref follows it and the watcher starts
        expect(mockAnimatedRef).toHaveBeenCalledWith(scrollableRef.current);
        expect(mockSetFrameCallbackActive).toHaveBeenCalledWith(true);
    });

    it('does not scroll past the top for a negative offset', () => {
        // Given a negative offset
        const {scrollWithKeyboard, moveKeyboard} = renderKeyboardDrivenScroll();
        scrollWithKeyboard({offset: -50});

        // When the keyboard moves
        moveKeyboard(100);

        // Then it stops at the top
        expect(mockScrollTo).toHaveBeenCalledWith(mockAnimatedRef, 0, 0, false);
    });

    it('scrolls right away with animation when the keyboard is already open', () => {
        // Given the keyboard is already open, so no frames will come
        const {scrollWithKeyboard, startKeyboard, endKeyboard} = renderKeyboardDrivenScroll();
        startKeyboard(KEYBOARD_HEIGHT);
        endKeyboard(KEYBOARD_HEIGHT);

        // When a target is set
        scrollWithKeyboard({offset: 80});

        // Then it scrolls at once, animated
        expect(mockScrollTo).toHaveBeenCalledTimes(1);
        expect(mockScrollTo).toHaveBeenCalledWith(mockAnimatedRef, 0, 80, true);
    });

    it('scrolls right away when the keyboard was already visible when the hook mounted', () => {
        // Given the keyboard was open when the hook mounted
        jest.mocked(KeyboardController.isVisible).mockReturnValue(true);
        const {scrollWithKeyboard} = renderKeyboardDrivenScroll();

        // When a target is set
        scrollWithKeyboard({offset: 80});

        // Then it scrolls at once, animated
        expect(mockScrollTo).toHaveBeenCalledWith(mockAnimatedRef, 0, 80, true);
    });

    it('drops the target when the keyboard starts closing', () => {
        // Given a target followed while the keyboard opens
        const {scrollWithKeyboard, startKeyboard, moveKeyboard} = renderKeyboardDrivenScroll();
        scrollWithKeyboard({offset: 120});
        startKeyboard(KEYBOARD_HEIGHT);
        moveKeyboard(100);
        mockScrollTo.mockClear();

        // When the keyboard closes
        startKeyboard(0);
        moveKeyboard(100);
        moveKeyboard(0);

        // Then it stops scrolling, since the user left the input
        expect(mockScrollTo).not.toHaveBeenCalled();
    });

    it('applies the target once more, animated, after the keyboard has settled', () => {
        // Given the keyboard finished opening, after which Android may still move the input
        const {scrollWithKeyboard, startKeyboard, endKeyboard, runFrame} = renderKeyboardDrivenScroll();
        scrollWithKeyboard({offset: 120});
        startKeyboard(KEYBOARD_HEIGHT);
        endKeyboard(KEYBOARD_HEIGHT);
        mockScrollTo.mockClear();

        // When frames run before the settle delay
        jest.advanceTimersByTime(399);
        runFrame();

        // Then nothing scrolls yet, as the native scroll may still run
        expect(mockScrollTo).not.toHaveBeenCalled();

        // When frames run after the settle delay
        jest.advanceTimersByTime(1);
        runFrame();
        runFrame();

        // Then the target is applied once, animated
        expect(mockScrollTo).toHaveBeenCalledTimes(1);
        expect(mockScrollTo).toHaveBeenCalledWith(mockAnimatedRef, 0, 120, true);
    });

    it('applies the target again after the scroll view is resized', () => {
        // Given the target was applied after settling
        const {scrollWithKeyboard, startKeyboard, endKeyboard, runFrame} = renderKeyboardDrivenScroll();
        scrollWithKeyboard({offset: 120});
        startKeyboard(KEYBOARD_HEIGHT);
        endKeyboard(KEYBOARD_HEIGHT);
        jest.advanceTimersByTime(400);
        runFrame();
        mockScrollTo.mockClear();

        // When the scroll view shrinks later
        mockVisibleHeight = 300;
        jest.advanceTimersByTime(100);
        runFrame();

        // Then it waits for the native scroll to finish
        expect(mockScrollTo).not.toHaveBeenCalled();
        jest.advanceTimersByTime(399);
        runFrame();
        expect(mockScrollTo).not.toHaveBeenCalled();

        // When the settle delay is over
        jest.advanceTimersByTime(1);
        runFrame();

        // Then the target is applied again, animated
        expect(mockScrollTo).toHaveBeenCalledTimes(1);
        expect(mockScrollTo).toHaveBeenCalledWith(mockAnimatedRef, 0, 120, true);
    });

    it('keeps a pending settle past the target lifetime', () => {
        // Given a resize just before the target expires
        const {scrollWithKeyboard, startKeyboard, endKeyboard, runFrame} = renderKeyboardDrivenScroll();
        scrollWithKeyboard({offset: 120});
        startKeyboard(KEYBOARD_HEIGHT);
        endKeyboard(KEYBOARD_HEIGHT);
        jest.advanceTimersByTime(400);
        runFrame();
        jest.advanceTimersByTime(1500);
        mockVisibleHeight = 300;
        runFrame();
        mockScrollTo.mockClear();

        // When the settle delay ends after the lifetime
        jest.advanceTimersByTime(400);
        runFrame();

        // Then the target is still applied
        expect(mockScrollTo).toHaveBeenCalledWith(mockAnimatedRef, 0, 120, true);
    });

    it('drops the target once its lifetime is over and no settle is pending', () => {
        // Given a target that has already settled
        const {scrollWithKeyboard, startKeyboard, moveKeyboard, endKeyboard, runFrame} = renderKeyboardDrivenScroll();
        scrollWithKeyboard({offset: 120});
        startKeyboard(KEYBOARD_HEIGHT);
        endKeyboard(KEYBOARD_HEIGHT);
        jest.advanceTimersByTime(400);
        runFrame();
        mockScrollTo.mockClear();

        // When the lifetime passes, then the view resizes
        jest.advanceTimersByTime(1601);
        runFrame();
        mockVisibleHeight = 300;
        runFrame();
        jest.advanceTimersByTime(400);
        runFrame();
        moveKeyboard(KEYBOARD_HEIGHT);

        // Then nothing scrolls, as later changes aren't about this input
        expect(mockScrollTo).not.toHaveBeenCalled();
    });

    it('scrolls without the keyboard when no keyboard comes, for example with a hardware keyboard', () => {
        // Given focus with no keyboard coming
        const {scrollWithKeyboard, runFrame} = renderKeyboardDrivenScroll();
        scrollWithKeyboard({offset: 120});

        // When frames run before the wait is over
        jest.advanceTimersByTime(499);
        runFrame();

        // Then nothing scrolls yet, as the keyboard may still open
        expect(mockScrollTo).not.toHaveBeenCalled();

        // When frames run after the wait
        jest.advanceTimersByTime(1);
        runFrame();
        runFrame();

        // Then the target is applied once, animated
        expect(mockScrollTo).toHaveBeenCalledTimes(1);
        expect(mockScrollTo).toHaveBeenCalledWith(mockAnimatedRef, 0, 120, true);
    });

    it('does not scroll without the keyboard when the keyboard starts opening in time', () => {
        // Given focus while the keyboard is closed
        const {scrollWithKeyboard, startKeyboard, runFrame} = renderKeyboardDrivenScroll();
        scrollWithKeyboard({offset: 120});

        // When the keyboard starts opening before the wait is over
        startKeyboard(KEYBOARD_HEIGHT);
        jest.advanceTimersByTime(500);
        runFrame();

        // Then only keyboard frames scroll
        expect(mockScrollTo).not.toHaveBeenCalled();
    });

    it('does not scroll without the keyboard when the keyboard is already opening as the target is set', () => {
        // Given the keyboard started before focus reached JS (common on iOS)
        const {scrollWithKeyboard, startKeyboard, runFrame} = renderKeyboardDrivenScroll();
        startKeyboard(KEYBOARD_HEIGHT);

        // When the target is set and frames run past the wait
        scrollWithKeyboard({offset: 120});
        jest.advanceTimersByTime(500);
        runFrame();

        // Then only keyboard frames scroll
        expect(mockScrollTo).not.toHaveBeenCalled();
    });

    it('does nothing but reports the scroll as handled when the scrollable is not mounted', () => {
        // Given a caller whose scrollable is not mounted yet
        const {scrollWithKeyboard, moveKeyboard} = renderKeyboardDrivenScroll({current: null});

        // When a target is set and the keyboard moves
        const isHandled = scrollWithKeyboard({offset: 120});
        moveKeyboard(100);

        // Then nothing happens, and the caller is told not to scroll either
        expect(isHandled).toBe(true);
        expect(mockAnimatedRef).not.toHaveBeenCalled();
        expect(mockSetFrameCallbackActive).not.toHaveBeenCalled();
        expect(mockScrollTo).not.toHaveBeenCalled();
    });

    it('reports the scroll as not handled on web', () => {
        // Given the web version
        const {result} = renderHook(() => useKeyboardDrivenScrollWeb(createScrollableRef()));

        // When a target is set
        const isHandled = result.current({offset: 120});

        // Then the caller scrolls on its own
        expect(isHandled).toBe(false);
        expect(mockScrollTo).not.toHaveBeenCalled();
    });
});
