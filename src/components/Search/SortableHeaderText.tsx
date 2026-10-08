import Icon from '@components/Icon';
import PressableWithSecondaryInteraction from '@components/PressableWithSecondaryInteraction';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';
import type WithSentryLabel from '@src/types/utils/SentryLabel';

import type {StyleProp, TextStyle, ViewStyle} from 'react-native';

import React, {useRef} from 'react';
import {StyleSheet, View} from 'react-native';

import type {SortOrder} from './types';

type SearchTableHeaderColumnProps = WithSentryLabel & {
    text: string;
    icon?: IconAsset;
    isActive: boolean;
    sortOrder: SortOrder;
    isSortable?: boolean;
    containerStyle?: StyleProp<ViewStyle>;

    /** Styles for the inner content row. Put padding/borders here, not on the container, so flex columns stay aligned. */
    innerContainerStyle?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    onPress: (order: SortOrder) => void;

    /** Data attributes for the container, such as the marker the frozen edge overlay is measured from. */
    dataSet?: Record<string, boolean>;

    /**
     * Opens the column's menu, given where the header cell sits in the window. When set, both a press and a right-click
     * or long press open the menu instead of sorting.
     */
    onMenuPress?: (cellFrame: HeaderCellFrame) => void;
};

/** Where a header cell sits in the window, which its menu is anchored to. */
type HeaderCellFrame = {
    x: number;
    y: number;
    width: number;
    height: number;
};

export default function SortableHeaderText({
    text,
    icon,
    sortOrder,
    isActive,
    textStyle,
    containerStyle,
    innerContainerStyle,
    isSortable = true,
    onPress,
    onMenuPress,
    sentryLabel,
    dataSet,
}: SearchTableHeaderColumnProps) {
    const containerRef = useRef<View>(null);
    const icons = useMemoizedLazyExpensifyIcons(['ArrowDownLong', 'ArrowUpLong']);
    const styles = useThemeStyles();
    const theme = useTheme();
    // The pressable stretches across the cell, so it carries the cell's own alignment to keep the content in place.
    const pressableStyle = [styles.searchTableHeaderPressable, {alignItems: StyleSheet.flatten(containerStyle)?.alignItems}];
    const openMenu = () => {
        containerRef.current?.measureInWindow((x, y, width, height) => onMenuPress?.({x, y, width, height}));
    };

    if (!isSortable) {
        const content = (
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1, innerContainerStyle]}>
                {!!icon && (
                    <Icon
                        src={icon}
                        fill={theme.icon}
                        height={16}
                        width={16}
                    />
                )}
                {!!text && (
                    <Text
                        numberOfLines={1}
                        style={[styles.textMicroSupporting, textStyle]}
                    >
                        {text}
                    </Text>
                )}
            </View>
        );

        return (
            <View
                ref={containerRef}
                style={containerStyle}
                dataSet={dataSet}
            >
                {onMenuPress ? (
                    <PressableWithSecondaryInteraction
                        onPress={openMenu}
                        onSecondaryInteraction={openMenu}
                        wrapperStyle={styles.searchTableHeaderPressableWrapper}
                        style={pressableStyle}
                        role={CONST.ROLE.BUTTON}
                        accessibilityLabel={text}
                        accessible
                        sentryLabel={sentryLabel}
                    >
                        {content}
                    </PressableWithSecondaryInteraction>
                ) : (
                    content
                )}
            </View>
        );
    }

    const sortArrowIcon = sortOrder === CONST.SEARCH.SORT_ORDER.ASC ? icons.ArrowUpLong : icons.ArrowDownLong;
    const displayIcon = isActive;
    const activeColumnStyle = isSortable && isActive && styles.searchTableHeaderActive;

    const nextSortOrder = isActive && sortOrder === CONST.SEARCH.SORT_ORDER.DESC ? CONST.SEARCH.SORT_ORDER.ASC : CONST.SEARCH.SORT_ORDER.DESC;

    return (
        <View
            ref={containerRef}
            style={containerStyle}
            dataSet={dataSet}
        >
            <PressableWithSecondaryInteraction
                onPress={onMenuPress ? openMenu : () => onPress(nextSortOrder)}
                onSecondaryInteraction={onMenuPress ? openMenu : undefined}
                wrapperStyle={styles.searchTableHeaderPressableWrapper}
                style={pressableStyle}
                role={CONST.ROLE.BUTTON}
                accessibilityLabel={CONST.ROLE.BUTTON}
                accessible
                disabled={!isSortable}
                sentryLabel={sentryLabel}
            >
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1, innerContainerStyle]}>
                    {!!icon && (
                        <Icon
                            src={icon}
                            fill={theme.icon}
                            height={16}
                            width={16}
                        />
                    )}
                    {!!text && (
                        <Text
                            numberOfLines={1}
                            style={[styles.textMicroSupporting, activeColumnStyle, textStyle]}
                        >
                            {text}
                        </Text>
                    )}
                    {displayIcon && (
                        <Icon
                            src={sortArrowIcon}
                            fill={theme.icon}
                            height={12}
                            width={12}
                        />
                    )}
                </View>
            </PressableWithSecondaryInteraction>
        </View>
    );
}

export type {HeaderCellFrame};
