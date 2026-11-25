/** Scrolls a scroll view with the keyboard, frame by frame on the UI thread. */
import type {ComponentRef} from 'react';
import type {View} from 'react-native';
import type {ScrollEvent} from 'react-native-reanimated';

import {useEffect, useRef} from 'react';
import {useKeyboardHandler, useReanimatedFocusedInput, useReanimatedKeyboardAnimation} from 'react-native-keyboard-controller';
import {measure, scrollTo, useAnimatedReaction, useEvent, useFrameCallback, useScrollOffset, useSharedValue} from 'react-native-reanimated';
import {scheduleOnUI} from 'react-native-worklets';

import type {KeyboardScrollable, ScrollWithKeyboard, UseKeyboardDrivenScroll} from './types';

/** Android can resize the keyboard avoiding view up to a second late. */
const TARGET_LIFETIME_MS = 2000;

/** Outlasts Android's own 250 ms scroll to the focused input. */
const SETTLE_DELAY_MS = 400;

/** No keyboard by then, e.g. a hardware one. */
const NO_KEYBOARD_DELAY_MS = 500;

/** After the last possible re-apply. */
const WATCHER_STOP_DELAY_MS = TARGET_LIFETIME_MS + SETTLE_DELAY_MS + 100;

type KeyboardPhase = 'closed' | 'opening' | 'open';

type FollowStart = {
    offset: number;
    keyboardHeight: number;
};

/** useEvent's runtime return value. Its public type is a function. */
type ViewEventHandler = {
    workletEventHandler: {
        registerForEvents: (viewTag: number) => void;
        unregisterFromEvents: (viewTag: number) => void;
    };
};

/**
 * ScrollView has getInnerViewRef at runtime, but only React Native's strict API types (opted into with the
 * react-native-strict-api custom condition) declare it. The app uses the hand-written types, which don't.
 */
type ScrollViewWithInnerView = KeyboardScrollable & {getInnerViewRef?: () => ComponentRef<typeof View> | null};

/** Scroll events miss content that was never scrolled or grew since. measure is synchronous on the new architecture. */
function measureContentHeight(scrollView: KeyboardScrollable): number | null {
    let contentHeight: number | null = null;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- see ScrollViewWithInnerView
    (scrollView as ScrollViewWithInnerView).getInnerViewRef?.()?.measure((_x, _y, _width, height) => {
        contentHeight = height;
    });
    return contentHeight;
}

