import type {ComponentProps} from 'react';
import ProcessMoneyReportHoldMenu from '@components/ProcessMoneyReportHoldMenu';

type MoneyReportHeaderHoldMenuProps = ComponentProps<typeof ProcessMoneyReportHoldMenu>;

/**
 * Renders the hold / pay-or-approve decision flow only when the menu is open and a request type is set.
 * Keeps the parent free of `{visible && <ProcessMoneyReportHoldMenu ... />}` conditional rendering.
 */
function MoneyReportHeaderHoldMenu({
    chatReport,
    fullAmount,
    isVisible,
    moneyRequestReport,
    nonHeldAmount,
    onClose,
    paymentType,
    methodID,
    requestType,
    transactionCount,
    startAnimation,
    hasNonHeldExpenses,
    onNonReimbursablePaymentError,
    transactions,
}: MoneyReportHeaderHoldMenuProps) {
    if (!isVisible || requestType === undefined) {
        return null;
    }

    return (
        <ProcessMoneyReportHoldMenu
            chatReport={chatReport}
            fullAmount={fullAmount}
            isVisible={isVisible}
            moneyRequestReport={moneyRequestReport}
            nonHeldAmount={nonHeldAmount}
            onClose={onClose}
            paymentType={paymentType}
            methodID={methodID}
            requestType={requestType}
            transactionCount={transactionCount}
            startAnimation={startAnimation}
            hasNonHeldExpenses={hasNonHeldExpenses}
            onNonReimbursablePaymentError={onNonReimbursablePaymentError}
            transactions={transactions}
        />
    );
}

export default MoneyReportHeaderHoldMenu;
export type {MoneyReportHeaderHoldMenuProps};
