import useOnyx from '@hooks/useOnyx';
import {getReportName} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';

function useOptionName(reportID: string) {
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: true});
    const [parentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`, {canBeMissing: true});
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`, {canBeMissing: true});
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {canBeMissing: true});
    const invoiceReceiverPolicyID = parentReport?.invoiceReceiver && 'policyID' in parentReport.invoiceReceiver ? parentReport.invoiceReceiver.policyID : '-1';
    const [invoiceReceiverPolicy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${invoiceReceiverPolicyID}`, {canBeMissing: true});
    const isArchived = !!reportNameValuePairs?.private_isArchived;

    return getReportName(report, policy, undefined, undefined, invoiceReceiverPolicy, undefined, undefined, isArchived);
}

export default useOptionName;
