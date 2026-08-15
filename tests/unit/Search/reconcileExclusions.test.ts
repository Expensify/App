import {mapEmptyReportToSelectedEntry, reconcileExclusions} from '@components/Search/selectionBuilders';
import type {SelectedTransactions} from '@components/Search/types';

import {buildCategoryGroup} from '../../utils/collections/searchListItems';

const GROUP_KEY = 'Advertising';

/** A real entry, so the fixtures carry the shape the provider writes. `groupKey` is what says which group covers a row. */
const entry = (key: string, groupKey?: string, isSelectedViaGroup?: boolean): SelectedTransactions => {
    const [, built] = mapEmptyReportToSelectedEntry(buildCategoryGroup(key));
    return {[key]: {...built, ...(groupKey ? {groupKey} : {}), ...(isSelectedViaGroup ? {isSelectedViaGroup} : {})}};
};

const EMPTY: SelectedTransactions = {};

const reconcile = (params: Partial<Parameters<typeof reconcileExclusions>[0]>) =>
    reconcileExclusions({
        previousSelectedTransactions: EMPTY,
        selectedTransactions: EMPTY,
        excludedTransactions: EMPTY,
        deselectedWithoutEntry: EMPTY,
        ...params,
    });

describe('reconcileExclusions', () => {
    it('excludes a row that left the selection', () => {
        const result = reconcile({previousSelectedTransactions: entry('1'), selectedTransactions: EMPTY});
        expect(Object.keys(result)).toEqual(['1']);
    });

    it('stops excluding a row that entered it', () => {
        const result = reconcile({selectedTransactions: entry('1'), excludedTransactions: entry('1')});
        expect(result['1']).toBeUndefined();
    });

    it('excludes a row the caller names, since a row that was never in the selection cannot be seen to leave it', () => {
        const result = reconcile({deselectedWithoutEntry: entry('1')});
        expect(Object.keys(result)).toEqual(['1']);
    });

    it('ignores a named row that is in the selection, since it did not leave', () => {
        const result = reconcile({selectedTransactions: entry('1'), deselectedWithoutEntry: entry('1')});
        expect(result['1']).toBeUndefined();
    });

    it('stops excluding a group once a row selected as part of it puts the group back', () => {
        const result = reconcile({selectedTransactions: entry('1', GROUP_KEY, true), excludedTransactions: entry(GROUP_KEY)});
        expect(result[GROUP_KEY]).toBeUndefined();
    });

    it('keeps a group excluded when one of its rows is re-checked on its own, since the rest are still out', () => {
        const result = reconcile({selectedTransactions: entry('1', GROUP_KEY), excludedTransactions: entry(GROUP_KEY)});
        expect(result[GROUP_KEY]).toBeDefined();
    });

    it('drops a row exclusion its group already covers, so the same rows are not counted twice', () => {
        const result = reconcile({excludedTransactions: {...entry(GROUP_KEY), ...entry('1', GROUP_KEY)}});
        expect(Object.keys(result)).toEqual([GROUP_KEY]);
    });

    it('prunes a chain of covered exclusions the same way whichever it reaches first', () => {
        // A row under a group that is itself recorded under another group, keyed so the parent is reached first.
        const chained = {...entry('G0'), ...entry('G1', 'G0'), ...entry('rowA', 'G1')};
        expect(Object.keys(reconcile({excludedTransactions: chained}))).toEqual(['G0']);
    });

    // The order the two group rules run in is the whole reason they live in one function.
    it('keeps a row that left the selection excluded when the same gesture put its group back', () => {
        const result = reconcile({
            previousSelectedTransactions: entry('2', GROUP_KEY),
            selectedTransactions: entry('1', GROUP_KEY, true),
            excludedTransactions: entry(GROUP_KEY),
        });
        expect(result[GROUP_KEY]).toBeUndefined();
        expect(result['2']).toBeDefined();
    });
});
