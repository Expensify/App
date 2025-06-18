const transactionIDs: string[] = [];
/**
 * When single transaction report is displayed in RHP it may need extra context when user navigated to it from MoneyRequestReportView
 * This context are the list of "sibling" transactions ids.
 * These "siblings" are transactions connected to the same parent Report that the original transaction.
 *
 * This is a super simple storage to keep these ids. It's implemented as a singleton because we can only ever have 1 RHP opened with report screen.
 */

function setActiveTransactionIDs(ids: string[]) {
    // Clearing previously saved keys
    transactionIDs.splice(0, Infinity);
    transactionIDs.push(...ids);
}

function getActiveTransactionIDs() {
    return transactionIDs;
}

function clearActiveTransactionIDs() {
    transactionIDs.splice(0, Infinity);
}

export {setActiveTransactionIDs, getActiveTransactionIDs, clearActiveTransactionIDs};
