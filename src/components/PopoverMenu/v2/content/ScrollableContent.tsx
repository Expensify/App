import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {useRootVisibility} from '@components/PopoverMenu/v2/root/RootContext';
import ScrollView from '@components/ScrollView';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Log from '@libs/Log';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import BaseContent from './BaseContent';
import type {BasePopoverProps} from './BaseContent';
import useMaxHeightStyle from './useMaxHeightStyle';

type ScrollableContentProps = BasePopoverProps & {
    contentContainerStyle?: StyleProp<ViewStyle>;
};

const VIRTUALIZATION_RECOMMENDED_THRESHOLD = 50;

/** Popover surface for bounded-but-tall menus; wraps children in a `<ScrollView>` capped at window height. */
function ScrollableContent({contentContainerStyle, children, ...rest}: ScrollableContentProps): React.ReactElement | null {
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
            // eslint-disable-next-line react/jsx-props-no-spreading -- forwarding the variant's caller props
            {...rest}
            componentName={ScrollableContent.displayName}
            maxHeightStyle={maxHeightStyle}
            shouldWrapModalChildrenInScrollViewIfBottomDockedInLandscapeMode={false}
        >
            <ScrollView contentContainerStyle={contentContainerStyle}>{children}</ScrollView>
        </BaseContent>
    );
}

ScrollableContent.displayName = 'PopoverMenu.ScrollableContent';

export default ScrollableContent;
export type {ScrollableContentProps};
