import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useIsSoftKeyboardOpen from '@hooks/useIsSoftKeyboardOpen';

import {isMobilePhoneWeb} from '@libs/isInLandscapeMode';

import {useActionListContext} from '@pages/inbox/ActionListContext';

import type {LayoutChangeEvent} from 'react-native';

import React, {useEffect, useRef} from 'react';
import Reanimated, {Easing, useAnimatedReaction, useAnimatedStyle, useDerivedValue, useSharedValue, withTiming} from 'react-native-reanimated';

import type {CollapsibleHeaderOnScrollProps} from './types';

import FloatingBackButton from './FloatingBackButton';

const HIDE_DURATION = 150;
const SHOW_DURATION = 200;

/** Scroll jitter below this many pixels is ignored, so a stray frame can't flip the header on its own. */
const DIRECTION_CHANGE_THRESHOLD = 12;

/**
 * How near the oldest message the header stops being hidden by scrolling. The list is inverted, so that end is the
 * visual top, and reaching it makes the offset shrink without a downward gesture behind it: the list bounces off the
 * end and settles back, and loading older messages nudges the offset as the content grows. Either one reads exactly
 * like scrolling down and hides the header the user just scrolled all the way up to reach. Wide enough to cover a
 * settle, and still far narrower than a deliberate swipe, which moves several hundred pixels.
 */
const TOO_CLOSE_TO_TOP_DISTANCE = 100;

/**
 * Collapsing the header resizes the list, which then reports a scroll offset of its own — read as a gesture, that
 * offset flips the header straight back and the two fight each other. Scroll is therefore distrusted for the length of
 * the animation plus this much, giving the list a few frames to finish re-laying out.
 */
const SETTLE_DURATION = 120;

/** Same idea for the keyboard, which resizes the viewport over a longer, browser-controlled animation. */
const KEYBOARD_SETTLE_DURATION = 400;

/**
 * A single scroll event can't move the list further than this by hand. Anything larger is programmatic — pagination
 * prepending older messages and correcting the offset, a scrollToIndex, the viewport resizing — and carries no
 * direction the user intended.
 */
const PROGRAMMATIC_JUMP_THRESHOLD = 400;

/**
 * Wraps the report header and scrolls it away with the report actions when there is no room for it. Vertical space is
 * scarce on mobile web in landscape, where the header plus the compose row leave only a handful of messages visible.
 *
 * Scrolling down hides the header and scrolling up brings it back. The report actions list is inverted, so its scroll
 * offset grows as the user moves up into the history: the header is out of the way while reading and typing at the
 * newest messages, and comes back — along with its back button — as soon as the user scrolls up. It also collapses
 * while the soft keyboard is open, since the composer takes the space the keyboard leaves.
 *
 * A floating back button fades in as the header collapses so that leaving the report is always one tap away, even with the
 * header's own back button scrolled off screen.
 *
 * Uses the height animation (rather than translateY over the content) so the freed space is actually reclaimed by the
 * list below, matching CollapsibleHeaderOnKeyboard — which is a no-op on web, so the two never animate the same node.
 *
 * Only a phone browser can ever be in landscape here, so this is only mounted there — see CollapsibleHeaderOnScroll
 * below. On a phone it stays mounted in portrait too: swapping it in on rotation would remount the header.
 */
