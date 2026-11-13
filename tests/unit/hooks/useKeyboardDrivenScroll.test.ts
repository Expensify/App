import {renderHook} from '@testing-library/react-native';

import type {KeyboardScrollable, KeyboardScrollTarget, UseKeyboardDrivenScroll} from '@hooks/useKeyboardDrivenScroll/types';

import type {RefObject} from 'react';
import type {KeyboardHandler} from 'react-native-keyboard-controller';

import {useKeyboardHandler, useReanimatedFocusedInput, useReanimatedKeyboardAnimation} from 'react-native-keyboard-controller';

type KeyboardEvent = Parameters<NonNullable<KeyboardHandler['onStart']>>[0];

const mockScrollTo = jest.fn();
let mockVisibleHeight = 0;
let mockScrollOffset = 0;
// Keeps what it was pointed at, as the real animated ref does
const mockAnimatedRefState: {current: unknown} = {current: null};
const mockAnimatedRef = Object.assign(
    jest.fn((instance: unknown) => {
        mockAnimatedRef.current = instance;
    }),
    mockAnimatedRefState,
);
const mockSetFrameCallbackActive = jest.fn();
let mockFrameCallback: (() => void) | undefined;
let mockFocusedInputTag: number | null = null;

jest.mock('react-native-reanimated', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-native-reanimated/mock'),
    useAnimatedRef: () => mockAnimatedRef,
    measure: () => ({x: 0, y: 0, width: 0, height: mockVisibleHeight, pageX: 0, pageY: 0}),
    useScrollOffset: () => ({get: () => mockScrollOffset}),
    scrollTo: (...args: unknown[]) => {
        mockScrollTo(...args);
    },
    useFrameCallback: (callback: () => void) => {
        mockFrameCallback = callback;
        return {callbackId: 1, isActive: false, setActive: mockSetFrameCallbackActive};
    },
}));

// UI thread work runs synchronously, without flushing timers
jest.mock('react-native-worklets', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-native-worklets/src/mock'),
    scheduleOnUI: (worklet: () => void) => worklet(),
}));

type HookModule = {default: UseKeyboardDrivenScroll};

const useKeyboardDrivenScroll = jest.requireActual<HookModule>('@hooks/useKeyboardDrivenScroll/index.native.ts').default;
const useKeyboardDrivenScrollWeb = jest.requireActual<HookModule>('@hooks/useKeyboardDrivenScroll/index.ts').default;

const KEYBOARD_HEIGHT = 300;

const FIRST_INPUT_TAG = 1;
const SECOND_INPUT_TAG = 2;

/** Lifetime of a target plus one settle delay and a margin, after which the watcher stops. */
const WATCHER_STOP_DELAY_MS = 2500;

function createKeyboardEvent(height: number): KeyboardEvent {
    return {height, progress: height / KEYBOARD_HEIGHT, duration: 250, target: FIRST_INPUT_TAG};
}

function createScrollableRef(): RefObject<KeyboardScrollable | null> {
    // Only passed to the mocked animated ref
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- see the comment above
    return {current: {} as KeyboardScrollable};
}

/** Renders the hook and returns the keyboard handlers it registered, so tests can play keyboard frames. */
function renderKeyboardDrivenScroll(scrollableRef: RefObject<KeyboardScrollable | null> | undefined = createScrollableRef()) {
    const {result, unmount} = renderHook(() => useKeyboardDrivenScroll(scrollableRef));
    const handlers = jest.mocked(useKeyboardHandler).mock.lastCall?.[0] ?? {};
    return {
        scrollWithKeyboard: (target: KeyboardScrollTarget) => result.current(target),
        startKeyboard: (height: number) => handlers.onStart?.(createKeyboardEvent(height)),
        moveKeyboard: (height: number) => handlers.onMove?.(createKeyboardEvent(height)),
        endKeyboard: (height: number) => handlers.onEnd?.(createKeyboardEvent(height)),
        runFrame: () => mockFrameCallback?.(),
        unmount,
    };
}

/** Sets what the keyboard provider reports on the UI thread before the hook sees a keyboard event of its own. */
function setProviderKeyboard(progress: number, height: number) {
    // Only get() is read from the provider's shared values
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- see the comment above
    const providerKeyboard = {progress: {get: () => progress}, height: {get: () => -height}} as unknown as ReturnType<typeof useReanimatedKeyboardAnimation>;
    jest.mocked(useReanimatedKeyboardAnimation).mockReturnValue(providerKeyboard);
}

