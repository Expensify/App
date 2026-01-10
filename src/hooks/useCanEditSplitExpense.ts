import {useMemo} from 'react';
import useReportIsArchived from '@hooks/useReportIsArchived';
import {getIOUActionForTransactions} from '@libs/actions/IOU';
import {canEditFieldOfMoneyRequest} from '@libs/ReportUtils';
import CONST from '@src/CONST';

function useCanEditSplitExpense(
    transactionReport: OnyxEntry<OnyxTypes.Report>,
    splitExpenseTransactionID: string,
): {isEditingSplitExpense: boolean; canEditSplitExpense: boolean | undefined} {
    const isEditingSplitAmount = useMemo(() => !!Number(splitExpenseTransactionID), [splitExpenseTransactionID]);
    if (!isEditingSplitAmount) {
        return {isEditingSplitExpense: false};
    }

    const isChatReportArchived = useReportIsArchived(transactionReport?.chatReportID);
    const splitIOUAction = getIOUActionForTransactions([splitExpenseTransactionID], transactionReport?.reportID).at(0);
    const canEditSplitAmount = useMemo(() => {
        return canEditFieldOfMoneyRequest(splitIOUAction, CONST.EDIT_REQUEST_FIELD.AMOUNT, undefined, isChatReportArchived);
    }, [splitIOUAction, isChatReportArchived]);

    return {isEditingSplitExpense: true, canEditSplitExpense: canEditSplitAmount};
}

export default useCanEditSplitExpense;
