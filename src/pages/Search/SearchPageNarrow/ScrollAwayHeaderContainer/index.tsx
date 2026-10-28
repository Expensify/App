import ScrollView from '@components/ScrollView';
import SearchListScrollLockContext, {SearchListScrollRegistrationContext} from '@components/Search/SearchListScrollLockContext';
import type {SearchListScroller} from '@components/Search/SearchListScrollLockContext';

import useScrollEventEmitter from '@hooks/useScrollEventEmitter';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import CONST from '@src/CONST';

import type {ComponentRef} from 'react';
import type {GestureResponderEvent, LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent} from 'react-native';

import React, {useEffect, useImperativeHandle, useRef, useState} from 'react';
import {View} from 'react-native';

import type {ScrollAwayHeaderContainerProps} from './types';

type ScrollSample = {
    offset: number;
    time: number;

    /** px/ms, positive while scrolling down */
    velocity: number;
};

// With a fractional pixel ratio (common on Android) fractional layout heights, e.g. while the selection footer shows,
// leave the outer scroller's end short of the header height: the browser rounds the scroll range to whole pixels and
// snaps offsets to device pixels. Without this the rows would stay locked under a header that is already gone.
const SCROLLED_AWAY_TOLERANCE = 2;

/** Whether the outer scroller, at this offset, has scrolled the whole header off screen. */
function isHeaderScrolledAway(offset: number, headerHeight: number): boolean {
    return headerHeight > 0 && offset >= headerHeight - SCROLLED_AWAY_TOLERANCE;
}

// Scroll events further apart than this belong to separate gestures.
const MAX_SCROLL_SAMPLE_GAP_MS = 100;

// Weight of the newest sample in the running velocity estimate (0..1); the remainder keeps the previous value.
const VELOCITY_SMOOTHING = 0.7;

/** Folds a scroll event into a running velocity estimate. */
function sampleScroll(previous: ScrollSample | undefined, offset: number): ScrollSample {
    const time = performance.now();
    if (!previous || time <= previous.time || time - previous.time > MAX_SCROLL_SAMPLE_GAP_MS) {
        return {offset, time, velocity: 0};
    }
    const instantVelocity = (offset - previous.offset) / (time - previous.time);
    return {offset, time, velocity: VELOCITY_SMOOTHING * instantVelocity + (1 - VELOCITY_SMOOTHING) * previous.velocity};
}

// Carrying a fling that hides the header on into the rows.
const MOMENTUM_TIME_CONSTANT_MS = 325;
// The carried-over scroll stops once less than this many pixels of it are left.
const MOMENTUM_REST_DISTANCE = 0.5;

/**
 * Continues a fling on the given scroller, frame by frame, the way native momentum would: it starts at the fling's own
 * velocity and decays exponentially.
 */
function continueMomentum(scroller: SearchListScroller, velocity: number): () => void {
    const startOffset = scroller.getOffset();
    const startTime = performance.now();
    const totalDistance = velocity * MOMENTUM_TIME_CONSTANT_MS;
    let frameID = requestAnimationFrame(function step() {
        const remainingDistance = totalDistance * Math.exp(-(performance.now() - startTime) / MOMENTUM_TIME_CONSTANT_MS);
        scroller.scrollTo(startOffset + totalDistance - remainingDistance);
        if (Math.abs(remainingDistance) >= MOMENTUM_REST_DISTANCE) {
            frameID = requestAnimationFrame(step);
        }
    });

    return () => cancelAnimationFrame(frameID);
}

/**
 * The narrow Search page's list area, which on mobile web in landscape also carries the page header so it scrolls away.
 *
 * The header and the list area share one outer scroller, so a drag starting anywhere on the header (title, type menu,
 * input, filter bars) scrolls the screen natively. While any of the header is on screen the inner scrollers are locked (see
 * SearchListScrollLockContext), so a drag on the rows moves the outer scroller too and the header leaves first; once it
 * is gone they scroll on their own.
 *
 * The header isn't the results list's ListHeaderComponent, as in the Inbox, because the list area is swapped on every query
 * change and is often not a list at all (skeleton, empty state, chart), so the header would keep remounting, this is why
 * we use this approach.
 */
