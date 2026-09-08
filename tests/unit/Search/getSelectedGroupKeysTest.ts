import type {SelectedTransactions} from '@components/Search/types';

import {getSelectedGroupKeys} from '@hooks/useSearchBulkActions';

import CONST from '@src/CONST';

const groupKey = `${CONST.SEARCH.GROUP_PREFIX}42` as const;
const otherGroupKey = `${CONST.SEARCH.GROUP_PREFIX}43` as const;

function buildSelection(entries: Record<string, Partial<SelectedTransactions[string]>>): SelectedTransactions {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test fixtures are intentionally partial selection entries
    return Object.fromEntries(Object.entries(entries).map(([key, entry]) => [key, {isSelected: true, ...entry}])) as SelectedTransactions;
}

describe('getSelectedGroupKeys', () => {
    it('returns each group whose transactions were all selected via the group row', () => {
        const keys = getSelectedGroupKeys(
            buildSelection({
                txn1: {isSelectedViaGroup: true, groupKey},
                txn2: {isSelectedViaGroup: true, groupKey},
                txn3: {isSelectedViaGroup: true, groupKey: otherGroupKey},
            }),
        );

        expect(keys).toEqual([groupKey, otherGroupKey]);
    });

    it('returns an empty group row selected under its own group key', () => {
        expect(getSelectedGroupKeys(buildSelection({[groupKey]: {}}))).toEqual([groupKey]);
    });

    it('skips a group left only partially selected', () => {
        // Deselecting any child clears isSelectedViaGroup for the rest of the group, so the group survives the
        // delete and must not be flagged.
        const keys = getSelectedGroupKeys(
            buildSelection({
                txn1: {isSelectedViaGroup: false, groupKey},
                txn2: {isSelectedViaGroup: false, groupKey},
            }),
        );

        expect(keys).toEqual([]);
    });

    it('skips transactions selected outside of any group', () => {
        expect(getSelectedGroupKeys(buildSelection({txn1: {}, txn2: {}}))).toEqual([]);
    });
});
