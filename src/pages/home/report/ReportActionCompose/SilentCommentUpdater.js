import {useEffect} from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import usePrevious from '../../../../hooks/usePrevious';
import ONYXKEYS from '../../../../ONYXKEYS';
import useLocalize from '../../../../hooks/useLocalize';

const propTypes = {
    /** The comment of the report */
    comment: PropTypes.string,

    /** The report associated with the comment */
    report: PropTypes.shape({
        /** The ID of the report */
        reportID: PropTypes.string,
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

/**
 * This component doesn't render anything. It runs a side effect to update the comment of a report under certain conditions.
 * It is connected to the actual draft comment in onyx. The comment in onyx might updates multiple times, and we want to avoid
 * re-rendering a UI component for that. That's why the side effect was moved down to a separate component.
 * @returns {null}
 */
function SilentCommentUpdater({comment, commentRef, report, value, updateComment}) {
    const prevCommentProp = usePrevious(comment);
    const prevReportId = usePrevious(report.reportID);
    const {preferredLocale} = useLocalize();
    const prevPreferredLocale = usePrevious(preferredLocale);

    useEffect(() => {
        // Value state does not have the same value as comment props when the comment gets changed from another tab.
        // In this case, we should synchronize the value between tabs.
        const shouldSyncComment = prevCommentProp !== comment && value !== comment;

        // As the report IDs change, make sure to update the composer comment as we need to make sure
        // we do not show incorrect data in there (ie. draft of message from other report).
        if (preferredLocale === prevPreferredLocale && report.reportID === prevReportId && !shouldSyncComment) {
            return;
        }

        updateComment(comment);
    }, [prevCommentProp, prevPreferredLocale, prevReportId, comment, preferredLocale, report.reportID, updateComment, value, commentRef]);

    return null;
}

SilentCommentUpdater.propTypes = propTypes;
SilentCommentUpdater.defaultProps = defaultProps;
SilentCommentUpdater.displayName = 'SilentCommentUpdater';

export default withOnyx({
    comment: {
        key: ({reportID}) => `${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`,
        initialValue: '',
    },
})(SilentCommentUpdater);
