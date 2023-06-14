import React, {useEffect, useState, useMemo} from 'react';
import PropTypes from 'prop-types';
import {debounce} from 'lodash';
import CONST from '../CONST';
import * as ReportUtils from '../libs/ReportUtils';
import Text from './Text';
import styles from '../styles/styles';

const propTypes = {
    /** Text Comment */
    comment: PropTypes.string.isRequired,

    /** Update UI on parent when comment length is exceeded */
    onExceededMaxCommentLength: PropTypes.func.isRequired,
};

function ExceededCommentLength(props) {
    const [commentLength, setCommentLength] = useState(0);
    const updateCommentLength = useMemo(
        () =>
            debounce((comment, onExceededMaxCommentLength) => {
                const newCommentLength = ReportUtils.getCommentLength(comment);
                setCommentLength(newCommentLength);
                onExceededMaxCommentLength(newCommentLength > CONST.MAX_COMMENT_LENGTH);
            }, CONST.TIMING.COMMENT_LENGTH_DEBOUNCE_TIME),
        [],
    );

    useEffect(() => {
        updateCommentLength(props.comment, props.onExceededMaxCommentLength);
    }, [props.comment, props.onExceededMaxCommentLength, updateCommentLength]);

    if (commentLength <= CONST.MAX_COMMENT_LENGTH) {
        return null;
    }

    return <Text style={[styles.textMicro, styles.textDanger, styles.chatItemComposeSecondaryRow, styles.mlAuto, styles.pl2]}>{`${commentLength}/${CONST.MAX_COMMENT_LENGTH}`}</Text>;
}

ExceededCommentLength.propTypes = propTypes;

export default ExceededCommentLength;
