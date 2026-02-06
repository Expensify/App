import React from 'react';
import {View} from 'react-native';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import Icon from '@components/Icon';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import type {SortOrder} from '@components/Search/types';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';

type SearchTableHeaderColumnProps = {
    text: string;
    icon?: IconAsset;
    isActive: boolean;
    sortOrder: SortOrder;
    isSortable?: boolean;
    containerStyle?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    onPress: (order: SortOrder) => void;
};

export default function SortableHeaderText({text, icon, sortOrder, isActive, textStyle, containerStyle, isSortable = true, onPress}: SearchTableHeaderColumnProps) {
    const icons = useMemoizedLazyExpensifyIcons(['ArrowDownLong', 'ArrowUpLong']);
    const styles = useThemeStyles();
    const theme = useTheme();

    if (!isSortable) {
        return (
            <View style={containerStyle}>
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1]}>
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
            </View>
        );
    }

    const sortArrowIcon = sortOrder === CONST.SEARCH.SORT_ORDER.ASC ? icons.ArrowUpLong : icons.ArrowDownLong;
    const displayIcon = isActive;
    const activeColumnStyle = isSortable && isActive && styles.searchTableHeaderActive;

    const nextSortOrder = isActive && sortOrder === CONST.SEARCH.SORT_ORDER.DESC ? CONST.SEARCH.SORT_ORDER.ASC : CONST.SEARCH.SORT_ORDER.DESC;

    return (
        <View style={containerStyle}>
            <PressableWithFeedback
                onPress={() => onPress(nextSortOrder)}
                role={CONST.ROLE.BUTTON}
                accessibilityLabel={CONST.ROLE.BUTTON}
                accessible
                disabled={!isSortable}
            >
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1]}>
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
            </PressableWithFeedback>
        </View>
    );
}
