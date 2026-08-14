import type {TransactionListItemType} from '@components/Search/SearchList/ListItem/types';
import {countFullyExcludedItems, countSelectableItems, mapEmptyReportToSelectedEntry} from '@components/Search/selectionBuilders';
import type {SearchData, SelectedTransactions} from '@components/Search/types';

import CONST from '@src/CONST';

import {buildCategoryGroup, buildTransactionRow} from '../../utils/collections/searchListItems';

const deletedRow = (key: string) => buildTransactionRow(Number(key), key, {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE});

/** Rows taken back out of a wider selection. Only the keys are read here, so any real entry shape will do. */
const exclude = (...keys: string[]): SelectedTransactions => Object.fromEntries(keys.map((key) => [key, mapEmptyReportToSelectedEntry(buildCategoryGroup(key))[1]]));

describe('selection counts', () => {
    describe('countSelectableItems', () => {
        it('counts every row of a flat list', () => {
            const rows: TransactionListItemType[] = [buildTransactionRow(1, '1'), buildTransactionRow(2, '2')];
            expect(countSelectableItems(rows, false)).toBe(2);
        });

        it('counts a group as the rows it carries, skipping the ones being deleted', () => {
            const data: SearchData = [buildCategoryGroup('a', [buildTransactionRow(1, '1'), deletedRow('2')])];
            expect(countSelectableItems(data, true)).toBe(1);
        });

        it('counts a group carrying no rows as one item of its own', () => {
            expect(countSelectableItems([buildCategoryGroup('a')], true)).toBe(1);
        });

        it('counts nothing for a group being deleted', () => {
            const data: SearchData = [{...buildCategoryGroup('a'), pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}];
            expect(countSelectableItems(data, true)).toBe(0);
        });
    });

    // The two counts are compared against each other to decide whether a selection still covers everything, so
    // excluding all of a group's items has to reach exactly the number the total gave it.
    describe('countFullyExcludedItems matches countSelectableItems', () => {
        it('when every row of a group is excluded one by one', () => {
            const data: SearchData = [buildCategoryGroup('a', [buildTransactionRow(1, '1'), buildTransactionRow(2, '2')])];
            expect(countFullyExcludedItems(data, exclude('1', '2'), true)).toBe(countSelectableItems(data, true));
        });

        it('when the group is excluded whole instead of row by row', () => {
            const data: SearchData = [buildCategoryGroup('a', [buildTransactionRow(1, '1'), buildTransactionRow(2, '2')])];
            expect(countFullyExcludedItems(data, exclude('a'), true)).toBe(countSelectableItems(data, true));
        });

        it('when a group carrying no rows is excluded under its own key', () => {
            const data: SearchData = [buildCategoryGroup('a')];
            expect(countFullyExcludedItems(data, exclude('a'), true)).toBe(countSelectableItems(data, true));
        });

        it('when every row a group carries is being deleted, so the group is worth nothing to either count', () => {
            const data: SearchData = [buildCategoryGroup('a', [deletedRow('1')])];
            expect(countSelectableItems(data, true)).toBe(0);
            expect(countFullyExcludedItems(data, exclude('a'), true)).toBe(0);
        });

        it('when a row being deleted is excluded alongside the rest', () => {
            const data: SearchData = [buildCategoryGroup('a', [buildTransactionRow(1, '1'), deletedRow('2')])];
            expect(countFullyExcludedItems(data, exclude('1', '2'), true)).toBe(countSelectableItems(data, true));
        });
    });
});
