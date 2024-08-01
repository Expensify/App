import {useEffect} from 'react';
import {withOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import usePrevious from '@hooks/usePrevious';
import ONYXKEYS from '@src/ONYXKEYS';
import type {SilentCommentUpdaterOnyxProps, SilentCommentUpdaterProps} from './types';

/**
 * This component doesn't render anything. It runs a side effect to update the comment of a report under certain conditions.
 * It is connected to the actual draft comment in onyx. The comment in onyx might updates multiple times, and we want to avoid
 * re-rendering a UI component for that. That's why the side effect was moved down to a separate component.
 */
function SilentCommentUpdater({comment, commentRef, reportID, value, updateComment, isCommentPendingSaved}: SilentCommentUpdaterProps) {
    const prevCommentProp = usePrevious(comment);
    const prevReportId = usePrevious(reportID);
    const {preferredLocale} = useLocalize();
    const prevPreferredLocale = usePrevious(preferredLocale);

    useEffect(() => {
        updateComment(comment ?? '');

        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- We need to run this on mount
    }, []);

    useEffect(() => {
        // Value state does not have the same value as comment props when the comment gets changed from another tab.
        // In this case, we should synchronize the value between tabs.
        const shouldSyncComment = prevCommentProp !== comment && value !== comment && !isCommentPendingSaved.current;

        // As the report IDs change, make sure to update the composer comment as we need to make sure
        // we do not show incorrect data in there (ie. draft of message from other report).
        if (preferredLocale === prevPreferredLocale && reportID === prevReportId && !shouldSyncComment) {
            return;
        }

        updateComment(comment ?? '');
    }, [prevCommentProp, prevPreferredLocale, prevReportId, comment, preferredLocale, reportID, updateComment, value, commentRef, isCommentPendingSaved]);

    return null;
}

SilentCommentUpdater.displayName = 'SilentCommentUpdater';

export default withOnyx<SilentCommentUpdaterProps, SilentCommentUpdaterOnyxProps>({
    comment: {
        key: ({reportID}) => `${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`,
        initialValue: '',
    },
})(SilentCommentUpdater);
