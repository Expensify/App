import React, {Fragment} from 'react';
import {StyleProp, TextStyle, View, ViewStyle} from 'react-native';
import Text from '@components/Text';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

type WrappedTextProps = ChildrenProps & {
    /** Style to be applied to Text */
    textStyles?: StyleProp<TextStyle>;

    /** Style for each word(Token) in the text, remember that token also includes whitespaces among words */
    wordStyles?: StyleProp<ViewStyle>;
};

/**
 * Breaks the text into matrix
 * for eg: My Name  is Rajat
 *  [
 *    [My,' ',Name,' ',' ',is,' ',Rajat],
 *  ]
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
