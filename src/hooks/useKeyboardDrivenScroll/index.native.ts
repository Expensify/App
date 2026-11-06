/**
 * Scrolls a scroll view on every keyboard frame, on the UI thread, so content moves together with the keyboard.
 * A JS timer or keyboard event scrolls late when JS is busy, which makes the content jump a second time.
 */
import {useRef} from 'react';
import {KeyboardController, useKeyboardHandler} from 'react-native-keyboard-controller';
import {measure, scrollTo, useAnimatedReaction, useAnimatedRef, useFrameCallback, useSharedValue} from 'react-native-reanimated';
import {scheduleOnRN, scheduleOnUI} from 'react-native-worklets';

import type {KeyboardScrollable, KeyboardScrollTarget, UseKeyboardDrivenScroll} from './types';

/** How long the target is kept. On a busy Android app the keyboard avoiding view can resize about a second late. */
const TARGET_LIFETIME_MS = 2000;

/** Android smooth-scrolls a focused input to the bottom edge for 250 ms after a resize, so the target is re-applied after that. */
const SETTLE_DELAY_MS = 400;

/** If no keyboard starts opening by then (e.g. hardware keyboard), the target is applied without it. */
const NO_KEYBOARD_DELAY_MS = 500;

/** Smaller height changes are rounding noise, not a resize. */
const RESIZE_THRESHOLD = 1;

const useKeyboardDrivenScroll: UseKeyboardDrivenScroll = (scrollableRef) => {
    const animatedScrollableRef = useAnimatedRef<KeyboardScrollable>();
    const pendingTarget = useSharedValue<KeyboardScrollTarget | null>(null);
    const targetSetAt = useSharedValue(0);
    const scrolledAtHeight = useSharedValue(0);
    const settleAt = useSharedValue<number | null>(null);
    const noKeyboardAt = useSharedValue<number | null>(null);
    const isWatchingTarget = useSharedValue(false);
    const watchedRequest = useSharedValue(0);
    const latestRequest = useRef(0);

    // Tracked on the UI thread because the keyboard often starts, or even finishes, before the focus event reaches JS
    const isKeyboardFullyOpen = useSharedValue(KeyboardController.isVisible());
    const isKeyboardOpening = useSharedValue(false);

    function scrollToTarget(target: KeyboardScrollTarget, isAnimated: boolean) {
        'worklet';

        scrolledAtHeight.set(measure(animatedScrollableRef)?.height ?? 0);
        scrollTo(animatedScrollableRef, 0, Math.max(target.offset, 0), isAnimated);
    }

    function scheduleSettle() {
        'worklet';

        settleAt.set(Date.now() + SETTLE_DELAY_MS);
    }

    // Re-applies the target after late resizes, which on Android also move the focused input
    const targetWatcher = useFrameCallback(() => {
        'worklet';

        const target = pendingTarget.get();
        const now = Date.now();
        const pendingSettleAt = settleAt.get();
        // A pending settle still runs after the lifetime ends
        if (!target || (now - targetSetAt.get() > TARGET_LIFETIME_MS && pendingSettleAt === null)) {
            pendingTarget.set(null);
            settleAt.set(null);
            noKeyboardAt.set(null);
            isWatchingTarget.set(false);
            return;
        }

        const pendingNoKeyboardAt = noKeyboardAt.get();
        if (pendingNoKeyboardAt !== null && now >= pendingNoKeyboardAt) {
            noKeyboardAt.set(null);
            scrollToTarget(target, true);
            return;
        }
        if (!isKeyboardFullyOpen.get()) {
            return;
        }

        const height = measure(animatedScrollableRef)?.height ?? 0;
        if (Math.abs(height - scrolledAtHeight.get()) > RESIZE_THRESHOLD) {
            scrolledAtHeight.set(height);
            scheduleSettle();
            return;
        }
        if (pendingSettleAt !== null && now >= pendingSettleAt) {
            settleAt.set(null);
            scrollToTarget(target, true);
        }
    }, false);

    const stopTargetWatcher = (request: number) => {
        // A newer target started the watcher again
        if (request !== latestRequest.current) {
            return;
        }
        targetWatcher.setActive(false);
    };

    // Frame callbacks can only be stopped from JS
    useAnimatedReaction(
        () => isWatchingTarget.get(),
        (isWatching, wasWatching) => {
            if (isWatching || !wasWatching) {
                return;
            }
            scheduleOnRN(stopTargetWatcher, watchedRequest.get());
        },
    );

    useKeyboardHandler(
        {
            onStart: (event) => {
                'worklet';

                isKeyboardFullyOpen.set(false);
                isKeyboardOpening.set(event.height > 0);
                noKeyboardAt.set(null);
                if (event.height === 0) {
                    pendingTarget.set(null);
                }
            },
            onMove: () => {
                'worklet';

                const target = pendingTarget.get();
                if (!target || !isKeyboardOpening.get()) {
                    return;
                }
                // The end of the content grows as the view shrinks, so the content follows the keyboard
                scrollToTarget(target, false);
            },
            onEnd: (event) => {
                'worklet';

                isKeyboardOpening.set(false);
                isKeyboardFullyOpen.set(event.height > 0);
                const target = pendingTarget.get();
                if (!target || event.height === 0) {
                    return;
                }
                scrollToTarget(target, false);
                scheduleSettle();
            },
        },
        [],
    );

    return (target) => {
        const scrollable = scrollableRef?.current;
        // Nothing to scroll, so the caller's fallback couldn't scroll either
        if (!scrollable) {
            return true;
        }
        // Callers don't have to attach a second ref
        animatedScrollableRef(scrollable);
        latestRequest.current += 1;
        const request = latestRequest.current;

        scheduleOnUI(() => {
            'worklet';

            pendingTarget.set(target);
            watchedRequest.set(request);
            targetSetAt.set(Date.now());
            settleAt.set(null);
            noKeyboardAt.set(null);
            isWatchingTarget.set(true);
            // No keyboard frames will come, so scroll now
            if (isKeyboardFullyOpen.get()) {
                scrollToTarget(target, true);
                scheduleSettle();
                return;
            }
            // Also covers focus while the keyboard is closing
            if (!isKeyboardOpening.get()) {
                noKeyboardAt.set(Date.now() + NO_KEYBOARD_DELAY_MS);
            }
        });
        targetWatcher.setActive(true);
        return true;
    };
};

export default useKeyboardDrivenScroll;
