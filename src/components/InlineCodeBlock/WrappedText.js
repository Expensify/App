import PropTypes from 'prop-types';
import React, {Fragment} from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import Text from '@components/Text';
import styles from '@styles/styles';
import CONST from '@src/CONST';

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
    console.log(text)
    const result = _.map(text.split('\n'), (row) => _.without(row.split(CONST.REGEX.SPACE_OR_EMOJI), ''));
    console.log(result)
    return result
}

const propTypes = {
    /** Required text */
    children: PropTypes.string.isRequired,

    /** Style to be applied to Text */
    // eslint-disable-next-line react/forbid-prop-types
    textStyles: PropTypes.arrayOf(PropTypes.object),

    /** Style for each word(Token) in the text, remember that token also includes whitespaces among words */
    // eslint-disable-next-line react/forbid-prop-types
    wordStyles: PropTypes.arrayOf(PropTypes.object),
};

const defaultProps = {
    textStyles: [],
    wordStyles: [],
};

function WrappedText(props) {
    if (!_.isString(props.children)) {
        return null;
    }

    useEffect(() => {
        console.log(props.boxModelStyle)
        console.log(props.textStyles)
    }, [])
    // const textMatrix = getTextMatrix(props.children);
    return (
        <Text style={styles.codeWordWrapper}>
            <Text style={[props.textStyles]}>{props.children}</Text>
        </Text>
    );
}

WrappedText.propTypes = propTypes;
WrappedText.defaultProps = defaultProps;
WrappedText.displayName = 'WrappedText';

export default WrappedText;