const useKeyboardDrivenScroll: UseKeyboardDrivenScroll = (scrollableRef) => {
    const scrollOffset = useScrollOffset(scrollableRef);

    const providerKeyboard = useReanimatedKeyboardAnimation();
    const {input: focusedInput} = useReanimatedFocusedInput();

    // Null until the first keyboard event
    const keyboardPhase = useSharedValue<KeyboardPhase | null>(null);
    const keyboardHeight = useSharedValue<number | null>(null);
    const keyboardEndHeight = useSharedValue(0);
    const followStart = useSharedValue<FollowStart | null>(null);

    const pendingTarget = useSharedValue<number | null>(null);
    const targetInputTag = useSharedValue<number | null>(null);
    const targetSetAt = useSharedValue(0);
    const reapplyAt = useSharedValue<number | null>(null);
    const heightAtLastScroll = useSharedValue(0);
    const contentHeight = useSharedValue<number | null>(null);
    const focusChangedAt = useSharedValue(0);
    const dragStartedAt = useSharedValue(0);

    const stopWatcherTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    function getKeyboardPhase(): KeyboardPhase {
        'worklet';

        const phase = keyboardPhase.get();
        if (phase) {
            return phase;
        }
        // iOS sets the end value on start
        const progress = providerKeyboard.progress.get();
        if (progress >= 1) {
            return 'open';
        }
        return progress <= 0 ? 'closed' : 'opening';
    }

    function getFocusedInputTag() {
        'worklet';

        return focusedInput.get()?.target ?? null;
    }

    function getVisibleHeight() {
        'worklet';

        return measure(scrollableRef)?.height ?? 0;
    }

    /** A target past the end would otherwise be reached on the first frame. */
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

    /** Re-applies after Android's own scroll to the focused input. */
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

    /** Drops the target once focus moves or it expires. */
    function getTargetOfFocusedInput() {
        'worklet';

        const target = pendingTarget.get();
        if (target === null) {
            return null;
        }
        // An input focused after the target was set owns it
        const focusedTag = getFocusedInputTag();
        const ownerTag = targetInputTag.get() ?? focusedTag;
        targetInputTag.set(ownerTag);
        if (focusedTag !== ownerTag || (isTargetExpired() && reapplyAt.get() === null)) {
            clearTarget();
            return null;
        }
        return target;
    }

    // Re-applies the target after late resizes
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

    // A late onFocus can come after the user dragged
    useAnimatedReaction(getFocusedInputTag, (inputTag, previousInputTag) => {
        if (inputTag === previousInputTag) {
            return;
        }
        focusChangedAt.set(Date.now());
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- useEvent's public type hides the handler object it returns
    const {workletEventHandler: scrollEventHandler} = useEvent(
        (event: ScrollEvent) => {
            'worklet';

            contentHeight.set(event.contentSize.height);
            // Only user drags send it, not scrollTo. Event names are prefixed with the view tag.
            if (event.eventName.endsWith('onScrollBeginDrag')) {
                dragStartedAt.set(Date.now());
                clearTarget();
            }
        },
        ['onScroll', 'onScrollBeginDrag'],
    ) as unknown as ViewEventHandler;

    // Registered on the view, like useScrollOffset, so the scroll view's props stay untouched
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
                // iOS starts an event with no frames when focus moves to another input
                const keepsOpenHeight = getKeyboardPhase() === 'open' && event.height === keyboardHeight.get();
                if (!keepsOpenHeight) {
                    keyboardPhase.set(isOpening ? 'opening' : 'closed');
                }
                keyboardEndHeight.set(event.height);
                followStart.set(null);
                reapplyAt.set(null);
                if (!isOpening) {
                    clearTarget();
                }
            },
            onMove: (event) => {
                'worklet';

                const target = getTargetOfFocusedInput();
                if (target !== null && getKeyboardPhase() === 'opening') {
                    const endHeight = keyboardEndHeight.get();
                    // Taken on the target's first frame, which can be mid-animation
                    let start = followStart.get();
                    if (!start) {
                        // iOS sets the provider to the end height on start, so the start further from the end wins. The provider height is negative.
                        const providerHeight = Math.abs(providerKeyboard.height.get());
                        const fallbackHeight = Math.abs(providerHeight - endHeight) > Math.abs(event.height - endHeight) ? providerHeight : event.height;
                        start = {offset: scrollOffset.get(), keyboardHeight: keyboardHeight.get() ?? fallbackHeight};
                        followStart.set(start);
                    }
                    // Negative distance: an open keyboard getting shorter
                    const distance = endHeight - start.keyboardHeight;
                    const share = distance === 0 ? 1 : Math.min(Math.max((event.height - start.keyboardHeight) / distance, 0), 1);
                    scrollToOffset(start.offset + (getReachableOffset(target) - start.offset) * share, false);
                }
                keyboardHeight.set(event.height);
            },
            onEnd: (event) => {
                'worklet';

                const isOpen = event.height > 0;
                // An open keyboard's target was applied when set
                const wasOpening = getKeyboardPhase() === 'opening';
                keyboardPhase.set(isOpen ? 'open' : 'closed');
                keyboardHeight.set(event.height);
                followStart.set(null);
                const target = getTargetOfFocusedInput();
                // Frames can stop short or never come
                if (target !== null && isOpen && wasOpening) {
                    scrollAndSettle(target, true);
                }
            },
        },
        [],
    );

    const scrollWithKeyboard: ScrollWithKeyboard = (target, {shouldIgnoreEarlierDrag = false} = {}) => {
        const scrollView = scrollableRef.current;
        if (!scrollView) {
            return;
        }
        const measuredContentHeight = measureContentHeight(scrollView);

        scheduleOnUI(() => {
            'worklet';

            if (measuredContentHeight !== null) {
                contentHeight.set(measuredContentHeight);
            }
            clearTarget();
            // The user dragged after focusing the input
            const focusedTag = getFocusedInputTag();
            if (!shouldIgnoreEarlierDrag && focusedTag !== null && dragStartedAt.get() > focusChangedAt.get()) {
                return;
            }
            pendingTarget.set(target);
            targetInputTag.set(focusedTag);
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
