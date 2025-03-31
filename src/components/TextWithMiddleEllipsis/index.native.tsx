import React from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import Text from '@components/Text';

type TextWithMiddleEllipsisProps = {
    /** The text to display */
    text: string;

    /** Additional styles */
    style?: StyleProp<TextStyle>;
};

function TextWithMiddleEllipsis({text, style}: TextWithMiddleEllipsisProps) {
    return (
        <Text
            style={style}
            ellipsizeMode="middle"
            numberOfLines={1}
        >
            {text}
        </Text>
    );
}

TextWithMiddleEllipsis.displayName = 'TextWithMiddleEllipsis';

export default TextWithMiddleEllipsis; 
