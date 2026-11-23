import {renderHook} from '@testing-library/react-native';

import type {KeyboardScrollable, UseKeyboardDrivenScroll} from '@hooks/useKeyboardDrivenScroll/types';

import CONST from '@src/CONST';

import type {KeyboardHandler} from 'react-native-keyboard-controller';
import type {AnimatedRef} from 'react-native-reanimated';

import {useKeyboardHandler, useReanimatedFocusedInput, useReanimatedKeyboardAnimation} from 'react-native-keyboard-controller';

type KeyboardEvent = Parameters<NonNullable<KeyboardHandler['onStart']>>[0];

const mockScrollTo = jest.fn();
let mockVisibleHeight = 0;
let mockScrollOffset = 0;
const SCROLL_VIEW_TAG = 10;
// Height of the scroll view's content when the hook measures it, or null when it can't be measured
let mockMeasuredContentHeight: number | null = null;
// Passed to the mocked Reanimated functions, and the hook measures its content through it
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- see the comment above
const MOUNTED_SCROLL_VIEW = {
    getInnerViewRef: () =>
        mockMeasuredContentHeight === null ? null : {measure: (callback: (x: number, y: number, width: number, height: number) => void) => callback(0, 0, 0, mockMeasuredContentHeight ?? 0)},
} as unknown as KeyboardScrollable;
// The caller's animated ref. The hook reads only current and observe, and the scroll view is mounted, so observers get its tag right away.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- see the comment above
const scrollableRef = {
    current: MOUNTED_SCROLL_VIEW,
    observe: (observer: (viewTag: number | null) => void) => {
        observer(SCROLL_VIEW_TAG);
        return () => {};
    },
} as unknown as AnimatedRef<KeyboardScrollable>;
const mockSetFrameCallbackActive = jest.fn();
let mockFrameCallback: (() => void) | undefined;
let mockFocusedInputTag: number | null = null;
/** The hook's reaction to the input the keyboard provider reports as focused. */
type MockFocusedInputReaction = (inputTag: number | null, previousInputTag: number | null) => void;
let mockFocusedInputReaction: MockFocusedInputReaction | undefined;
const mockRegisterForEvents = jest.fn();
/** The part of a native scroll event the hook reads. */
type MockScrollViewEvent = {eventName: string; contentSize: {height: number}};
let mockScrollViewEventHandler: ((event: MockScrollViewEvent) => void) | undefined;
let mockContentHeight = 0;
// Read on every get(), like the provider's shared values, so a change after the hook rendered is seen too
let mockProviderKeyboard = {progress: 0, height: 0};

