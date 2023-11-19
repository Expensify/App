import debounce from 'lodash/debounce';
import React, {useEffect, useMemo, useState} from 'react';
import {withOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import * as ReportUtils from '@libs/ReportUtils';
import styles from '@styles/styles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {OnyxEntry} from "react-native-onyx/lib/types";
import Text from './Text';

type ExceededCommentLengthOnyxProps = {
    comment: OnyxEntry<string>
};

type ExceededCommentLengthProps = {
    /** Report ID to get the comment from (used in withOnyx) */
    // eslint-disable-next-line react/no-unused-prop-types
    reportID: string;

    /** Text Comment */
    comment: string;

    /** Update UI on parent when comment length is exceeded */
    onExceededMaxCommentLength: () => void;
};

function ExceededCommentLength({comment = '', onExceededMaxCommentLength}: ExceededCommentLengthProps & ExceededCommentLengthOnyxProps) {
    const {numberFormat, translate} = useLocalize();
    const [commentLength, setCommentLength] = useState(0);
    const updateCommentLength = useMemo(
        () =>
            debounce((newComment, onExceededMaxCommentLengthCallabck) => {
                const newCommentLength = ReportUtils.getCommentLength(newComment);
                setCommentLength(newCommentLength);
                onExceededMaxCommentLengthCallabck(newCommentLength > CONST.MAX_COMMENT_LENGTH);
            }, CONST.TIMING.COMMENT_LENGTH_DEBOUNCE_TIME),
        [],
    );

    useEffect(() => {
        updateCommentLength(comment, onExceededMaxCommentLength);
    }, [comment, onExceededMaxCommentLength, updateCommentLength]);

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

ExceededCommentLength.displayName = 'ExceededCommentLength';

export default withOnyx<ExceededCommentLengthProps, ExceededCommentLengthOnyxProps>({
    comment: {
        key: ({reportID}) => `${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`,
        initialValue: '',
    },
})(ExceededCommentLength);
