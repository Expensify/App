import {FlashList} from '@shopify/flash-list';
import type {ListRenderItem} from '@shopify/flash-list';
import React from 'react';
import type {ReactElement} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {useAssertInsideRoot} from '@components/PopoverMenu/v2/root/RootContext';
import useWindowDimensions from '@hooks/useWindowDimensions';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import BaseContent from './BaseContent';
import type {BasePopoverProps} from './BaseContent';
import useMaxHeightStyle from './useMaxHeightStyle';

type VirtualizedContentProps<T> = Omit<BasePopoverProps, 'children'> & {
    data: T[];

    keyExtractor: (item: T, index: number) => string;

    /** Single `<Item>` or `<CheckmarkItem>` per row — `<Sub>` would cascade-pop nav when its host item recycles. Arrow-key nav is limited to visible rows. */
    renderItem: ListRenderItem<T>;

    contentContainerStyle?: StyleProp<ViewStyle>;
};

/** Popover surface backed by FlashList. Use when the row count is genuinely unbounded (hundreds+). */
function VirtualizedContent<T>({data, keyExtractor, renderItem, contentContainerStyle, ...rest}: VirtualizedContentProps<T>): ReactElement | null {
    useAssertInsideRoot(VirtualizedContent.displayName);
    const {windowHeight} = useWindowDimensions();
    // Cap to window height (with a floor of POPOVER_MENU_MAX_HEIGHT) so FlashList has a bounded box to virtualize within.
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
            <FlashList
                data={data}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                contentContainerStyle={contentContainerStyle}
            />
        </BaseContent>
    );
}

VirtualizedContent.displayName = 'PopoverMenu.VirtualizedContent';

export default VirtualizedContent;
export type {VirtualizedContentProps};