function ScrollAwayHeaderContainer({isEnabled, header, children, ref}: ScrollAwayHeaderContainerProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {windowHeight} = useWindowDimensions();
    // Hides the educational tooltip while the screen scrolls, the same as the list's own scrolling does.
    const triggerScrollEvent = useScrollEventEmitter();

    // The window height stands in until the outer scroller is measured, so the list area never starts out empty.
    const [outerScrollerHeight, setOuterScrollerHeight] = useState(windowHeight);
    const [isHeaderHidden, setIsHeaderHidden] = useState(false);
    // Read only by the scroll handlers, so kept out of state.
    const outerScrollerRef = useRef<ComponentRef<typeof ScrollView>>(null);
    const headerHeightRef = useRef(0);
    const isHeaderHiddenRef = useRef(false);
    const outerScrollSampleRef = useRef<ScrollSample | undefined>(undefined);
    const listOffsetRef = useRef(0);
    const listScrollerRef = useRef<SearchListScroller | undefined>(undefined);
    const cancelMomentumRef = useRef<(() => void) | undefined>(undefined);
    const isTouchingRef = useRef(false);
    const isForwardingTouchRef = useRef(false);
    const lastTouchYRef = useRef(0);
    const forwardedListOffsetRef = useRef(0);
    const forwardedScrollSampleRef = useRef<ScrollSample | undefined>(undefined);

    // A context value. Because of the React Compiler we don't need to memoize it manually: it only closes over refs.
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const registerListScroller = (scroller: SearchListScroller) => {
        listScrollerRef.current = scroller;
        return () => {
            if (listScrollerRef.current !== scroller) {
                return;
            }
            listScrollerRef.current = undefined;
        };
    };

    // A carried-over fling must not outlive the page.
    useEffect(() => () => cancelMomentumRef.current?.(), []);

    useImperativeHandle(ref, () => ({
        // Reaching the top of the list while the header is hidden means the user is heading back to it, so bring the
        // whole header in, rather than leaving it to a second swipe.
        onListScroll: (offset: number) => {
            const hasJustReachedTop = offset <= 0 && listOffsetRef.current > 0;
            listOffsetRef.current = offset;
            if (!hasJustReachedTop || !isHeaderHiddenRef.current) {
                return;
            }
            outerScrollerRef.current?.scrollTo({y: 0, animated: true});
        },
    }));

    // The header leaves the scroller when disabled, so start from a fully shown header the next time it is enabled.
    const [wasEnabled, setWasEnabled] = useState(isEnabled);
    if (wasEnabled !== isEnabled) {
        setWasEnabled(isEnabled);
        if (!isEnabled) {
            setIsHeaderHidden(false);
        }
    }
    useEffect(() => {
        if (isEnabled) {
            return;
        }
        cancelMomentumRef.current?.();
        headerHeightRef.current = 0;
        isHeaderHiddenRef.current = false;
        outerScrollSampleRef.current = undefined;
        isForwardingTouchRef.current = false;
        outerScrollerRef.current?.scrollTo({y: 0, animated: false});
    }, [isEnabled]);

    const onOuterScrollerLayout = (event: LayoutChangeEvent) => setOuterScrollerHeight(event.nativeEvent.layout.height);

    const onHeaderLayout = (event: LayoutChangeEvent) => {
        const headerHeight = event.nativeEvent.layout.height;
        const isFirstLayout = headerHeightRef.current === 0;
        headerHeightRef.current = headerHeight;

        // Enabled with the rows already scrolled, after rotating to landscape mid-list: start with the header hidden
        const listOffset = listScrollerRef.current?.getOffset() ?? 0;
        if (isFirstLayout && headerHeight > 0 && listOffset > 0) {
            // List scrolls aren't reported while disabled, so catch up for onListScroll's reached-the-top check.
            listOffsetRef.current = listOffset;
            isHeaderHiddenRef.current = true;
            setIsHeaderHidden(true);
        }

        // The header can change height with no scroll to re-evaluate it, e.g. when selection mode swaps its contents.
        if (isHeaderHiddenRef.current) {
            // Keep a hidden header fully hidden at its new height, rather than letting part of a grown one show above
            // rows that are already unlocked.
            outerScrollerRef.current?.scrollTo({y: headerHeight, animated: false});
            return;
        }

        // A shrink clamps the outer scroller to its new end, but that scroll event can arrive before this layout and be
        // judged against the old height, which would leave the rows locked under a header that is already gone.
        if (!isHeaderScrolledAway(outerScrollSampleRef.current?.offset ?? 0, headerHeight)) {
            return;
        }
        isHeaderHiddenRef.current = true;
        setIsHeaderHidden(true);
    };

    const cancelMomentum = () => cancelMomentumRef.current?.();

    // Carries a downward motion that ran out at the header's end on into the rows, however slow it was.
    const carryIntoList = (velocity: number) => {
        const listScroller = listScrollerRef.current;
        if (!listScroller || velocity <= 0) {
            return;
        }
        cancelMomentumRef.current = continueMomentum(listScroller, velocity);
    };

    const onOuterScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        triggerScrollEvent();
        const offset = event.nativeEvent.contentOffset.y;
        const previousSample = outerScrollSampleRef.current;
        const sample = sampleScroll(previousSample, offset);
        outerScrollSampleRef.current = sample;

        const isHidden = isHeaderScrolledAway(offset, headerHeightRef.current);
        if (isHidden === isHeaderHiddenRef.current) {
            return;
        }
        isHeaderHiddenRef.current = isHidden;
        cancelMomentum();
        // Unlocked right away, not after the carried-over motion: the browser picks a gesture's scroller when the
        // gesture starts, so a swipe begun while the list is still locked would go to the spent outer scroller and do
        // nothing. A carried-over motion is programmatic and unaffected by the lock either way.
        setIsHeaderHidden(isHidden);

        if (!isHidden) {
            isForwardingTouchRef.current = false;
            return;
        }

        // The finger is still down: the browser has committed this gesture to the outer scroller, which just ran out, so
        // the rest of the drag is forwarded to the rows (see onOuterTouchMove) and carried on when the finger lifts.
        if (isTouchingRef.current) {
            isForwardingTouchRef.current = true;
            forwardedListOffsetRef.current = listScrollerRef.current?.getOffset() ?? 0;
            forwardedScrollSampleRef.current = undefined;
            return;
        }

        // A fling: the browser ends it where the outer scroller runs out. The event that hits the end is clamped and
        // reads slower than the fling was, so the speed from just before it counts too.
        carryIntoList(Math.max(sample.velocity, previousSample?.velocity ?? 0));
    };

    const onOuterTouchStart = (event: GestureResponderEvent) => {
        // A touch takes over from a carried-over fling, the same as it would from a native one.
        cancelMomentum();
        isTouchingRef.current = true;
        isForwardingTouchRef.current = false;
        lastTouchYRef.current = event.nativeEvent.pageY;
    };

    const onOuterTouchMove = (event: GestureResponderEvent) => {
        const touchY = event.nativeEvent.pageY;
        const distance = lastTouchYRef.current - touchY;
        lastTouchYRef.current = touchY;
        const listScroller = listScrollerRef.current;

        // Pulling down at the top of the list while the header is hidden. The list doesn't bounce (see
        // useSearchListScrollLockStyle), so it no longer hands this pull to the outer scroller. Bring the header back here.
        if (distance < 0 && !isForwardingTouchRef.current && isHeaderHiddenRef.current && listScroller && listScroller.getOffset() <= 0) {
            outerScrollerRef.current?.scrollTo({y: 0, animated: true});
            return;
        }

        // Only upward finger movement is forwarded. Moving back down scrolls the outer scroller up natively, which
        // brings the header back and ends the forwarding in onOuterScroll.
        if (!isForwardingTouchRef.current || !listScroller || distance <= 0) {
            return;
        }
        forwardedListOffsetRef.current += distance;
        listScroller.scrollTo(forwardedListOffsetRef.current);
        forwardedScrollSampleRef.current = sampleScroll(forwardedScrollSampleRef.current, forwardedListOffsetRef.current);
    };

    const onOuterTouchEnd = () => {
        isTouchingRef.current = false;
        if (!isForwardingTouchRef.current) {
            return;
        }
        isForwardingTouchRef.current = false;
        // Released mid-drag: carry the drag's own speed on, as native scrolling would after lifting the finger.
        carryIntoList(forwardedScrollSampleRef.current?.velocity ?? 0);
    };

    return (
        <ScrollView
            ref={outerScrollerRef}
            // No rubber-banding at the header's end, which would fight the rows being driven past it.
            style={[styles.flex1, styles.overscrollBehaviorNone]}
            onTouchStart={onOuterTouchStart}
            onTouchMove={onOuterTouchMove}
            onTouchEnd={onOuterTouchEnd}
            onTouchCancel={onOuterTouchEnd}
            // Measured only when enabled. When disabled the list area fills the scroller by flex, as a plain View would.
            onLayout={isEnabled ? onOuterScrollerLayout : undefined}
            contentContainerStyle={isEnabled ? undefined : styles.flexGrow1}
            onScroll={onOuterScroll}
            scrollEventThrottle={CONST.TIMING.MIN_SMOOTH_SCROLL_EVENT_THROTTLE}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
        >
            {isEnabled && (
                <View
                    style={styles.appBG}
                    onLayout={onHeaderLayout}
                >
                    {header}
                </View>
            )}
            <SearchListScrollRegistrationContext.Provider value={registerListScroller}>
                {/* Undefined when disabled: the inner scrollers then behave as if there were no outer scroller at all. */}
                <SearchListScrollLockContext.Provider value={isEnabled ? !isHeaderHidden : undefined}>
                    <View style={isEnabled ? StyleUtils.getHeight(outerScrollerHeight) : styles.flex1}>{children}</View>
                </SearchListScrollLockContext.Provider>
            </SearchListScrollRegistrationContext.Provider>
        </ScrollView>
    );
}

export default ScrollAwayHeaderContainer;
