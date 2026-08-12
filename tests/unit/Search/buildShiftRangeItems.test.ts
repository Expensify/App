import {buildGroupChildrenIndex, buildShiftRangeItems, isGroupSelected, mapEmptyReportToSelectedEntry} from '@components/Search/selectionBuilders';
import type {SearchData, SelectedTransactions} from '@components/Search/types';

import {buildCategoryGroup as makeGroup, buildTransactionRow as makeChild} from '../../utils/collections/searchListItems';

const openGroups = (...keys: string[]): ReadonlySet<string> => new Set(keys);

const NO_OPEN_GROUPS = openGroups();

describe('buildShiftRangeItems', () => {
    it('passes flat (non-grouped) data through unchanged', () => {
        const filteredData: SearchData = [makeChild(1, 't1'), makeChild(2, 't2')];

        const result = buildShiftRangeItems(filteredData, {}, NO_OPEN_GROUPS, false);

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

        const result = buildShiftRangeItems(filteredData, groupChildrenByKey, openGroups('groupA', 'groupB'), true);

        expect(result).toEqual([groupA, childA1, childA2, groupB, childB1]);
    });

    it('skips the rows a closed group still carries, since a range must not reach what is off screen', () => {
        // A group that was open earlier keeps its children in `transactions`, because the sub-snapshot stays cached
        const group = makeGroup('groupA', [makeChild(1, 'x'), makeChild(2, 'y')]);
        const filteredData: SearchData = [group];

        const result = buildShiftRangeItems(filteredData, {}, NO_OPEN_GROUPS, true);

        expect(result).toEqual([group]);
    });

    it('skips a closed group even while its children are still published, since openness is what decides', () => {
        const group = makeGroup('groupA');
        const filteredData: SearchData = [group];
        const groupChildrenByKey = {groupA: [makeChild(1, 'a1'), makeChild(2, 'a2')]};

        const result = buildShiftRangeItems(filteredData, groupChildrenByKey, NO_OPEN_GROUPS, true);

        expect(result).toEqual([group]);
    });

    it('resolves each group independently, so an open group contributes its rows and a closed one contributes none', () => {
        const openGroup = makeGroup('groupA');
        // Closed, but still carrying the rows it loaded when it was open
        const closedGroup = makeGroup('groupB', [makeChild(1, 'own2')]);
        const regChild1 = makeChild(2, 'reg1a');
        const regChild2 = makeChild(3, 'reg1b');
        const filteredData: SearchData = [openGroup, closedGroup];
        const groupChildrenByKey = {groupA: [regChild1, regChild2], groupB: [makeChild(4, 'reg2a')]};

        const result = buildShiftRangeItems(filteredData, groupChildrenByKey, openGroups('groupA'), true);

        expect(result).toEqual([openGroup, regChild1, regChild2, closedGroup]);
    });

    it('does not flatten when groups are the selectable unit (groupsAreHeaders=false, e.g. expense-report views): rows pass through unchanged', () => {
        const groupA = makeGroup('groupA');
        const filteredData: SearchData = [groupA];
        const groupChildrenByKey = {groupA: [makeChild(1, 'a1')]};

        const result = buildShiftRangeItems(filteredData, groupChildrenByKey, openGroups('groupA'), false);

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
    it('indexes each child against the group it is rendered under, and indexes nothing for a closed group', () => {
        const openGroup = makeGroup('groupA');
        // Closed, but still carrying the rows it loaded when it was open
        const closedGroup = makeGroup('groupB', [makeChild(1, 'own1')]);
        const regChild1 = makeChild(2, 'reg1');
        const regChild2 = makeChild(3, 'reg2');
        const filteredData: SearchData = [openGroup, closedGroup];

        const {childrenByGroupKey, groupKeyByChildKey} = buildGroupChildrenIndex(filteredData, {groupA: [regChild1, regChild2]}, openGroups('groupA'), true);

        expect(childrenByGroupKey.get('groupA')).toEqual([regChild1, regChild2]);
        expect(childrenByGroupKey.get('groupB')).toEqual([]);
        expect(groupKeyByChildKey.get('reg1')).toBe('groupA');
        expect(groupKeyByChildKey.get('reg2')).toBe('groupA');
        expect(groupKeyByChildKey.has('own1')).toBe(false);
    });

    it('indexes the same children the range spans, so the two cannot disagree about who owns a row', () => {
        const group = makeGroup('groupA', [makeChild(1, 'stale')]);
        const registered = makeChild(2, 'fresh');
        const filteredData: SearchData = [group];
        const groupChildrenByKey = {groupA: [registered]};

        const {groupKeyByChildKey} = buildGroupChildrenIndex(filteredData, groupChildrenByKey, openGroups('groupA'), true);

        expect(buildShiftRangeItems(filteredData, groupChildrenByKey, openGroups('groupA'), true)).toEqual([group, registered]);
        expect(groupKeyByChildKey.get('fresh')).toBe('groupA');
        expect(groupKeyByChildKey.has('stale')).toBe(false);
    });

    it('is empty where groups are the selectable unit, since those rows own no children in the list', () => {
        const groupA = makeGroup('groupA');
        const filteredData: SearchData = [groupA];

        const {childrenByGroupKey, groupKeyByChildKey} = buildGroupChildrenIndex(filteredData, {groupA: [makeChild(1, 'a1')]}, openGroups('groupA'), false);

        expect(childrenByGroupKey.size).toBe(0);
        expect(groupKeyByChildKey.size).toBe(0);
    });
});
