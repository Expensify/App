import {useMemo} from 'react';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

/**
 * Given a list of transactionIDs, returns a record mapping each transactionID
 * to the childReportID (transaction thread report ID) of its IOU report action.
 */
function useTransactionThreadReportIDs(transactionIDList: string[] | undefined): Record<string, string | undefined> {
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);
    const [allReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS);
    const transactionIDsKey = transactionIDList?.join('|') ?? '';

    return useMemo(() => {
        const result: Record<string, string | undefined> = {};
        const ids = transactionIDsKey ? transactionIDsKey.split('|') : [];

        for (const transactionID of ids) {
            const transaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
            if (!transaction?.reportID) {
                continue;
            }

            const reportActions = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transaction.reportID}`];
            const iouAction = Object.values(reportActions ?? {}).find((action) => {
                if (!isMoneyRequestAction(action)) {
                    return false;
                }
                return getOriginalMessage(action)?.IOUTransactionID === transactionID;
            });

            result[transactionID] = iouAction?.childReportID;
        }

        return result;
    }, [transactionIDsKey, allTransactions, allReportActions]);
}

export default useTransactionThreadReportIDs;
