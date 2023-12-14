import React, {Fragment} from 'react';
import {StyleProp, TextStyle, View, ViewStyle} from 'react-native';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
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

function WrappedText({children, wordStyles, textStyles}: WrappedTextProps) {
    const styles = useThemeStyles();

    if (typeof children !== 'string') {
        return null;
    }

    const textMatrix = getTextMatrix(children);

    return textMatrix.map((rowText, rowIndex) => (
        <Fragment
            // eslint-disable-next-line react/no-array-index-key
            key={`${rowText[0]}-${rowIndex}`}
        >
            {rowText.map((colText, colIndex) => (
                // Outer View is important to vertically center the Text
                <View
                    // eslint-disable-next-line react/no-array-index-key
                    key={`${colText}-${colIndex}`}
                    style={styles.codeWordWrapper}
                >
                    <View style={[wordStyles, colIndex === 0 && styles.codeFirstWordStyle, colIndex === rowText.length - 1 && styles.codeLastWordStyle]}>
                        <Text style={textStyles}>{colText}</Text>
                    </View>
                </View>
            ))}
        </Fragment>
    ));
}

WrappedText.displayName = 'WrappedText';

export default WrappedText;
