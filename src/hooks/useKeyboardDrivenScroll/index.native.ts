/**
 * Scrolls a scroll view on every keyboard frame, on the UI thread, so content moves with the keyboard.
 * A JS-side scroll lands late when JS is busy, so the content jumps twice.
 */
import type {ScrollEvent} from 'react-native-reanimated';

import {useEffect, useRef} from 'react';
import {useKeyboardHandler, useReanimatedFocusedInput, useReanimatedKeyboardAnimation} from 'react-native-keyboard-controller';
import {measure, scrollTo, useEvent, useFrameCallback, useScrollOffset, useSharedValue} from 'react-native-reanimated';
import {scheduleOnUI} from 'react-native-worklets';

import type {ScrollWithKeyboard, UseKeyboardDrivenScroll} from './types';

/** On a busy Android app the keyboard avoiding view can resize about a second late. */
const TARGET_LIFETIME_MS = 2000;

/** Android smooth-scrolls the focused input for 250 ms after a resize. */
const SETTLE_DELAY_MS = 400;

/** No keyboard by then (e.g. hardware keyboard), so scroll without it. */
const NO_KEYBOARD_DELAY_MS = 500;

/** Past the last re-apply, due by the lifetime plus one settle delay. The margin covers the UI thread starting later. */
const WATCHER_STOP_DELAY_MS = TARGET_LIFETIME_MS + SETTLE_DELAY_MS + 100;

/** No 'closing': the target is dropped when the keyboard starts closing. */
type KeyboardPhase = 'closed' | 'opening' | 'open';

type FollowStart = {
    offset: number;
    keyboardHeight: number;
};

/** What useEvent returns at runtime. Its public type is a plain function, as it's meant to be passed as a prop. */
type ViewEventHandler = {
    workletEventHandler: {
        registerForEvents: (viewTag: number) => void;
        unregisterFromEvents: (viewTag: number) => void;
    };
};

