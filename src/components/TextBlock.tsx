/**
 * TextBlock component splits a given text into individual words and displays
 * each word within a Text component.
 */
import React, {memo, useMemo} from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import Text from './Text';

type TextBlockProps = {
    /** The color of the text */
    color?: string;

    /** Styles to apply to each text word */
    textStyles?: StyleProp<TextStyle>;

    /** The full text to be split into words */
    text: string;
};

function TextBlock({color, textStyles, text}: TextBlockProps) {
    const words = useMemo(() => text.match(/(\S+\s*)/g) ?? [], [text]);

    return (
        <>
            {words.map((word, index) => (
                <Text
                    color={color}
                    style={textStyles}
                    // eslint-disable-next-line react/no-array-index-key
                    key={index}
                >
                    {word}
                </Text>
            ))}
        </>
    );
}

TextBlock.displayName = 'TextBlock';

export default memo(TextBlock);
