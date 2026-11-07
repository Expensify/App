import type {TransactionGroupListItemType, TransactionReportGroupListItemType} from '@components/Search/SearchList/ListItem/types';
import {mapEmptyReportToSelectedEntry, mergeRowsIntoPartlyLoadedGroups, resolveGroupCount, stampGroupCoverageFlags} from '@components/Search/selectionBuilders';
import type {SelectedTransactions} from '@components/Search/types';

import type {SearchGroupKey} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import type {SearchDayGroup, SearchResultDataType} from '@src/types/onyx/SearchResults';

import {buildCategoryGroup, buildTransactionRow} from '../../utils/collections/searchListItems';
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
            // Given a group whose count of three includes a loaded row being deleted, with its other two rows selected
            // When its coverage is stamped
            const selected = stampGroupCoverageFlags({
                selectedTransactions: buildSelection({
                    txn1: {groupKey},
                    txn2: {groupKey},
                }),
                groupKey,
                groupCount: 3,
                loadedRows: [buildTransactionRow(1, 'txn1'), buildTransactionRow(2, 'txn2'), buildTransactionRow(3, 'txn3', {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE})],
            });

            // Then the group is wholly selected, since the selection need not hold a row being deleted
            expect(selected.txn1.isEntireGroupSelected).toBe(true);
            expect(selected.txn2.isEntireGroupSelected).toBe(true);
        });

        it('does not cover a truncated limit selection as the whole group', () => {
            // Given two loaded rows of a five-expense group, both checked through its header
            // When its coverage is stamped
            const selected = stampGroupCoverageFlags({
                selectedTransactions: buildSelection({
                    txn1: {isSelectedViaGroup: true, groupKey},
                    txn2: {isSelectedViaGroup: true, groupKey},
                }),
                groupKey,
                groupCount: 5,
                loadedRows: [buildTransactionRow(1, 'txn1'), buildTransactionRow(2, 'txn2')],
            });

            // Then the group is not wholly selected, so delete cannot take three rows it never loaded
            expect(selected.txn1.isEntireGroupSelected).toBe(false);
            expect(selected.txn1.isSelectedViaGroup).toBe(true);
        });

        it('does not let rows kept off the page prove a partly loaded group whole, since any of them can be stale', () => {
            // Given a three-expense group with its one loaded row checked, next to two rows kept off the page
            const selection = buildSelection({
                txn1: {groupKey},
                txn2: {groupKey},
                txn3: {groupKey},
            });

            // When its coverage is stamped
            const selected = stampGroupCoverageFlags({selectedTransactions: selection, groupKey, groupCount: 3, loadedRows: [buildTransactionRow(1, 'txn1')]});

            // Then the group is not wholly selected, since only rows on the page can prove it
            expect(selected.txn1.isEntireGroupSelected).toBe(false);
        });
    });

    describe('resolveGroupCount', () => {
        // A group of two shown rows whose group-by count still holds a third expense that left it
        const shownRows = [buildTransactionRow(1, 'txn1'), buildTransactionRow(2, 'txn2')];
        const buildGroup = (hasMoreTransactions: boolean | undefined) => ({...buildCategoryGroup(groupKey, shownRows), count: 3, hasMoreTransactions});

        it('takes the rows a group shows once its own search has returned every expense', () => {
            // Given a group whose own search has nothing more to load
            // When its count is resolved
            // Then it is the two rows it shows, since nothing lowers the group-by count until that search runs again
            expect(resolveGroupCount(buildGroup(false))).toBe(2);
        });

        it('takes the group-by count for a group with more to load, or one whose own search has not answered', () => {
            // Given a group whose own search has more to load, and one whose own search has not answered yet
            // When their counts are resolved
            // Then both are the group-by count, since their rows are not the whole group
            expect(resolveGroupCount(buildGroup(true))).toBe(3);
            expect(resolveGroupCount(buildGroup(undefined))).toBe(3);
        });
    });

    describe('mergeRowsIntoPartlyLoadedGroups', () => {
        const otherGroupKey: SearchGroupKey = `${CONST.SEARCH.GROUP_PREFIX}43`;

        it('puts one entry for the whole group in place of its loaded rows when they were checked through the header', () => {
            // Given two loaded rows of a 692-expense group checked through its header, next to a row of another group
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

            // Then the group appears once with its full total, and the other row is kept as it was
            expect(Object.keys(merged)).toEqual(['txn3', groupKey]);
            expect(merged[groupKey]).toEqual(expect.objectContaining({displayAmount: 12990, currency: CONST.CURRENCY.USD}));
            expect(merged.txn3).toBe(selection.txn3);
        });

        it('keeps the workspace of the rows it replaces, and whether they all come from one-expense reports', () => {
            // Given two loaded rows of a 692-expense group on one workspace, each from a one-expense report
            const searchData = buildDayGroupData([[groupKey, {count: 692, total: 12990}]]);
            const selection = buildSelection({
                txn1: {isSelectedViaGroup: true, groupKey, policyID: 'policy1', isFromOneTransactionReport: true},
                txn2: {isSelectedViaGroup: true, groupKey, policyID: 'policy1', isFromOneTransactionReport: true},
            });

            // When the rows are merged into the groups they stand for
            const merged = mergeRowsIntoPartlyLoadedGroups(selection, searchData, false);

            // Then the group's entry keeps both, since the Export menu picks its options from them
            expect(merged[groupKey]).toEqual(expect.objectContaining({policyID: 'policy1', isFromOneTransactionReport: true}));
        });

        it('keeps neither when the rows it replaces disagree', () => {
            // Given two loaded rows of a 692-expense group on different workspaces, only one from a one-expense report
            const searchData = buildDayGroupData([[groupKey, {count: 692, total: 12990}]]);
            const selection = buildSelection({
                txn1: {isSelectedViaGroup: true, groupKey, policyID: 'policy1', isFromOneTransactionReport: true},
                txn2: {isSelectedViaGroup: true, groupKey, policyID: 'policy2', isFromOneTransactionReport: false},
            });

            // When the rows are merged into the groups they stand for
            const merged = mergeRowsIntoPartlyLoadedGroups(selection, searchData, false);

            // Then the group's entry claims neither, since no single workspace or report type describes its rows
            expect(merged[groupKey]).toEqual(expect.objectContaining({policyID: CONST.POLICY.ID_FAKE, isFromOneTransactionReport: false}));
        });

        it('folds a row of the group checked one by one into the group entry, rather than counting it a second time', () => {
            // Given a loaded row of a ten-expense group checked through its header, and another row of it checked on its own
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

        it('puts one entry for the whole group in place of rows that outnumber it, since some of them left the group unseen', () => {
            // Given three rows that covered a group, kept after one was deleted elsewhere and the count fell to two
            const searchData = buildDayGroupData([[groupKey, {count: 2, total: 20}]]);
            const selection = buildSelection({
                txn1: {groupKey, isEntireGroupSelected: true, displayAmount: 10},
                txn2: {groupKey, isEntireGroupSelected: true, displayAmount: 10},
                txn3: {groupKey, isEntireGroupSelected: true, displayAmount: 10, isKeptOffPage: true},
            });

            // When the rows are merged into the groups they stand for
            const merged = mergeRowsIntoPartlyLoadedGroups(selection, searchData, false);

            // Then the group appears once with the server's figures, so the deleted expense is neither counted nor acted on
            expect(Object.keys(merged)).toEqual([groupKey]);
            expect(merged[groupKey]).toEqual(expect.objectContaining({displayAmount: 20}));
        });

        it('puts one entry for the whole group in place of rows checked through its header that match its count without covering it', () => {
            // Given three rows standing for a four-expense group, one deleted elsewhere, after a refresh brought the count to three
            const searchData = buildDayGroupData([[groupKey, {count: 3, total: 30}]]);
            const selection = buildSelection({
                txn1: {isSelectedViaGroup: true, groupKey, isEntireGroupSelected: false, displayAmount: 10},
                txn2: {isSelectedViaGroup: true, groupKey, isEntireGroupSelected: false, displayAmount: 10},
                txn3: {isSelectedViaGroup: true, groupKey, isEntireGroupSelected: false, displayAmount: 10},
            });

            // When the rows are merged into the groups they stand for
            const merged = mergeRowsIntoPartlyLoadedGroups(selection, searchData, false);

            // Then the group appears once, so no row action takes the deleted expense or misses the one still to load
            expect(Object.keys(merged)).toEqual([groupKey]);
        });

        it('keeps the rows of a wholly selected group holding one kept off the page, since the server figures can still include an expense deleted since', () => {
            // Given a wholly selected group with a row off the page, after an expense was deleted while the server still reads three and 300
            const searchData = buildDayGroupData([[groupKey, {count: 3, total: 300}]]);
            const selection = buildSelection({
                txn2: {groupKey, isEntireGroupSelected: true, displayAmount: 100},
                txn3: {groupKey, isEntireGroupSelected: true, displayAmount: 100, isKeptOffPage: true},
            });

            // When the rows are merged for the count, the total and the bulk actions
            const merged = mergeRowsIntoPartlyLoadedGroups(selection, searchData, false);

            // Then the two selected rows stay, so the count and total are two and 200, and Delete or Hold stay on offer
            expect(merged).toBe(selection);
        });

        it('leaves loaded rows that outnumber the count alone, since the count is only behind an expense that moved in', () => {
            // Given four loaded rows that covered a group, one just moved in while the count still reads three
            const searchData = buildDayGroupData([[groupKey, {count: 3, total: 30}]]);
            const selection = buildSelection({
                txn1: {groupKey, isEntireGroupSelected: true},
                txn2: {groupKey, isEntireGroupSelected: true},
                txn3: {groupKey, isEntireGroupSelected: true},
                txn4: {groupKey, isEntireGroupSelected: true},
            });

            // When the rows are merged into the groups they stand for
            const merged = mergeRowsIntoPartlyLoadedGroups(selection, searchData, false);

            // Then nothing changes, since only a row kept off the page can have left unseen
            expect(merged).toBe(selection);
        });

        it('leaves the selection alone under Select all, where the query already covers the rows not loaded', () => {
            // Given two loaded rows of a 692-expense group checked through its header, under Select all
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
