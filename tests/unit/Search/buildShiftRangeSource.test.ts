import {buildShiftRangeSource, getGroupCheckboxState, isGroupSelected, mapEmptyReportToSelectedEntry} from '@components/Search/selectionBuilders';
import type {SearchData, SelectedTransactions} from '@components/Search/types';

import CONST from '@src/CONST';

import {buildCategoryGroup as makeGroup, buildTransactionRow as makeChild} from '../../utils/collections/searchListItems';

const openGroups = (...keys: string[]): ReadonlySet<string> => new Set(keys);

const NO_OPEN_GROUPS = openGroups();

describe('buildShiftRangeSource: the rows a range spans', () => {
    it('passes flat (non-grouped) data through unchanged', () => {
        const filteredData: SearchData = [makeChild(1, 't1'), makeChild(2, 't2')];

        expect(buildShiftRangeSource(filteredData, NO_OPEN_GROUPS, false).items).toBe(filteredData);
    });

    it('follows each open group with the rows it carries, in the order the list renders them', () => {
        const childA1 = makeChild(1, 'a1');
        const childA2 = makeChild(2, 'a2');
        const childB1 = makeChild(3, 'b1');
        const groupA = makeGroup('groupA', [childA1, childA2]);
        const groupB = makeGroup('groupB', [childB1]);
        const filteredData: SearchData = [groupA, groupB];

        expect(buildShiftRangeSource(filteredData, openGroups('groupA', 'groupB'), true).items).toEqual([groupA, childA1, childA2, groupB, childB1]);
    });

    it('skips the rows a closed group still carries, since a range must not reach what is off screen', () => {
        const group = makeGroup('groupA', [makeChild(1, 'x'), makeChild(2, 'y')]);
        const filteredData: SearchData = [group];

        expect(buildShiftRangeSource(filteredData, NO_OPEN_GROUPS, true).items).toEqual([group]);
    });

    it('resolves each group independently, so an open group contributes its rows and a closed one contributes none', () => {
        const openChild = makeChild(1, 'open1');
        const openGroup = makeGroup('groupA', [openChild]);
        const closedGroup = makeGroup('groupB', [makeChild(2, 'closed1')]);
        const filteredData: SearchData = [openGroup, closedGroup];

        expect(buildShiftRangeSource(filteredData, openGroups('groupA'), true).items).toEqual([openGroup, openChild, closedGroup]);
    });

    it('contributes nothing for an open group whose rows have not arrived, rather than guessing at them', () => {
        const group = makeGroup('groupA');
        const filteredData: SearchData = [group];

        expect(buildShiftRangeSource(filteredData, openGroups('groupA'), true).items).toEqual([group]);
    });

    it('does not flatten when groups are the selectable unit (groupsAreHeaders=false, e.g. expense-report views): rows pass through unchanged', () => {
        const filteredData: SearchData = [makeGroup('groupA', [makeChild(1, 'a1')])];

        expect(buildShiftRangeSource(filteredData, openGroups('groupA'), false).items).toBe(filteredData);
    });
});

describe('isGroupSelected', () => {
    const child = makeChild(1, 'c1');

    /** Entries are only ever read for `isSelected`, so the empty-report builder supplies a fully typed one. */
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
    });

    it('counts a group with no loaded rows that select-all-matching covers, the same as its checkbox does', () => {
        expect(isGroupSelected(groupOf({}, {children: [], areAllMatchingItemsSelected: true}))).toBe(true);
    });

    it('ignores a row being deleted, so clicking the header cannot mean deselect while the checkbox reads unchecked', () => {
        const deletedChild = {...child, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE};
        const params = groupOf(selectionOf('c1'), {children: [deletedChild]});
        expect(isGroupSelected(params)).toBe(false);
        expect(getGroupCheckboxState(params).isSelectAllChecked).toBe(false);
    });

    it('stops answering from its own key once it carries rows, so a group holding only deleted ones reads the same to both', () => {
        const deletedChild = {...child, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE};
        const params = groupOf(selectionOf('groupA'), {children: [deletedChild]});
        expect(isGroupSelected(params)).toBe(false);
        expect(getGroupCheckboxState(params).isSelectAllChecked).toBe(false);
    });
});

describe('buildShiftRangeSource: who owns each row', () => {
    it('indexes each child against the group it is rendered under, and indexes nothing for a closed group', () => {
        const openChild1 = makeChild(1, 'open1');
        const openChild2 = makeChild(2, 'open2');
        const openGroup = makeGroup('groupA', [openChild1, openChild2]);
        const closedGroup = makeGroup('groupB', [makeChild(3, 'closed1')]);
        const filteredData: SearchData = [openGroup, closedGroup];

        const {childrenByGroupKey, groupKeyByChildKey} = buildShiftRangeSource(filteredData, openGroups('groupA'), true);

        expect(childrenByGroupKey.get('groupA')).toEqual([openChild1, openChild2]);
        expect(childrenByGroupKey.get('groupB')).toEqual([]);
        expect(groupKeyByChildKey.get('open1')).toBe('groupA');
        expect(groupKeyByChildKey.get('open2')).toBe('groupA');
        expect(groupKeyByChildKey.has('closed1')).toBe(false);
    });

    it('indexes the same children the range spans, so the two cannot disagree about who owns a row', () => {
        const child = makeChild(1, 'c1');
        const filteredData: SearchData = [makeGroup('groupA', [child])];

        const {groupKeyByChildKey} = buildShiftRangeSource(filteredData, openGroups('groupA'), true);

        expect(buildShiftRangeSource(filteredData, openGroups('groupA'), true).items.at(-1)).toBe(child);
        expect(groupKeyByChildKey.get('c1')).toBe('groupA');
    });

    it('is empty where groups are the selectable unit, since those rows own no children in the list', () => {
        const filteredData: SearchData = [makeGroup('groupA', [makeChild(1, 'a1')])];

        const {childrenByGroupKey, groupKeyByChildKey} = buildShiftRangeSource(filteredData, openGroups('groupA'), false);

        expect(childrenByGroupKey.size).toBe(0);
        expect(groupKeyByChildKey.size).toBe(0);
    });
});
