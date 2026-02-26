import {useEffect} from 'react';
import {isDeletedAction} from '@libs/ReportActionsUtils';
import type * as OnyxTypes from '@src/types/onyx';

function useActionDraftDeletion(
    action: OnyxTypes.ReportAction,
    reportID: string | undefined,
    draftMessage: string | undefined,
    deleteReportActionDraft: (reportID: string | undefined, action: OnyxTypes.ReportAction) => void,
) {
    useEffect(() => {
        if (draftMessage === undefined || !isDeletedAction(action)) {
            return;
        }
        deleteReportActionDraft(reportID, action);
    }, [draftMessage, action, reportID, deleteReportActionDraft]);
}

export default useActionDraftDeletion;
