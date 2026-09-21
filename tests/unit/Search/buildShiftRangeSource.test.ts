import {buildShiftRangeSource, getGroupCheckboxState, isGroupSelected, mapEmptyReportToSelectedEntry} from '@components/Search/selectionBuilders';
import type {SearchData, SelectedTransactions} from '@components/Search/types';

import CONST from '@src/CONST';

import {buildCategoryGroup as makeGroup, buildTransactionRow as makeChild} from '../../utils/collections/searchListItems';

const openGroups = (...keys: string[]): ReadonlySet<string> => new Set(keys);

const NO_OPEN_GROUPS = openGroups();

describe('buildShiftRangeSource: the rows a range spans', () => {
    it('passes flat (non-grouped) data through unchanged', () => {
        // Given a flat search, where every row is already its own selectable unit
        const filteredData: SearchData = [makeChild(1, 't1'), makeChild(2, 't2')];

        // When the range source is built with no flattening asked for
        // Then the same array comes back, so a flat list costs no copy per render
        expect(buildShiftRangeSource(filteredData, NO_OPEN_GROUPS, false).items).toBe(filteredData);
    });

    it('follows each open group with the rows it carries, in the order the list renders them', () => {
        // Given two expanded groups
        const childA1 = makeChild(1, 'a1');
        const childA2 = makeChild(2, 'a2');
        const childB1 = makeChild(3, 'b1');
        const groupA = makeGroup('groupA', [childA1, childA2]);
        const groupB = makeGroup('groupB', [childB1]);
        const filteredData: SearchData = [groupA, groupB];

        // When the range source is built
        // Then it is the list as the screen shows it, since a range spans what the user sees between two clicks
        expect(buildShiftRangeSource(filteredData, openGroups('groupA', 'groupB'), true).items).toEqual([groupA, childA1, childA2, groupB, childB1]);
    });

    it('skips the rows a closed group still carries, since a range must not reach what is off screen', () => {
        // Given a collapsed group that still holds the rows it loaded earlier
        const group = makeGroup('groupA', [makeChild(1, 'x'), makeChild(2, 'y')]);
        const filteredData: SearchData = [group];

        // When the range source is built
        // Then only the header is in it: openness is the gate, not whether the rows are known
        expect(buildShiftRangeSource(filteredData, NO_OPEN_GROUPS, true).items).toEqual([group]);
    });

    it('resolves each group independently, so an open group contributes its rows and a closed one contributes none', () => {
        // Given one expanded group and one collapsed group
        const openChild = makeChild(1, 'open1');
        const openGroup = makeGroup('groupA', [openChild]);
        const closedGroup = makeGroup('groupB', [makeChild(2, 'closed1')]);
        const filteredData: SearchData = [openGroup, closedGroup];

        // When the range source is built
        // Then each answers for itself, rather than one group's state deciding for the list
        expect(buildShiftRangeSource(filteredData, openGroups('groupA'), true).items).toEqual([openGroup, openChild, closedGroup]);
    });

    it('contributes nothing for an open group whose rows have not arrived, rather than guessing at them', () => {
        // Given an expanded group whose children are still being fetched
        const group = makeGroup('groupA');
        const filteredData: SearchData = [group];

        // When the range source is built
        // Then it holds the header alone, since a range can only span rows the list actually has
        expect(buildShiftRangeSource(filteredData, openGroups('groupA'), true).items).toEqual([group]);
    });

    it('does not flatten when groups are the selectable unit (groupsAreHeaders=false, e.g. expense-report views): rows pass through unchanged', () => {
        // Given an expense-report view, where the report row is what a click selects
        const filteredData: SearchData = [makeGroup('groupA', [makeChild(1, 'a1')])];

        // When the range source is built without treating groups as headers
        // Then the rows pass through, so a range spans reports rather than the expenses inside them
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
        // Given a group selected while collapsed, so the selection sits under the group's own key
        // When the header is asked what a click means
        // Then it means deselect, since its rows read as checked through that entry
        expect(isGroupSelected(groupOf(selectionOf('groupA')))).toBe(true);
    });

    it('counts a group with any child selected', () => {
        // Given one child of the group checked
        // When the header is asked what a click means
        // Then it means deselect, which is what a partially checked header does
        expect(isGroupSelected(groupOf(selectionOf('c1')))).toBe(true);
    });

    it('does not count a group whose key and children are both unselected', () => {
        // Given a selection holding some other row
        // When the header is asked
        // Then a click means select, since nothing under it reads as checked
        expect(isGroupSelected(groupOf(selectionOf('other')))).toBe(false);
    });

    it('counts a group whose rows are checked by select-all-matching alone, which is what the user is looking at', () => {
        // Given every matching item selected, so the rows are checked with no entry of their own
        // When the header is asked
        // Then it means deselect, because the click has to answer to what the checkbox shows
        expect(isGroupSelected(groupOf({}, {areAllMatchingItemsSelected: true}))).toBe(true);
    });

    it('counts a group with no loaded rows that select-all-matching covers, the same as its checkbox does', () => {
        // Given a group carrying no rows yet, under select-all-matching
        // When the header is asked
        // Then it answers from its own key, which is all there is to ask
        expect(isGroupSelected(groupOf({}, {children: [], areAllMatchingItemsSelected: true}))).toBe(true);
    });

    it('does not count a loaded group whose rows are all excluded, even though select-all-matching still covers its own key', () => {
        // Given a group whose every loaded row has been taken back out of an all-matching selection
        const params = groupOf({}, {areAllMatchingItemsSelected: true, excludedTransactions: selectionOf('c1')});

        // When the header is asked, and the checkbox is drawn
        // Then both read unchecked, so the click can check the group again rather than deselecting it twice
        expect(isGroupSelected(params)).toBe(false);
        expect(getGroupCheckboxState(params).isSelectAllChecked).toBe(false);
    });

    it('ignores a row being deleted, so clicking the header cannot mean deselect while the checkbox reads unchecked', () => {
        // Given a group whose only checked row is on its way out
        const deletedChild = {...child, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE};
        const params = groupOf(selectionOf('c1'), {children: [deletedChild]});

        // When the header is asked, and the checkbox is drawn
        // Then neither counts that row, since the user cannot act on it
        expect(isGroupSelected(params)).toBe(false);
        expect(getGroupCheckboxState(params).isSelectAllChecked).toBe(false);
    });

    it('stops answering from its own key once it carries rows, so a group holding only deleted ones reads the same to both', () => {
        // Given a group selected while collapsed whose rows have since arrived, all being deleted
        const deletedChild = {...child, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE};
        const params = groupOf(selectionOf('groupA'), {children: [deletedChild]});

        // When the header is asked, and the checkbox is drawn
        // Then the rows decide and both read unchecked, rather than the stale key making the click a no-op
        expect(isGroupSelected(params)).toBe(false);
        expect(getGroupCheckboxState(params).isSelectAllChecked).toBe(false);
    });
});

