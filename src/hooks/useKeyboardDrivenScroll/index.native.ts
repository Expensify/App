/**
 * Scrolls a scroll view on every keyboard frame, on the UI thread, so content moves together with the keyboard.
 * A JS timer or keyboard event scrolls late when JS is busy, which makes the content jump a second time.
 */
import {useRef} from 'react';
import {KeyboardController, useKeyboardHandler} from 'react-native-keyboard-controller';
import {measure, scrollTo, useAnimatedReaction, useAnimatedRef, useFrameCallback, useSharedValue} from 'react-native-reanimated';
import {scheduleOnRN, scheduleOnUI} from 'react-native-worklets';

import type {KeyboardScrollable, KeyboardScrollTarget, ScrollWithKeyboard, UseKeyboardDrivenScroll} from './types';

/** How long the target is kept. On a busy Android app the keyboard avoiding view can resize about a second late. */
const TARGET_LIFETIME_MS = 2000;

/** Android smooth-scrolls a focused input to the bottom edge for 250 ms after a resize, so the target is re-applied after that. */
const SETTLE_DELAY_MS = 400;

/** If no keyboard starts opening by then (e.g. hardware keyboard), the target is applied without it. */
const NO_KEYBOARD_DELAY_MS = 500;

/** Smaller height changes are rounding noise, not a resize. */
const RESIZE_THRESHOLD = 1;

type KeyboardPhase = 'closed' | 'opening' | 'open' | 'closing';

function isDue(deadline: number | null, now: number) {
    'worklet';

    return deadline !== null && now >= deadline;
}

const useKeyboardDrivenScroll: UseKeyboardDrivenScroll = (scrollableRef) => {
    const animatedScrollableRef = useAnimatedRef<KeyboardScrollable>();

    // Tracked on the UI thread because the keyboard often starts, or even finishes, before the focus event reaches JS
    const keyboardPhase = useSharedValue<KeyboardPhase>(KeyboardController.isVisible() ? 'open' : 'closed');

    const pendingTarget = useSharedValue<KeyboardScrollTarget | null>(null);
    const targetSetAt = useSharedValue(0);
    const settleAt = useSharedValue<number | null>(null);
    const noKeyboardAt = useSharedValue<number | null>(null);
    const heightAtLastScroll = useSharedValue(0);

    // Each target gets a number, so a stop meant for an old target can't stop the watcher of a new one
    const latestRequest = useRef(0);
    const activeRequest = useSharedValue(0);
    const finishedRequest = useSharedValue(0);

    function getVisibleHeight() {
        'worklet';

        return measure(animatedScrollableRef)?.height ?? 0;
    }

    function scrollToTarget(target: KeyboardScrollTarget, isAnimated: boolean) {
        'worklet';

        heightAtLastScroll.set(getVisibleHeight());
        scrollTo(animatedScrollableRef, 0, Math.max(target.offset, 0), isAnimated);
    }

    /** Scrolls now, and again once Android's own scroll to the focused input is done. */
    function scrollAndSettle(target: KeyboardScrollTarget, isAnimated: boolean) {
        'worklet';

        scrollToTarget(target, isAnimated);
        settleAt.set(Date.now() + SETTLE_DELAY_MS);
    }

    function finishTarget() {
        'worklet';

        pendingTarget.set(null);
        settleAt.set(null);
        noKeyboardAt.set(null);
        finishedRequest.set(activeRequest.get());
    }

    // Keeps the target applied after the keyboard is up: late resizes, which on Android also move the focused input
    const targetWatcher = useFrameCallback(() => {
        'worklet';

        const target = pendingTarget.get();
        const now = Date.now();
        const isExpired = now - targetSetAt.get() > TARGET_LIFETIME_MS;
        // A settle scheduled before the target expired still runs
        if (!target || (isExpired && settleAt.get() === null)) {
            finishTarget();
            return;
        }

        if (isDue(noKeyboardAt.get(), now)) {
            noKeyboardAt.set(null);
            scrollToTarget(target, true);
            return;
        }
        if (keyboardPhase.get() !== 'open') {
            return;
        }

        if (Math.abs(getVisibleHeight() - heightAtLastScroll.get()) > RESIZE_THRESHOLD) {
            scrollAndSettle(target, false);
            return;
        }
        if (isDue(settleAt.get(), now)) {
            settleAt.set(null);
            scrollToTarget(target, true);
        }
    }, false);

    const stopTargetWatcher = (request: number) => {
        if (request !== latestRequest.current) {
            return;
        }
        targetWatcher.setActive(false);
    };

    // Frame callbacks can only be stopped from JS
    useAnimatedReaction(
        () => finishedRequest.get(),
        (request, previousRequest) => {
            if (previousRequest === null || request === previousRequest) {
                return;
            }
            scheduleOnRN(stopTargetWatcher, request);
        },
    );

    useKeyboardHandler(
        {
            onStart: (event) => {
                'worklet';

                const isOpening = event.height > 0;
                keyboardPhase.set(isOpening ? 'opening' : 'closing');
                noKeyboardAt.set(null);
                // The user left the input, so the content stays where they put it
                if (!isOpening) {
                    pendingTarget.set(null);
                }
            },
            onMove: () => {
                'worklet';

                const target = pendingTarget.get();
                if (!target || keyboardPhase.get() !== 'opening') {
                    return;
                }
                // The end of the content grows as the view shrinks, so the content follows the keyboard
                scrollToTarget(target, false);
            },
            onEnd: (event) => {
                'worklet';

                const isOpen = event.height > 0;
                keyboardPhase.set(isOpen ? 'open' : 'closed');
                const target = pendingTarget.get();
                if (target && isOpen) {
                    scrollAndSettle(target, false);
                }
            },
        },
        [],
    );

    const scrollWithKeyboard: ScrollWithKeyboard = (target) => {
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
            targetSetAt.set(Date.now());
            activeRequest.set(request);
            settleAt.set(null);
            noKeyboardAt.set(null);

            const phase = keyboardPhase.get();
            // No keyboard frames will come, so scroll now
            if (phase === 'open') {
                scrollAndSettle(target, true);
                return;
            }
            // Closed or closing: give a keyboard a moment to open, then scroll without it
            if (phase !== 'opening') {
                noKeyboardAt.set(Date.now() + NO_KEYBOARD_DELAY_MS);
            }
        });
        targetWatcher.setActive(true);
        return true;
    };

    // Runs on the UI thread after any earlier request, so it can't drop a target set after it
    const cancelScrollWithKeyboard = () => {
        scheduleOnUI(() => {
            'worklet';

            if (!pendingTarget.get()) {
                return;
            }
            finishTarget();
        });
    };

    return {scrollWithKeyboard, cancelScrollWithKeyboard};
};

export default useKeyboardDrivenScroll;
