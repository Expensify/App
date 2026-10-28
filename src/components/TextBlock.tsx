import type {StyleProp, TextStyle} from 'react-native';

/**
 * TextBlock component splits a given text into individual words and displays
 * each word within a Text component.
 */
import React from 'react';

import Text from './Text';

type TextBlockProps = {
    color?: string;

    /** Styles to apply to each text word */
    textStyles?: StyleProp<TextStyle>;

    /** The full text to be split into words */
    text: string;
};

function TextBlock({color, textStyles, text}: TextBlockProps) {
    const words = text.match(/(\S+\s*)/g) ?? [];

    return (
        <>
            {words.map((word) => (
                <Text
                    color={color}
                    style={textStyles}
                    key={word}
                >
                    {word}
                </Text>
            ))}
        </>
    );
}

export default TextBlock;
