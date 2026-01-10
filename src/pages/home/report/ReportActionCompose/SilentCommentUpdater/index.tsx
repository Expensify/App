import {useEffect} from 'react';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import ONYXKEYS from '@src/ONYXKEYS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import type SilentCommentUpdaterProps from './types';

/**
 * This component doesn't render anything. It runs a side effect to update the comment of a report under certain conditions.
 * It is connected to the actual draft comment in onyx. The comment in onyx might updates multiple times, and we want to avoid
 * re-rendering a UI component for that. That's why the side effect was moved down to a separate component.
 */
function SilentCommentUpdater({
    commentRef,
    reportID,
    value,
    updateComment,
    isCommentPendingSaved,
    isTransitioningToPreExistingReport,
    onTransitionToPreExistingReportComplete,
}: SilentCommentUpdaterProps) {
    const [comment = '', commentResult] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`, {canBeMissing: true});
    const prevCommentProp = usePrevious(comment);
    const prevReportId = usePrevious(reportID);
    const {preferredLocale} = useLocalize();
    const prevPreferredLocale = usePrevious(preferredLocale);

    useEffect(() => {
        if (isLoadingOnyxValue(commentResult)) {
            return;
        }

        // Skip sync when transitioning to a preexisting report
        // This prevents overwriting the just-saved draft with an empty string
        if (isTransitioningToPreExistingReport.current && reportID !== prevReportId) {
            onTransitionToPreExistingReportComplete();
            return;
        }

        // Value state does not have the same value as comment props when the comment gets changed from another tab.
        // In this case, we should synchronize the value between tabs.
        const shouldSyncComment = prevCommentProp !== comment && value !== comment && !isCommentPendingSaved.current;

        // As the report IDs change, make sure to update the composer comment as we need to make sure
        // we do not show incorrect data in there (ie. draft of message from other report).
        if (preferredLocale === prevPreferredLocale && reportID === prevReportId && !shouldSyncComment) {
            return;
        }

        updateComment(comment ?? '');
    }, [
        prevCommentProp,
        prevPreferredLocale,
        prevReportId,
        comment,
        preferredLocale,
        reportID,
        updateComment,
        value,
        commentRef,
        isCommentPendingSaved,
        isTransitioningToPreExistingReport,
        onTransitionToPreExistingReportComplete,
        commentResult,
    ]);

    return null;
}

export default SilentCommentUpdater;
