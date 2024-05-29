import React from 'react';
import {View} from 'react-native';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';

type SearchTableHeaderColumnProps = {
    shouldShow?: boolean;
    containerStyle?: StyleProp<ViewStyle>;
    text: string;
    textStyle?: StyleProp<TextStyle>;
};

export default function SearchTableHeaderColumn({containerStyle, text, textStyle, shouldShow = true}: SearchTableHeaderColumnProps) {
    const styles = useThemeStyles();

    if (!shouldShow) {
        return null;
    }

    return (
        <View style={containerStyle}>
            <Text
                numberOfLines={1}
                style={[styles.textMicroSupporting, textStyle]}
            >
                {text}
            </Text>
        </View>
    );
}
