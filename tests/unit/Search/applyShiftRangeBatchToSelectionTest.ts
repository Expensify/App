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
    });

const lookupsFor = (groupKeyByChildKey: Map<string, string> = new Map(), childrenByGroupKey: Map<string, TransactionListItemType[]> = new Map()) => ({
    groupKeyByChildKey,
    childrenByGroupKey,
    buildSelectedEntry: buildEntry,
});

const batchOf = (toSelect: SearchListItem[] = [], toDeselect: SearchListItem[] = []): ShiftRangeBatch<SearchListItem> => ({toSelect, toDeselect});

const selectionOf = (...items: TransactionListItemType[]): SelectedTransactions => Object.fromEntries(items.map(buildEntry));

describe('applyShiftRangeBatchToSelection', () => {
    it('selects the rows a range covers', () => {
        const first = makeChild(1, 't1');
        const second = makeChild(2, 't2');

        const updated = applyShiftRangeBatchToSelection(batchOf([first, second]), {}, false, lookupsFor());

        expect(Object.keys(updated).sort()).toEqual(['t1', 't2']);
    });

    it('gives back the rows a range no longer covers', () => {
        const first = makeChild(1, 't1');
        const second = makeChild(2, 't2');

        const updated = applyShiftRangeBatchToSelection(batchOf([first], [second]), selectionOf(first, second), false, lookupsFor());

        expect(Object.keys(updated)).toEqual(['t1']);
    });

    it('returns the map it was given when the batch writes nothing, so the commit bails on identity', () => {
        const first = makeChild(1, 't1');
        const selection = selectionOf(first);

        expect(applyShiftRangeBatchToSelection(batchOf([first]), selection, false, lookupsFor())).toBe(selection);
    });

    it('counts no write when it is asked to give back rows the selection never held', () => {
        const absent = makeChild(9, 'gone');
        const selection = selectionOf(makeChild(1, 't1'));

        expect(applyShiftRangeBatchToSelection(batchOf([], [absent]), selection, false, lookupsFor())).toBe(selection);
    });

    it('refuses a row being deleted, even handed one directly', () => {
        const deleted = {...makeChild(1, 't1'), pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE};

        expect(applyShiftRangeBatchToSelection(batchOf([deleted]), {}, false, lookupsFor())).toEqual({});
    });

    it('refuses an empty report being deleted, which is the one row kind the transaction check cannot cover', () => {
        const deletedReport = {...buildReportGroup(1, 'report-1'), pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE};

        expect(applyShiftRangeBatchToSelection(batchOf([deletedReport]), {}, false, lookupsFor())).toEqual({});
    });

    it('selects an empty report under its own key, which is the only key it has', () => {
        const report = buildReportGroup(1, 'report-1');

        const updated = applyShiftRangeBatchToSelection(batchOf([report]), {}, false, lookupsFor());

        expect(Object.keys(updated)).toEqual(['report-1']);
    });

    it('marks a whole group row it covers as selected through the group, so a later range may narrow it', () => {
        const child = makeChild(1, 'c1');
        const group = makeGroup('groupA', [child]);

        const updated = applyShiftRangeBatchToSelection(batchOf([group]), {}, false, lookupsFor());

        expect(updated.c1?.isSelectedViaGroup).toBe(true);
        expect(updated.c1?.groupKey).toBe('groupA');
        expect(updated.groupA).toBeUndefined();
    });

    it('leaves a group carrying only rows it cannot select exactly as it was', () => {
        const deleted = {...makeChild(1, 'c1'), pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE};
        const group = makeGroup('groupA', [deleted]);
        const selection = selectionOf(makeChild(2, 't2'));

        expect(applyShiftRangeBatchToSelection(batchOf([group]), selection, false, lookupsFor())).toBe(selection);
    });

    it('stops a row claiming its group covers it once the range takes only part of that group', () => {
        const kept = makeChild(1, 'c1');
        const dropped = makeChild(2, 'c2');
        const selection: SelectedTransactions = {
            ...selectionOf(kept, dropped),
        };
        selection.c1 = {...selection.c1, groupKey: 'groupA', isSelectedViaGroup: true};
        selection.c2 = {...selection.c2, groupKey: 'groupA', isSelectedViaGroup: true};

        // Given a range that gives back one of the two rows the group covered
        const updated = applyShiftRangeBatchToSelection(batchOf([], [dropped]), selection, false, lookupsFor(new Map([['c2', 'groupA']])));

        // Then the row left behind stops claiming the group covers it, or an export would send a whole-group filter
        expect(updated.c2).toBeUndefined();
        expect(updated.c1?.isSelectedViaGroup).toBe(false);
        expect(updated.c1?.groupKey).toBe('groupA');
    });

    it('keeps the claim when the range takes the whole group, since nothing was left behind', () => {
        const child = makeChild(1, 'c1');
        const group = makeGroup('groupA', [child]);

        const updated = applyShiftRangeBatchToSelection(batchOf([group]), {}, false, lookupsFor(new Map([['c1', 'groupA']])));

        expect(updated.c1?.isSelectedViaGroup).toBe(true);
    });

    it('writes a group held under its own key out into its rows before dropping one of them', () => {
        const kept = makeChild(1, 'c1');
        const dropped = makeChild(2, 'c2');
        const [groupKey, groupEntry] = mapEmptyReportToSelectedEntry(makeGroup('groupA', []));
        const selection: SelectedTransactions = {[groupKey]: groupEntry};

        // Given a group selected while collapsed, then a range that gives back one of the rows that have since arrived
        const updated = applyShiftRangeBatchToSelection(batchOf([], [dropped]), selection, false, lookupsFor(new Map([['c2', 'groupA']]), new Map([['groupA', [kept, dropped]]])));

        // Then the row it kept is named, rather than the group's entry standing for rows it no longer covers
        expect(updated.groupA).toBeUndefined();
        expect(updated.c1?.groupKey).toBe('groupA');
        expect(updated.c2).toBeUndefined();
    });

    it('leaves a group held under its own key alone under select-all-matching, where its rows are not known', () => {
        const dropped = makeChild(2, 'c2');
        const [groupKey, groupEntry] = mapEmptyReportToSelectedEntry(makeGroup('groupA', []));
        const selection: SelectedTransactions = {[groupKey]: groupEntry};

        const updated = applyShiftRangeBatchToSelection(batchOf([], [dropped]), selection, true, lookupsFor(new Map([['c2', 'groupA']]), new Map([['groupA', [dropped]]])));

        expect(updated.groupA).toBeDefined();
    });
});
