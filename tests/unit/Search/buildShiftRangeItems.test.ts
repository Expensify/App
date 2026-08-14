import {buildGroupChildrenIndex, buildShiftRangeItems, isGroupChecked, isGroupSelected, mapEmptyReportToSelectedEntry} from '@components/Search/selectionBuilders';
import type {SearchData, SelectedTransactions} from '@components/Search/types';

import CONST from '@src/CONST';

import {buildCategoryGroup as makeGroup, buildTransactionRow as makeChild} from '../../utils/collections/searchListItems';

const openGroups = (...keys: string[]): ReadonlySet<string> => new Set(keys);

const NO_OPEN_GROUPS = openGroups();

describe('buildShiftRangeItems', () => {
    it('passes flat (non-grouped) data through unchanged', () => {
        const filteredData: SearchData = [makeChild(1, 't1'), makeChild(2, 't2')];

        expect(buildShiftRangeItems(filteredData, NO_OPEN_GROUPS, false)).toBe(filteredData);
    });

    it('follows each open group with the rows it carries, in the order the list renders them', () => {
        const childA1 = makeChild(1, 'a1');
        const childA2 = makeChild(2, 'a2');
        const childB1 = makeChild(3, 'b1');
        const groupA = makeGroup('groupA', [childA1, childA2]);
        const groupB = makeGroup('groupB', [childB1]);
        const filteredData: SearchData = [groupA, groupB];

        expect(buildShiftRangeItems(filteredData, openGroups('groupA', 'groupB'), true)).toEqual([groupA, childA1, childA2, groupB, childB1]);
    });

    it('skips the rows a closed group still carries, since a range must not reach what is off screen', () => {
        // A group that was open earlier keeps its rows, because the sub-snapshot stays cached
        const group = makeGroup('groupA', [makeChild(1, 'x'), makeChild(2, 'y')]);
        const filteredData: SearchData = [group];

        expect(buildShiftRangeItems(filteredData, NO_OPEN_GROUPS, true)).toEqual([group]);
    });

    it('resolves each group independently, so an open group contributes its rows and a closed one contributes none', () => {
        const openChild = makeChild(1, 'open1');
        const openGroup = makeGroup('groupA', [openChild]);
        // Closed, but still carrying the rows it loaded when it was open
        const closedGroup = makeGroup('groupB', [makeChild(2, 'closed1')]);
        const filteredData: SearchData = [openGroup, closedGroup];

        expect(buildShiftRangeItems(filteredData, openGroups('groupA'), true)).toEqual([openGroup, openChild, closedGroup]);
    });

    it('contributes nothing for an open group whose rows have not arrived, rather than guessing at them', () => {
        const group = makeGroup('groupA');
        const filteredData: SearchData = [group];

        expect(buildShiftRangeItems(filteredData, openGroups('groupA'), true)).toEqual([group]);
    });

    it('does not flatten when groups are the selectable unit (groupsAreHeaders=false, e.g. expense-report views): rows pass through unchanged', () => {
        const filteredData: SearchData = [makeGroup('groupA', [makeChild(1, 'a1')])];

        expect(buildShiftRangeItems(filteredData, openGroups('groupA'), false)).toBe(filteredData);
    });
});

