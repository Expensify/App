import React, {useState} from 'react';
import {View} from 'react-native';
import type {NativeSyntheticEvent, TextLayoutEventData, StyleProp, TextStyle, ViewStyle} from 'react-native';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import {containsOnlyEmojis} from '@libs/EmojiUtils';
import CONST from '@src/CONST';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

type WrappedTextProps = ChildrenProps & {
    /** Style to be applied to Text */
    textStyles?: StyleProp<TextStyle>;

    /** Style for each individual word (token) in the text */
    wordStyles?: StyleProp<ViewStyle>;
};

/** Validates if the text contains any emoji */
function containsEmoji(text: string): boolean {
    return CONST.REGEX.EMOJIS.test(text);
}

function WrappedText({children, wordStyles, textStyles}: WrappedTextProps) {
    const [lines, setLines] = useState<string[]>([]);
    const styles = useThemeStyles();

    if (typeof children !== 'string') {
        return null;
    }

    type TextLayoutEvent = NativeSyntheticEvent<TextLayoutEventData>;

    const handleTextLayout = (event: TextLayoutEvent) => {
        const {
            nativeEvent: {lines: textLines},
        } = event;
        setLines(textLines.map((line: {text: string}) => line.text));
    };

    if (!lines.length) {
        return (
            <View style={{position: 'absolute', opacity: 0, width: '100%'}}>
                <Text
                    style={[textStyles]}
                    onTextLayout={handleTextLayout}
                >
                    {children}
                </Text>
            </View>
        );
    }

    return (<>
        {lines.map((line, index) => (
            <View
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                style={styles.codeWordWrapper}
            >
                <View style={[wordStyles, index === 0 && styles.codeFirstWordStyle, index === lines.length - 1 && styles.codeLastWordStyle]}>
                    <Text style={[textStyles, !containsEmoji(line) && styles.codePlainTextStyle]}>
                        {Array.from(line).map((char, charIndex) =>
                            containsOnlyEmojis(char) ? (
                                <Text
                                    // eslint-disable-next-line react/no-array-index-key
                                    key={`${index}-${charIndex}`}
                                    style={[textStyles, styles.emojiDefaultStyles]}
                                >
                                    {char}
                                </Text>
                            ) : (
                                char
                            ),
                        )}
                    </Text>
                </View>
            </View>
        ))}
    </>);
}

WrappedText.displayName = 'WrappedText';

export default WrappedText;
