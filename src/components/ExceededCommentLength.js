import React from 'react';
import PropTypes from 'prop-types';

import CONST from '../CONST';
import Text from './Text';
import styles from '../styles/styles';

const propTypes = {
    /** The current length of the comment */
    commentLength: PropTypes.number.isRequired,
};

const ExceededCommentLength = (props) => {
    if (props.commentLength <= CONST.MAX_COMMENT_LENGTH) {
        return null;
    }

    return (
        <Text style={[styles.textMicro, styles.textDanger]}>
            {`${props.commentLength}/${CONST.MAX_COMMENT_LENGTH}`}
        </Text>
    );
};

ExceededCommentLength.propTypes = propTypes;
ExceededCommentLength.displayName = 'ExceededCommentLength';

export default ExceededCommentLength;
