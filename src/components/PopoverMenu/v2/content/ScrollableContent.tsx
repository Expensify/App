import {useRootVisibility} from '@components/PopoverMenu/v2/root/RootContext';
import ScrollView from '@components/ScrollView';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import Log from '@libs/Log';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';

import type {BasePopoverProps} from './BaseContent';

import BaseContent from './BaseContent';
import useMaxHeightStyle from './useMaxHeightStyle';

type ScrollableContentProps = BasePopoverProps & {
    contentContainerStyle?: StyleProp<ViewStyle>;
};

const VIRTUALIZATION_RECOMMENDED_THRESHOLD = 50;

/** Popover surface for bounded-but-tall menus; wraps children in a `<ScrollView>` capped at window height. */
function ScrollableContent({contentContainerStyle, children, ...rest}: ScrollableContentProps): React.ReactElement | null {
    const styles = useThemeStyles();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth -- popovers float even in RHP on desktop, so true device width drives sizing
    const {isSmallScreenWidth} = useResponsiveLayout();
    useRootVisibility(ScrollableContent.displayName);
    if (__DEV__) {
        const childCount = React.Children.count(children);
        if (childCount > VIRTUALIZATION_RECOMMENDED_THRESHOLD) {
            Log.warn(
                `<PopoverMenu.ScrollableContent> received ${childCount} children — <ScrollableContent> renders all rows synchronously and will jank on lower-end devices for unbounded counts. Consider a virtualized list (FlashList) wrapper.`,
            );
        }
    }
    const {windowHeight} = useWindowDimensions();
    // Cap to window height (with a floor of POPOVER_MENU_MAX_HEIGHT) so the inner scroll has room.
    const maxHeightStyle = useMaxHeightStyle({
        desktopFallback: {maxHeight: Math.max(windowHeight - variables.compactPopoverMenuVerticalMargin, CONST.POPOVER_MENU_MAX_HEIGHT)},
    });

    return (
        <BaseContent
            {...rest}
            componentName={ScrollableContent.displayName}
            maxHeightStyle={maxHeightStyle}
            shouldWrapModalChildrenInScrollViewIfBottomDockedInLandscapeMode={false}
        >
            <ScrollView contentContainerStyle={[isSmallScreenWidth ? styles.pv4 : styles.pv2, contentContainerStyle]}>{children}</ScrollView>
        </BaseContent>
    );
}

ScrollableContent.displayName = 'PopoverMenu.ScrollableContent';

export default ScrollableContent;
export type {ScrollableContentProps};
