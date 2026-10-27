import CollapsibleHeaderView from '@components/CollapsibleHeaderOnKeyboard/CollapsibleHeaderView';
import useCollapsibleHeader, {collapseHeaderTo, restoreHeaderTo} from '@components/CollapsibleHeaderOnKeyboard/useCollapsibleHeader';

import useThemeStyles from '@hooks/useThemeStyles';

import {isMobilePhoneWeb} from '@libs/isInLandscapeMode';

import {useActionListContext} from '@pages/inbox/ActionListContext';

import KeyboardUtils from '@src/utils/keyboard';

import type {ViewStyle} from 'react-native';

import React, {useEffect} from 'react';
import {useAnimatedReaction, useAnimatedStyle, useDerivedValue, useSharedValue} from 'react-native-reanimated';

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
    const collapsibleHeader = useCollapsibleHeader();
    const {naturalHeight, animatedHeight, isFocusedSV, isInLandscapeModeSV} = collapsibleHeader;
    const {scrollMetricsSV, collapsedHeaderHeightSV} = useActionListContext();

    const isKeyboardOpen = useSharedValue(false);
    useEffect(() => KeyboardUtils.subscribeKeyboardVisibilityChange((isVisible) => isKeyboardOpen.set(isVisible)), [isKeyboardOpen]);

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

            // Ignore overscroll past either end, its bounce back would read as a scroll the other way.
            if (distanceToNewestEnd < 0 || distanceToOldestEnd < 0) {
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
        () => (naturalHeight.get() === -1 ? null : shouldHide.get()),
        (hide, previousHide) => {
            if (hide === null || hide === previousHide) {
                return;
            }

            if (hide) {
                collapseHeaderTo(animatedHeight, 0);
            } else {
                restoreHeaderTo(animatedHeight, naturalHeight.get());
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
        <CollapsibleHeaderView collapsibleHeader={{...collapsibleHeader, outerStyle: slotStyle, innerStyle: [styles.appBG, collapsibleHeader.innerStyle]}}>{children}</CollapsibleHeaderView>
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
