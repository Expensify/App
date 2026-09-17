import ProcessMoneyReportHoldMenu from '@components/ProcessMoneyReportHoldMenu';

import {useCurrencyListActions} from '@hooks/useCurrencyList';

import {getNonHeldAndFullAmount, hasOnlyHeldExpenses as hasOnlyHeldExpensesReportUtils} from '@libs/ReportUtils';

import React from 'react';

import {useReportPreviewActions, useReportPreviewData, useReportPreviewHoldMenu} from './MoneyRequestReportPreviewContext';

/**
 * Hold/approve confirmation menu for the money request report preview. Visibility and open parameters live in the
 * provider so sibling components communicate through context actions instead of imperative refs.
 */
function ReportPreviewHoldMenu() {
    const holdMenu = useReportPreviewHoldMenu();
    const {iouReport, chatReport, transactions} = useReportPreviewData();
    const {startAnimation, onHoldMenuClose} = useReportPreviewActions();
    const {convertToDisplayString} = useCurrencyListActions();

    if (!holdMenu || !iouReport) {
        return null;
    }

    const hasOnlyHeldExpenses = hasOnlyHeldExpensesReportUtils(transactions);
    const {nonHeldAmount, fullAmount, hasValidNonHeldAmount} = getNonHeldAndFullAmount(iouReport, holdMenu.canPay, transactions, convertToDisplayString);

    return (
        <ProcessMoneyReportHoldMenu
            nonHeldAmount={!hasOnlyHeldExpenses && hasValidNonHeldAmount ? nonHeldAmount : undefined}
            fullAmount={fullAmount}
            onClose={onHoldMenuClose}
            isVisible
            paymentType={holdMenu.paymentType}
            methodID={holdMenu.methodID}
            chatReport={chatReport}
            moneyRequestReport={iouReport}
            transactionCount={transactions.length}
            hasNonHeldExpenses={!hasOnlyHeldExpenses}
            onConfirm={startAnimation}
        />
    );
}

export default ReportPreviewHoldMenu;
