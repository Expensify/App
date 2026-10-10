import type {TransactionGroupListItemType, TransactionReportGroupListItemType} from '@components/Search/SearchList/ListItem/types';
import {mapEmptyReportToSelectedEntry, mergeRowsIntoPartlyLoadedGroups, stampGroupCoverageFlags} from '@components/Search/selectionBuilders';
import type {SelectedTransactions} from '@components/Search/types';

import type {SearchGroupKey} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import type {SearchDayGroup, SearchResultDataType} from '@src/types/onyx/SearchResults';

import {buildTransactionRow} from '../../utils/collections/searchListItems';
import createMock from '../../utils/createMock';

const groupKey: SearchGroupKey = `${CONST.SEARCH.GROUP_PREFIX}42`;

function buildSelection(entries: Record<string, Partial<SelectedTransactions[string]>>): SelectedTransactions {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return Object.fromEntries(Object.entries(entries).map(([key, entry]) => [key, {isSelected: true, ...entry}])) as SelectedTransactions;
}

function buildDayGroupData(groups: Array<[SearchGroupKey, Omit<SearchDayGroup, 'currency' | 'day'>]>): SearchResultDataType {
    const data: SearchResultDataType = {};
    for (const [key, group] of groups) {
        data[key] = {...group, currency: CONST.CURRENCY.USD, day: '2026-10-07'};
    }
    return data;
}

