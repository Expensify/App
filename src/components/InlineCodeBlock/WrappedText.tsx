import React, {Fragment, useMemo} from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import {View} from 'react-native';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {containsOnlyEmojis} from '@libs/EmojiUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

type WrappedTextProps = ChildrenProps & {
    /** Style to be applied to Text */
    textStyles?: StyleProp<TextStyle>;

    /**
     * Style for each individual word (token) in the text. Note that a token can also include whitespace characters between words.
     */
    wordStyles?: StyleProp<ViewStyle>;
};

/**
 * Breaks the text into matrix
 *
 * @example
 * const text = "My Name is Rajat";
 * const resultMatrix = getTextMatrix(text);
 * console.log(resultMatrix);
 * // Output:
 * // [
 * //   ['My', ' ', 'Name', ' ', 'is', ' ', 'Rajat'],
 * // ]
 */
function getTextMatrix(text: string): string[][] {
    return text.split('\n').map((row) => row.split(CONST.REGEX.SPACE_OR_EMOJI).filter((value) => value !== ''));
}

/**
 * Validates if the text contains any emoji
 */
function containsEmoji(text: string): boolean {
    return CONST.REGEX.EMOJIS.test(text);
}

/**
 * Splits long words into multiple strings
 */
function splitLongWord(word: string, maxLength: number): string[] {
    if (word.length <= maxLength) {
        return [word];
    }

    return word.match(new RegExp(`.{1,${maxLength}}`, 'g')) ?? [];
}

function getFontSizeFromStyles(textStyles: StyleProp<TextStyle>): number {
    if (Array.isArray(textStyles)) {
        for (const style of textStyles) {
            if (style && 'fontSize' in style && style.fontSize) {
                return style.fontSize;
            }
        }
    } else if (textStyles && 'fontSize' in textStyles && textStyles.fontSize) {
        return textStyles.fontSize;
    }

    // if we cannot infer fontSize from styles, a default value is returned
    return variables.fontSizeLabel;
}

function WrappedText({children, wordStyles, textStyles}: WrappedTextProps) {
    const styles = useThemeStyles();
    const {windowWidth} = useWindowDimensions();

    const fontSize = useMemo(() => getFontSizeFromStyles(textStyles), [textStyles]);
    const childrenString = typeof children === 'string' ? children : '';
    const charsPerLine = useMemo(() => Math.floor(windowWidth / (fontSize * variables.fontSizeToWidthRatio)), [windowWidth, fontSize]);

    const textMatrix = getTextMatrix(childrenString).map((row) => row.flatMap((word) => splitLongWord(word, charsPerLine)));

    if (typeof children !== 'string') {
        return null;
    }

    return textMatrix.map((rowText, rowIndex) => (
        <Fragment
            // eslint-disable-next-line react/no-array-index-key
            key={`${rowText.at(0)}-${rowIndex}`}
        >
            {rowText.map((colText, colIndex) => (
                // Outer View is important to vertically center the Text
                <View
                    // eslint-disable-next-line react/no-array-index-key
                    key={`${colText}-${colIndex}`}
                    style={styles.codeWordWrapper}
                >
                    <View style={[wordStyles, colIndex === 0 && styles.codeFirstWordStyle, colIndex === rowText.length - 1 && styles.codeLastWordStyle]}>
                        <Text style={[textStyles, !containsEmoji(colText) && styles.codePlainTextStyle]}>
                            {Array.from(colText).map((char, charIndex) =>
                                containsOnlyEmojis(char) ? (
                                    <Text
                                        // eslint-disable-next-line react/no-array-index-key
                                        key={`${colIndex}-${charIndex}`}
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
        </Fragment>
    ));
}

WrappedText.displayName = 'WrappedText';

export default WrappedText;
