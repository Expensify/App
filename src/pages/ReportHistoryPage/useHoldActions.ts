import useOnyx from '@hooks/useOnyx';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';

import {getIOUActionForTransactionID} from '@libs/ReportActionsUtils';
import {isOnHold} from '@libs/TransactionUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction, ReportActions} from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

/** Returns one hold action per held expense on the report. An entry is undefined while that expense's thread isn't loaded */
function useHoldActions(reportID: string, reportActions: OnyxEntry<ReportActions>): Array<OnyxEntry<ReportAction>> {
    const {transactions} = useTransactionsAndViolationsForReport(reportID);
    const reportActionsList = Object.values(reportActions ?? {});
    const holds = Object.values(transactions)
        .filter(isOnHold)
        .map((transaction) => ({
            threadReportID: getIOUActionForTransactionID(reportActionsList, transaction.transactionID)?.childReportID,
            holdReportActionID: transaction.comment?.hold,
        }));

    const holdActionsSelector = (allReportActions: OnyxCollection<ReportActions>) =>
        holds.map(({threadReportID, holdReportActionID}) =>
            holdReportActionID ? allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${threadReportID}`]?.[holdReportActionID] : undefined,
        );
    const [holdActions = getEmptyArray<OnyxEntry<ReportAction>>()] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {selector: holdActionsSelector});

    return holdActions;
}

export default useHoldActions;
