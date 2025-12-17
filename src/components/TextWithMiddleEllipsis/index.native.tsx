import React from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import Text from '@components/Text';

type TextWithMiddleEllipsisProps = {
    /** The text to display */
    text: string;

    /** Additional styles */
    style?: StyleProp<TextStyle>;

    /** Additional text styles */
    textStyle?: StyleProp<TextStyle>;
};

function TextWithMiddleEllipsis({text, style, textStyle}: TextWithMiddleEllipsisProps) {
    return (
        <Text
            style={[style, textStyle]}
            ellipsizeMode="middle"
            numberOfLines={1}
        >
            {text}
        </Text>
    );
}

export default TextWithMiddleEllipsis;
