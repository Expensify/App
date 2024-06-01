import React from 'react';
import type { StyleProp, TextStyle } from 'react-native';
import { Text } from 'react-native';
import useTheme from "@hooks/useTheme";

type TextWordProps = {
    /** The color of the text */
    color?: string;

    /** Styles to apply to each text word */
    textStyles?: StyleProp<TextStyle>;

    /** The full text to be split into words */
    text: string;
};

function TextWord({ color, textStyles, text }: TextWordProps) {
    const theme = useTheme();
    const words = text.split(' ');

    return (
        <>
            {words.map((word, index) => (
                <Text
                    style={[
                        { color: color ?? theme.placeholderText },
                        textStyles,
                        { marginRight: index === words.length - 1 ? 0 : 4 } // Adding margin between words except for the last word
                    ]}
                >
                    {word}
                </Text>
            ))}
        </>
    );
}

TextWord.displayName = 'TextWord';

export default TextWord;
