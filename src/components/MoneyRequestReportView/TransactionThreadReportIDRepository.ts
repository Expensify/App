const transactionReportIDs: string[] = [];
/**
 * When single transaction report is displayed in RHP it may need extra context when user navigated to it from MoneyRequestReportView
 * This context are the list of "sibling" report ids.
 * These "siblings" are child report IDs of every transaction connected to the same parent Report that the original transaction.
 *
 * This is a super simple storage to keep these ids. It's implemented as a singleton because we can only ever have 1 RHP opened with report screen.
 */

function setActiveTransactionThreadIDs(ids: string[]) {
    // Clearing previously saved keys
    transactionReportIDs.splice(0, Infinity);
    transactionReportIDs.push(...ids);
}

function getActiveTransactionThreadIDs() {
    return transactionReportIDs;
}

function clearActiveTransactionThreadIDs() {
    transactionReportIDs.splice(0, Infinity);
}

export {setActiveTransactionThreadIDs, getActiveTransactionThreadIDs, clearActiveTransactionThreadIDs};
