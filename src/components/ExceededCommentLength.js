import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import CONST from '../CONST';
import Text from './Text';
import styles from '../styles/styles';
import stylePropTypes from '../styles/stylePropTypes';

const propTypes = {
    /** The current length of the comment */
    commentLength: PropTypes.number.isRequired,

    /** Additional style props */
    style: stylePropTypes,
};

const defaultProps = {
    style: [],
};

const ExceededCommentLength = (props) => {
    if (props.commentLength <= CONST.MAX_COMMENT_LENGTH) {
        return null;
    }

    const additionalStyles = _.isArray(props.style) ? props.style : [props.style];

    return (
        <Text style={[styles.textMicro, styles.textDanger, ...additionalStyles]}>
            {`${props.commentLength}/${CONST.MAX_COMMENT_LENGTH}`}
        </Text>
    );
};

ExceededCommentLength.propTypes = propTypes;
ExceededCommentLength.defaultProps = defaultProps;
ExceededCommentLength.displayName = 'ExceededCommentLength';

export default ExceededCommentLength;
