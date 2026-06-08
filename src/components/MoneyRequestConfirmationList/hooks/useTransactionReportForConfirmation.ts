import type {OnyxEntry} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

const transactionReportSelector = (report: OnyxEntry<OnyxTypes.Report>) => report && ({type: report.type} as OnyxEntry<OnyxTypes.Report>);

/**
 * Owns the transaction-report subscription for the confirmation flow.
 *
 * Reads the report tied to the given transaction's reportID and narrows it to just the
 * `type` field that the confirmation-validation hook needs — avoiding broad re-renders
 * on unrelated report updates.
 */
function useTransactionReportForConfirmation(transactionReportID: string | undefined) {
    const [transactionReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionReportID}`, {
        selector: transactionReportSelector,
    });
    return transactionReport;
}

export default useTransactionReportForConfirmation;
