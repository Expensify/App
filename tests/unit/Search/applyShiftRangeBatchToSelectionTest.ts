import type {SearchListItem, TransactionListItemType} from '@components/Search/SearchList/ListItem/types';
import {applyShiftRangeBatchToSelection, mapEmptyReportToSelectedEntry, mapTransactionItemToSelectedEntry} from '@components/Search/selectionBuilders';
import type {SelectedTransactionInfo, SelectedTransactions} from '@components/Search/types';

import type {ShiftRangeBatch} from '@libs/shiftRangeSelection';

import CONST from '@src/CONST';

import {buildCategoryGroup as makeGroup, buildReportGroup, buildTransactionRow as makeChild} from '../../utils/collections/searchListItems';

/**
 * The engine keeps rows being deleted out of a batch, so several of these hand the writer one anyway. That is the
 * point of testing it directly: the guards exist so the two halves cannot drift, not because a caller reaches them.
 */
const buildEntry = (item: TransactionListItemType): [string, SelectedTransactionInfo] =>
    mapTransactionItemToSelectedEntry({
        item,
        itemTransaction: undefined,
        originalItemTransaction: undefined,
        currentUserLogin: 'a@b.com',
        currentUserAccountID: 1,
        reportNameValuePairs: undefined,
        outstandingReportsByPolicyID: undefined,
        selfDMReport: undefined,
        allowNegativeAmount: true,
        parentReport: undefined,
        rules: undefined,
    });

const lookupsFor = (groupKeyByChildKey: Map<string, string> = new Map(), childrenByGroupKey: Map<string, TransactionListItemType[]> = new Map()) => ({
    groupKeyByChildKey,
    childrenByGroupKey,
    buildSelectedEntry: buildEntry,
    getGroupCount: () => undefined,
});

const batchOf = (toSelect: SearchListItem[] = [], toDeselect: SearchListItem[] = []): ShiftRangeBatch<SearchListItem> => ({toSelect, toDeselect});

const selectionOf = (...items: TransactionListItemType[]): SelectedTransactions => Object.fromEntries(items.map(buildEntry));

