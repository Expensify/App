import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import {getOneTransactionThreadReportID} from '@libs/ReportActionsUtils';
import {isUnread} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';

function useIsReportUnread(reportID: string) {
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: true});
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`, {canBeMissing: true});
    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {canBeMissing: true});
    const {isOffline} = useNetwork();
    const oneTransactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, reportActions, isOffline);
    const [oneTransactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${oneTransactionThreadReportID}`, {canBeMissing: true});
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {canBeMissing: true});
    const isReportArchived = !!reportNameValuePairs?.private_isArchived;

    return isUnread(report, oneTransactionThreadReport, isReportArchived) && !!report?.lastActorAccountID;
}

export default useIsReportUnread;