/** Sets which input the keyboard provider reports as focused, or none. */
function setFocusedInput(inputTag: number | null) {
    mockFocusedInputTag = inputTag;
}

describe('useKeyboardDrivenScroll', () => {
    beforeEach(() => {
        // Lets tests move Date.now forward
        jest.useFakeTimers();
        jest.clearAllMocks();
        mockVisibleHeight = 600;
        mockScrollOffset = 0;
        mockFrameCallback = undefined;
        mockAnimatedRef.current = null;
        setProviderKeyboard(0, 0);
        setFocusedInput(FIRST_INPUT_TAG);
        // Only get() is read from the provider's shared value, and only its target
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- see the comment above
        const focusedInput = {input: {get: () => (mockFocusedInputTag === null ? null : {target: mockFocusedInputTag})}} as unknown as ReturnType<typeof useReanimatedFocusedInput>;
        jest.mocked(useReanimatedFocusedInput).mockReturnValue(focusedInput);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('moves toward the offset on every keyboard frame without animation, and lands on it when the keyboard stops', () => {
        // Given focus while the keyboard is closed and the content is at the top
        const {scrollWithKeyboard, startKeyboard, moveKeyboard, endKeyboard} = renderKeyboardDrivenScroll();
        scrollWithKeyboard({offset: 120});
        startKeyboard(KEYBOARD_HEIGHT);

        // Then nothing scrolls before the keyboard moves
        expect(mockScrollTo).not.toHaveBeenCalled();

        // When the keyboard animates and then stops
        moveKeyboard(100);
        moveKeyboard(200);
        endKeyboard(KEYBOARD_HEIGHT);

        // Then each frame moves the content by the keyboard's share of its animation, so it doesn't jump on the first frame
        expect(mockScrollTo).toHaveBeenCalledTimes(3);
        expect(mockScrollTo).toHaveBeenNthCalledWith(1, mockAnimatedRef, 0, 40, false);
        expect(mockScrollTo).toHaveBeenNthCalledWith(2, mockAnimatedRef, 0, 80, false);
        expect(mockScrollTo).toHaveBeenNthCalledWith(3, mockAnimatedRef, 0, 120, false);
    });

    it('moves from where the user scrolled, not from the top', () => {
        // Given the user scrolled past the input before focusing it
        mockScrollOffset = 300;
        const {scrollWithKeyboard, startKeyboard, moveKeyboard} = renderKeyboardDrivenScroll();
        scrollWithKeyboard({offset: 120});
        startKeyboard(KEYBOARD_HEIGHT);

        // When the keyboard is halfway up
        moveKeyboard(KEYBOARD_HEIGHT / 2);

        // Then the content is halfway back to the target
        expect(mockScrollTo).toHaveBeenCalledWith(mockAnimatedRef, 0, 210, false);
    });

    it('follows from the current frame when the target is set while the keyboard is already moving', () => {
        // Given the keyboard is halfway up when focus reaches JS
        const {scrollWithKeyboard, startKeyboard, moveKeyboard} = renderKeyboardDrivenScroll();
        startKeyboard(KEYBOARD_HEIGHT);
        moveKeyboard(KEYBOARD_HEIGHT / 2);
        scrollWithKeyboard({offset: 120});

        // When the keyboard covers half of what is left
        moveKeyboard(KEYBOARD_HEIGHT * 0.75);

        // Then the content covers half of the way too, instead of jumping to the target
        expect(mockScrollTo).toHaveBeenCalledTimes(1);
        expect(mockScrollTo).toHaveBeenCalledWith(mockAnimatedRef, 0, 60, false);
    });

    it('follows an open keyboard that gets shorter', () => {
        // Given an open keyboard and a target below where the content is
        const {scrollWithKeyboard, startKeyboard, moveKeyboard, endKeyboard} = renderKeyboardDrivenScroll();
        startKeyboard(KEYBOARD_HEIGHT);
        endKeyboard(KEYBOARD_HEIGHT);
        mockScrollOffset = 120;
        scrollWithKeyboard({offset: 160});
        mockScrollTo.mockClear();

        // When the keyboard is halfway through getting 40 px shorter
        startKeyboard(KEYBOARD_HEIGHT - 40);
        moveKeyboard(KEYBOARD_HEIGHT - 20);

        // Then the content is halfway to the target too, instead of jumping there
        expect(mockScrollTo).toHaveBeenCalledWith(mockAnimatedRef, 0, 140, false);
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

    it('re-attaches the animated ref only when the scrollable changes', () => {
        // Given the animated ref already points at the scrollable since mount
        const scrollableRef = createScrollableRef();
        const {scrollWithKeyboard} = renderKeyboardDrivenScroll(scrollableRef);
        mockAnimatedRef.mockClear();

        // When targets are set for the same scrollable
        scrollWithKeyboard({offset: 10});
        scrollWithKeyboard({offset: 20});

        // Then it isn't re-attached, as that would re-subscribe the scroll offset
        expect(mockAnimatedRef).not.toHaveBeenCalled();

        // When the scroll view remounts and a target is set
        scrollableRef.current = createScrollableRef().current;
        scrollWithKeyboard({offset: 30});

        // Then it follows the new scrollable
        expect(mockAnimatedRef).toHaveBeenCalledTimes(1);
        expect(mockAnimatedRef).toHaveBeenCalledWith(scrollableRef.current);
    });

    it('does not scroll past the top for a negative offset', () => {
        // Given a negative offset
        const {scrollWithKeyboard, startKeyboard, moveKeyboard} = renderKeyboardDrivenScroll();
        scrollWithKeyboard({offset: -50});

        // When the keyboard opens
        startKeyboard(KEYBOARD_HEIGHT);
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

    it('scrolls right away when the keyboard was already open when the hook mounted', () => {
        // Given the provider reports an open keyboard and the hook hasn't seen a keyboard event yet
        setProviderKeyboard(1, KEYBOARD_HEIGHT);
        const {scrollWithKeyboard} = renderKeyboardDrivenScroll();

        // When a target is set
        scrollWithKeyboard({offset: 80});

        // Then it scrolls at once, animated
        expect(mockScrollTo).toHaveBeenCalledWith(mockAnimatedRef, 0, 80, true);
    });

    it('follows from the height of a keyboard that opened before the hook mounted', () => {
        // Given the provider reports an open keyboard and the hook hasn't seen a keyboard event yet
        setProviderKeyboard(1, KEYBOARD_HEIGHT);
        const {scrollWithKeyboard, startKeyboard, moveKeyboard} = renderKeyboardDrivenScroll();
        scrollWithKeyboard({offset: 120});
        mockScrollOffset = 120;
        scrollWithKeyboard({offset: 160});
        mockScrollTo.mockClear();

        // When the keyboard is halfway through getting 40 px taller
        startKeyboard(KEYBOARD_HEIGHT + 40);
        moveKeyboard(KEYBOARD_HEIGHT + 20);

        // Then the content is halfway to the target, as the move started at the provider's height and not at 0
        expect(mockScrollTo).toHaveBeenCalledWith(mockAnimatedRef, 0, 140, false);
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

    it('drops the target when its input loses focus, even without a keyboard event', () => {
        // Given a target applied once the keyboard opened, with its settle still pending
        const {scrollWithKeyboard, startKeyboard, endKeyboard, runFrame} = renderKeyboardDrivenScroll();
        scrollWithKeyboard({offset: 120});
        startKeyboard(KEYBOARD_HEIGHT);
        endKeyboard(KEYBOARD_HEIGHT);
        mockScrollTo.mockClear();

        // When the input loses focus, and the view resizes before the settle delay is over
        setFocusedInput(null);
        mockVisibleHeight = 300;
        runFrame();
        jest.advanceTimersByTime(400);
        runFrame();

        // Then nothing scrolls back to the input that lost focus
        expect(mockScrollTo).not.toHaveBeenCalled();
    });

    it('drops the target as soon as another input takes focus, before the blur reaches JS', () => {
        // Given a target applied once the keyboard opened for the first input
        const {scrollWithKeyboard, startKeyboard, endKeyboard, runFrame} = renderKeyboardDrivenScroll();
        scrollWithKeyboard({offset: 120});
        startKeyboard(KEYBOARD_HEIGHT);
        endKeyboard(KEYBOARD_HEIGHT);
        mockScrollTo.mockClear();

        // When focus moves to the second input, which sends instant keyboard events for it
        setFocusedInput(SECOND_INPUT_TAG);
        startKeyboard(KEYBOARD_HEIGHT);
        endKeyboard(KEYBOARD_HEIGHT);
        jest.advanceTimersByTime(400);
        runFrame();

        // Then the first input's target isn't applied again, so the second input stays where native scrolled it
        expect(mockScrollTo).not.toHaveBeenCalled();
    });

    it('keeps the target when the keyboard of the same input changes height', () => {
        // Given a target applied once the keyboard opened
        const {scrollWithKeyboard, startKeyboard, moveKeyboard, endKeyboard} = renderKeyboardDrivenScroll();
        scrollWithKeyboard({offset: 120});
        startKeyboard(KEYBOARD_HEIGHT);
        endKeyboard(KEYBOARD_HEIGHT);
        mockScrollTo.mockClear();

        // When the same input's keyboard gets taller
        startKeyboard(KEYBOARD_HEIGHT + 40);
        moveKeyboard(KEYBOARD_HEIGHT + 40);

        // Then the content still follows it
        expect(mockScrollTo).toHaveBeenCalledWith(mockAnimatedRef, 0, 120, false);
    });

    it('applies the target of the input that took focus', () => {
        // Given the first input's target, and focus then moved to the second input while the keyboard stayed open
        const {scrollWithKeyboard, startKeyboard, endKeyboard} = renderKeyboardDrivenScroll();
        startKeyboard(KEYBOARD_HEIGHT);
        endKeyboard(KEYBOARD_HEIGHT);
        scrollWithKeyboard({offset: 120});
        setFocusedInput(SECOND_INPUT_TAG);
        mockScrollTo.mockClear();

        // When the second input sets its own target
        scrollWithKeyboard({offset: 200});

        // Then the new target is applied, as it belongs to the focused input
        expect(mockScrollTo).toHaveBeenCalledTimes(1);
        expect(mockScrollTo).toHaveBeenCalledWith(mockAnimatedRef, 0, 200, true);
    });

    it('takes the input that gets focus after the target is set as its owner', () => {
        // Given a target set before the provider reports a focused input
        setFocusedInput(null);
        const {scrollWithKeyboard, startKeyboard, moveKeyboard} = renderKeyboardDrivenScroll();
        scrollWithKeyboard({offset: 120});

        // When the first input gets focus and its keyboard starts opening
        setFocusedInput(FIRST_INPUT_TAG);
        startKeyboard(KEYBOARD_HEIGHT);
        moveKeyboard(KEYBOARD_HEIGHT / 2);

        // Then the content follows the keyboard for it
        expect(mockScrollTo).toHaveBeenCalledWith(mockAnimatedRef, 0, 60, false);

        // When focus then moves to the second input
        mockScrollTo.mockClear();
        setFocusedInput(SECOND_INPUT_TAG);
        moveKeyboard(KEYBOARD_HEIGHT);

        // Then the target is dropped, as it belonged to the first input
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

        // Then it follows the resize at once, without animation, and waits for the native scroll before settling
        expect(mockScrollTo).toHaveBeenCalledTimes(1);
        expect(mockScrollTo).toHaveBeenCalledWith(mockAnimatedRef, 0, 120, false);
        mockScrollTo.mockClear();
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

    it('keeps a re-apply that is pending when the target expires', () => {
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

    it('schedules no new re-apply after the target expires, so the stop timer cannot cut one off', () => {
        // Given a resize just before the target expires, so a re-apply is pending past the lifetime
        const {scrollWithKeyboard, startKeyboard, endKeyboard, runFrame} = renderKeyboardDrivenScroll();
        scrollWithKeyboard({offset: 120});
        startKeyboard(KEYBOARD_HEIGHT);
        endKeyboard(KEYBOARD_HEIGHT);
        jest.advanceTimersByTime(400);
        runFrame();
        jest.advanceTimersByTime(1550);
        mockVisibleHeight = 300;
        runFrame();

        // When the view resizes again after the lifetime
        jest.advanceTimersByTime(350);
        mockVisibleHeight = 250;
        runFrame();
        mockScrollTo.mockClear();

        // Then the first re-apply still runs on time, and no later one is left for the stop timer to drop
        jest.advanceTimersByTime(50);
        runFrame();
        expect(mockScrollTo).toHaveBeenCalledTimes(1);
        expect(mockScrollTo).toHaveBeenCalledWith(mockAnimatedRef, 0, 120, true);
        mockScrollTo.mockClear();
        jest.advanceTimersByTime(400);
        runFrame();
        expect(mockScrollTo).not.toHaveBeenCalled();
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

    it('does not follow a closing keyboard, and scrolls without it if no keyboard opens', () => {
        // Given focus while the previous keyboard is still closing
        const {scrollWithKeyboard, startKeyboard, moveKeyboard, endKeyboard, runFrame} = renderKeyboardDrivenScroll();
        startKeyboard(0);
        scrollWithKeyboard({offset: 120});

        // When the keyboard finishes closing
        moveKeyboard(100);
        endKeyboard(0);

        // Then nothing scrolls, as content shouldn't follow a closing keyboard
        expect(mockScrollTo).not.toHaveBeenCalled();

        // When no keyboard opens before the wait is over
        jest.advanceTimersByTime(500);
        runFrame();

        // Then the target is applied once, animated
        expect(mockScrollTo).toHaveBeenCalledTimes(1);
        expect(mockScrollTo).toHaveBeenCalledWith(mockAnimatedRef, 0, 120, true);
    });

    it('stops the watcher once the lifetime and one settle delay are over', () => {
        // Given a target that starts the watcher
        const {scrollWithKeyboard} = renderKeyboardDrivenScroll();
        scrollWithKeyboard({offset: 120});
        expect(mockSetFrameCallbackActive).toHaveBeenLastCalledWith(true);

        // When the last re-apply the target can have is due
        jest.advanceTimersByTime(WATCHER_STOP_DELAY_MS - 1);
        expect(mockSetFrameCallbackActive).toHaveBeenLastCalledWith(true);
        jest.advanceTimersByTime(1);

        // Then the watcher stops, as nothing is left for it to do
        expect(mockSetFrameCallbackActive).toHaveBeenLastCalledWith(false);
    });

    it('keeps the watcher running for a new target set before the old one would stop it', () => {
        // Given a target whose watcher is about to stop
        const {scrollWithKeyboard} = renderKeyboardDrivenScroll();
        scrollWithKeyboard({offset: 120});
        jest.advanceTimersByTime(WATCHER_STOP_DELAY_MS - 100);

        // When a new target is set, and the old stop time passes
        scrollWithKeyboard({offset: 200});
        jest.advanceTimersByTime(100);

        // Then the watcher keeps running for the new target, until its own stop time
        expect(mockSetFrameCallbackActive).toHaveBeenLastCalledWith(true);
        jest.advanceTimersByTime(WATCHER_STOP_DELAY_MS - 100);
        expect(mockSetFrameCallbackActive).toHaveBeenLastCalledWith(false);
    });

    it('drops the target when the watcher stops, even if no frame ran to drop it', () => {
        // Given a target applied once the keyboard opened, with no frame run since
        const {scrollWithKeyboard, startKeyboard, moveKeyboard, endKeyboard} = renderKeyboardDrivenScroll();
        scrollWithKeyboard({offset: 120});
        startKeyboard(KEYBOARD_HEIGHT);
        endKeyboard(KEYBOARD_HEIGHT);
        mockScrollTo.mockClear();

        // When the watcher stops, and the keyboard changes height later
        jest.advanceTimersByTime(WATCHER_STOP_DELAY_MS);
        startKeyboard(KEYBOARD_HEIGHT + 40);
        moveKeyboard(KEYBOARD_HEIGHT + 40);

        // Then nothing scrolls, as later changes aren't about this input
        expect(mockScrollTo).not.toHaveBeenCalled();
    });

    it('does not touch the watcher after unmount', () => {
        // Given a target whose watcher would stop later
        const {scrollWithKeyboard, unmount} = renderKeyboardDrivenScroll();
        scrollWithKeyboard({offset: 120});
        mockSetFrameCallbackActive.mockClear();

        // When the hook unmounts before the stop time
        unmount();
        jest.advanceTimersByTime(WATCHER_STOP_DELAY_MS);

        // Then the stop timer was cleared with it
        expect(mockSetFrameCallbackActive).not.toHaveBeenCalled();
    });

    it('does nothing but reports the scroll as handled when the scrollable is not mounted', () => {
        // Given a caller whose scrollable is not mounted, e.g. a form without a scroll view
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
