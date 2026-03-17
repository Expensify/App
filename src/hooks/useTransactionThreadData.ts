import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';
import useTransactionViolations from './useTransactionViolations';

/**
 * Shared hook that resolves the common Onyx subscription chain for a transaction thread.
 * Given a reportID, derives: report → parentReport → policy → parentReportAction → transaction → transactionViolations.
 */
function useTransactionThreadData(reportID: string | undefined) {
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`);
    const [parentReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.parentReportID}`, {canEvict: false});
    const parentReportAction = report?.parentReportActionID ? parentReportActions?.[report.parentReportActionID] : undefined;
    const transactionIDFromAction = isMoneyRequestAction(parentReportAction)
        ? (getOriginalMessage(parentReportAction)?.IOUTransactionID ?? CONST.DEFAULT_NUMBER_ID)
        : CONST.DEFAULT_NUMBER_ID;
    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionIDFromAction}`, {});
    const transactionViolations = useTransactionViolations(transaction?.transactionID);

    return {report, parentReport, policy, parentReportAction, transaction, transactionViolations};
}

export default useTransactionThreadData;
