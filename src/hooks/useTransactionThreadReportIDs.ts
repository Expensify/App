import {useCallback, useMemo} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction, ReportActions, Transaction} from '@src/types/onyx';
import useOnyx from './useOnyx';

/**
 * Given a list of transactionIDs, returns a record mapping each transactionID
 * to the childReportID (transaction thread report ID) of its IOU report action.
 * Report actions are fetched reactively via useOnyx.
 */
function useTransactionThreadReportIDs(transactionIDList: string[] | undefined): Record<string, string | undefined> {
    const transactionIDsKey = transactionIDList?.join('|') ?? '';

    const transactionsSelector = useCallback(
        (collection: OnyxCollection<Transaction>) => {
            const ids = transactionIDsKey ? transactionIDsKey.split('|') : [];
            return ids.map((id) => collection?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${id}`]);
        },
        [transactionIDsKey],
    );

    const [transactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {selector: transactionsSelector}, [transactionsSelector]);

    const reportIDsKey = useMemo(() => {
        const ids = new Set<string>();
        for (const tx of transactions ?? []) {
            if (tx?.reportID) {
                ids.add(tx.reportID);
            }
        }
        return Array.from(ids).sort().join('|');
    }, [transactions]);

    const reportActionsSelector = useCallback(
        (collection: OnyxCollection<ReportActions>) => {
            const ids = reportIDsKey ? reportIDsKey.split('|') : [];
            const result: Record<string, ReportActions> = {};
            for (const id of ids) {
                const key = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${id}`;
                const actions = collection?.[key];
                if (actions) {
                    result[key] = actions;
                }
            }
            return result;
        },
        [reportIDsKey],
    );

    const [relevantReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {selector: reportActionsSelector}, [reportActionsSelector]);

    return useMemo(() => {
        const result: Record<string, string | undefined> = {};
        const ids = transactionIDsKey ? transactionIDsKey.split('|') : [];

        for (const transactionID of ids) {
            const transaction = (transactions ?? []).find((tx) => tx?.transactionID === transactionID);
            if (!transaction?.reportID) {
                continue;
            }

            const reportActions = relevantReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transaction.reportID}`];
            const iouAction = Object.values(reportActions ?? {}).find((action): action is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> => {
                if (!isMoneyRequestAction(action)) {
                    return false;
                }
                const message = getOriginalMessage(action);
                return message?.IOUTransactionID === transactionID;
            });

            result[transactionID] = iouAction?.childReportID;
        }

        return result;
    }, [transactionIDsKey, transactions, relevantReportActions]);
}

export default useTransactionThreadReportIDs;