describe('buildShiftRangeSource: who owns each row', () => {
    it('indexes each child against the group it is rendered under, and indexes nothing for a closed group', () => {
        // Given one expanded group and one collapsed group
        const openChild1 = makeChild(1, 'open1');
        const openChild2 = makeChild(2, 'open2');
        const openGroup = makeGroup('groupA', [openChild1, openChild2]);
        const closedGroup = makeGroup('groupB', [makeChild(3, 'closed1')]);
        const filteredData: SearchData = [openGroup, closedGroup];

        // When the range source is built
        const {childrenByGroupKey, groupKeyByChildKey} = buildShiftRangeSource(filteredData, openGroups('groupA'), true);

        // Then a write knows the parent of every row a range can reach, and nothing about the rows it cannot
        expect(childrenByGroupKey.get('groupA')).toEqual([openChild1, openChild2]);
        expect(childrenByGroupKey.get('groupB')).toEqual([]);
        expect(groupKeyByChildKey.get('open1')).toBe('groupA');
        expect(groupKeyByChildKey.get('open2')).toBe('groupA');
        expect(groupKeyByChildKey.has('closed1')).toBe(false);
    });

    it('indexes the same children the range spans, so the two cannot disagree about who owns a row', () => {
        // Given an expanded group with one child
        const child = makeChild(1, 'c1');
        const filteredData: SearchData = [makeGroup('groupA', [child])];

        // When the range source is built
        const {groupKeyByChildKey} = buildShiftRangeSource(filteredData, openGroups('groupA'), true);

        // Then the row a range spans is the row the index owns: one pass, so a row cannot be stored under another parent
        expect(buildShiftRangeSource(filteredData, openGroups('groupA'), true).items.at(-1)).toBe(child);
        expect(groupKeyByChildKey.get('c1')).toBe('groupA');
    });

    it('is empty where groups are the selectable unit, since those rows own no children in the list', () => {
        // Given an expense-report view
        const filteredData: SearchData = [makeGroup('groupA', [makeChild(1, 'a1')])];

        // When the range source is built without treating groups as headers
        const {childrenByGroupKey, groupKeyByChildKey} = buildShiftRangeSource(filteredData, openGroups('groupA'), false);

        // Then there is nothing to own: the report row is itself what a click selects
        expect(childrenByGroupKey.size).toBe(0);
        expect(groupKeyByChildKey.size).toBe(0);
    });
});
