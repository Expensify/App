import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {useRootState} from '@components/PopoverMenu/v2/root/RootContext';
import ScrollView from '@components/ScrollView';
import useWindowDimensions from '@hooks/useWindowDimensions';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import BaseContent from './BaseContent';
import type {BasePopoverProps} from './BaseContent';
import useMaxHeightStyle from './useMaxHeightStyle';

type ScrollableContentProps = BasePopoverProps & {
    contentContainerStyle?: StyleProp<ViewStyle>;
};

/** Popover surface that wraps children in a `<ScrollView>` for unbounded row counts. */
function ScrollableContent({contentContainerStyle, children, ...rest}: ScrollableContentProps): React.ReactElement | null {
    // Result discarded — attributes hierarchy violations to ScrollableContent, not BaseContent.
    useRootState(ScrollableContent.displayName);
    const {windowHeight} = useWindowDimensions();
    // Cap to window height (with a floor of POPOVER_MENU_MAX_HEIGHT) so the inner scroll has room.
    const maxHeightStyle = useMaxHeightStyle({
        desktopFallback: {maxHeight: Math.max(windowHeight - variables.compactPopoverMenuVerticalMargin, CONST.POPOVER_MENU_MAX_HEIGHT)},
    });

    return (
        <BaseContent
            // eslint-disable-next-line react/jsx-props-no-spreading -- forwards BasePopoverProps through to BaseContent
            {...rest}
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
