import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import ScrollView from '@components/ScrollView';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useWindowDimensions from '@hooks/useWindowDimensions';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import BaseContent from './BaseContent';
import type {BasePopoverProps} from './BaseContent';
import {useRootState} from './RootContext';

/**
 * Renders the popover-menu surface anchored to the current anchor, with its children wrapped
 * in a `<ScrollView>`. Use this variant when the menu can be tall enough to need an inner
 * scroll region — space-bar scrolling is left intact and the modal won't double-wrap us in
 * landscape.
 */
type ScrollableContentProps = BasePopoverProps & {
    /** Cap popover height. Ignored in landscape so content stays reachable. */
    shouldEnableMaxHeight?: boolean;
    /** Forwarded to the inner `<ScrollView>`'s `contentContainerStyle`. */
    contentContainerStyle?: StyleProp<ViewStyle>;
};

function ScrollableContent({shouldEnableMaxHeight = true, contentContainerStyle, children, ...rest}: ScrollableContentProps): React.ReactElement | null {
    // Result discarded — call exists purely to attribute "outside <Root>" errors to ScrollableContent
    // instead of the internal BaseContent that runs further down the render.
    useRootState(ScrollableContent.displayName);
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth -- popovers float even in RHP on desktop, so true device width drives sizing
    const {isSmallScreenWidth, isInLandscapeMode} = useResponsiveLayout();
    const {windowHeight} = useWindowDimensions();
    const maxHeightStyle = computeMaxHeightStyle({shouldEnableMaxHeight, isSmallScreenWidth, isInLandscapeMode, windowHeight});

    return (
        <BaseContent
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
            maxHeightStyle={maxHeightStyle}
            shouldWrapModalChildrenInScrollViewIfBottomDockedInLandscapeMode={false}
        >
            <ScrollView contentContainerStyle={contentContainerStyle}>{children}</ScrollView>
        </BaseContent>
    );
}

/**
 * Scrollable content fills the viewport (capped at `POPOVER_MENU_MAX_HEIGHT`) so the inner
 * `<ScrollView>` has room to actually scroll. Landscape opts out so bottom-docked sheets
 * stay reachable.
 */
function computeMaxHeightStyle({
    shouldEnableMaxHeight,
    isSmallScreenWidth,
    isInLandscapeMode,
    windowHeight,
}: {
    shouldEnableMaxHeight: boolean;
    isSmallScreenWidth: boolean;
    isInLandscapeMode: boolean;
    windowHeight: number;
}): ViewStyle | undefined {
    if (!shouldEnableMaxHeight || isInLandscapeMode) {
        return undefined;
    }
    if (isSmallScreenWidth) {
        return {maxHeight: CONST.POPOVER_MENU_MAX_HEIGHT_MOBILE};
    }
    return {maxHeight: Math.max(windowHeight - variables.compactPopoverMenuVerticalMargin, CONST.POPOVER_MENU_MAX_HEIGHT)};
}

ScrollableContent.displayName = 'PopoverMenu.ScrollableContent';

export default ScrollableContent;
export type {ScrollableContentProps};
