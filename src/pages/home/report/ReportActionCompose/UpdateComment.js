import {useEffect} from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import usePrevious from '../../../../hooks/usePrevious';
import ONYXKEYS from '../../../../ONYXKEYS';
import compose from '../../../../libs/compose';
import withLocalize from '../../../../components/withLocalize';

const propTypes = {
    /** The comment of the report */
    comment: PropTypes.string,

    /** The preferred locale of the user */
    preferredLocale: PropTypes.string.isRequired,

    /** The report associated with the comment */
    report: PropTypes.shape({
        /** The ID of the report */
        reportID: PropTypes.number,
    }).isRequired,

    /** The value of the comment */
    value: PropTypes.string.isRequired,

    /** The ref of the comment */
    commentRef: PropTypes.shape({
        /** The current value of the comment */
        current: PropTypes.string,
    }).isRequired,

    /** Updates the comment */
    updateComment: PropTypes.func.isRequired,
};

const defaultProps = {
    comment: '',
};

function UpdateComment({comment, commentRef, preferredLocale, report, value, updateComment}) {
    const prevCommentProp = usePrevious(comment);
    const prevPreferredLocale = usePrevious(preferredLocale);
    const prevReportId = usePrevious(report.reportID);

    useEffect(() => {
        // Value state does not have the same value as comment props when the comment gets changed from another tab.
        // In this case, we should synchronize the value between tabs.
        const shouldSyncComment = prevCommentProp !== comment && value !== comment;

        // As the report IDs change, make sure to update the composer comment as we need to make sure
        // we do not show incorrect data in there (ie. draft of message from other report).
        if (preferredLocale === prevPreferredLocale && report.reportID === prevReportId && !shouldSyncComment) {
            return;
        }

        console.log('UpdateComment.js: Updating from', comment, 'to comment', commentRef.current);
        updateComment(comment);
    }, [prevCommentProp, prevPreferredLocale, prevReportId, comment, preferredLocale, report.reportID, updateComment, value, commentRef]);

    return null;
}

UpdateComment.propTypes = propTypes;
UpdateComment.defaultProps = defaultProps;
UpdateComment.displayName = 'UpdateComment';

export default compose(
    withLocalize,
    withOnyx({
        comment: {
            key: ({reportID}) => `${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`,
        },
    }),
)(UpdateComment);