describe('applyShiftRangeBatchToSelection', () => {
    it('commits a group written out into its rows even when the row it was asked to drop has none to drop', () => {
        // Given a group selected under its own key, whose loaded rows are one ordinary row and one being deleted
        const kept = makeChild(1, 'c1');
        const deleted = {...makeChild(2, 'c2'), pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE};
        const group = makeGroup('groupA', [kept, deleted]);
        const [groupKey, groupEntry] = mapEmptyReportToSelectedEntry(group);
        const lookups = lookupsFor(new Map([['c2', 'groupA']]), new Map([['groupA', [kept, deleted]]]));

        // When a range gives back the row being deleted, which the group never held an entry for
        const updated = applyShiftRangeBatchToSelection(batchOf([], [deleted]), {[groupKey]: groupEntry}, false, lookups);

        // Then the write survives: the group is spelled out into the row it does hold, rather than the batch bailing on identity
        expect(updated.groupA).toBeUndefined();
        expect(updated.c1?.groupKey).toBe('groupA');
    });

    it('selects the rows a range covers', () => {
        // Given an empty selection and two rows a range spans
        const first = makeChild(1, 't1');
        const second = makeChild(2, 't2');

        // When the batch is applied
        const updated = applyShiftRangeBatchToSelection(batchOf([first, second]), {}, false, lookupsFor());

        // Then both are selected, which is the half of a range that never changes
        expect(Object.keys(updated).sort()).toEqual(['t1', 't2']);
    });

    it('gives back the rows a range no longer covers', () => {
        // Given both rows selected by an earlier span
        const first = makeChild(1, 't1');
        const second = makeChild(2, 't2');

        // When the range shrinks onto the first, handing the second back
        const updated = applyShiftRangeBatchToSelection(batchOf([first], [second]), selectionOf(first, second), false, lookupsFor());

        // Then only the row still covered stays, which is what makes an overshoot recoverable in one click
        expect(Object.keys(updated)).toEqual(['t1']);
    });

    it('does not count a group as wholly selected once a range gives back its loaded row, though rows kept off the page make up the count', () => {
        // Given a two-expense group whose one loaded row is selected along with two rows a refresh kept off the page, one of them deleted elsewhere
        const loaded = makeChild(1, 'c1');
        const selection: SelectedTransactions = {
            c1: {...buildEntry(loaded)[1], groupKey: 'groupA'},
            c2: {...buildEntry(makeChild(2, 'c2'))[1], groupKey: 'groupA'},
            c3: {...buildEntry(makeChild(3, 'c3'))[1], groupKey: 'groupA'},
        };
        const lookups = {...lookupsFor(new Map([['c1', 'groupA']]), new Map([['groupA', [loaded]]])), getGroupCount: () => 2};

        // When a range gives back the loaded row
        const updated = applyShiftRangeBatchToSelection(batchOf([], [loaded]), selection, false, lookups);

        // Then the kept rows no longer stand for the whole group, so a bulk delete leaves the unchecked row on screen
        expect(updated.c2?.isEntireGroupSelected).toBe(false);
        expect(updated.c3?.isEntireGroupSelected).toBe(false);
    });

    it('gives back the rows a refresh left off the page along with the group a range no longer covers', () => {
        // Given a group a range selected whole, with one loaded row and one row a refresh left off the loaded page, both standing for the group
        const loaded = makeChild(1, 'c1');
        const leftOut = makeChild(2, 'c2');
        const group = makeGroup('groupA', [loaded]);
        const selection: SelectedTransactions = {
            c1: {...buildEntry(loaded)[1], groupKey: 'groupA', isSelectedViaGroup: true},
            c2: {...buildEntry(leftOut)[1], groupKey: 'groupA', isSelectedViaGroup: true},
        };
        const lookups = lookupsFor(new Map([['c1', 'groupA']]), new Map([['groupA', [loaded]]]));

        // When the range shrinks and gives the group back
        const updated = applyShiftRangeBatchToSelection(batchOf([], [group]), selection, false, lookups);

        // Then both rows go, as when the group's header is unchecked, so the row left off the page cannot check the group again
        expect(updated).toEqual({});
    });

    it('returns the map it was given when the batch writes nothing, so the commit bails on identity', () => {
        // Given a row already selected exactly as the range would write it
        const first = makeChild(1, 't1');
        const selection = selectionOf(first);

        // When a range re-covers it
        // Then the same map comes back: an equal map would re-render every row in the list
        expect(applyShiftRangeBatchToSelection(batchOf([first]), selection, false, lookupsFor())).toBe(selection);
    });

    it('counts no write when it is asked to give back rows the selection never held', () => {
        // Given a selection that does not hold the row the batch gives back
        const absent = makeChild(9, 'gone');
        const selection = selectionOf(makeChild(1, 't1'));

        // When the batch is applied
        // Then nothing is committed, since dropping a key that was never there changes nothing
        expect(applyShiftRangeBatchToSelection(batchOf([], [absent]), selection, false, lookupsFor())).toBe(selection);
    });

    it('refuses a row being deleted, even handed one directly', () => {
        // Given a row on its way out, which the engine would never put in a batch
        const deleted = {...makeChild(1, 't1'), pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE};

        // When the writer is handed it anyway
        // Then it selects nothing, so the two halves cannot drift on what a selectable row is
        expect(applyShiftRangeBatchToSelection(batchOf([deleted]), {}, false, lookupsFor())).toEqual({});
    });

    it('refuses an empty report being deleted, which is the one row kind the transaction check cannot cover', () => {
        // Given a report row with no expenses of its own, being deleted
        const deletedReport = {...buildReportGroup(1, 'report-1'), pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE};

        // When a range covers it
        // Then it stays out of the selection, since the row-level check reads transactions it does not have
        expect(applyShiftRangeBatchToSelection(batchOf([deletedReport]), {}, false, lookupsFor())).toEqual({});
    });

    it('selects an empty report under its own key, which is the only key it has', () => {
        // Given a report row carrying no expenses
        const report = buildReportGroup(1, 'report-1');

        // When a range covers it
        const updated = applyShiftRangeBatchToSelection(batchOf([report]), {}, false, lookupsFor());

        // Then it is stored under the report's key, the same way clicking that row stores it
        expect(Object.keys(updated)).toEqual(['report-1']);
    });

    it('marks a whole group row it covers as selected through the group, so a later range may narrow it', () => {
        // Given a group row with one child
        const child = makeChild(1, 'c1');
        const group = makeGroup('groupA', [child]);

        // When a range covers the group row itself
        const updated = applyShiftRangeBatchToSelection(batchOf([group]), {}, false, lookupsFor());

        // Then its children carry the selection and the group's own key does not, exactly as a header click writes it
        expect(updated.c1?.isSelectedViaGroup).toBe(true);
        expect(updated.c1?.groupKey).toBe('groupA');
        expect(updated.groupA).toBeUndefined();
    });

    it('leaves a group carrying only rows it cannot select exactly as it was', () => {
        // Given a group whose only row is being deleted
        const deleted = {...makeChild(1, 'c1'), pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE};
        const group = makeGroup('groupA', [deleted]);
        const selection = selectionOf(makeChild(2, 't2'));

        // When a range covers that group
        // Then the same map comes back, rather than an equal one that re-renders every row for nothing
        expect(applyShiftRangeBatchToSelection(batchOf([group]), selection, false, lookupsFor())).toBe(selection);
    });

    it('stops a row claiming its group covers it once the range takes only part of that group', () => {
        // Given two rows checked through their group
        const kept = makeChild(1, 'c1');
        const dropped = makeChild(2, 'c2');
        const selection: SelectedTransactions = {
            ...selectionOf(kept, dropped),
        };
        selection.c1 = {...selection.c1, groupKey: 'groupA', isSelectedViaGroup: true};
        selection.c2 = {...selection.c2, groupKey: 'groupA', isSelectedViaGroup: true};

        // When a range gives back one of the two rows the group covered
        const updated = applyShiftRangeBatchToSelection(batchOf([], [dropped]), selection, false, lookupsFor(new Map([['c2', 'groupA']])));

        // Then the row left behind stops claiming the group covers it, or an export would send a whole-group filter
        expect(updated.c2).toBeUndefined();
        expect(updated.c1?.isSelectedViaGroup).toBe(false);
        expect(updated.c1?.groupKey).toBe('groupA');
    });

    it('keeps the claim on rows a range only re-covers, since it took none of them back', () => {
        // Given two rows selected through their group's header
        const first = makeChild(1, 'c1');
        const second = makeChild(2, 'c2');
        const selection: SelectedTransactions = {...selectionOf(first, second)};
        selection.c1 = {...selection.c1, groupKey: 'groupA', isSelectedViaGroup: true};
        selection.c2 = {...selection.c2, groupKey: 'groupA', isSelectedViaGroup: true};

        // When a range covers both of them again and gives nothing back
        const updated = applyShiftRangeBatchToSelection(
            batchOf([first, second]),
            selection,
            false,
            lookupsFor(
                new Map([
                    ['c1', 'groupA'],
                    ['c2', 'groupA'],
                ]),
            ),
        );

        // Then both still claim the group, so an export keeps sending the group filter that reaches its unloaded rows
        expect(updated.c1?.isSelectedViaGroup).toBe(true);
        expect(updated.c2?.isSelectedViaGroup).toBe(true);
    });

    it('drops the claim when the same batch re-covers one row of a group and gives another back', () => {
        // Given two rows selected through their group's header
        const kept = makeChild(1, 'c1');
        const dropped = makeChild(2, 'c2');
        const selection: SelectedTransactions = {...selectionOf(kept, dropped)};
        selection.c1 = {...selection.c1, groupKey: 'groupA', isSelectedViaGroup: true};
        selection.c2 = {...selection.c2, groupKey: 'groupA', isSelectedViaGroup: true};

        // When a range narrows onto the first, re-covering it and giving the second back
        const updated = applyShiftRangeBatchToSelection(
            batchOf([kept], [dropped]),
            selection,
            false,
            lookupsFor(
                new Map([
                    ['c1', 'groupA'],
                    ['c2', 'groupA'],
                ]),
            ),
        );

        // Then the re-covered row stops claiming the group, because the group is no longer whole
        expect(updated.c2).toBeUndefined();
        expect(updated.c1?.isSelectedViaGroup).toBe(false);
    });

    it('keeps the claim when the range takes the whole group, since nothing was left behind', () => {
        // Given a group whose every row the range covers
        const child = makeChild(1, 'c1');
        const group = makeGroup('groupA', [child]);

        // When the batch is applied
        const updated = applyShiftRangeBatchToSelection(batchOf([group]), {}, false, lookupsFor(new Map([['c1', 'groupA']])));

        // Then the whole-group claim stands, since it is a whole-group gesture and an export may send one filter
        expect(updated.c1?.isSelectedViaGroup).toBe(true);
    });

    it('writes a group held under its own key out into its rows before dropping one of them', () => {
        // Given a group selected while collapsed, whose rows have since arrived
        const kept = makeChild(1, 'c1');
        const dropped = makeChild(2, 'c2');
        const [groupKey, groupEntry] = mapEmptyReportToSelectedEntry(makeGroup('groupA', []));
        const selection: SelectedTransactions = {[groupKey]: groupEntry};

        // When a range gives back one of the rows that have since arrived under it
        const updated = applyShiftRangeBatchToSelection(batchOf([], [dropped]), selection, false, lookupsFor(new Map([['c2', 'groupA']]), new Map([['groupA', [kept, dropped]]])));

        // Then the row it kept is named, rather than the group's entry standing for rows it no longer covers
        expect(updated.groupA).toBeUndefined();
        expect(updated.c1?.groupKey).toBe('groupA');
        expect(updated.c2).toBeUndefined();
    });

    it('leaves a group held under its own key alone under select-all-matching, where its rows are not known', () => {
        // Given a group selected under its own key while every matching item is selected
        const dropped = makeChild(2, 'c2');
        const [groupKey, groupEntry] = mapEmptyReportToSelectedEntry(makeGroup('groupA', []));
        const selection: SelectedTransactions = {[groupKey]: groupEntry};

        // When a range gives back one of its rows
        const updated = applyShiftRangeBatchToSelection(batchOf([], [dropped]), selection, true, lookupsFor(new Map([['c2', 'groupA']]), new Map([['groupA', [dropped]]])));

        // Then the group stays whole: writing it out here would record the rows that never loaded as deselected
        expect(updated.groupA).toBeDefined();
    });
});
