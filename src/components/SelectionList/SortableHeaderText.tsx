import React from 'react';
import {View} from 'react-native';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

type SearchTableHeaderColumnProps = {
    text: string;
    isActive: boolean;
    sortOrder: 'asc' | 'desc';
    shouldShow?: boolean;
    isSortable?: boolean;
    containerStyle?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    onPress: (order: 'asc' | 'desc') => void;
};

export default function SortableHeaderText({text, sortOrder, isActive, textStyle, containerStyle, shouldShow = true, isSortable = true, onPress}: SearchTableHeaderColumnProps) {
    const styles = useThemeStyles();
    const theme = useTheme();

    if (!shouldShow) {
        return null;
    }

    const icon = sortOrder === 'asc' ? Expensicons.UpArrow : Expensicons.DownArrow;
    const iconStyles = isActive ? [] : [styles.visibilityHidden];

    const newSortOrder = isActive && sortOrder === 'asc' ? 'desc' : 'asc';

    return (
        <View style={containerStyle}>
            <PressableWithFeedback
                onPress={() => onPress(newSortOrder)}
                accessibilityLabel={''}
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
                        additionalStyles={iconStyles}
                        src={icon}
                        fill={theme.icon}
                        height={12}
                        width={12}
                    />
                </View>
            </PressableWithFeedback>
        </View>
    );
}
