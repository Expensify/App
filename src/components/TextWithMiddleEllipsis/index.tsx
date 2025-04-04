import React from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import {View} from 'react-native';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';

type TextWithMiddleEllipsisProps = {
    /** The text to display */
    text: string;

    /** Additional styles */
    style?: StyleProp<ViewStyle>;

    /** Additional text styles */
    textStyle?: StyleProp<TextStyle>;
};

function TextWithMiddleEllipsis({
    text, 
    style, 
    textStyle,
}: TextWithMiddleEllipsisProps) {
    const styles = useThemeStyles();

    const firstPart = text.substring(0, Math.ceil(text.length / 2));
    const secondPart = text.substring(Math.ceil(text.length / 2));
    
    return (
        <View
            style={[
                style,
                styles.flexShrink1, 
                {
                    width: '100%',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    flexDirection: 'row',
                }
            ]}
        >
            <Text 
                style={[
                    textStyle, 
                    {
                        overflow: 'hidden',
                        textOverflow: 'clip',
                        whiteSpace: 'nowrap',
                    }
                ]} 
                numberOfLines={1}
            >
                {firstPart}
            </Text>
            <Text 
                style={[
                    textStyle, 
                    {
                        overflow: 'hidden',
                        direction: 'rtl',
                        textOverflow: 'ellipsis',
                    }
                ]} 
                numberOfLines={1}
            >
                {secondPart}
            </Text>
        </View>
    );
}

export default TextWithMiddleEllipsis;