describe('selectionBuilders', () => {
    describe('mapEmptyReportToSelectedEntry', () => {
        it('takes displayAmount from the report-signed total for a report row', () => {
            // totalDisplaySpend is already negated for expense reports, so a credit report keeps its negative sign.
            const item = createMock<TransactionReportGroupListItemType>({
                keyForList: 'report1',
                reportID: 'report1',
                policyID: 'policy1',
                currency: CONST.CURRENCY.USD,
                groupedBy: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT,
                transactions: [],
                total: 10000,
                totalDisplaySpend: -10000,
            });

            const [, entry] = mapEmptyReportToSelectedEntry(item);

            expect(entry.displayAmount).toBe(-10000);
        });

        it('takes displayAmount from the group total for a group row', () => {
            const item = createMock<TransactionGroupListItemType>({
                keyForList: `${CONST.SEARCH.GROUP_PREFIX}category1`,
                reportID: undefined,
                policyID: 'policy1',
                currency: CONST.CURRENCY.USD,
                transactions: [],
                total: -4000,
            });

            const [, entry] = mapEmptyReportToSelectedEntry(item);

            expect(entry.displayAmount).toBe(-4000);
        });
    });

    describe('stampGroupCoverageFlags', () => {
        it('covers the remaining children when snapshot count still includes pending-delete rows', () => {
            const selected = stampGroupCoverageFlags({
                selectedTransactions: buildSelection({
                    txn1: {groupKey},
                    txn2: {groupKey},
                }),
                groupKey,
                groupCount: 3,
                loadedRows: [buildTransactionRow(1, 'txn1'), buildTransactionRow(2, 'txn2'), buildTransactionRow(3, 'txn3', {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE})],
            });

            expect(selected.txn1.isEntireGroupSelected).toBe(true);
            expect(selected.txn2.isEntireGroupSelected).toBe(true);
        });

        it('does not cover a truncated limit selection as the whole group', () => {
            const selected = stampGroupCoverageFlags({
                selectedTransactions: buildSelection({
                    txn1: {isSelectedViaGroup: true, groupKey},
                    txn2: {isSelectedViaGroup: true, groupKey},
                }),
                groupKey,
                groupCount: 5,
                loadedRows: [buildTransactionRow(1, 'txn1'), buildTransactionRow(2, 'txn2')],
            });

            expect(selected.txn1.isEntireGroupSelected).toBe(false);
            expect(selected.txn1.isSelectedViaGroup).toBe(true);
        });

        it('does not cover the group while a loaded row is unchecked, even when rows kept off the page make up the count', () => {
            // Given a group of two whose one loaded row was just unchecked, with two rows a refresh kept off the page, one of them deleted elsewhere
            const selection = buildSelection({
                txn2: {groupKey},
                txn3: {groupKey},
            });

            // When its coverage is stamped
            const selected = stampGroupCoverageFlags({selectedTransactions: selection, groupKey, groupCount: 2, loadedRows: [buildTransactionRow(1, 'txn1')]});

            // Then the group is not wholly selected, so a bulk delete takes only the checked rows and leaves the unchecked one on screen
            expect(selected.txn2.isEntireGroupSelected).toBe(false);
            expect(selected.txn3.isEntireGroupSelected).toBe(false);
        });

        it('does not let rows kept off the page prove a partly loaded group whole, since any of them can be stale', () => {
            // Given a three-expense group whose one loaded row is checked, next to two rows a refresh kept off the page, with no earlier coverage to keep
            const selection = buildSelection({
                txn1: {groupKey},
                txn2: {groupKey},
                txn3: {groupKey},
            });

            // When its coverage is stamped
            const selected = stampGroupCoverageFlags({selectedTransactions: selection, groupKey, groupCount: 3, loadedRows: [buildTransactionRow(1, 'txn1')]});

            // Then the group is not wholly selected, even though the three rows match the count, since only rows on the page can prove it
            expect(selected.txn1.isEntireGroupSelected).toBe(false);
        });
    });

    describe('mergeRowsIntoPartlyLoadedGroups', () => {
        const otherGroupKey: SearchGroupKey = `${CONST.SEARCH.GROUP_PREFIX}43`;

        it('puts one entry for the whole group in place of its loaded rows when they were checked through the header', () => {
            // Given two loaded rows of a 692-expense group checked through its header, next to a row of another group checked on its own
            const searchData = buildDayGroupData([
                [groupKey, {count: 692, total: 12990}],
                [otherGroupKey, {count: 2, total: 30}],
            ]);
            const selection = buildSelection({
                txn1: {isSelectedViaGroup: true, groupKey, displayAmount: 10},
                txn2: {isSelectedViaGroup: true, groupKey, displayAmount: 10},
                txn3: {groupKey: otherGroupKey, displayAmount: 15},
            });

            // When the rows are merged into the groups they stand for
            const merged = mergeRowsIntoPartlyLoadedGroups(selection, searchData, false);

            // Then the group appears once with its full total, as an export covers it, and the row checked on its own is kept as it was
            expect(Object.keys(merged)).toEqual(['txn3', groupKey]);
            expect(merged[groupKey]).toEqual(expect.objectContaining({displayAmount: 12990, currency: CONST.CURRENCY.USD}));
            expect(merged.txn3).toBe(selection.txn3);
        });

        it('folds a row of the group checked one by one into the group entry, rather than counting it a second time', () => {
            // Given a loaded row of a ten-expense group checked through its header, and a row of the same group checked on its own on a page a refresh left out
            const searchData = buildDayGroupData([[groupKey, {count: 10, total: 100}]]);
            const selection = buildSelection({
                txn1: {isSelectedViaGroup: true, groupKey, displayAmount: 10},
                txn7: {groupKey, displayAmount: 10},
            });

            // When the rows are merged into the groups they stand for
            const merged = mergeRowsIntoPartlyLoadedGroups(selection, searchData, false);

            // Then only the group's entry is left, so a count says ten and a total adds the row once
            expect(Object.keys(merged)).toEqual([groupKey]);
        });

        it('leaves the selection alone once every row of the group is loaded', () => {
            // Given both rows of a two-expense group checked through its header
            const searchData = buildDayGroupData([[groupKey, {count: 2, total: 20}]]);
            const selection = buildSelection({
                txn1: {isSelectedViaGroup: true, groupKey},
                txn2: {isSelectedViaGroup: true, groupKey},
            });

            // When the rows are merged into the groups they stand for
            const merged = mergeRowsIntoPartlyLoadedGroups(selection, searchData, false);

            // Then nothing changes, because the loaded rows already count as the whole group
            expect(merged).toBe(selection);
        });

        it('leaves the selection alone when the group count still includes rows being deleted', () => {
            // Given the two rows left of a group whose snapshot count of 3 still includes a row being deleted, stamped as covering the group
            const searchData = buildDayGroupData([[groupKey, {count: 3, total: 30}]]);
            const selection = buildSelection({
                txn1: {isSelectedViaGroup: true, groupKey, isEntireGroupSelected: true},
                txn2: {isSelectedViaGroup: true, groupKey, isEntireGroupSelected: true},
            });

            // When the rows are merged into the groups they stand for
            const merged = mergeRowsIntoPartlyLoadedGroups(selection, searchData, false);

            // Then nothing changes, because the rows already cover what is left of the group
            expect(merged).toBe(selection);
        });

        it('puts one entry for the whole group in place of rows that outnumber it, since some of them left the group unseen', () => {
            // Given three rows of a group checked whole through its header, kept after one of them was deleted elsewhere and the group's count fell to two
            const searchData = buildDayGroupData([[groupKey, {count: 2, total: 20}]]);
            const selection = buildSelection({
                txn1: {isSelectedViaGroup: true, groupKey, isEntireGroupSelected: true, displayAmount: 10},
                txn2: {isSelectedViaGroup: true, groupKey, isEntireGroupSelected: true, displayAmount: 10},
                txn3: {isSelectedViaGroup: true, groupKey, isEntireGroupSelected: true, displayAmount: 10},
            });

            // When the rows are merged into the groups they stand for
            const merged = mergeRowsIntoPartlyLoadedGroups(selection, searchData, false);

            // Then the group appears once with the server's count and total, so the deleted expense is neither counted nor sent to an action
            expect(Object.keys(merged)).toEqual([groupKey]);
            expect(merged[groupKey]).toEqual(expect.objectContaining({displayAmount: 20}));
        });

        it('puts one entry for the whole group in place of rows checked through its header that match its count without covering it', () => {
            // Given three rows standing for a four-expense group checked through its header, one of them deleted elsewhere, after a refresh brought the count to three with one row loaded
            const searchData = buildDayGroupData([[groupKey, {count: 3, total: 30}]]);
            const selection = buildSelection({
                txn1: {isSelectedViaGroup: true, groupKey, isEntireGroupSelected: false, displayAmount: 10},
                txn2: {isSelectedViaGroup: true, groupKey, isEntireGroupSelected: false, displayAmount: 10},
                txn3: {isSelectedViaGroup: true, groupKey, isEntireGroupSelected: false, displayAmount: 10},
            });

            // When the rows are merged into the groups they stand for
            const merged = mergeRowsIntoPartlyLoadedGroups(selection, searchData, false);

            // Then the group appears once, as the stamp found it not wholly selected, so no row action takes the deleted expense or misses the one still to load
            expect(Object.keys(merged)).toEqual([groupKey]);
        });

        it('puts one entry for the whole group in place of rows that cover it when some are kept off the page, so its total is the server one', () => {
            // Given a wholly selected three-expense group whose third row a refresh kept off the page at its old amount, while the server's total for the group has since moved to 500
            const searchData = buildDayGroupData([[groupKey, {count: 3, total: 500}]]);
            const selection = buildSelection({
                txn1: {groupKey, isEntireGroupSelected: true, displayAmount: 100},
                txn2: {groupKey, isEntireGroupSelected: true, displayAmount: 100},
                txn3: {groupKey, isEntireGroupSelected: true, displayAmount: 100, isKeptOffPage: true},
            });

            // When the rows are merged into the groups they stand for
            const merged = mergeRowsIntoPartlyLoadedGroups(selection, searchData, false);

            // Then the group appears once with the server's total, rather than the 300 its rows would add up to
            expect(Object.keys(merged)).toEqual([groupKey]);
            expect(merged[groupKey]).toEqual(expect.objectContaining({displayAmount: 500}));
        });

        it('puts one entry for the whole group in place of rows checked one by one that outnumber it, once they covered the group', () => {
            // Given three rows of a group each checked on its own, which covered it, kept after one of them was deleted elsewhere and the group's count fell to two
            const searchData = buildDayGroupData([[groupKey, {count: 2, total: 20}]]);
            const selection = buildSelection({
                txn1: {groupKey, isEntireGroupSelected: true, displayAmount: 10},
                txn2: {groupKey, isEntireGroupSelected: true, displayAmount: 10},
                txn3: {groupKey, isEntireGroupSelected: true, displayAmount: 10},
            });

            // When the rows are merged into the groups they stand for
            const merged = mergeRowsIntoPartlyLoadedGroups(selection, searchData, false);

            // Then the group appears once with the server's count and total, as it does for a group checked through its header
            expect(Object.keys(merged)).toEqual([groupKey]);
            expect(merged[groupKey]).toEqual(expect.objectContaining({displayAmount: 20}));
        });

        it('leaves the selection alone under Select all, where the query already covers the rows not loaded', () => {
            // Given two loaded rows of a 692-expense group checked through its header, with every matching expense selected
            const searchData = buildDayGroupData([[groupKey, {count: 692, total: 12990}]]);
            const selection = buildSelection({
                txn1: {isSelectedViaGroup: true, groupKey},
                txn2: {isSelectedViaGroup: true, groupKey},
            });

            // When the rows are merged into the groups they stand for
            const merged = mergeRowsIntoPartlyLoadedGroups(selection, searchData, true);

            // Then nothing changes, because every action under Select all sends the query rather than the rows
            expect(merged).toBe(selection);
        });
    });
});