jest.mock('react-native-reanimated', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-native-reanimated/mock'),
    measure: () => ({x: 0, y: 0, width: 0, height: mockVisibleHeight, pageX: 0, pageY: 0}),
    useScrollOffset: () => ({get: () => mockScrollOffset}),
    scrollTo: (...args: unknown[]) => {
        mockScrollTo(...args);
    },
    useFrameCallback: (callback: () => void) => {
        mockFrameCallback = callback;
        return {callbackId: 1, isActive: false, setActive: mockSetFrameCallbackActive};
    },
    // Only the hook's reaction to the focused input is registered, and setFocusedInput runs it
    useAnimatedReaction: (_prepare: unknown, react: MockFocusedInputReaction) => {
        mockFocusedInputReaction = react;
    },
    useEvent: (handler: (event: MockScrollViewEvent) => void) => {
        mockScrollViewEventHandler = handler;
        return {workletEventHandler: {registerForEvents: mockRegisterForEvents, unregisterFromEvents: jest.fn()}};
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

/** Renders the hook and returns the keyboard handlers it registered, so tests can play keyboard frames. */
function renderKeyboardDrivenScroll() {
    const {result, unmount} = renderHook(() => useKeyboardDrivenScroll(scrollableRef));
    const handlers = jest.mocked(useKeyboardHandler).mock.lastCall?.[0] ?? {};
    return {
        scrollWithKeyboard: (offset: number) => result.current(offset),
        startKeyboard: (height: number) => handlers.onStart?.(createKeyboardEvent(height)),
        moveKeyboard: (height: number) => handlers.onMove?.(createKeyboardEvent(height)),
        endKeyboard: (height: number) => handlers.onEnd?.(createKeyboardEvent(height)),
        // Reanimated prefixes event names with the view tag, so the hook matches their end
        startDrag: () => mockScrollViewEventHandler?.({eventName: `${SCROLL_VIEW_TAG}onScrollBeginDrag`, contentSize: {height: mockContentHeight}}),
        scroll: () => mockScrollViewEventHandler?.({eventName: `${SCROLL_VIEW_TAG}onScroll`, contentSize: {height: mockContentHeight}}),
        unmount,
    };
}

/** Renders the hook with a target applied once the keyboard finished opening, and clears the scrolls that took. */
function renderWithSettledTarget(offset = 120) {
    const hook = renderKeyboardDrivenScroll();
    hook.scrollWithKeyboard(offset);
    hook.startKeyboard(KEYBOARD_HEIGHT);
    hook.endKeyboard(KEYBOARD_HEIGHT);
    mockScrollTo.mockClear();
    return hook;
}

/** Moves time forward, then runs one UI frame. */
function runFrameAfter(ms: number) {
    jest.advanceTimersByTime(ms);
    mockFrameCallback?.();
}

/** Sets what the keyboard provider reports on the UI thread before the hook sees a keyboard event of its own. */
function setProviderKeyboard(progress: number, height: number) {
    mockProviderKeyboard = {progress, height};
}

/** Sets which input the keyboard provider reports as focused, or none, and runs the hook's reaction to it. */
function setFocusedInput(inputTag: number | null) {
    const previousInputTag = mockFocusedInputTag;
    mockFocusedInputTag = inputTag;
    mockFocusedInputReaction?.(inputTag, previousInputTag);
}

describe('useKeyboardDrivenScroll', () => {
    beforeEach(() => {
        // Lets tests move Date.now forward
        jest.useFakeTimers();
        jest.clearAllMocks();
        mockVisibleHeight = 600;
        mockScrollOffset = 0;
        mockContentHeight = 0;
        mockMeasuredContentHeight = null;
        mockFrameCallback = undefined;
        mockFocusedInputReaction = undefined;
        scrollableRef.current = MOUNTED_SCROLL_VIEW;
        setProviderKeyboard(0, 0);
        setFocusedInput(FIRST_INPUT_TAG);
        // Only get() is read from the provider's shared value, and only its target
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- see the comment above
        const focusedInput = {input: {get: () => (mockFocusedInputTag === null ? null : {target: mockFocusedInputTag})}} as unknown as ReturnType<typeof useReanimatedFocusedInput>;
        jest.mocked(useReanimatedFocusedInput).mockReturnValue(focusedInput);
        // Only get() is read from the provider's shared values. The height is stored as a negative offset.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- see the comment above
        const providerKeyboard = {progress: {get: () => mockProviderKeyboard.progress}, height: {get: () => -mockProviderKeyboard.height}} as unknown as ReturnType<
            typeof useReanimatedKeyboardAnimation
        >;
        jest.mocked(useReanimatedKeyboardAnimation).mockReturnValue(providerKeyboard);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('moves toward the offset on every keyboard frame without animation, and slides the rest of the way when the keyboard stops', () => {
        // Given focus while the keyboard is closed and the content is at the top
        const {scrollWithKeyboard, startKeyboard, moveKeyboard, endKeyboard} = renderKeyboardDrivenScroll();
        scrollWithKeyboard(120);
        startKeyboard(KEYBOARD_HEIGHT);

        // Then nothing scrolls before the keyboard moves
        expect(mockScrollTo).not.toHaveBeenCalled();

        // When the keyboard animates and then stops
        moveKeyboard(100);
        moveKeyboard(200);
        endKeyboard(KEYBOARD_HEIGHT);

        // Then each frame moves the content by the keyboard's share of its animation, so it doesn't jump on the first frame,
        // and the content slides the rest of the way when the keyboard stops short of its last frames
        expect(mockScrollTo).toHaveBeenCalledTimes(3);
        expect(mockScrollTo).toHaveBeenNthCalledWith(1, scrollableRef, 0, 40, false);
        expect(mockScrollTo).toHaveBeenNthCalledWith(2, scrollableRef, 0, 80, false);
        expect(mockScrollTo).toHaveBeenNthCalledWith(3, scrollableRef, 0, 120, true);
    });

    it('moves from where the user scrolled, not from the top', () => {
        // Given the user scrolled past the input before focusing it
        mockScrollOffset = 300;
        const {scrollWithKeyboard, startKeyboard, moveKeyboard} = renderKeyboardDrivenScroll();
        scrollWithKeyboard(120);
        startKeyboard(KEYBOARD_HEIGHT);

        // When the keyboard is halfway up
        moveKeyboard(KEYBOARD_HEIGHT / 2);

        // Then the content is halfway back to the target
        expect(mockScrollTo).toHaveBeenCalledWith(scrollableRef, 0, 210, false);
    });

    it('follows from the current frame when the target is set while the keyboard is already moving', () => {
        // Given the keyboard is halfway up when focus reaches JS
        const {scrollWithKeyboard, startKeyboard, moveKeyboard} = renderKeyboardDrivenScroll();
        startKeyboard(KEYBOARD_HEIGHT);
        moveKeyboard(KEYBOARD_HEIGHT / 2);
        scrollWithKeyboard(120);

        // When the keyboard covers half of what is left
        moveKeyboard(KEYBOARD_HEIGHT * 0.75);

        // Then the content covers half of the way too, instead of jumping to the target
        expect(mockScrollTo).toHaveBeenCalledTimes(1);
        expect(mockScrollTo).toHaveBeenCalledWith(scrollableRef, 0, 60, false);
    });

    it('follows an open keyboard that gets shorter', () => {
        // Given an open keyboard and a target below where the content is
        const {scrollWithKeyboard, startKeyboard, moveKeyboard, endKeyboard} = renderKeyboardDrivenScroll();
        startKeyboard(KEYBOARD_HEIGHT);
        endKeyboard(KEYBOARD_HEIGHT);
        mockScrollOffset = 120;
        scrollWithKeyboard(160);
        mockScrollTo.mockClear();

        // When the keyboard is halfway through getting 40 px shorter
        startKeyboard(KEYBOARD_HEIGHT - 40);
        moveKeyboard(KEYBOARD_HEIGHT - 20);

        // Then the content is halfway to the target too, instead of jumping there
        expect(mockScrollTo).toHaveBeenCalledWith(scrollableRef, 0, 140, false);
    });

    it('keeps the content between where it started and the target when a frame is outside the keyboard animation', () => {
        // Given the content follows the opening keyboard from 100 px toward 200 px
        mockScrollOffset = 100;
        const {scrollWithKeyboard, startKeyboard, moveKeyboard} = renderKeyboardDrivenScroll();
        scrollWithKeyboard(200);
        startKeyboard(KEYBOARD_HEIGHT);
        moveKeyboard(0);

        // When a frame reports a height past the end, as can happen on the last frame
        moveKeyboard(KEYBOARD_HEIGHT + 20);

        // Then the content doesn't move past either end
        expect(mockScrollTo).toHaveBeenNthCalledWith(1, scrollableRef, 0, 100, false);
        expect(mockScrollTo).toHaveBeenNthCalledWith(2, scrollableRef, 0, 200, false);
    });

    it('slides to the target of the next input at once when focus moves while the keyboard stays open', () => {
        // Given an open keyboard with a target for the first input
        const {scrollWithKeyboard, startKeyboard, endKeyboard} = renderWithSettledTarget();

        // When focus moves to the second input, and iOS starts and ends a keyboard event of the same height with no frames between
        setFocusedInput(SECOND_INPUT_TAG);
        startKeyboard(KEYBOARD_HEIGHT);
        scrollWithKeyboard(400);
        endKeyboard(KEYBOARD_HEIGHT);

        // Then the content slides to the new target right away, once, instead of jumping to it when the keyboard event ends
        expect(mockScrollTo).toHaveBeenCalledTimes(1);
        expect(mockScrollTo).toHaveBeenCalledWith(scrollableRef, 0, 400, true);
    });

    it('slides to a target that came after the last keyboard frame', () => {
        // Given a keyboard that reached its height before the target came, with its end event still to come
        const {scrollWithKeyboard, startKeyboard, moveKeyboard, endKeyboard} = renderKeyboardDrivenScroll();
        startKeyboard(KEYBOARD_HEIGHT);
        moveKeyboard(KEYBOARD_HEIGHT);
        scrollWithKeyboard(120);

        // When the keyboard event ends
        endKeyboard(KEYBOARD_HEIGHT);

        // Then no frame moved the content, so it slides to the target instead of jumping
        expect(mockScrollTo).toHaveBeenCalledWith(scrollableRef, 0, 120, true);
    });

    it('does not scroll past the top for a negative offset', () => {
        // Given a negative offset
        const {scrollWithKeyboard, startKeyboard, moveKeyboard} = renderKeyboardDrivenScroll();
        scrollWithKeyboard(-50);

        // When the keyboard opens
        startKeyboard(KEYBOARD_HEIGHT);
        moveKeyboard(100);

        // Then it stops at the top
        expect(mockScrollTo).toHaveBeenCalledWith(scrollableRef, 0, 0, false);
    });

    it.each([
        ['the hook saw it open', false],
        ['it opened before the hook mounted', true],
    ])('scrolls right away with animation when the keyboard is already open and %s', (_, isOpenBeforeMount) => {
        // Given the keyboard is already open, so no frames will come
        if (isOpenBeforeMount) {
            setProviderKeyboard(1, KEYBOARD_HEIGHT);
        }
        const {scrollWithKeyboard, startKeyboard, endKeyboard} = renderKeyboardDrivenScroll();
        if (!isOpenBeforeMount) {
            startKeyboard(KEYBOARD_HEIGHT);
            endKeyboard(KEYBOARD_HEIGHT);
        }

        // When a target is set
        scrollWithKeyboard(80);

        // Then it scrolls at once, animated
        expect(mockScrollTo).toHaveBeenCalledTimes(1);
        expect(mockScrollTo).toHaveBeenCalledWith(scrollableRef, 0, 80, true);
    });

    it('follows from the height of a keyboard that opened before the hook mounted', () => {
        // Given the provider reports an open keyboard and the hook hasn't seen a keyboard event yet
        setProviderKeyboard(1, KEYBOARD_HEIGHT);
        const {scrollWithKeyboard, startKeyboard, moveKeyboard} = renderKeyboardDrivenScroll();
        scrollWithKeyboard(120);
        mockScrollOffset = 120;
        scrollWithKeyboard(160);
        mockScrollTo.mockClear();

        // When the keyboard is halfway through getting 40 px taller
        startKeyboard(KEYBOARD_HEIGHT + 40);
        moveKeyboard(KEYBOARD_HEIGHT + 20);

        // Then the content is halfway to the target, as the move started at the provider's height and not at 0
        expect(mockScrollTo).toHaveBeenCalledWith(scrollableRef, 0, 140, false);
    });

    it('drops the target when the keyboard starts closing', () => {
        // Given a target followed while the keyboard opens
        const {scrollWithKeyboard, startKeyboard, moveKeyboard} = renderKeyboardDrivenScroll();
        scrollWithKeyboard(120);
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
        renderWithSettledTarget();

        // When the input loses focus, and the view resizes before the settle delay is over
        setFocusedInput(null);
        mockVisibleHeight = 300;
        runFrameAfter(0);
        runFrameAfter(400);

        // Then nothing scrolls back to the input that lost focus
        expect(mockScrollTo).not.toHaveBeenCalled();
    });

    it('drops the target as soon as another input takes focus, before the blur reaches JS', () => {
        // Given a target applied once the keyboard opened for the first input
        const {startKeyboard, endKeyboard} = renderWithSettledTarget();

        // When focus moves to the second input, which sends instant keyboard events for it
        setFocusedInput(SECOND_INPUT_TAG);
        startKeyboard(KEYBOARD_HEIGHT);
        endKeyboard(KEYBOARD_HEIGHT);
        runFrameAfter(400);

        // Then the first input's target isn't applied again, so the second input stays where native scrolled it
        expect(mockScrollTo).not.toHaveBeenCalled();
    });

    it('keeps the target when the keyboard of the same input changes height', () => {
        // Given a target applied once the keyboard opened
        const {startKeyboard, moveKeyboard} = renderWithSettledTarget();

        // When the same input's keyboard gets taller
        startKeyboard(KEYBOARD_HEIGHT + 40);
        moveKeyboard(KEYBOARD_HEIGHT + 40);

        // Then the content still follows it
        expect(mockScrollTo).toHaveBeenCalledWith(scrollableRef, 0, 120, false);
    });

    it('applies the target of the input that took focus', () => {
        // Given the first input's target, and focus then moved to the second input while the keyboard stayed open
        const {scrollWithKeyboard, startKeyboard, endKeyboard} = renderKeyboardDrivenScroll();
        startKeyboard(KEYBOARD_HEIGHT);
        endKeyboard(KEYBOARD_HEIGHT);
        scrollWithKeyboard(120);
        setFocusedInput(SECOND_INPUT_TAG);
        mockScrollTo.mockClear();

        // When the second input sets its own target
        scrollWithKeyboard(200);

        // Then the new target is applied, as it belongs to the focused input
        expect(mockScrollTo).toHaveBeenCalledTimes(1);
        expect(mockScrollTo).toHaveBeenCalledWith(scrollableRef, 0, 200, true);
    });

    it('takes the input that gets focus after the target is set as its owner', () => {
        // Given a target set before the provider reports a focused input
        setFocusedInput(null);
        const {scrollWithKeyboard, startKeyboard, moveKeyboard} = renderKeyboardDrivenScroll();
        scrollWithKeyboard(120);

        // When the first input gets focus and its keyboard starts opening
        setFocusedInput(FIRST_INPUT_TAG);
        startKeyboard(KEYBOARD_HEIGHT);
        moveKeyboard(KEYBOARD_HEIGHT / 2);

        // Then the content follows the keyboard for it
        expect(mockScrollTo).toHaveBeenCalledWith(scrollableRef, 0, 60, false);

        // When focus then moves to the second input
        mockScrollTo.mockClear();
        setFocusedInput(SECOND_INPUT_TAG);
        moveKeyboard(KEYBOARD_HEIGHT);

        // Then the target is dropped, as it belonged to the first input
        expect(mockScrollTo).not.toHaveBeenCalled();
    });

    it('applies the target once more, animated, after the keyboard has settled', () => {
        // Given the keyboard finished opening, after which Android may still move the input
        renderWithSettledTarget();

        // When frames run before the settle delay
        runFrameAfter(399);

        // Then nothing scrolls yet, as the native scroll may still run
        expect(mockScrollTo).not.toHaveBeenCalled();

        // When frames run after the settle delay
        runFrameAfter(1);
        runFrameAfter(0);

        // Then the target is applied once, animated
        expect(mockScrollTo).toHaveBeenCalledTimes(1);
        expect(mockScrollTo).toHaveBeenCalledWith(scrollableRef, 0, 120, true);
    });

    it('listens for drags on the scroll view', () => {
        // Given the hook is mounted with a scroll view
        renderKeyboardDrivenScroll();

        // Then it listens for that view's events on the UI thread, without changing the scroll view's props
        expect(mockRegisterForEvents).toHaveBeenCalledWith(SCROLL_VIEW_TAG);
    });

    it('drops the target when the user starts dragging, so nothing pulls the content back', () => {
        // Given the keyboard finished opening, with the settle re-apply still pending
        const {startDrag} = renderWithSettledTarget();

        // When the user drags the content, and then the settle delay passes and the view resizes
        startDrag();
        runFrameAfter(400);
        mockVisibleHeight = 300;
        runFrameAfter(0);

        // Then the content stays where the user put it
        expect(mockScrollTo).not.toHaveBeenCalled();
    });

    it('stops following the keyboard when the user drags while it opens', () => {
        // Given the content follows the opening keyboard
        const {scrollWithKeyboard, startKeyboard, moveKeyboard, endKeyboard, startDrag} = renderKeyboardDrivenScroll();
        scrollWithKeyboard(120);
        startKeyboard(KEYBOARD_HEIGHT);
        moveKeyboard(100);
        mockScrollTo.mockClear();

        // When the user drags before the keyboard stops
        startDrag();
        moveKeyboard(200);
        endKeyboard(KEYBOARD_HEIGHT);

        // Then the remaining keyboard frames don't scroll against the user's finger
        expect(mockScrollTo).not.toHaveBeenCalled();
    });

    it('keeps the content where the user dragged it when the target comes after the drag', () => {
        // Given an open keyboard, and the user who focused the second input and started dragging before JS handled the focus
        const {scrollWithKeyboard, startKeyboard, endKeyboard, startDrag} = renderKeyboardDrivenScroll();
        startKeyboard(KEYBOARD_HEIGHT);
        endKeyboard(KEYBOARD_HEIGHT);
        setFocusedInput(SECOND_INPUT_TAG);
        jest.advanceTimersByTime(100);
        startDrag();

        // When the target of the focus comes, and then the settle delay passes
        jest.advanceTimersByTime(100);
        scrollWithKeyboard(120);
        runFrameAfter(500);

        // Then nothing scrolls against the user's drag or pulls the content back after it
        expect(mockScrollTo).not.toHaveBeenCalled();
    });

    it('applies the target when the user dragged before the input got focus', () => {
        // Given an open keyboard, and the user who dragged the content and then focused the second input
        const {scrollWithKeyboard, startKeyboard, endKeyboard, startDrag} = renderKeyboardDrivenScroll();
        startKeyboard(KEYBOARD_HEIGHT);
        endKeyboard(KEYBOARD_HEIGHT);
        startDrag();
        jest.advanceTimersByTime(100);
        setFocusedInput(SECOND_INPUT_TAG);

        // When the target of the focus comes
        scrollWithKeyboard(120);

        // Then the content slides to it, as the drag was not about this input
        expect(mockScrollTo).toHaveBeenCalledWith(scrollableRef, 0, 120, true);
    });

    it('follows the end the scroll view can reach, instead of jumping to a target past it on the first frame', () => {
        // Given a scroll view that shrinks with the keyboard, scrolled 100 px above its end, and a target past its end
        mockContentHeight = 1000;
        mockScrollOffset = 300;
        const {scrollWithKeyboard, startKeyboard, moveKeyboard, endKeyboard, scroll} = renderKeyboardDrivenScroll();
        scroll();
        scrollWithKeyboard(Number.MAX_SAFE_INTEGER);
        startKeyboard(KEYBOARD_HEIGHT);

        // When the keyboard covers half of its way and the view shrinks with it, and then the keyboard stops
        mockVisibleHeight = 450;
        moveKeyboard(KEYBOARD_HEIGHT / 2);
        mockVisibleHeight = 300;
        moveKeyboard(KEYBOARD_HEIGHT);
        endKeyboard(KEYBOARD_HEIGHT);

        // Then the content covers half of the way to the end it can reach on that frame, and lands on the end when the keyboard stops
        expect(mockScrollTo).toHaveBeenNthCalledWith(1, scrollableRef, 0, 425, false);
        expect(mockScrollTo).toHaveBeenNthCalledWith(2, scrollableRef, 0, 700, false);
    });

    it.each([
        ['before the user scrolled', null],
        ['after the content grew since the last scroll', 700],
    ])('follows the reachable end measured when the target is set, %s', (_case, lastScrollContentHeight) => {
        // Given a scroll view whose last scroll event, if any, reported less content than it has now, and a target past its end
        mockScrollOffset = 300;
        const {scrollWithKeyboard, startKeyboard, moveKeyboard, endKeyboard, scroll} = renderKeyboardDrivenScroll();
        if (lastScrollContentHeight !== null) {
            mockContentHeight = lastScrollContentHeight;
            scroll();
        }

        // When the target is set while the content is 1000 px tall, and the keyboard opens as the view shrinks with it
        mockMeasuredContentHeight = 1000;
        scrollWithKeyboard(Number.MAX_SAFE_INTEGER);
        startKeyboard(KEYBOARD_HEIGHT);
        mockVisibleHeight = 450;
        moveKeyboard(KEYBOARD_HEIGHT / 2);
        mockVisibleHeight = 300;
        moveKeyboard(KEYBOARD_HEIGHT);
        endKeyboard(KEYBOARD_HEIGHT);

        // Then the content follows the end of the measured content instead of jumping to the end on the first frame or stopping short of it
        expect(mockScrollTo).toHaveBeenNthCalledWith(1, scrollableRef, 0, 425, false);
        expect(mockScrollTo).toHaveBeenNthCalledWith(2, scrollableRef, 0, 700, false);
    });

    it('starts following from the first keyboard frame when the provider already reports the end height', () => {
        // Given a target set before the keyboard moved, and the provider already at the end height, as on iOS
        const {scrollWithKeyboard, startKeyboard, moveKeyboard} = renderKeyboardDrivenScroll();
        scrollWithKeyboard(120);
        setProviderKeyboard(1, KEYBOARD_HEIGHT);
        startKeyboard(KEYBOARD_HEIGHT);

        // When the first frames of the keyboard animation come
        moveKeyboard(30);
        moveKeyboard(30 + (KEYBOARD_HEIGHT - 30) / 2);

        // Then the content starts where it is and moves with the keyboard, instead of reaching the target on the first frame
        expect(mockScrollTo).toHaveBeenNthCalledWith(1, scrollableRef, 0, 0, false);
        expect(mockScrollTo).toHaveBeenNthCalledWith(2, scrollableRef, 0, 60, false);
    });

    it('applies the target again after the scroll view is resized', () => {
        // Given the target was applied after settling
        renderWithSettledTarget();
        runFrameAfter(400);
        mockScrollTo.mockClear();

        // When the scroll view shrinks later
        mockVisibleHeight = 300;
        runFrameAfter(100);

        // Then it follows the resize at once, without animation, and waits for the native scroll before settling
        expect(mockScrollTo).toHaveBeenCalledTimes(1);
        expect(mockScrollTo).toHaveBeenCalledWith(scrollableRef, 0, 120, false);
        mockScrollTo.mockClear();
        runFrameAfter(399);
        expect(mockScrollTo).not.toHaveBeenCalled();

        // When the settle delay is over
        runFrameAfter(1);

        // Then the target is applied again, animated
        expect(mockScrollTo).toHaveBeenCalledTimes(1);
        expect(mockScrollTo).toHaveBeenCalledWith(scrollableRef, 0, 120, true);
    });

    it('schedules no new re-apply after the target expires, so the stop timer cannot cut one off', () => {
        // Given a resize just before the target expires, so a re-apply is pending past the lifetime
        renderWithSettledTarget();
        runFrameAfter(400);
        jest.advanceTimersByTime(1550);
        mockVisibleHeight = 300;
        runFrameAfter(0);

        // When the view resizes again after the lifetime
        jest.advanceTimersByTime(350);
        mockVisibleHeight = 250;
        runFrameAfter(0);
        mockScrollTo.mockClear();

        // Then the first re-apply still runs on time, and no later one is left for the stop timer to drop
        runFrameAfter(50);
        expect(mockScrollTo).toHaveBeenCalledTimes(1);
        expect(mockScrollTo).toHaveBeenCalledWith(scrollableRef, 0, 120, true);
        mockScrollTo.mockClear();
        runFrameAfter(400);
        expect(mockScrollTo).not.toHaveBeenCalled();
    });

    it('drops the target once its lifetime is over and no settle is pending', () => {
        // Given a target that has already settled
        const {moveKeyboard} = renderWithSettledTarget();
        runFrameAfter(400);
        mockScrollTo.mockClear();

        // When the lifetime passes, then the view resizes
        runFrameAfter(1601);
        mockVisibleHeight = 300;
        runFrameAfter(0);
        runFrameAfter(400);
        moveKeyboard(KEYBOARD_HEIGHT);

        // Then nothing scrolls, as later changes aren't about this input
        expect(mockScrollTo).not.toHaveBeenCalled();
    });

    it('scrolls without the keyboard when no keyboard comes, for example with a hardware keyboard', () => {
        // Given focus with no keyboard coming
        const {scrollWithKeyboard} = renderKeyboardDrivenScroll();
        scrollWithKeyboard(120);

        // When frames run before the wait is over
        runFrameAfter(499);

        // Then nothing scrolls yet, as the keyboard may still open
        expect(mockScrollTo).not.toHaveBeenCalled();

        // When frames run after the wait
        runFrameAfter(1);
        runFrameAfter(0);

        // Then the target is applied once, animated
        expect(mockScrollTo).toHaveBeenCalledTimes(1);
        expect(mockScrollTo).toHaveBeenCalledWith(scrollableRef, 0, 120, true);
    });

    it.each([
        ['starts opening in time', true],
        ['is already opening as the target is set (common on iOS)', false],
    ])('does not scroll without the keyboard when the keyboard %s', (_, isTargetFirst) => {
        // Given focus and a keyboard that starts opening, in either order
        const {scrollWithKeyboard, startKeyboard} = renderKeyboardDrivenScroll();
        if (isTargetFirst) {
            scrollWithKeyboard(120);
            startKeyboard(KEYBOARD_HEIGHT);
        } else {
            startKeyboard(KEYBOARD_HEIGHT);
            scrollWithKeyboard(120);
        }

        // When frames run past the wait
        runFrameAfter(500);

        // Then only keyboard frames scroll
        expect(mockScrollTo).not.toHaveBeenCalled();
    });

    it('does not follow a closing keyboard, and scrolls without it if no keyboard opens', () => {
        // Given focus while the previous keyboard is still closing
        const {scrollWithKeyboard, startKeyboard, moveKeyboard, endKeyboard} = renderKeyboardDrivenScroll();
        startKeyboard(0);
        scrollWithKeyboard(120);

        // When the keyboard finishes closing
        moveKeyboard(100);
        endKeyboard(0);

        // Then nothing scrolls, as content shouldn't follow a closing keyboard
        expect(mockScrollTo).not.toHaveBeenCalled();

        // When no keyboard opens before the wait is over
        runFrameAfter(500);

        // Then the target is applied once, animated
        expect(mockScrollTo).toHaveBeenCalledTimes(1);
        expect(mockScrollTo).toHaveBeenCalledWith(scrollableRef, 0, 120, true);
    });

    it('stops the watcher once the lifetime and one settle delay are over', () => {
        // Given a target that starts the watcher
        const {scrollWithKeyboard} = renderKeyboardDrivenScroll();
        scrollWithKeyboard(120);
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
        scrollWithKeyboard(120);
        jest.advanceTimersByTime(WATCHER_STOP_DELAY_MS - 100);

        // When a new target is set, and the old stop time passes
        scrollWithKeyboard(200);
        jest.advanceTimersByTime(100);

        // Then the watcher keeps running for the new target, until its own stop time
        expect(mockSetFrameCallbackActive).toHaveBeenLastCalledWith(true);
        jest.advanceTimersByTime(WATCHER_STOP_DELAY_MS - 100);
        expect(mockSetFrameCallbackActive).toHaveBeenLastCalledWith(false);
    });

    it('drops the target when the watcher stops, even if no frame ran to drop it', () => {
        // Given a target applied once the keyboard opened, with no frame run since
        const {startKeyboard, moveKeyboard} = renderWithSettledTarget();

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
        scrollWithKeyboard(120);
        mockSetFrameCallbackActive.mockClear();

        // When the hook unmounts before the stop time
        unmount();
        jest.advanceTimersByTime(WATCHER_STOP_DELAY_MS);

        // Then the stop timer was cleared with it
        expect(mockSetFrameCallbackActive).not.toHaveBeenCalled();
    });

    it('does nothing when the scroll view is not mounted', () => {
        // Given a caller whose scroll view is not mounted, e.g. a form without a scroll view
        scrollableRef.current = null;
        const {scrollWithKeyboard, moveKeyboard} = renderKeyboardDrivenScroll();

        // When a target is set and the keyboard moves
        scrollWithKeyboard(120);
        moveKeyboard(100);

        // Then nothing is scrolled or watched
        expect(mockSetFrameCallbackActive).not.toHaveBeenCalled();
        expect(mockScrollTo).not.toHaveBeenCalled();
    });

    it('scrolls on web once the transition is over, as there are no keyboard frames', () => {
        // Given the web version and a scroll view
        const scrollViewScrollTo = jest.fn();
        // Only scrollTo is called on web
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- see the comment above
        scrollableRef.current = {scrollTo: scrollViewScrollTo} as unknown as KeyboardScrollable;
        const {result} = renderHook(() => useKeyboardDrivenScrollWeb(scrollableRef));

        // When a target is set
        result.current(120);

        // Then it scrolls only after the transition, animated
        jest.advanceTimersByTime(CONST.ANIMATED_TRANSITION - 1);
        expect(scrollViewScrollTo).not.toHaveBeenCalled();
        jest.advanceTimersByTime(1);
        expect(scrollViewScrollTo).toHaveBeenCalledWith({y: 120, animated: true});
    });

    it('does not scroll on web after the caller unmounts', () => {
        // Given the web version, a scroll view and a pending scroll
        const scrollViewScrollTo = jest.fn();
        // Only scrollTo is called on web
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- see the comment above
        scrollableRef.current = {scrollTo: scrollViewScrollTo} as unknown as KeyboardScrollable;
        const {result, unmount} = renderHook(() => useKeyboardDrivenScrollWeb(scrollableRef));
        result.current(120);

        // When the caller unmounts before the transition is over
        unmount();
        jest.advanceTimersByTime(CONST.ANIMATED_TRANSITION);

        // Then the pending scroll is dropped
        expect(scrollViewScrollTo).not.toHaveBeenCalled();
    });
});
