import type {TransactionGroupListItemType, TransactionReportGroupListItemType} from '@components/Search/SearchList/ListItem/types';
import {mapEmptyReportToSelectedEntry, mergeRowsIntoPartlyLoadedGroups, stampGroupCoverageFlags} from '@components/Search/selectionBuilders';
import type {SelectedTransactions} from '@components/Search/types';

import type {SearchGroupKey} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import type {SearchDayGroup, SearchResultDataType} from '@src/types/onyx/SearchResults';

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
                loadedChildrenCount: 3,
                loadedSelectableCount: 2,
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
                loadedChildrenCount: 2,
                loadedSelectableCount: 2,
            });

            expect(selected.txn1.isEntireGroupSelected).toBe(false);
            expect(selected.txn1.isSelectedViaGroup).toBe(true);
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
