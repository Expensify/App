import React, {Fragment} from 'react';
import {Text, View} from 'react-native';
import PropTypes from 'prop-types';

/**
 * Return the space if we have not reached end of line
 *
 * @param {Number} textLen
 * @param {Number} currentIndex
 * @returns {String}
 */
function getWordSpace(textLen, currentIndex) {
    return currentIndex !== textLen - 1 ? ' ' : '';
}

/**
 * Breaks the text into matrix
 * for eg: My Name \n is Rajat
 *  [
 *    [My, Name],
 *    [is, Rajat]
 *  ]
 *
 * @param {String} text
 * @returns {Array<String[]>}
 */
function getTextMatrix(text) {
    return text.split('\n').map(row => row.split(' '));
}
const propTypes = {
    // Required text
    children: PropTypes.string.isRequired,

    // Style to be applied to Text
    // eslint-disable-next-line react/forbid-prop-types
    textStyle: PropTypes.object,

    // Style for each word(Token) in the text,
    // remember that token also includes the following spaces before next word break
    // eslint-disable-next-line react/forbid-prop-types
    wordStyle: PropTypes.object,

    // Style for first word
    // eslint-disable-next-line react/forbid-prop-types
    firstWordStyle: PropTypes.object,

    // Style for last word
    // eslint-disable-next-line react/forbid-prop-types
    lastWordStyle: PropTypes.object,
};
const defaultProps = {
    textStyle: {},
    wordStyle: {},
    firstWordStyle: {},
    lastWordStyle: {},
};
const WrappedText = function (props) {
    const textMatrix = getTextMatrix(props.children);
    return (
        <>
            {textMatrix.map((rowText, rowIndex) => (
                <Fragment
                    // eslint-disable-next-line react/no-array-index-key
                    key={`${rowText}-${rowIndex}`}
                >
                    {rowText.map((colText, colIndex) => (
                        (colText !== '' || (rowText.length === 1 && colText === ''))
                        && (

                            // Outer View is important to vertically center the Text
                            <View
                                // eslint-disable-next-line react/no-array-index-key
                                key={`${colText}-${colIndex}`}
                            >
                                <View
                                    style={[
                                        props.wordStyle,
                                        colIndex === 0 && props.firstWordStyle,
                                        colIndex === rowText.length - 1 && props.lastWordStyle,
                                    ]}
                                >
                                    <Text style={props.textStyle}>
                                        {colText + getWordSpace(rowText.length, colIndex)}
                                    </Text>
                                </View>
                            </View>
                        )
                    ))}
                </Fragment>
            ))}
        </>
    );
};
WrappedText.propTypes = propTypes;
WrappedText.defaultProps = defaultProps;
WrappedText.displayName = 'WrappedText';

export default WrappedText;