function MobileWebCollapsibleHeaderOnScroll({children}: CollapsibleHeaderOnScrollProps) {
    // `isInLandscapeMode` is already false on desktop browsers and tablets (see @libs/isInLandscapeMode), so this is
    // effectively "mobile web phone, in landscape".
    const isInLandscapeMode = useIsInLandscapeMode();
    const isSoftKeyboardOpen = useIsSoftKeyboardOpen(isInLandscapeMode);
    const {scrollOffsetSV, maxScrollOffsetSV} = useActionListContext();

    // JS ref guards against re-measuring when the inner view reports a height of 0.
    const naturalHeightRef = useRef(-1);
    // Worklet-accessible mirror of naturalHeightRef. -1 signals "not yet measured".
    const naturalHeight = useSharedValue(-1);
    // Drives the animated style.
    const animatedHeight = useSharedValue(0);
    // The offset the current hide/show decision is measured against, re-anchored on every direction change.
    const anchorOffset = useSharedValue(0);
    const isHiddenByScroll = useSharedValue(false);
    // Timestamp until which the list's reported offset is a consequence of our own resizing rather than a gesture.
    const settleUntil = useSharedValue(0);

    // Worklet-readable mirrors of the two gates. Stable shared values, excluded from the effects' deps.
    const isEnabled = useSharedValue(isInLandscapeMode);
    const isKeyboardOpen = useSharedValue(isSoftKeyboardOpen);
    useEffect(() => {
        isEnabled.set(isInLandscapeMode);

        // Re-anchor so the first scroll after rotating isn't measured against a stale offset.
        if (isInLandscapeMode) {
            anchorOffset.set(scrollOffsetSV.get());
        }
    }, [anchorOffset, isEnabled, isInLandscapeMode, scrollOffsetSV]);
    useEffect(() => {
        isKeyboardOpen.set(isSoftKeyboardOpen);
        // The keyboard resizes the viewport, so the offset moves without the user having scrolled.
        settleUntil.set(Date.now() + KEYBOARD_SETTLE_DURATION);
    }, [isKeyboardOpen, isSoftKeyboardOpen, settleUntil]);

    // Closing the keyboard restores the header only if the user hadn't already scrolled it away.
    const shouldHide = useDerivedValue(() => isEnabled.get() && (isHiddenByScroll.get() || isKeyboardOpen.get()));

    const onLayout = (e: LayoutChangeEvent) => {
        // The inner view is unconstrained (only the outer one clips), so its layout is always the natural height.
        const height = e.nativeEvent.layout.height;

        if (height <= 0 || height === naturalHeightRef.current) {
            return;
        }

        naturalHeightRef.current = height;
        naturalHeight.set(height);
        // Also catches up on a collapse decision taken before the header had ever been measured.
        animatedHeight.set(shouldHide.get() ? 0 : height);
    };

    useAnimatedReaction(
        () => scrollOffsetSV.get(),
        (offset, previousOffset) => {
            // previousOffset is null on the reaction's initial run, which carries no direction to act on.
            if (previousOffset === null || !isEnabled.get()) {
                return;
            }

            // Scrolling past the newest message rubber-bands back, reversing direction without the user asking.
            if (offset < 0) {
                return;
            }

            // Offsets that are our own doing, or a programmatic jump, only re-anchor: the next real gesture is then
            // measured from where the list actually ended up.
            if (Date.now() < settleUntil.get() || Math.abs(offset - previousOffset) > PROGRAMMATIC_JUMP_THRESHOLD) {
                anchorOffset.set(offset);
                return;
            }

            const delta = offset - anchorOffset.get();
            if (Math.abs(delta) <= DIRECTION_CHANGE_THRESHOLD) {
                return;
            }

            // Re-anchor on the turning point so the next reversal is measured from here.
            anchorOffset.set(offset);

            // The list is inverted, so a shrinking offset means scrolling down, back toward the newest message.
            const isScrollingDown = delta < 0;

            // Only hiding is suppressed near the oldest message: bringing the header back there is always what the
            // user wants, and the guard must not strand it off screen.
            if (isScrollingDown && offset >= maxScrollOffsetSV.get() - TOO_CLOSE_TO_TOP_DISTANCE) {
                return;
            }

            isHiddenByScroll.set(isScrollingDown);
        },
    );

    useAnimatedReaction(
        () => shouldHide.get(),
        (hide, previousHide) => {
            if (hide === previousHide || naturalHeight.get() === -1) {
                return;
            }

            const duration = hide ? HIDE_DURATION : SHOW_DURATION;
            // Stop trusting the list's offset until it has settled at its new size.
            settleUntil.set(Date.now() + duration + SETTLE_DURATION);

            if (hide) {
                animatedHeight.set(withTiming(0, {duration, easing: Easing.out(Easing.cubic)}));
                return;
            }

            animatedHeight.set(withTiming(naturalHeight.get(), {duration, easing: Easing.out(Easing.cubic)}));
        },
    );

    // Outer wrapper owns the layout space and clips the header as it collapses. While the header is fully open its
    // height is left to the layout engine, so content changes and orientation changes aren't fought over.
    const outerStyle = useAnimatedStyle(() => {
        if (animatedHeight.get() >= naturalHeight.get()) {
            return {height: 'auto', overflow: 'hidden'};
        }

        return {height: animatedHeight.get(), overflow: 'hidden'};
    });

    /**
     * 0 while the header is fully open, 1 once it has fully collapsed. Derived from the header's own height so the
     * floating back button fades on exactly the animation that moves the header, with no timing of its own to drift.
     */
    const collapseProgress = useDerivedValue(() => {
        const height = naturalHeight.get();
        if (height <= 0) {
            return 0;
        }

        return Math.min(Math.max(1 - animatedHeight.get() / height, 0), 1);
    });

    // Inner wrapper slides the header up as the outer one shrinks, so it scrolls out of view instead of being cropped.
    const innerStyle = useAnimatedStyle(() => {
        if (animatedHeight.get() >= naturalHeight.get()) {
            return {transform: [{translateY: 0}]};
        }

        return {transform: [{translateY: animatedHeight.get() - naturalHeight.get()}]};
    });

    return (
        <>
            <Reanimated.View style={outerStyle}>
                <Reanimated.View
                    onLayout={onLayout}
                    style={innerStyle}
                >
                    {children}
                </Reanimated.View>
            </Reanimated.View>
            {/* The wrappers above stay mounted in portrait too (see the component comment); the button is the part that
                can be skipped, so it is mounted only where the header can actually collapse. */}
            {isInLandscapeMode && <FloatingBackButton collapseProgress={collapseProgress} />}
        </>
    );
}

/**
 * Desktop and tablet browsers can never rotate into mobile web landscape, so they render the header exactly as native
 * does, with no animated wrappers and no per-scroll reaction. `isMobilePhoneWeb` is fixed at load, so the tree shape
 * never changes at runtime and the header is never remounted.
 */
function CollapsibleHeaderOnScroll({children}: CollapsibleHeaderOnScrollProps) {
    if (!isMobilePhoneWeb) {
        return children;
    }

    return <MobileWebCollapsibleHeaderOnScroll>{children}</MobileWebCollapsibleHeaderOnScroll>;
}

export default CollapsibleHeaderOnScroll;
