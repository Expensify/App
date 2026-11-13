/**
 * Scrolls a scroll view on every keyboard frame, on the UI thread, so content moves with the keyboard.
 * A JS-side scroll lands late when JS is busy, so the content jumps twice.
 */
import {useEffect, useRef} from 'react';
import {useKeyboardHandler, useReanimatedFocusedInput, useReanimatedKeyboardAnimation} from 'react-native-keyboard-controller';
import {measure, scrollTo, useAnimatedRef, useFrameCallback, useScrollOffset, useSharedValue} from 'react-native-reanimated';
import {scheduleOnUI} from 'react-native-worklets';

import type {KeyboardScrollable, KeyboardScrollTarget, ScrollWithKeyboard, UseKeyboardDrivenScroll} from './types';

import getFollowOffset from './getFollowOffset';

/** On a busy Android app the keyboard avoiding view can resize about a second late. */
const TARGET_LIFETIME_MS = 2000;

/** Android smooth-scrolls the focused input for 250 ms after a resize. */
const SETTLE_DELAY_MS = 400;

/** No keyboard by then (e.g. hardware keyboard), so scroll without it. */
const NO_KEYBOARD_DELAY_MS = 500;

/** Past the last re-apply, due by the lifetime plus one settle delay. The margin covers the UI thread starting later. */
const WATCHER_STOP_DELAY_MS = TARGET_LIFETIME_MS + SETTLE_DELAY_MS + 100;

const RESIZE_THRESHOLD = 1;

/** No 'closing': the target is dropped when the keyboard starts closing. */
type KeyboardPhase = 'closed' | 'opening' | 'open';

type FollowStart = {
    offset: number;
    keyboardHeight: number;
};

const useKeyboardDrivenScroll: UseKeyboardDrivenScroll = (scrollableRef) => {
    const animatedScrollableRef = useAnimatedRef<KeyboardScrollable>();

    // Attached on mount, so the offset is tracked before the first focus
    useEffect(() => {
        if (!scrollableRef?.current) {
            return;
        }
        animatedScrollableRef(scrollableRef.current);
    }, [scrollableRef, animatedScrollableRef]);

    // Reanimated warns about an unattached ref
    const scrollOffset = useScrollOffset(scrollableRef ? animatedScrollableRef : undefined);

    // UI-thread values, current even when JS is busy (unlike KeyboardController.isVisible())
    const providerKeyboard = useReanimatedKeyboardAnimation();
    const {input: focusedInput} = useReanimatedFocusedInput();

    // Null until the first keyboard event, then the provider's values are no longer needed
    const keyboardPhase = useSharedValue<KeyboardPhase | null>(null);
    const keyboardHeight = useSharedValue<number | null>(null);
    const keyboardEndHeight = useSharedValue(0);
    const followStart = useSharedValue<FollowStart | null>(null);

    const pendingTarget = useSharedValue<KeyboardScrollTarget | null>(null);
    const targetInputTag = useSharedValue<number | null>(null);
    const targetSetAt = useSharedValue(0);
    const reapplyAt = useSharedValue<number | null>(null);
    const heightAtLastScroll = useSharedValue(0);

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

    function getKeyboardHeight() {
        'worklet';

        // Stored as a negative offset
        return keyboardHeight.get() ?? Math.abs(providerKeyboard.height.get());
    }

    function getVisibleHeight() {
        'worklet';

        return measure(animatedScrollableRef)?.height ?? 0;
    }

    function scrollToOffset(offset: number, isAnimated: boolean) {
        'worklet';

        heightAtLastScroll.set(getVisibleHeight());
        scrollTo(animatedScrollableRef, 0, Math.max(offset, 0), isAnimated);
    }

    function isTargetExpired() {
        'worklet';

        return Date.now() - targetSetAt.get() > TARGET_LIFETIME_MS;
    }

    /** Scrolls now and again after Android's own scroll to the focused input. No new re-apply once expired. */
    function scrollAndSettle(target: KeyboardScrollTarget, isAnimated: boolean) {
        'worklet';

        scrollToOffset(target.offset, isAnimated);
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
        if (!target) {
            return null;
        }
        if (isTargetExpired() && reapplyAt.get() === null) {
            clearTarget();
            return null;
        }
        const focusedTag = focusedInput.get()?.target ?? null;
        const ownerTag = targetInputTag.get();
        if (ownerTag === null) {
            targetInputTag.set(focusedTag);
            return target;
        }
        if (focusedTag !== ownerTag) {
            clearTarget();
            return null;
        }
        return target;
    }

    // Re-applies the target after late resizes, which on Android also move the focused input
    const targetWatcher = useFrameCallback(() => {
        'worklet';

        const target = getTargetOfFocusedInput();
        if (!target) {
            return;
        }

        const phase = getKeyboardPhase();
        if (phase === 'opening') {
            return;
        }
        if (phase === 'open' && Math.abs(getVisibleHeight() - heightAtLastScroll.get()) > RESIZE_THRESHOLD) {
            scrollAndSettle(target, false);
            return;
        }
        const reapplyTime = reapplyAt.get();
        if (reapplyTime !== null && Date.now() >= reapplyTime) {
            reapplyAt.set(null);
            scrollToOffset(target.offset, true);
        }
    }, false);

    useEffect(
        () => () => {
            if (!stopWatcherTimer.current) {
                return;
            }
            clearTimeout(stopWatcherTimer.current);
        },
        [],
    );

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
                if (target && getKeyboardPhase() === 'opening') {
                    // The target can be set mid-animation, so the start is taken on its first frame
                    const start = followStart.get() ?? {offset: scrollOffset.get(), keyboardHeight: getKeyboardHeight()};
                    followStart.set(start);
                    const offset = getFollowOffset({
                        startOffset: start.offset,
                        startKeyboardHeight: start.keyboardHeight,
                        endKeyboardHeight: keyboardEndHeight.get(),
                        keyboardHeight: event.height,
                        targetOffset: target.offset,
                    });
                    scrollToOffset(offset, false);
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
                if (target && isOpen) {
                    scrollAndSettle(target, false);
                }
            },
        },
        [],
    );

    const scrollWithKeyboard: ScrollWithKeyboard = (target) => {
        const scrollable = scrollableRef?.current;
        // Nothing to scroll, so the caller's fallback can't scroll either
        if (!scrollable) {
            return true;
        }
        // The scroll view can remount. Re-attaching re-subscribes the scroll offset, so only on a change.
        if (animatedScrollableRef.current !== scrollable) {
            animatedScrollableRef(scrollable);
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
        if (stopWatcherTimer.current) {
            clearTimeout(stopWatcherTimer.current);
        }
        stopWatcherTimer.current = setTimeout(() => {
            targetWatcher.setActive(false);
            scheduleOnUI(clearTarget);
        }, WATCHER_STOP_DELAY_MS);
        return true;
    };

    return scrollWithKeyboard;
};

export default useKeyboardDrivenScroll;
