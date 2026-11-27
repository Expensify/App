/**
 * Which choices the report list offers besides the reports themselves: a new report, and no report at all. The Report
 * row and the list both ask here, so the row never opens a list with nothing to pick.
 */
import usePolicyForMovingExpenses from '@hooks/usePolicyForMovingExpenses';

import {canCreateReportForExpense, canLeaveExpenseUnreported} from '@libs/IOUUtils';

import type {IOUAction, IOUType} from '@src/CONST';

type UseReportPickerChoicesParams = {
    action: IOUAction | undefined;
    iouType: IOUType;
    isPerDiemRequest: boolean;
    isTimeRequest: boolean;
    isUnreportedManagedCardTransaction: boolean;

    /** Workspace the expense has to stay on. Left out, a new report goes on the user's default workspace. */
    expensePolicyID: string | undefined;
};

type UseReportPickerChoicesResult = {
    /** Whether the list offers a new report */
    canCreateReport: boolean;

    /** Whether the list offers None, which leaves the expense off any report */
    canLeaveUnreported: boolean;

    /** Workspace a new report would be made on */
    policyForMovingExpensesID: string | undefined;

    /** Whether the user has to pick that workspace first */
    shouldSelectPolicy: boolean;
};

function useReportPickerChoices({
    action,
    iouType,
    isPerDiemRequest,
    isTimeRequest,
    isUnreportedManagedCardTransaction,
    expensePolicyID,
}: UseReportPickerChoicesParams): UseReportPickerChoicesResult {
    const {policyForMovingExpensesID, shouldSelectPolicy} = usePolicyForMovingExpenses(isPerDiemRequest, isTimeRequest, expensePolicyID, isUnreportedManagedCardTransaction);

    return {
        canCreateReport: canCreateReportForExpense({policyForMovingExpensesID, shouldSelectPolicy, isPerDiemRequest, isUnreportedManagedCardTransaction}),
        canLeaveUnreported: canLeaveExpenseUnreported(action, iouType, isPerDiemRequest, isTimeRequest),
        policyForMovingExpensesID,
        shouldSelectPolicy,
    };
}

export default useReportPickerChoices;
