import type {SelectedTransactions} from './types';

type SearchMoveSelectionValidationParams = {
    isExpenseReportSearch?: boolean;
    getOwnerAccountIDForReportID?: (reportID?: string) => number | undefined;
};

type SearchMoveSelectionValidation = {
    canMoveToReport: boolean;
};

function getSearchMoveSelectionValidation(
    selectedTransactions: SelectedTransactions,
    {isExpenseReportSearch = false, getOwnerAccountIDForReportID}: SearchMoveSelectionValidationParams = {},
): SearchMoveSelectionValidation {
    const selectedTransactionEntries = Object.values(selectedTransactions);
    const hasSelections = selectedTransactionEntries.length > 0;
    const hasOnlyTransactionSelections = selectedTransactionEntries.every((transaction) => transaction.transaction?.transactionID !== undefined);
    const canAllTransactionsBeMoved = hasSelections && selectedTransactionEntries.every((transaction) => transaction.canChangeReport);

    const ownerAccountIDs = new Set<number>();
    let hasUnknownOwner = false;

    for (const transaction of selectedTransactionEntries) {
        const ownerAccountID = transaction.ownerAccountID ?? transaction.report?.ownerAccountID ?? getOwnerAccountIDForReportID?.(transaction.reportID);
        if (typeof ownerAccountID === 'number') {
            ownerAccountIDs.add(ownerAccountID);
            if (ownerAccountIDs.size > 1) {
                break;
            }
            continue;
        }

        hasUnknownOwner = true;
    }

    const hasMultipleOwners = ownerAccountIDs.size > 1 || (hasUnknownOwner && (ownerAccountIDs.size > 0 || selectedTransactionEntries.length > 1));

    return {
        canMoveToReport: hasSelections && hasOnlyTransactionSelections && canAllTransactionsBeMoved && !hasMultipleOwners && !isExpenseReportSearch,
    };
}

export default getSearchMoveSelectionValidation;
