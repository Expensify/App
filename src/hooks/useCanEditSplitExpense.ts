import {useMemo} from 'react';
import {getIOUActionForTransactions} from '@libs/actions/IOU';
import {canEditFieldOfMoneyRequest} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type Report from '@src/types/onyx/Report';
import useReportIsArchived from './useReportIsArchived';

function useCanEditSplitExpense(
    transactionReport: Report | undefined,
    splitExpenseTransactionID: string | undefined,
): {isEditingSplitExpense: boolean; canEditSplitExpense: boolean | undefined} {
    const isEditingSplitAmount = useMemo(() => !!Number(splitExpenseTransactionID), [splitExpenseTransactionID]);

    const isChatReportArchived = useReportIsArchived(transactionReport?.chatReportID);
    const splitIOUAction = getIOUActionForTransactions([splitExpenseTransactionID], transactionReport?.reportID).at(0);
    const canEditSplitAmount = useMemo(() => {
        return canEditFieldOfMoneyRequest(splitIOUAction, CONST.EDIT_REQUEST_FIELD.AMOUNT, undefined, isChatReportArchived);
    }, [splitIOUAction, isChatReportArchived]);

    if (isEditingSplitAmount) {
        return {isEditingSplitExpense: true, canEditSplitExpense: canEditSplitAmount};
    }
    return {isEditingSplitExpense: false, canEditSplitExpense: undefined};
}

export default useCanEditSplitExpense;
