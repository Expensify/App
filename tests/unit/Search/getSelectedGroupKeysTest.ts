import type {SelectedTransactions} from '@components/Search/types';

import {getSelectedGroupKeys} from '@hooks/useSearchBulkActions';

import type {SearchGroupKey} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import type {SearchGroupBase, SearchResultDataType} from '@src/types/onyx/SearchResults';

const groupKey = `${CONST.SEARCH.GROUP_PREFIX}42` as const;
const otherGroupKey = `${CONST.SEARCH.GROUP_PREFIX}43` as const;

function buildSelection(entries: Record<string, Partial<SelectedTransactions[string]>>): SelectedTransactions {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test fixtures are intentionally partial selection entries
    return Object.fromEntries(Object.entries(entries).map(([key, entry]) => [key, {isSelected: true, ...entry}])) as SelectedTransactions;
}

function buildGroupSearchData(groups: Partial<Record<SearchGroupKey, SearchGroupBase>>): SearchResultDataType {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- tests only supply group snapshot fields
    return groups as unknown as SearchResultDataType;
}

describe('getSelectedGroupKeys', () => {
    it('returns each group whose selected children cover the whole group', () => {
        const keys = getSelectedGroupKeys(
            buildSelection({
                txn1: {isEntireGroupSelected: true, groupKey},
                txn2: {isEntireGroupSelected: true, groupKey},
                txn3: {isEntireGroupSelected: true, groupKey: otherGroupKey},
            }),
        );

        expect(keys).toEqual([groupKey, otherGroupKey]);
    });

    it('returns an empty group row selected under its own group key', () => {
        expect(getSelectedGroupKeys(buildSelection({[groupKey]: {}}))).toEqual([groupKey]);
    });

    it('skips a group left only partially selected', () => {
        const keys = getSelectedGroupKeys(
            buildSelection({
                txn1: {isEntireGroupSelected: false, isSelectedViaGroup: false, groupKey},
                txn2: {isEntireGroupSelected: false, isSelectedViaGroup: false, groupKey},
            }),
        );

        expect(keys).toEqual([]);
    });

    it('skips a group selected via the group row when the snapshot count is missing and the group is not fully covered', () => {
        expect(
            getSelectedGroupKeys(
                buildSelection({
                    txn1: {isSelectedViaGroup: true, isEntireGroupSelected: false, groupKey},
                    txn2: {isSelectedViaGroup: true, isEntireGroupSelected: false, groupKey},
                }),
            ),
        ).toEqual([]);
    });

    it('skips transactions selected outside of any group', () => {
        expect(getSelectedGroupKeys(buildSelection({txn1: {}, txn2: {}}))).toEqual([]);
    });

    it('returns a group when every transaction is selected even without isSelectedViaGroup', () => {
        const keys = getSelectedGroupKeys(
            buildSelection({
                txn1: {groupKey},
                txn2: {groupKey},
            }),
            buildGroupSearchData({
                [groupKey]: {count: 2, total: 0, currency: 'USD'},
            }),
        );

        expect(keys).toEqual([groupKey]);
    });

    it('skips a group whose loaded selection is smaller than the group count', () => {
        const keys = getSelectedGroupKeys(
            buildSelection({
                txn1: {isSelectedViaGroup: true, groupKey},
                txn2: {isSelectedViaGroup: true, groupKey},
            }),
            buildGroupSearchData({
                [groupKey]: {count: 5, total: 0, currency: 'USD'},
            }),
        );

        expect(keys).toEqual([]);
    });
});
