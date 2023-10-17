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
        <Text style={{"backgroundColor": "#07271F", "borderBottomColor": "#1A3D32", "borderBottomLeftRadius": 5, "borderBottomRightRadius": 5, "borderBottomWidth": 1, "borderLeftColor": "#1A3D32", "borderLeftWidth": 1, "borderRightColor": "#1A3D32", "borderRightWidth": 1, "borderTopColor": "#1A3D32", "borderTopLeftRadius": 5, "borderTopRightRadius": 5, "borderTopWidth": 1, "paddingLeft": 5, "paddingRight": 5}}>
            <Text style={{"color": "#E7ECE9", "fontFamily": "ExpensifyMono-Regular", "fontSize": 13, "fontStyle": undefined, "fontWeight": undefined, "writingDirection": "ltr"}}>{props.children}</Text>
        </Text>
    );
}

WrappedText.propTypes = propTypes;
WrappedText.defaultProps = defaultProps;
WrappedText.displayName = 'WrappedText';

export default WrappedText;