describe('isGroupSelected', () => {
    const child = makeChild(1, 'c1');

    /** Builds a real selection whose entries are only ever read for `isSelected`, so the empty-report builder supplies a fully typed one. */
    function selectionOf(...keys: string[]): SelectedTransactions {
        const [, entry] = mapEmptyReportToSelectedEntry(makeGroup('anyGroup'));
        return Object.fromEntries(keys.map((key) => [key, entry]));
    }

    const groupOf = (selectedTransactions: SelectedTransactions, overrides: Partial<Parameters<typeof isGroupSelected>[0]> = {}) => ({
        groupKey: 'groupA',
        children: [child],
        selectedTransactions,
        excludedTransactions: {},
        areAllMatchingItemsSelected: false,
        ...overrides,
    });

    it('counts a group selected under its own key, which is how it is stored before its children load', () => {
        expect(isGroupSelected(groupOf(selectionOf('groupA')))).toBe(true);
    });

    it('counts a group with any child selected', () => {
        expect(isGroupSelected(groupOf(selectionOf('c1')))).toBe(true);
    });

    it('does not count a group whose key and children are both unselected', () => {
        expect(isGroupSelected(groupOf(selectionOf('other')))).toBe(false);
    });

    it('counts a group whose rows are checked by select-all-matching alone, which is what the user is looking at', () => {
        expect(isGroupSelected(groupOf({}, {areAllMatchingItemsSelected: true}))).toBe(true);
        expect(isGroupChecked(groupOf({}, {areAllMatchingItemsSelected: true}))).toBe(true);
    });

    it('counts a group with no loaded rows that select-all-matching covers, the same as its checkbox does', () => {
        expect(isGroupSelected(groupOf({}, {children: [], areAllMatchingItemsSelected: true}))).toBe(true);
    });

    it('reads a group with no loaded rows from its own key, since there is nothing else to ask', () => {
        expect(isGroupChecked(groupOf({}, {children: [], areAllMatchingItemsSelected: true}))).toBe(true);
        expect(isGroupChecked(groupOf({}, {children: []}))).toBe(false);
    });

    it('does not read a group as fully checked while one of its rows is excluded', () => {
        expect(isGroupChecked(groupOf(selectionOf('groupA'), {excludedTransactions: selectionOf('c1')}))).toBe(false);
    });

    it('ignores a row being deleted, so clicking the header cannot mean deselect while the checkbox reads unchecked', () => {
        const deletedChild = {...child, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE};
        const params = groupOf(selectionOf('c1'), {children: [deletedChild]});
        expect(isGroupSelected(params)).toBe(false);
        expect(isGroupChecked(params)).toBe(false);
    });
});

describe('buildGroupChildrenIndex', () => {
    it('indexes each child against the group it is rendered under, and indexes nothing for a closed group', () => {
        const openChild1 = makeChild(1, 'open1');
        const openChild2 = makeChild(2, 'open2');
        const openGroup = makeGroup('groupA', [openChild1, openChild2]);
        // Closed, but still carrying the rows it loaded when it was open
        const closedGroup = makeGroup('groupB', [makeChild(3, 'closed1')]);
        const filteredData: SearchData = [openGroup, closedGroup];

        const {childrenByGroupKey, groupKeyByChildKey} = buildGroupChildrenIndex(filteredData, openGroups('groupA'), true);

        expect(childrenByGroupKey.get('groupA')).toEqual([openChild1, openChild2]);
        expect(childrenByGroupKey.get('groupB')).toEqual([]);
        expect(groupKeyByChildKey.get('open1')).toBe('groupA');
        expect(groupKeyByChildKey.get('open2')).toBe('groupA');
        expect(groupKeyByChildKey.has('closed1')).toBe(false);
    });

    it('indexes the same children the range spans, so the two cannot disagree about who owns a row', () => {
        const child = makeChild(1, 'c1');
        const filteredData: SearchData = [makeGroup('groupA', [child])];

        const {groupKeyByChildKey} = buildGroupChildrenIndex(filteredData, openGroups('groupA'), true);

        expect(buildShiftRangeItems(filteredData, openGroups('groupA'), true).at(-1)).toBe(child);
        expect(groupKeyByChildKey.get('c1')).toBe('groupA');
    });

    it('is empty where groups are the selectable unit, since those rows own no children in the list', () => {
        const filteredData: SearchData = [makeGroup('groupA', [makeChild(1, 'a1')])];

        const {childrenByGroupKey, groupKeyByChildKey} = buildGroupChildrenIndex(filteredData, openGroups('groupA'), false);

        expect(childrenByGroupKey.size).toBe(0);
        expect(groupKeyByChildKey.size).toBe(0);
    });
});