const useKeyboardDrivenScroll: UseKeyboardDrivenScroll = (scrollableRef) => {
    const scrollOffset = useScrollOffset(scrollableRef);

    // UI-thread values, current even when JS is busy (unlike KeyboardController.isVisible())
    const providerKeyboard = useReanimatedKeyboardAnimation();
    const {input: focusedInput} = useReanimatedFocusedInput();

    // Null until the first keyboard event, then the provider's values are no longer needed
    const keyboardPhase = useSharedValue<KeyboardPhase | null>(null);
    const keyboardHeight = useSharedValue<number | null>(null);
    const keyboardEndHeight = useSharedValue(0);
    const followStart = useSharedValue<FollowStart | null>(null);

    const pendingTarget = useSharedValue<number | null>(null);
    const targetInputTag = useSharedValue<number | null>(null);
    const targetSetAt = useSharedValue(0);
    const reapplyAt = useSharedValue<number | null>(null);
    const heightAtLastScroll = useSharedValue(0);
    // Null until the scroll view sends its first scroll event
    const contentHeight = useSharedValue<number | null>(null);

    const stopWatcherTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    function getKeyboardPhase(): KeyboardPhase {
        'worklet';

        const phase = keyboardPhase.get();
        if (phase) {
            return phase;
        }
        // iOS jumps to the end value on start, Android follows every frame
        const progress = providerKeyboard.progress.get();
        if (progress >= 1) {
            return 'open';
        }
        return progress <= 0 ? 'closed' : 'opening';
    }

    function getVisibleHeight() {
        'worklet';

        return measure(scrollableRef)?.height ?? 0;
    }

    /**
     * The scroll view stops at its end, so a target past it, like a scroll to the end, would be reached on the first
     * frame. Following the end the scroll view can reach right now moves the content with the keyboard instead.
     */
    function getReachableOffset(targetOffset: number) {
        'worklet';

        const height = contentHeight.get();
        return Math.max(Math.min(targetOffset, height === null ? targetOffset : height - getVisibleHeight()), 0);
    }

    function scrollToOffset(offset: number, isAnimated: boolean) {
        'worklet';

        heightAtLastScroll.set(getVisibleHeight());
        scrollTo(scrollableRef, 0, Math.max(offset, 0), isAnimated);
    }

    function isTargetExpired() {
        'worklet';

        return Date.now() - targetSetAt.get() > TARGET_LIFETIME_MS;
    }

    /** Scrolls now and again after Android's own scroll to the focused input. No new re-apply once expired. */
    function scrollAndSettle(target: number, isAnimated: boolean) {
        'worklet';

        scrollToOffset(target, isAnimated);
        if (isTargetExpired()) {
            return;
        }
        reapplyAt.set(Date.now() + SETTLE_DELAY_MS);
    }

    function clearTarget() {
        'worklet';

        pendingTarget.set(null);
        targetInputTag.set(null);
        reapplyAt.set(null);
        followStart.set(null);
    }

    /** Drops the target once focus moves, or once expired with no re-apply pending. Focus reaches the UI thread before the blur reaches JS. */
    function getTargetOfFocusedInput() {
        'worklet';

        const target = pendingTarget.get();
        if (target === null) {
            return null;
        }
        // An input that gets focus after the target is set becomes its owner
        const focusedTag = focusedInput.get()?.target ?? null;
        const ownerTag = targetInputTag.get() ?? focusedTag;
        targetInputTag.set(ownerTag);
        if (focusedTag !== ownerTag || (isTargetExpired() && reapplyAt.get() === null)) {
            clearTarget();
            return null;
        }
        return target;
    }

    // Re-applies the target after late resizes, which on Android also move the focused input
    const targetWatcher = useFrameCallback(() => {
        'worklet';

        const target = getTargetOfFocusedInput();
        if (target === null) {
            return;
        }

        const phase = getKeyboardPhase();
        if (phase === 'opening') {
            return;
        }
        // Ignores sub-pixel layout changes
        if (phase === 'open' && Math.abs(getVisibleHeight() - heightAtLastScroll.get()) > 1) {
            scrollAndSettle(target, false);
            return;
        }
        const reapplyTime = reapplyAt.get();
        if (reapplyTime !== null && Date.now() >= reapplyTime) {
            reapplyAt.set(null);
            scrollToOffset(target, true);
        }
    }, false);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- useEvent's public type hides the handler object it returns
    const {workletEventHandler: scrollEventHandler} = useEvent(
        (event: ScrollEvent) => {
            'worklet';

            contentHeight.set(event.contentSize.height);
            // A drag means the user wants the content where they put it, so no re-apply may pull it back.
            // Our own scrollTo calls don't send this event, so only the user's drags drop the target.
            // Reanimated prefixes the event name with the view tag.
            if (event.eventName.endsWith('onScrollBeginDrag')) {
                clearTarget();
            }
        },
        ['onScroll', 'onScrollBeginDrag'],
    ) as unknown as ViewEventHandler;

    // Registered on the view directly, as Reanimated's useScrollOffset does, so the scroll view's props don't change
    useEffect(
        () =>
            scrollableRef.observe((viewTag) => {
                if (!viewTag) {
                    return;
                }
                scrollEventHandler.registerForEvents(viewTag);
                return () => scrollEventHandler.unregisterFromEvents(viewTag);
            }),
        [scrollableRef, scrollEventHandler],
    );

    useEffect(() => () => clearTimeout(stopWatcherTimer.current ?? undefined), []);

    useKeyboardHandler(
        {
            onStart: (event) => {
                'worklet';

                const isOpening = event.height > 0;
                keyboardPhase.set(isOpening ? 'opening' : 'closed');
                // The height the keyboard is moving to
                keyboardEndHeight.set(event.height);
                followStart.set(null);
                reapplyAt.set(null);
                // The user left the input, so keep the content where they put it
                if (!isOpening) {
                    clearTarget();
                }
            },
            onMove: (event) => {
                'worklet';

                const target = getTargetOfFocusedInput();
                if (target !== null && getKeyboardPhase() === 'opening') {
                    const endHeight = keyboardEndHeight.get();
                    // The target can be set mid-animation, so the start is taken on its first frame
                    let start = followStart.get();
                    if (!start) {
                        // Before the hook has seen a keyboard frame, the provider may already hold the end height, as iOS sets it when
                        // the keyboard starts moving. Starting there would finish the follow on the first frame, so the start is
                        // whichever of the provider and this frame is further from the end. The provider stores a negative offset.
                        const providerHeight = Math.abs(providerKeyboard.height.get());
                        const fallbackHeight = Math.abs(providerHeight - endHeight) > Math.abs(event.height - endHeight) ? providerHeight : event.height;
                        start = {offset: scrollOffset.get(), keyboardHeight: keyboardHeight.get() ?? fallbackHeight};
                        followStart.set(start);
                    }
                    // The content moves by the share of the keyboard animation done so far, so it doesn't jump on the first frame.
                    // The distance is negative when an open keyboard gets shorter.
                    const distance = endHeight - start.keyboardHeight;
                    const share = distance === 0 ? 1 : Math.min(Math.max((event.height - start.keyboardHeight) / distance, 0), 1);
                    scrollToOffset(start.offset + (getReachableOffset(target) - start.offset) * share, false);
                }
                keyboardHeight.set(event.height);
            },
            onEnd: (event) => {
                'worklet';

                const isOpen = event.height > 0;
                keyboardPhase.set(isOpen ? 'open' : 'closed');
                keyboardHeight.set(event.height);
                followStart.set(null);
                const target = getTargetOfFocusedInput();
                if (target !== null && isOpen) {
                    scrollAndSettle(target, false);
                }
            },
        },
        [],
    );

    const scrollWithKeyboard: ScrollWithKeyboard = (target) => {
        // Nothing to scroll, e.g. a form without a scroll view
        if (!scrollableRef.current) {
            return;
        }

        scheduleOnUI(() => {
            'worklet';

            clearTarget();
            pendingTarget.set(target);
            targetInputTag.set(focusedInput.get()?.target ?? null);
            targetSetAt.set(Date.now());

            const phase = getKeyboardPhase();
            // No keyboard frames will come
            if (phase === 'open') {
                scrollAndSettle(target, true);
                return;
            }
            if (phase === 'closed') {
                reapplyAt.set(Date.now() + NO_KEYBOARD_DELAY_MS);
            }
        });

        // A late stop is harmless
        targetWatcher.setActive(true);
        clearTimeout(stopWatcherTimer.current ?? undefined);
        stopWatcherTimer.current = setTimeout(() => {
            targetWatcher.setActive(false);
            scheduleOnUI(clearTarget);
        }, WATCHER_STOP_DELAY_MS);
    };

    return scrollWithKeyboard;
};

export default useKeyboardDrivenScroll;
