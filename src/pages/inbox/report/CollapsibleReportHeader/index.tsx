import CollapsibleHeaderView from '@components/CollapsibleHeaderOnKeyboard/CollapsibleHeaderView';
import useCollapsibleHeader, {collapseHeaderTo, restoreHeaderTo} from '@components/CollapsibleHeaderOnKeyboard/useCollapsibleHeader';

import useThemeStyles from '@hooks/useThemeStyles';

import {isMobilePhoneWeb} from '@libs/isInLandscapeMode';

import {useActionListContext} from '@pages/inbox/ActionListContext';

import KeyboardUtils from '@src/utils/keyboard';

import type {ViewStyle} from 'react-native';

import React, {useEffect, useState} from 'react';
import {useAnimatedReaction, useAnimatedStyle, useDerivedValue, useSharedValue} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';

import type {CollapsibleReportHeaderProps} from './types';

/**
 * Hides the report header on mobile web landscape while scrolling toward the newest message or while the keyboard is
 * open, and shows it again on scroll toward older messages.
 *
 * The slot steps its height in one frame instead of animating it, because resizing a scroller every frame during iOS
 * momentum scrolling speeds the scroll up. The header slides over the list instead.
 */
function MobileWebCollapsibleReportHeader({children}: CollapsibleReportHeaderProps) {
    const styles = useThemeStyles();
    const collapsibleHeader = useCollapsibleHeader({shouldMeasureWhileCollapsed: true});
    const {naturalHeight, animatedHeight, isFocusedSV, isInLandscapeModeSV} = collapsibleHeader;
    const {scrollMetricsSV, collapsedHeaderHeightSV} = useActionListContext();

    const isKeyboardOpen = useSharedValue(KeyboardUtils.isKeyboardVisible());
    useEffect(() => KeyboardUtils.subscribeKeyboardVisibilityChange((isVisible) => isKeyboardOpen.set(isVisible)), [isKeyboardOpen]);

    // Mirrors the hide state for `inert`, which keeps the offscreen header's buttons out of the tab order and screen readers.
    const [isHidden, setIsHidden] = useState(false);

    const anchorOffset = useSharedValue(0);
    const isHiddenByScroll = useSharedValue(false);

    // Start over when leaving the screen or landscape.
    useAnimatedReaction(
        () => isFocusedSV.get() && isInLandscapeModeSV.get(),
        () => {
            isHiddenByScroll.set(false);
            anchorOffset.set(scrollMetricsSV.get().offset);
        },
    );

    useAnimatedReaction(
        () => scrollMetricsSV.get(),
        ({offset, distanceToOldestEnd, distanceToNewestEnd, viewportHeight}, previous) => {
            if (previous === null || !isInLandscapeModeSV.get()) {
                return;
            }

            // Always show the header at the oldest end so it covers the spacer. < 1 for iOS Safari's fractional scrollTop.
            if (distanceToOldestEnd < 1) {
                anchorOffset.set(offset);
                isHiddenByScroll.set(false);
                return;
            }

            // Ignore overscroll past the newest end, its bounce back would read as a scroll the other way.
            if (distanceToNewestEnd < 0) {
                return;
            }

            // Resizes (header, keyboard) only re-anchor.
            if (viewportHeight !== previous.viewportHeight) {
                anchorOffset.set(offset);
                return;
            }

            // Ignore moves by less than the header's height.
            const headerHeight = naturalHeight.get();
            const delta = offset - anchorOffset.get();
            if (headerHeight <= 0 || Math.abs(delta) <= headerHeight) {
                return;
            }

            anchorOffset.set(offset);

            // offset grows toward the oldest message, so a shrinking one means scrolling down.
            isHiddenByScroll.set(delta < 0);
        },
    );

    const shouldHide = useDerivedValue(() => isFocusedSV.get() && isInLandscapeModeSV.get() && (isHiddenByScroll.get() || isKeyboardOpen.get()));

    useAnimatedReaction(
        // Wait for the header's first measurement.
        () => (naturalHeight.get() === -1 ? null : {hide: shouldHide.get(), height: naturalHeight.get()}),
        (current, previous) => {
            if (current === null) {
                return;
            }

            if (current.hide) {
                if (previous?.hide !== true) {
                    collapseHeaderTo(animatedHeight, 0);
                    scheduleOnRN(setIsHidden, true);
                }
                return;
            }

            // The header can change size while hidden, then a restore already running would stop at the old height.
            const hasResizedDuringRestore = current.height !== previous?.height && animatedHeight.get() < current.height;
            if (previous?.hide !== false || hasResizedDuringRestore) {
                restoreHeaderTo(animatedHeight, current.height);
            }
            if (previous?.hide === true) {
                scheduleOnRN(setIsHidden, false);
            }
        },
    );

    // Space is handed to the list as soon as a collapse starts and taken back once a restore has fully slid in.
    useAnimatedReaction(
        () => (isInLandscapeModeSV.get() && naturalHeight.get() > 0 && (shouldHide.get() || animatedHeight.get() < naturalHeight.get()) ? naturalHeight.get() : 0),
        (handedOverHeight) => collapsedHeaderHeightSV.set(handedOverHeight),
    );

    const slotStyle = useAnimatedStyle<ViewStyle>(() => ({height: collapsedHeaderHeightSV.get() > 0 ? 0 : 'auto', zIndex: 1}));

    return (
        <CollapsibleHeaderView collapsibleHeader={{...collapsibleHeader, outerStyle: slotStyle, innerStyle: [styles.appBG, collapsibleHeader.innerStyle]}}>
            {/* aria-hidden does not remove the mounted controls from the tab order. */}
            <div
                inert={isHidden}
                style={styles.dContents}
            >
                {children}
            </div>
        </CollapsibleHeaderView>
    );
}

/** `isMobilePhoneWeb` is fixed at load, so the header is never remounted. */
function CollapsibleReportHeader({children}: CollapsibleReportHeaderProps) {
    if (!isMobilePhoneWeb) {
        return children;
    }

    return <MobileWebCollapsibleReportHeader>{children}</MobileWebCollapsibleReportHeader>;
}

export default CollapsibleReportHeader;
