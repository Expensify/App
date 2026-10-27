import type {TransactionListItemType} from '@components/Search/SearchList/ListItem/types';

import type {Transaction} from '@src/types/onyx';

/**
 * Every field that only exists on a Search transaction row and not on a real transaction. Typing it as a record keyed by
 * the difference between both types makes the compiler flag any row field that is added later without being listed here.
 */
const SEARCH_TRANSACTION_ROW_ONLY_FIELDS: Record<Exclude<keyof TransactionListItemType, keyof Transaction>, true> = {
    text: true,
    alternateText: true,
    alternateTextComponent: true,
    accessibilityLabel: true,
    keyForList: true,
    isSelected: true,
    canShowSeveralIndicators: true,
    isDisabledCheckbox: true,
    isDisabled: true,
    shouldHideSelectionButton: true,
    isInteractive: true,
    isBold: true,
    accountID: true,
    login: true,
    leftElement: true,
    rightElement: true,
    actionElement: true,
    icons: true,
    invitedSecondaryLogin: true,
    policyID: true,
    searchText: true,
    brickRoadIndicator: true,
    footerContent: true,
    tabIndex: true,
    shouldAnimateInHighlight: true,
    itemStyle: true,
    titleStyles: true,
    shouldShowRightCaret: true,
    hash: true,
    lang: true,
    report: true,
    submitted: true,
    approved: true,
    exported: true,
    exportedTo: true,
    policy: true,
    reportAction: true,
    holdReportAction: true,
    from: true,
    to: true,
    formattedFrom: true,
    formattedTo: true,
    formattedTotal: true,
    formattedMerchant: true,
    date: true,
    shouldShowMerchant: true,
    shouldShowYear: true,
    shouldShowYearSubmitted: true,
    shouldShowYearApproved: true,
    shouldShowYearPosted: true,
    shouldShowYearExported: true,
    isAmountColumnWide: true,
    isTaxAmountColumnWide: true,
    isActionColumnWide: true,
    selectionGroupKey: true,
    filename: true,
    violations: true,
    allActions: true,
    action: true,
    canPay: true,
    canApprove: true,
    canSubmit: true,
    canChangeApprover: true,
};

const SEARCH_TRANSACTION_ROW_ONLY_FIELD_NAMES = Object.keys(SEARCH_TRANSACTION_ROW_ONLY_FIELDS);

/**
 * Returns the transaction without the display-only fields a Search row adds on top of it, so they never end up in the
 * transactions collection, where they would shadow the real values (e.g. a stale `formattedMerchant` hiding an edited merchant).
 */
function getTransactionFromTransactionListItem(item: Transaction | TransactionListItemType): Transaction {
    const transaction: Transaction = {...item};
    for (const fieldName of SEARCH_TRANSACTION_ROW_ONLY_FIELD_NAMES) {
        Reflect.deleteProperty(transaction, fieldName);
    }
    return transaction;
}

export {SEARCH_TRANSACTION_ROW_ONLY_FIELD_NAMES};

export default getTransactionFromTransactionListItem;
