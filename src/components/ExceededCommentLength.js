import React, {useEffect, useState, useMemo} from 'react';
import PropTypes from 'prop-types';
import {debounce} from 'lodash';
import {withOnyx} from 'react-native-onyx';
import CONST from '../CONST';
import * as ReportUtils from '../libs/ReportUtils';
import useLocalize from '../hooks/useLocalize';
import Text from './Text';
import styles from '../styles/styles';
import ONYXKEYS from '../ONYXKEYS';

const propTypes = {
    /** Report ID to get the comment from (used in withOnyx) */
    // eslint-disable-next-line react/no-unused-prop-types
    reportID: PropTypes.string.isRequired,

    /** Text Comment */
    comment: PropTypes.string,

    /** Update UI on parent when comment length is exceeded */
    onExceededMaxCommentLength: PropTypes.func.isRequired,
};

const defaultProps = {
    comment: '',
};

function ExceededCommentLength(props) {
    const {numberFormat, translate} = useLocalize();
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

    return (
        <Text
            style={[styles.textMicro, styles.textDanger, styles.chatItemComposeSecondaryRow, styles.mlAuto, styles.pl2]}
            numberOfLines={1}
        >
            {translate('composer.commentExceededMaxLength', {formattedMaxLength: numberFormat(CONST.MAX_COMMENT_LENGTH)})}
        </Text>
    );
}

ExceededCommentLength.propTypes = propTypes;
ExceededCommentLength.defaultProps = defaultProps;
ExceededCommentLength.displayName = 'ExceededCommentLength';

export default withOnyx({
    comment: {
        key: ({reportID}) => `${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`,
        initialValue: '',
    },
})(ExceededCommentLength);
