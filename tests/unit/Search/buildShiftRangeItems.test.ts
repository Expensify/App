import type {TransactionCategoryGroupListItemType, TransactionListItemType} from '@components/Search/SearchList/ListItem/types';
import {buildShiftRangeItems} from '@components/Search/selectionBuilders';
import type {SearchData} from '@components/Search/types';

import CONST from '@src/CONST';

import createRandomTransaction from '../../utils/collections/transaction';

/** A fully-typed transaction row. The Transaction half comes from the shared factory; the rest are the list-item fields. */
function makeChild(index: number, key: string): TransactionListItemType {
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
    };
}

/** A fully-typed group header. `groupedBy` makes `isGroupedItemArray` treat the list as grouped. */
function makeGroup(key: string, transactions: TransactionListItemType[] = []): TransactionCategoryGroupListItemType {
    return {
        category: key,
        count: transactions.length,
        currency: 'USD',
        total: 0,
        groupedBy: CONST.SEARCH.GROUP_BY.CATEGORY,
        formattedCategory: key,
        transactions,
        transactionsQueryJSON: undefined,
        keyForList: key,
    };
}

describe('buildShiftRangeItems', () => {
    it('passes flat (non-grouped) data through unchanged', () => {
        const filteredData: SearchData = [makeChild(1, 't1'), makeChild(2, 't2')];

        const result = buildShiftRangeItems(filteredData, {}, false);

        expect(result).toBe(filteredData);
    });

    it('interleaves registry children after each group when group.transactions is empty (the regression case)', () => {
        const groupA = makeGroup('groupA');
        const groupB = makeGroup('groupB');
        const childA1 = makeChild(1, 'a1');
        const childA2 = makeChild(2, 'a2');
        const childB1 = makeChild(3, 'b1');
        const filteredData: SearchData = [groupA, groupB];
        const groupChildrenByKey = {
            groupA: [childA1, childA2],
            groupB: [childB1],
        };

        const result = buildShiftRangeItems(filteredData, groupChildrenByKey, true);

        expect(result).toEqual([groupA, childA1, childA2, groupB, childB1]);
    });

    it('falls back to group.transactions when the registry has no entry for that group', () => {
        const childX = makeChild(1, 'x');
        const childY = makeChild(2, 'y');
        const group = makeGroup('groupA', [childX, childY]);
        const filteredData: SearchData = [group];

        const result = buildShiftRangeItems(filteredData, {}, true);

        expect(result).toEqual([group, childX, childY]);
    });

    it('resolves each group independently, mixing registry children and group.transactions, preserving order', () => {
        const groupA = makeGroup('groupA'); // empty transactions, resolved from the registry
        const ownChild = makeChild(1, 'own2');
        const groupB = makeGroup('groupB', [ownChild]); // not in the registry, resolved from its own transactions
        const regChild1 = makeChild(2, 'reg1a');
        const regChild2 = makeChild(3, 'reg1b');
        const filteredData: SearchData = [groupA, groupB];
        const groupChildrenByKey = {groupA: [regChild1, regChild2]};

        const result = buildShiftRangeItems(filteredData, groupChildrenByKey, true);

        expect(result).toEqual([groupA, regChild1, regChild2, groupB, ownChild]);
    });

    it('respects the areItemsGrouped guard: grouped-looking data with areItemsGrouped=false passes through unchanged', () => {
        const groupA = makeGroup('groupA');
        const filteredData: SearchData = [groupA];
        const groupChildrenByKey = {groupA: [makeChild(1, 'a1')]};

        const result = buildShiftRangeItems(filteredData, groupChildrenByKey, false);

        expect(result).toBe(filteredData);
    });
});
