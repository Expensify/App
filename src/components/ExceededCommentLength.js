import {debounce} from 'lodash';
import PropTypes from 'prop-types';
import React, {useEffect, useMemo, useState} from 'react';
import {withOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import * as ReportUtils from '@libs/ReportUtils';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import Text from './Text';

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
    const styles = useThemeStyles();
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
