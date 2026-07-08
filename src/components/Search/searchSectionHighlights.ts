import ONYXKEYS from '@src/ONYXKEYS';

import type {ReportActionListItemType, SearchListItem, TransactionGroupListItemType, TransactionListItemType} from './SearchList/ListItem/types';

/**
 * Stamps the post-create highlight flag + current query hash onto each sorted row, preserving the previous
 * item reference when nothing changed (so downstream memoization holds). `shouldAnimate` derives whether a
 * given row should play the highlight animation — the only part that varies per search type.
 */
function stampSearchHighlights(rows: SearchListItem[], hash: number, shouldAnimate: (item: SearchListItem) => boolean): SearchListItem[] {
    return rows.map((item) => {
        const shouldAnimateInHighlight = shouldAnimate(item);
        if (item.shouldAnimateInHighlight === shouldAnimateInHighlight && item.hash === hash) {
            return item;
        }
        return {...item, shouldAnimateInHighlight, hash};
    });
}

/**
 * Highlight rule for transaction rows (flat expenses and report groups): the row's own transaction key
 * matched, or any of its nested transactions matched. Shared by the expense-report and flat-transaction
 * section builders.
 */
function getTransactionRowShouldAnimate(item: SearchListItem, newSearchResultKeys: Set<string> | null | undefined): boolean {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- transaction rows carry a transactionID
    const transactionID = (item as TransactionListItemType).transactionID;
    const isBaseKeyMatch = !!newSearchResultKeys?.has(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- group rows expose nested transactions
    const groupTransactions = (item as TransactionGroupListItemType)?.transactions;
    const isAnyTransactionMatch = groupTransactions?.some((transaction) => !!newSearchResultKeys?.has(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`));

    return isBaseKeyMatch || !!isAnyTransactionMatch;
}

/**
 * Highlight rule for chat rows: the row's report-action key matched.
 */
function getReportActionRowShouldAnimate(item: SearchListItem, newSearchResultKeys: Set<string> | null | undefined): boolean {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- chat rows carry a reportActionID
    const reportActionID = (item as ReportActionListItemType).reportActionID;
    return !!newSearchResultKeys?.has(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportActionID}`);
}

export {stampSearchHighlights, getTransactionRowShouldAnimate, getReportActionRowShouldAnimate};
