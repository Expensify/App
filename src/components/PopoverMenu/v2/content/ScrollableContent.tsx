import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {useRootState} from '@components/PopoverMenu/v2/root/RootContext';
import ScrollView from '@components/ScrollView';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useWindowDimensions from '@hooks/useWindowDimensions';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import BaseContent from './BaseContent';
import type {BasePopoverProps} from './BaseContent';

type ScrollableContentProps = BasePopoverProps & {
    /** Ignored in landscape so bottom-docked sheets stay reachable. */
    shouldEnableMaxHeight?: boolean;
    contentContainerStyle?: StyleProp<ViewStyle>;
};

function ScrollableContent({shouldEnableMaxHeight = true, contentContainerStyle, children, ...rest}: ScrollableContentProps): React.ReactElement | null {
    // Result discarded — attributes hierarchy violations to ScrollableContent, not BaseContent.
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
