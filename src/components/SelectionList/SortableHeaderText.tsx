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
    shouldShow?: boolean;
    isSortable?: boolean;
    containerStyle?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    onPress: (order: SortOrder) => void;
};

export default function SortableHeaderText({text, sortOrder, isActive, textStyle, containerStyle, shouldShow = true, isSortable = true, onPress}: SearchTableHeaderColumnProps) {
    const styles = useThemeStyles();
    const theme = useTheme();

    if (!shouldShow) {
        return null;
    }

    const icon = sortOrder === 'asc' ? Expensicons.ArrowUpLong : Expensicons.ArrowDownLong;
    const iconStyles = isActive ? [] : [styles.visibilityHidden];

    const nextSortOrder = isActive && sortOrder === 'asc' ? 'desc' : 'asc';

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
                        style={[styles.mutedNormalTextLabel, textStyle, isActive && styles.searchTableHeaderActive]}
                    >
                        {text}
                    </Text>
                    <Icon
                        src={icon}
                        fill={theme.icon}
                        additionalStyles={iconStyles}
                        height={12}
                        width={12}
                    />
                </View>
            </PressableWithFeedback>
        </View>
    );
}
