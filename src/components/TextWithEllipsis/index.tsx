import React from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import {View} from 'react-native';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';

type TextWithEllipsisProps = {
    /** Leading text before the ellipsis */
    leadingText: string;

    /** Text after the ellipsis */
    trailingText: string;

    /** Styles for leading and trailing text */
    textStyle?: StyleProp<TextStyle>;

    /** Styles for leading text View */
    leadingTextParentStyle?: StyleProp<ViewStyle>;

    /** Styles for parent View */
    wrapperStyle?: StyleProp<ViewStyle>;
};

function TextWithEllipsis({leadingText, trailingText, textStyle, leadingTextParentStyle, wrapperStyle}: TextWithEllipsisProps) {
    const styles = useThemeStyles();
    return (
        <View style={[styles.flexRow, wrapperStyle]}>
            <View style={[styles.flexShrink1, leadingTextParentStyle]}>
                <Text
                    style={textStyle}
                    numberOfLines={1}
                >
                    {leadingText}
                </Text>
            </View>
            <View style={styles.flexShrink0}>
                <Text style={textStyle}>{trailingText}</Text>
            </View>
        </View>
    );
}

export default TextWithEllipsis;
