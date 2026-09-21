import type {TransactionCategoryGroupListItemType, TransactionListItemType, TransactionReportGroupListItemType} from '@components/Search/SearchList/ListItem/types';
import type {SearchQueryJSON} from '@components/Search/types';

import CONST from '@src/CONST';

import createPersonalDetails from './personalDetails';
import {createRandomReport} from './reports';
import createRandomTransaction from './transaction';

/** A fully-typed transaction row: Transaction fields from the shared factory plus the list-item fields. */
function buildTransactionRow(index: number, key: string, overrides: Partial<TransactionListItemType> = {}): TransactionListItemType {
    return {
        ...createRandomTransaction(index),
        // `Transaction.errors` (ReceiptErrors) widens past `ListItem.errors`, so pin it for the intersection.
        errors: undefined,
        report: undefined,
        policy: undefined,
        reportAction: undefined,
        holdReportAction: undefined,
        from: {accountID: index},
        to: {accountID: index},
        formattedFrom: '',
        formattedTo: '',
        formattedTotal: 0,
        formattedMerchant: '',
        date: '',
        shouldShowMerchant: false,
        shouldShowYear: false,
        shouldShowYearSubmitted: false,
        shouldShowYearApproved: false,
        shouldShowYearPosted: false,
        shouldShowYearExported: false,
        isAmountColumnWide: false,
        isTaxAmountColumnWide: false,
        keyForList: key,
        transactionID: key,
        allActions: [CONST.SEARCH.ACTION_TYPES.VIEW],
        action: CONST.SEARCH.ACTION_TYPES.VIEW,
        canPay: false,
        canApprove: false,
        canSubmit: false,
        canChangeApprover: false,
        ...overrides,
    };
}

/** A fully-typed group header. `groupedBy` makes `isGroupedItemArray` treat the list as grouped. */
function buildCategoryGroup(key: string, transactions: TransactionListItemType[] = [], transactionsQueryJSON?: SearchQueryJSON): TransactionCategoryGroupListItemType {
    return {
        category: key,
        count: transactions.length,
        currency: 'USD',
        total: 0,
        groupedBy: CONST.SEARCH.GROUP_BY.CATEGORY,
        formattedCategory: key,
        transactions,
        transactionsQueryJSON,
        keyForList: key,
    };
}

/** A fully-typed expense-report group, which is itself a selectable row. */
function buildReportGroup(index: number, key: string, transactions: TransactionListItemType[] = []): TransactionReportGroupListItemType {
    return {
        ...createRandomReport(index),
        reportID: key,
        groupedBy: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
        from: createPersonalDetails(index),
        to: createPersonalDetails(index),
        transactions,
        keyForList: key,
        shouldShowYear: false,
        shouldShowYearSubmitted: false,
        shouldShowYearApproved: false,
        shouldShowYearExported: false,
        action: CONST.SEARCH.ACTION_TYPES.VIEW,
        allActions: [CONST.SEARCH.ACTION_TYPES.VIEW],
        canPay: false,
        canApprove: false,
        canSubmit: false,
        canChangeApprover: false,
    };
}

export {buildTransactionRow, buildCategoryGroup, buildReportGroup};
