import type {SelectedTransactions} from '@components/Search/types';

import {getFullyDeletedGroupKeysByTransactionID, getUnloadedGroupSelectionKeys, getSelectedGroupKeys} from '@hooks/useSearchBulkActions';

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
                txn1: {isEntireGroupSelected: false, groupKey},
                txn2: {isEntireGroupSelected: false, groupKey},
            }),
        );

        expect(keys).toEqual([]);
    });

    it('skips a group whose selected rows do not cover it when the snapshot count is missing', () => {
        // Given two rows of a group, each marked as not covering the whole group, and no snapshot count to check against
        const selection = buildSelection({
            txn1: {isEntireGroupSelected: false, groupKey},
            txn2: {isEntireGroupSelected: false, groupKey},
        });

        // When the groups to delete as a whole are read
        const keys = getSelectedGroupKeys(selection);

        // Then the group is skipped, so a delete removes only the selected rows rather than the whole group
        expect(keys).toEqual([]);
    });

    it('skips transactions selected outside of any group', () => {
        expect(getSelectedGroupKeys(buildSelection({txn1: {}, txn2: {}}))).toEqual([]);
    });

    it('returns a group when every transaction is selected, however the rows were picked', () => {
        // Given both rows of a group of two selected, with nothing recording whether the header or the rows were clicked
        const selection = buildSelection({
            txn1: {groupKey},
            txn2: {groupKey},
        });
        const searchData = buildGroupSearchData({
            [groupKey]: {count: 2, total: 0, currency: 'USD'},
        });

        // When the groups to delete as a whole are read
        const keys = getSelectedGroupKeys(selection, searchData);

        // Then the group is returned, since its selected rows are every expense it has
        expect(keys).toEqual([groupKey]);
    });

    it('skips a group whose loaded selection is smaller than the group count', () => {
        const keys = getSelectedGroupKeys(
            buildSelection({
                txn1: {groupKey},
                txn2: {groupKey},
            }),
            buildGroupSearchData({
                [groupKey]: {count: 5, total: 0, currency: 'USD'},
            }),
        );

        expect(keys).toEqual([]);
    });
});

describe('getUnloadedGroupSelectionKeys', () => {
    it('returns a group selected under its own key, which is how a group with expenses left to load stays selected', () => {
        // Given a group held under its own key because not all of its expenses have loaded
        const selection = buildSelection({[groupKey]: {}});

        // When the groups to export as a filter are read
        const keys = getUnloadedGroupSelectionKeys(selection);

        // Then the group is returned, so the export reaches the expenses that never loaded
        expect(keys).toEqual([groupKey]);
    });

    it('skips the rows of a fully loaded group, which are exported by their own IDs', () => {
        // Given a fully loaded group whose rows carry the selection, with no entry under the group key
        const selection = buildSelection({
            txn1: {isEntireGroupSelected: true, groupKey},
            txn2: {isEntireGroupSelected: true, groupKey},
        });

        // When the groups to export as a filter are read
        const keys = getUnloadedGroupSelectionKeys(selection);

        // Then no group is returned, since the rows themselves are every expense in the group
        expect(keys).toEqual([]);
    });

    it('returns only the groups held under their own key when rows of another group are selected alongside', () => {
        // Given one group held under its own key and the rows of another group selected individually
        const selection = buildSelection({
            [groupKey]: {},
            txn1: {groupKey: otherGroupKey},
        });

        // When the groups to export as a filter are read
        const keys = getUnloadedGroupSelectionKeys(selection);

        // Then only the group held under its own key is returned, and the other group's rows go by their IDs
        expect(keys).toEqual([groupKey]);
    });
});

describe('getFullyDeletedGroupKeysByTransactionID', () => {
    it('maps each selected transaction to its group when that group is fully covered', () => {
        expect(
            getFullyDeletedGroupKeysByTransactionID(
                buildSelection({
                    txn1: {isEntireGroupSelected: true, groupKey},
                    txn2: {isEntireGroupSelected: true, groupKey},
                    txn3: {isEntireGroupSelected: true, groupKey: otherGroupKey},
                }),
            ),
        ).toEqual({
            txn1: groupKey,
            txn2: groupKey,
            txn3: otherGroupKey,
        });
    });

    it('omits transactions from a group that is not fully covered', () => {
        expect(
            getFullyDeletedGroupKeysByTransactionID(
                buildSelection({
                    txn1: {isEntireGroupSelected: false, groupKey},
                    txn2: {isEntireGroupSelected: false, groupKey},
                    txn3: {isEntireGroupSelected: true, groupKey: otherGroupKey},
                }),
            ),
        ).toEqual({
            txn3: otherGroupKey,
        });
    });

    it('omits a truncated group whose loaded selection is smaller than the group count', () => {
        expect(
            getFullyDeletedGroupKeysByTransactionID(
                buildSelection({
                    txn1: {groupKey},
                    txn2: {groupKey},
                }),
                buildGroupSearchData({
                    [groupKey]: {count: 5, total: 0, currency: 'USD'},
                }),
            ),
        ).toEqual({});
    });
});
