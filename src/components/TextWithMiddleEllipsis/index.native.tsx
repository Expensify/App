import Text from '@components/Text';

import type {StyleProp, TextStyle} from 'react-native';

import React from 'react';

type TextWithMiddleEllipsisProps = {
    text: string;
    style?: StyleProp<TextStyle>;
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
