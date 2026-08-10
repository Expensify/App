import type {TransactionCategoryGroupListItemType, TransactionListItemType} from '@components/Search/SearchList/ListItem/types';
import {buildGroupChildrenIndex, buildShiftRangeItems, isGroupSelected, mapEmptyReportToSelectedEntry} from '@components/Search/selectionBuilders';
import type {SearchData, SelectedTransactions} from '@components/Search/types';

import CONST from '@src/CONST';

import createRandomTransaction from '../../utils/collections/transaction';

/** A fully-typed transaction row: Transaction fields from the shared factory plus the list-item fields. */
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
        // Empty transactions, so this one resolves from the registry
        const groupA = makeGroup('groupA');
        const ownChild = makeChild(1, 'own2');
        // Not in the registry, so this one resolves from its own transactions
        const groupB = makeGroup('groupB', [ownChild]);
        const regChild1 = makeChild(2, 'reg1a');
        const regChild2 = makeChild(3, 'reg1b');
        const filteredData: SearchData = [groupA, groupB];
        const groupChildrenByKey = {groupA: [regChild1, regChild2]};

        const result = buildShiftRangeItems(filteredData, groupChildrenByKey, true);

        expect(result).toEqual([groupA, regChild1, regChild2, groupB, ownChild]);
    });

    it('does not flatten when groups are the selectable unit (groupsAreHeaders=false, e.g. expense-report views): rows pass through unchanged', () => {
        const groupA = makeGroup('groupA');
        const filteredData: SearchData = [groupA];
        const groupChildrenByKey = {groupA: [makeChild(1, 'a1')]};

        const result = buildShiftRangeItems(filteredData, groupChildrenByKey, false);

        expect(result).toBe(filteredData);
    });
});

describe('isGroupSelected', () => {
    const child = makeChild(1, 'c1');

    /** Builds a real selection whose entries are only ever read for `isSelected`, so the empty-report builder supplies a fully typed one. */
    function selectionOf(...keys: string[]): SelectedTransactions {
        const [, entry] = mapEmptyReportToSelectedEntry(makeGroup('anyGroup'));
        return Object.fromEntries(keys.map((key) => [key, entry]));
    }

    it('counts a group selected under its own key, which is how it is stored before its children load', () => {
        expect(isGroupSelected(selectionOf('groupA'), 'groupA', [child])).toBe(true);
    });

    it('counts a group with any child selected', () => {
        expect(isGroupSelected(selectionOf('c1'), 'groupA', [child])).toBe(true);
    });

    it('does not count a group whose key and children are both unselected', () => {
        expect(isGroupSelected(selectionOf('other'), 'groupA', [child])).toBe(false);
    });
});

describe('buildGroupChildrenIndex', () => {
    it('indexes each child against the group it is rendered under', () => {
        const groupA = makeGroup('groupA');
        const ownChild = makeChild(1, 'own1');
        const groupB = makeGroup('groupB', [ownChild]);
        const regChild1 = makeChild(2, 'reg1');
        const regChild2 = makeChild(3, 'reg2');
        const filteredData: SearchData = [groupA, groupB];

        const {childrenByGroupKey, groupKeyByChildKey} = buildGroupChildrenIndex(filteredData, {groupA: [regChild1, regChild2]}, true);

        expect(childrenByGroupKey.get('groupA')).toEqual([regChild1, regChild2]);
        expect(childrenByGroupKey.get('groupB')).toEqual([ownChild]);
        expect(groupKeyByChildKey.get('reg1')).toBe('groupA');
        expect(groupKeyByChildKey.get('reg2')).toBe('groupA');
        expect(groupKeyByChildKey.get('own1')).toBe('groupB');
    });

    it('indexes the same children the range spans, so the two cannot disagree about who owns a row', () => {
        const group = makeGroup('groupA', [makeChild(1, 'stale')]);
        const registered = makeChild(2, 'fresh');
        const filteredData: SearchData = [group];
        const groupChildrenByKey = {groupA: [registered]};

        const {groupKeyByChildKey} = buildGroupChildrenIndex(filteredData, groupChildrenByKey, true);

        expect(buildShiftRangeItems(filteredData, groupChildrenByKey, true)).toEqual([group, registered]);
        expect(groupKeyByChildKey.get('fresh')).toBe('groupA');
        expect(groupKeyByChildKey.has('stale')).toBe(false);
    });

    it('is empty where groups are the selectable unit, since those rows own no children in the list', () => {
        const groupA = makeGroup('groupA');
        const filteredData: SearchData = [groupA];

        const {childrenByGroupKey, groupKeyByChildKey} = buildGroupChildrenIndex(filteredData, {groupA: [makeChild(1, 'a1')]}, false);

        expect(childrenByGroupKey.size).toBe(0);
        expect(groupKeyByChildKey.size).toBe(0);
    });
});
