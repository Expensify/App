import _ from 'underscore';
import React, {Fragment} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import Text from '../Text';

/**
 * Breaks the text into matrix
 * for eg: My Name  is Rajat
 *  [
 *    [My,' ',Name,' ',' ',is,' ',Rajat],
 *  ]
 *
 * @param {String} text
 * @returns {Array<String[]>}
 */
function getTextMatrix(text) {
    return _.map(text.split('\n'), row => _.without(row.split(/(\s)/), ''));
}

const propTypes = {
    /** Required text */
    children: PropTypes.string.isRequired,

    /** Style to be applied to Text */
    textStyles: PropTypes.arrayOf(PropTypes.object),

    /** Style for each word(Token) in the text, remember that token also includes whitespaces among words */
    wordStyles: PropTypes.arrayOf(PropTypes.object),
};

const defaultProps = {
    textStyles: [],
    wordStyles: [],
};

const WrappedText = (props) => {
    const textMatrix = getTextMatrix(props.children);
    return (
        <>
            {_.map(textMatrix, (rowText, rowIndex) => (
                <Fragment
                    // eslint-disable-next-line react/no-array-index-key
                    key={`${rowText}-${rowIndex}`}
                >
                    {_.map(rowText, (colText, colIndex) => (

                        // Outer View is important to vertically center the Text
                        <View
                            // eslint-disable-next-line react/no-array-index-key
                            key={`${colText}-${colIndex}`}
                            style={styles.codeWordWrapper}
                        >
                            <View
                                style={[
                                    props.wordStyles,
                                    colIndex === 0 && styles.codeFirstWordStyle,
                                    colIndex === rowText.length - 1 && styles.codeLastWordStyle,
                                ]}
                            >
                                <Text style={props.textStyles}>{colText}</Text>
                            </View>
                        </View>
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
