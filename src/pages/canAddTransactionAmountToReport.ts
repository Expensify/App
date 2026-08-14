function canAddTransactionAmountToReport(transactionAmount: number, isIOU: boolean): boolean {
    return !isIOU || transactionAmount > 0;
}

export default canAddTransactionAmountToReport;
