import React from 'react';
import {View} from 'react-native';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {SortOrder} from '@libs/SearchUtils';
import CONST from '@src/CONST';

type SearchTableHeaderColumnProps = {
    text: string;
    isActive: boolean;
    sortOrder: SortOrder;
    isSortable?: boolean;
    containerStyle?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    onPress: (order: SortOrder) => void;
};

export default function SortableHeaderText({text, sortOrder, isActive, textStyle, containerStyle, isSortable = true, onPress}: SearchTableHeaderColumnProps) {
    const styles = useThemeStyles();
    const theme = useTheme();

    if (!isSortable) {
        return (
            <View style={containerStyle}>
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1]}>
                    <Text
                        numberOfLines={1}
                        style={[styles.textMicroSupporting, textStyle]}
                    >
                        {text}
                    </Text>
                </View>
            </View>
        );
    }

    const icon = sortOrder === CONST.SORT_ORDER.ASC ? Expensicons.ArrowUpLong : Expensicons.ArrowDownLong;
    const displayIcon = isActive;
    const activeColumnStyle = isSortable && isActive && styles.searchTableHeaderActive;

    const nextSortOrder = isActive && sortOrder === CONST.SORT_ORDER.DESC ? CONST.SORT_ORDER.ASC : CONST.SORT_ORDER.DESC;

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
                    <Text
                        numberOfLines={1}
                        style={[styles.textMicroSupporting, activeColumnStyle, textStyle]}
                    >
                        {text}
                    </Text>
                    {displayIcon && (
                        <Icon
                            src={icon}
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
