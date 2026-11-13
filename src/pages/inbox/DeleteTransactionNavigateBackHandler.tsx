import useClearDeleteTransactionNavigateBackUrlOnUnmount from '@hooks/useClearDeleteTransactionNavigateBackUrlOnUnmount';
import useOnyx from '@hooks/useOnyx';
import useParentReportAction from '@hooks/useParentReportAction';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import {isReportTransactionThreadNew} from '@libs/ReportUtils';
import {doesDeleteNavigateBackUrlIncludeDuplicatesReview} from '@libs/TransactionNavigationUtils';

import {clearDeleteTransactionNavigateBackUrl} from '@userActions/Report';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {useIsFocused} from '@react-navigation/native';
import {useEffect} from 'react';

type DeleteTransactionNavigateBackHandlerProps = {
    /** The reportID of the report screen this handler is mounted in */
    reportID: string | undefined;
};

const parentIDsSelector = (report: OnyxEntry<Report>) => report && {parentReportID: report.parentReportID, parentReportActionID: report.parentReportActionID};
const typeAndChatTypeSelector = (report: OnyxEntry<Report>) => report && {type: report.type, chatType: report.chatType};

/**
 * Component that does not render anything but isolates the RAM_ONLY_PENDING_TRANSACTION_DELETE_URL
 * subscription from ReportScreen. Clears the URL after interactions complete
 * when the report is no longer focused.
 */
function DeleteTransactionNavigateBackHandler({reportID}: DeleteTransactionNavigateBackHandlerProps) {
    const isFocused = useIsFocused();
    const [deleteTransactionNavigateBackUrl] = useOnyx(ONYXKEYS.RAM_ONLY_PENDING_TRANSACTION_DELETE_URL);
    const [reportParentIDs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportID)}`, {selector: parentIDsSelector});
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportParentIDs?.parentReportID)}`, {selector: typeAndChatTypeSelector});
    const parentReportAction = useParentReportAction(reportParentIDs);
    const isTransactionThreadReport = isReportTransactionThreadNew(reportParentIDs, parentReport, parentReportAction);

    useEffect(() => {
        if (isFocused || !deleteTransactionNavigateBackUrl) {
            return;
        }
        if (doesDeleteNavigateBackUrlIncludeDuplicatesReview(deleteTransactionNavigateBackUrl)) {
            return;
        }
        // Clear the URL only after we navigate away to avoid a brief Not Found flash.
        const handle = TransitionTracker.runAfterTransitions({
            callback: () => {
                requestAnimationFrame(clearDeleteTransactionNavigateBackUrl);
            },
            waitForUpcomingTransition: true,
        });
        return () => handle.cancel();
    }, [isFocused, deleteTransactionNavigateBackUrl]);

    useClearDeleteTransactionNavigateBackUrlOnUnmount(isTransactionThreadReport);

    return null;
}

DeleteTransactionNavigateBackHandler.displayName = 'DeleteTransactionNavigateBackHandler';

export default DeleteTransactionNavigateBackHandler;
