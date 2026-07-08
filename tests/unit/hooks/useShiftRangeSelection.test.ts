import {act, renderHook} from '@testing-library/react-native';

import useShiftRangeSelection from '@hooks/useShiftRangeSelection';

import {applyShiftRangeBatchToKeySet, getShiftKeyFromEvent} from '@libs/shiftRangeSelection';
import type {ShiftRangeBatch} from '@libs/shiftRangeSelection';

type Row = {keyForList: string; isHeader?: boolean; isDisabled?: boolean};

const ROWS: Row[] = [{keyForList: 'a'}, {keyForList: 'b'}, {keyForList: 'c'}, {keyForList: 'd'}, {keyForList: 'e'}];
const [ROW_A, ROW_B, ROW_C, ROW_D, ROW_E] = ROWS;

const GROUPED: Row[] = [
    {keyForList: 'h1', isHeader: true},
    {keyForList: 'a'},
    {keyForList: 'b'},
    {keyForList: 'h2', isHeader: true},
    {keyForList: 'c'},
    {keyForList: 'd'},
    {keyForList: 'e'},
];
const [GROUPED_HEADER_1, GROUPED_A, GROUPED_B, GROUPED_HEADER_2, , GROUPED_D] = GROUPED;

const MIXED: Row[] = [{keyForList: 'a'}, {keyForList: 'b', isDisabled: true}, {keyForList: 'c'}, {keyForList: 'd', isDisabled: true}, {keyForList: 'e'}];
const [MIXED_A, MIXED_B, MIXED_C, , MIXED_E] = MIXED;

function makeParams(overrides: Partial<Parameters<typeof useShiftRangeSelection<Row>>[0]> = {}): Parameters<typeof useShiftRangeSelection<Row>>[0] {
    return {
        items: ROWS,
        getItemKey: (row) => row.keyForList,
        isItemSelected: () => false,
        onApplyRange: jest.fn(),
        ...overrides,
    };
}

function makeApplyMock() {
    return jest.fn<void, [ShiftRangeBatch<Row>]>();
}

function nthBatchKeys(mockFn: ReturnType<typeof makeApplyMock>, n: number): {toSelect: string[]; toDeselect: string[]} {
    const batch = mockFn.mock.calls.at(n)?.at(0) ?? {toSelect: [], toDeselect: []};
    return {
        toSelect: batch.toSelect.map((r) => r.keyForList),
        toDeselect: batch.toDeselect.map((r) => r.keyForList),
    };
}

describe('useShiftRangeSelection', () => {
    describe('applyShiftClick — gating', () => {
        it('returns false when shiftKey is missing or false', () => {
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams()));
            act(() => result.current.notifyAnchor(ROW_A));
            let applied = true;
            act(() => {
                applied = result.current.applyShiftClick(ROW_C);
            });
            expect(applied).toBe(false);
            act(() => {
                applied = result.current.applyShiftClick(ROW_C, false);
            });
            expect(applied).toBe(false);
        });

        it.each([
            {kind: 'header', items: GROUPED, anchor: GROUPED_A, target: GROUPED_HEADER_2, excludeKey: 'isHeaderItem' as const},
            {kind: 'disabled', items: MIXED, anchor: MIXED_A, target: MIXED_B, excludeKey: 'isDisabledItem' as const},
        ])('returns false when the target row is $kind', ({items, anchor, target, excludeKey}) => {
            const onApplyRange = makeApplyMock();
            const {result} = renderHook(() =>
                useShiftRangeSelection<Row>(
                    makeParams({
                        items,
                        [excludeKey]: (r: Row) => !!r.isHeader || !!r.isDisabled,
                        onApplyRange,
                    }),
                ),
            );
            act(() => result.current.notifyAnchor(anchor));
            let applied = true;
            act(() => {
                applied = result.current.applyShiftClick(target, true);
            });
            expect(applied).toBe(false);
            expect(onApplyRange).not.toHaveBeenCalled();
        });

        it("returns false when the target row's key is missing", () => {
            const onApplyRange = makeApplyMock();
            const missingKeyRow: Row = {keyForList: ''};
            const itemsWithMissingKey: Row[] = [...ROWS, missingKeyRow];
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({items: itemsWithMissingKey, getItemKey: (row) => row.keyForList || null, onApplyRange})));
            act(() => result.current.notifyAnchor(ROW_A));
            let applied = true;
            act(() => {
                applied = result.current.applyShiftClick(missingKeyRow, true);
            });
            expect(applied).toBe(false);
        });

        it('returns false when the clicked row is no longer in items (removed by a data refresh mid-click)', () => {
            const onApplyRange = makeApplyMock();
            const staleRow: Row = {keyForList: 'gone'};
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({onApplyRange})));
            act(() => result.current.notifyAnchor(ROW_A));
            let applied = true;
            act(() => {
                applied = result.current.applyShiftClick(staleRow, true);
            });
            expect(applied).toBe(false);
            expect(onApplyRange).not.toHaveBeenCalled();
        });

        it('treats an empty-string key as valid — only null/undefined mean missing', () => {
            const onApplyRange = makeApplyMock();
            const emptyKeyRow: Row = {keyForList: ''};
            const itemsWithEmptyKey: Row[] = [...ROWS, emptyKeyRow];
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({items: itemsWithEmptyKey, onApplyRange})));
            act(() => result.current.notifyAnchor(ROW_E));
            let applied = false;
            act(() => {
                applied = result.current.applyShiftClick(emptyKeyRow, true);
            });
            expect(applied).toBe(true);
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: ['e', ''], toDeselect: []});
        });
    });

    describe('applyShiftClick — anchor resolution', () => {
        it('uses the first selected row as anchor when no plain click came first', () => {
            const onApplyRange = makeApplyMock();
            const {result} = renderHook(() =>
                useShiftRangeSelection<Row>(
                    makeParams({
                        isItemSelected: (row) => row.keyForList === 'c',
                        onApplyRange,
                    }),
                ),
            );
            act(() => {
                result.current.applyShiftClick(ROW_E, true);
            });
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: ['c', 'd', 'e'], toDeselect: []});
        });

        it('uses the first selectable row as anchor when nothing is selected', () => {
            const onApplyRange = makeApplyMock();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({onApplyRange})));
            act(() => {
                result.current.applyShiftClick(ROW_C, true);
            });
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: ['a', 'b', 'c'], toDeselect: []});
        });

        it('the first-selectable-row fallback skips header rows', () => {
            const onApplyRange = makeApplyMock();
            const {result} = renderHook(() =>
                useShiftRangeSelection<Row>(
                    makeParams({
                        items: GROUPED,
                        isHeaderItem: (r) => !!r.isHeader,
                        onApplyRange,
                    }),
                ),
            );
            act(() => {
                result.current.applyShiftClick(GROUPED_B, true);
            });
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: ['a', 'b'], toDeselect: []});
        });

        it('rejects a header anchor at resolution and falls back to the selected row', () => {
            const onApplyRange = makeApplyMock();
            const {result} = renderHook(() =>
                useShiftRangeSelection<Row>(
                    makeParams({
                        items: GROUPED,
                        isHeaderItem: (r) => !!r.isHeader,
                        isItemSelected: (row) => row.keyForList === 'c',
                        onApplyRange,
                    }),
                ),
            );
            act(() => result.current.notifyAnchor(GROUPED_HEADER_1));
            act(() => {
                result.current.applyShiftClick(GROUPED_D, true);
            });
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: ['c', 'd'], toDeselect: []});
        });

        it('ignores a disabled row passed to notifyAnchor and falls back to the first selectable row', () => {
            const onApplyRange = makeApplyMock();
            const {result} = renderHook(() =>
                useShiftRangeSelection<Row>(
                    makeParams({
                        items: MIXED,
                        isDisabledItem: (r) => !!r.isDisabled,
                        onApplyRange,
                    }),
                ),
            );
            act(() => result.current.notifyAnchor(MIXED_B));
            act(() => {
                result.current.applyShiftClick(MIXED_E, true);
            });
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: ['a', 'c', 'e'], toDeselect: []});
        });
    });

    describe('range computation', () => {
        it('selects from anchor down through the target when the target is below', () => {
            const onApplyRange = makeApplyMock();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({onApplyRange})));
            act(() => result.current.notifyAnchor(ROW_A));
            act(() => {
                result.current.applyShiftClick(ROW_D, true);
            });
            expect(onApplyRange).toHaveBeenCalledTimes(1);
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: ['a', 'b', 'c', 'd'], toDeselect: []});
        });

        it('selects from the target up through anchor when the target is above', () => {
            const onApplyRange = makeApplyMock();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({onApplyRange})));
            act(() => result.current.notifyAnchor(ROW_E));
            act(() => {
                result.current.applyShiftClick(ROW_B, true);
            });
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: ['b', 'c', 'd', 'e'], toDeselect: []});
        });

        it.each([
            {kind: 'headers', items: GROUPED, anchor: GROUPED_A, target: GROUPED_D, excludeKey: 'isHeaderItem' as const, expected: ['a', 'b', 'c', 'd']},
            {kind: 'disabled rows', items: MIXED, anchor: MIXED_A, target: MIXED_E, excludeKey: 'isDisabledItem' as const, expected: ['a', 'c', 'e']},
        ])('excludes $kind between anchor and target from the batch', ({items, anchor, target, excludeKey, expected}) => {
            const onApplyRange = makeApplyMock();
            const {result} = renderHook(() =>
                useShiftRangeSelection<Row>(
                    makeParams({
                        items,
                        [excludeKey]: (r: Row) => !!r.isHeader || !!r.isDisabled,
                        onApplyRange,
                    }),
                ),
            );
            act(() => result.current.notifyAnchor(anchor));
            act(() => {
                result.current.applyShiftClick(target, true);
            });
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: expected, toDeselect: []});
        });

        it('keeps rows without a key out of the range batch', () => {
            const onApplyRange = makeApplyMock();
            const keylessRow: Row = {keyForList: ''};
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({items: [ROW_A, keylessRow, ROW_B], getItemKey: (row) => row.keyForList || null, onApplyRange})));
            act(() => result.current.notifyAnchor(ROW_A));
            act(() => {
                result.current.applyShiftClick(ROW_B, true);
            });
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: ['a', 'b'], toDeselect: []});
        });

        it('emits a single-row batch when the target equals the anchor', () => {
            const onApplyRange = makeApplyMock();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({onApplyRange})));
            act(() => result.current.notifyAnchor(ROW_C));
            act(() => {
                result.current.applyShiftClick(ROW_C, true);
            });
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: ['c'], toDeselect: []});
        });
    });

    describe('session continuity', () => {
        it('deselects the tail when a second shift+click lands inside the existing range', () => {
            const onApplyRange = makeApplyMock();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({onApplyRange})));
            act(() => result.current.notifyAnchor(ROW_A));
            act(() => {
                result.current.applyShiftClick(ROW_E, true);
            });
            act(() => {
                result.current.applyShiftClick(ROW_C, true);
            });
            expect(nthBatchKeys(onApplyRange, 1)).toEqual({toSelect: ['a', 'b', 'c'], toDeselect: ['d', 'e']});
        });

        it('keeps the anchor stable when a second shift+click extends past the previous end', () => {
            const onApplyRange = makeApplyMock();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({onApplyRange})));
            act(() => result.current.notifyAnchor(ROW_A));
            act(() => {
                result.current.applyShiftClick(ROW_C, true);
            });
            act(() => {
                result.current.applyShiftClick(ROW_E, true);
            });
            expect(nthBatchKeys(onApplyRange, 1)).toEqual({toSelect: ['a', 'b', 'c', 'd', 'e'], toDeselect: []});
        });

        it('deselects the prior side when a shift+click reverses direction across the anchor', () => {
            const onApplyRange = makeApplyMock();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({onApplyRange})));
            act(() => result.current.notifyAnchor(ROW_C));
            act(() => {
                result.current.applyShiftClick(ROW_E, true);
            });
            act(() => {
                result.current.applyShiftClick(ROW_A, true);
            });
            expect(nthBatchKeys(onApplyRange, 1)).toEqual({toSelect: ['a', 'b', 'c'], toDeselect: ['d', 'e']});
        });

        it('notifyAnchor mid-session ends the session', () => {
            const onApplyRange = makeApplyMock();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({onApplyRange})));
            act(() => result.current.notifyAnchor(ROW_A));
            act(() => {
                result.current.applyShiftClick(ROW_E, true);
            });
            act(() => result.current.notifyAnchor(ROW_C));
            act(() => {
                result.current.applyShiftClick(ROW_D, true);
            });
            expect(nthBatchKeys(onApplyRange, 1)).toEqual({toSelect: ['c', 'd'], toDeselect: []});
        });

        it('re-emits the full range when a shift+click lands on the same target as the previous one', () => {
            const onApplyRange = makeApplyMock();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({onApplyRange})));
            act(() => result.current.notifyAnchor(ROW_A));
            act(() => {
                result.current.applyShiftClick(ROW_D, true);
            });
            onApplyRange.mockClear();
            act(() => {
                result.current.applyShiftClick(ROW_D, true);
            });
            expect(onApplyRange).toHaveBeenCalledTimes(1);
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: ['a', 'b', 'c', 'd'], toDeselect: []});
        });

        it('clearAnchor mid-session lets the next shift+click start fresh', () => {
            const onApplyRange = makeApplyMock();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({onApplyRange})));
            act(() => result.current.notifyAnchor(ROW_A));
            act(() => {
                result.current.applyShiftClick(ROW_E, true);
            });
            act(() => result.current.clearAnchor());
            onApplyRange.mockClear();
            act(() => {
                result.current.notifyAnchor(ROW_C);
            });
            act(() => {
                result.current.applyShiftClick(ROW_D, true);
            });
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: ['c', 'd'], toDeselect: []});
        });
    });

    describe('seedFullRange', () => {
        it('seeds a span across the whole list so a subsequent shift+click collapses the selection', () => {
            const onApplyRange = makeApplyMock();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({onApplyRange})));
            act(() => result.current.seedFullRange());
            act(() => {
                result.current.applyShiftClick(ROW_C, true);
            });
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: ['a', 'b', 'c'], toDeselect: ['d', 'e']});
        });

        it('spans only selectable rows, skipping excluded ones', () => {
            const onApplyRange = makeApplyMock();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({items: MIXED, onApplyRange, isDisabledItem: (row) => !!row.isDisabled})));
            act(() => result.current.seedFullRange());
            act(() => {
                result.current.applyShiftClick(MIXED_C, true);
            });
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: ['a', 'c'], toDeselect: ['e']});
        });

        it('is a safe no-op when there are no selectable rows', () => {
            const onApplyRange = makeApplyMock();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({items: [], onApplyRange})));
            let applied = true;
            act(() => {
                result.current.seedFullRange();
                applied = result.current.applyShiftClick({keyForList: 'x'}, true);
            });
            expect(applied).toBe(false);
            expect(onApplyRange).not.toHaveBeenCalled();
        });
    });

    describe('seedRangeFromSelection', () => {
        it('seeds a block span over the selected extent so a subsequent shift+click collapses within the block', () => {
            const onApplyRange = makeApplyMock();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({onApplyRange})));
            act(() => result.current.seedRangeFromSelection(['b', 'c', 'd']));
            act(() => {
                result.current.applyShiftClick(ROW_C, true);
            });
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: ['b', 'c'], toDeselect: ['d']});
        });

        it('extends the selection when the shift+click lands past the seeded block', () => {
            const onApplyRange = makeApplyMock();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({onApplyRange})));
            act(() => result.current.seedRangeFromSelection(['b', 'c']));
            act(() => {
                result.current.applyShiftClick(ROW_E, true);
            });
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: ['b', 'c', 'd', 'e'], toDeselect: []});
        });

        it('paints only the passed keys when the selection has a gap', () => {
            const onApplyRange = makeApplyMock();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({onApplyRange})));
            act(() => result.current.seedRangeFromSelection(['b', 'd']));
            act(() => {
                result.current.applyShiftClick(ROW_C, true);
            });
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: ['b', 'c'], toDeselect: ['d']});
        });

        it('clears the session when the selection is empty, so the next shift+click resolves a cold anchor', () => {
            const onApplyRange = makeApplyMock();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({onApplyRange})));
            act(() => result.current.seedRangeFromSelection([]));
            act(() => {
                // Session cleared → cold shift+click resolves the anchor from the first selectable row (a).
                result.current.applyShiftClick(ROW_C, true);
            });
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: ['a', 'b', 'c'], toDeselect: []});
        });
    });

    describe('shift+click always selects (no deselect mode)', () => {
        /** A live selection the tests mutate to mirror the toggle each click commits. */
        function makeSelection(...keys: string[]) {
            const selected = new Set(keys);
            return {selected, isItemSelected: (row: Row) => selected.has(row.keyForList)};
        }

        it('stays responsive after uncheck-then-shift (the reported dead-Shift flow)', () => {
            const onApplyRange = makeApplyMock();
            const {selected, isItemSelected} = makeSelection('a', 'b', 'c');
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({isItemSelected, onApplyRange})));
            // a..c checked; uncheck 'b', then shift+click 'e': unchecking never flips Shift into a deselect mode — the range selects b..e.
            act(() => result.current.notifyAnchor(ROW_B));
            selected.delete('b');
            act(() => {
                result.current.applyShiftClick(ROW_E, true);
            });
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: ['b', 'c', 'd', 'e'], toDeselect: []});
            // and the following shift+click keeps responding, moving the endpoint.
            act(() => {
                result.current.applyShiftClick(ROW_C, true);
            });
            expect(nthBatchKeys(onApplyRange, 1)).toEqual({toSelect: ['b', 'c'], toDeselect: ['d', 'e']});
        });

        it('a cold shift+click selects even when every row is already selected', () => {
            const onApplyRange = makeApplyMock();
            const {isItemSelected} = makeSelection('a', 'b', 'c', 'd', 'e');
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({isItemSelected, onApplyRange})));
            act(() => {
                result.current.applyShiftClick(ROW_C, true);
            });
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: ['a', 'b', 'c'], toDeselect: []});
        });

        it('a collapse never deselects rows that were selected before the session started', () => {
            const onApplyRange = makeApplyMock();
            const {selected, isItemSelected} = makeSelection('c', 'd');
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({isItemSelected, onApplyRange})));
            // c,d hand-picked earlier; click 'a', paint a..e, then shrink to a..b: only 'e' (painted by this session) collapses.
            act(() => result.current.notifyAnchor(ROW_A));
            selected.add('a');
            act(() => {
                result.current.applyShiftClick(ROW_E, true);
            });
            selected.add('b');
            selected.add('e');
            act(() => {
                result.current.applyShiftClick(ROW_B, true);
            });
            expect(nthBatchKeys(onApplyRange, 1)).toEqual({toSelect: ['a', 'b'], toDeselect: ['e']});
        });

        it('stops protecting pre-session rows once they are deselected (a clear ends the shield)', () => {
            const onApplyRange = makeApplyMock();
            const {selected, isItemSelected} = makeSelection('b');
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({isItemSelected, onApplyRange})));
            // b hand-picked, then a..c painted around it.
            act(() => result.current.notifyAnchor(ROW_C));
            selected.add('c');
            act(() => {
                result.current.applyShiftClick(ROW_A, true);
            });
            // Everything is cleared (e.g. the header checkbox); b's protection must end with its selection.
            selected.clear();
            act(() => {
                result.current.applyShiftClick(ROW_A, true);
            });
            selected.add('a');
            selected.add('b');
            selected.add('c');
            act(() => {
                result.current.applyShiftClick(ROW_C, true);
            });
            expect(nthBatchKeys(onApplyRange, 2)).toEqual({toSelect: ['c'], toDeselect: ['a', 'b']});
        });

        it('a seeded session owns its whole span, so Select All then shift+click still collapses hand-picked rows', () => {
            const onApplyRange = makeApplyMock();
            const {isItemSelected} = makeSelection('a', 'b', 'c', 'd', 'e');
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({isItemSelected, onApplyRange})));
            act(() => result.current.seedFullRange());
            act(() => {
                result.current.applyShiftClick(ROW_B, true);
            });
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: ['a', 'b'], toDeselect: ['c', 'd', 'e']});
        });
    });

    describe('items change mid-session', () => {
        it('still collapses surviving painted rows when the previous endpoint disappears mid-session', () => {
            const onApplyRange = makeApplyMock();
            const {result, rerender} = renderHook(({items}: {items: Row[]}) => useShiftRangeSelection<Row>(makeParams({items, onApplyRange})), {
                initialProps: {items: [...ROWS]},
            });
            act(() => result.current.notifyAnchor(ROW_A));
            act(() => {
                result.current.applyShiftClick(ROW_E, true);
            });
            // d and e are gone; c was painted, left the range, and still collapses — no phantom selection.
            rerender({items: ROWS.slice(0, 3)});
            onApplyRange.mockClear();
            act(() => {
                result.current.applyShiftClick(ROW_B, true);
            });
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: ['a', 'b'], toDeselect: ['c']});
        });

        it('collapses painted rows by key after the list is re-sorted mid-session', () => {
            const onApplyRange = makeApplyMock();
            const {result, rerender} = renderHook(({items}: {items: Row[]}) => useShiftRangeSelection<Row>(makeParams({items, onApplyRange})), {
                initialProps: {items: [...ROWS]},
            });
            act(() => result.current.notifyAnchor(ROW_B));
            act(() => {
                result.current.applyShiftClick(ROW_D, true);
            });
            // Re-sort moves painted 'c' outside the anchor..target index span; collapsing to just 'b' must still deselect it.
            rerender({items: [ROW_C, ROW_A, ROW_B, ROW_E, ROW_D]});
            onApplyRange.mockClear();
            act(() => {
                result.current.applyShiftClick(ROW_B, true);
            });
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: ['b'], toDeselect: ['c', 'd']});
        });

        it('defers the collapse of painted rows hidden mid-session until they reappear', () => {
            const onApplyRange = makeApplyMock();
            const {result, rerender} = renderHook(({items}: {items: Row[]}) => useShiftRangeSelection<Row>(makeParams({items, onApplyRange})), {
                initialProps: {items: [...ROWS]},
            });
            act(() => result.current.notifyAnchor(ROW_A));
            act(() => {
                result.current.applyShiftClick(ROW_E, true);
            });
            // d,e are hidden while the range shrinks: only visible c collapses now; d,e stay painted.
            rerender({items: ROWS.slice(0, 3)});
            act(() => {
                result.current.applyShiftClick(ROW_B, true);
            });
            expect(nthBatchKeys(onApplyRange, 1)).toEqual({toSelect: ['a', 'b'], toDeselect: ['c']});
            // Once d,e reappear, the next shrink finally collapses them.
            rerender({items: [...ROWS]});
            act(() => {
                result.current.applyShiftClick(ROW_A, true);
            });
            expect(nthBatchKeys(onApplyRange, 2)).toEqual({toSelect: ['a'], toDeselect: ['b', 'd', 'e']});
        });

        it('collapses a painted row that became disabled mid-session', () => {
            const onApplyRange = makeApplyMock();
            const {result, rerender} = renderHook(({items}: {items: Row[]}) => useShiftRangeSelection<Row>(makeParams({items, isDisabledItem: (row) => !!row.isDisabled, onApplyRange})), {
                initialProps: {items: [...ROWS]},
            });
            act(() => result.current.notifyAnchor(ROW_A));
            act(() => {
                result.current.applyShiftClick(ROW_E, true);
            });
            // c locks while still visible — the shrink must still uncheck it, since its own checkbox no longer can.
            rerender({items: [ROW_A, ROW_B, {keyForList: 'c', isDisabled: true}, ROW_D, ROW_E]});
            act(() => {
                result.current.applyShiftClick(ROW_B, true);
            });
            expect(nthBatchKeys(onApplyRange, 1)).toEqual({toSelect: ['a', 'b'], toDeselect: ['c', 'd', 'e']});
        });

        it('protects a hand-picked row that reappears and is re-painted mid-session', () => {
            const onApplyRange = makeApplyMock();
            const selected = new Set(['c']);
            const isItemSelected = (row: Row) => selected.has(row.keyForList);
            const {result, rerender} = renderHook(({items}: {items: Row[]}) => useShiftRangeSelection<Row>(makeParams({items, isItemSelected, onApplyRange})), {
                initialProps: {items: [ROW_A, ROW_B, ROW_D, ROW_E]},
            });
            act(() => result.current.notifyAnchor(ROW_A));
            selected.add('a');
            act(() => {
                result.current.applyShiftClick(ROW_E, true);
            });
            for (const key of ['b', 'd', 'e']) {
                selected.add(key);
            }
            // c reappears and the next shift+click re-paints across it — it must become protected, not claimed by the session.
            rerender({items: [...ROWS]});
            act(() => {
                result.current.applyShiftClick(ROW_E, true);
            });
            act(() => {
                result.current.applyShiftClick(ROW_B, true);
            });
            expect(nthBatchKeys(onApplyRange, 2)).toEqual({toSelect: ['a', 'b'], toDeselect: ['d', 'e']});
        });

        it('never collapses a hand-picked row that was hidden at session start and reappears mid-session', () => {
            const onApplyRange = makeApplyMock();
            const selected = new Set(['c']);
            const isItemSelected = (row: Row) => selected.has(row.keyForList);
            const {result, rerender} = renderHook(({items}: {items: Row[]}) => useShiftRangeSelection<Row>(makeParams({items, isItemSelected, onApplyRange})), {
                initialProps: {items: [ROW_A, ROW_B, ROW_D, ROW_E]},
            });
            // 'c' is hand-picked but filtered out, so the session-start snapshot can't see it; it must still survive the collapse below.
            act(() => result.current.notifyAnchor(ROW_A));
            selected.add('a');
            act(() => {
                result.current.applyShiftClick(ROW_E, true);
            });
            for (const key of ['b', 'd', 'e']) {
                selected.add(key);
            }
            rerender({items: [...ROWS]});
            onApplyRange.mockClear();
            act(() => {
                result.current.applyShiftClick(ROW_B, true);
            });
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: ['a', 'b'], toDeselect: ['d', 'e']});
        });

        it('keeps the anchor active when items shrink mid-session', () => {
            const onApplyRange = makeApplyMock();
            const {result, rerender} = renderHook(({items}: {items: Row[]}) => useShiftRangeSelection<Row>(makeParams({items, onApplyRange})), {
                initialProps: {items: [...ROWS]},
            });
            act(() => result.current.notifyAnchor(ROW_A));
            rerender({items: ROWS.slice(0, 3)});
            act(() => {
                result.current.applyShiftClick(ROW_C, true);
            });
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: ['a', 'b', 'c'], toDeselect: []});
        });

        it('falls back to a selected row when the ranging anchor disappears between shift+clicks', () => {
            const onApplyRange = makeApplyMock();
            // Selection includes 'c' which survives the items change — that becomes the fresh anchor.
            const {result, rerender} = renderHook(
                ({items}: {items: Row[]}) => useShiftRangeSelection<Row>(makeParams({items, onApplyRange, isItemSelected: (row) => row.keyForList === 'c'})),
                {
                    initialProps: {items: [...ROWS]},
                },
            );
            act(() => result.current.notifyAnchor(ROW_A));
            act(() => {
                result.current.applyShiftClick(ROW_C, true);
            });
            rerender({items: ROWS.slice(1)});
            onApplyRange.mockClear();
            act(() => {
                result.current.applyShiftClick(ROW_E, true);
            });
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: ['c', 'd', 'e'], toDeselect: []});
        });

        it('falls back to the first selectable row when the ranging anchor disappears and nothing is selected', () => {
            const onApplyRange = makeApplyMock();
            const {result, rerender} = renderHook(({items}: {items: Row[]}) => useShiftRangeSelection<Row>(makeParams({items, onApplyRange})), {
                initialProps: {items: [...ROWS]},
            });
            act(() => result.current.notifyAnchor(ROW_A));
            act(() => {
                result.current.applyShiftClick(ROW_C, true);
            });
            rerender({items: ROWS.slice(1)});
            onApplyRange.mockClear();
            act(() => {
                result.current.applyShiftClick(ROW_E, true);
            });
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: ['b', 'c', 'd', 'e'], toDeselect: []});
        });
    });

    describe('defensive bails', () => {
        it('returns false when every item is excluded and no anchor can be resolved', () => {
            const onApplyRange = makeApplyMock();
            const allHeaders: Row[] = [
                {keyForList: 'h1', isHeader: true},
                {keyForList: 'h2', isHeader: true},
            ];
            const [firstHeader] = allHeaders;
            const {result} = renderHook(() =>
                useShiftRangeSelection<Row>(
                    makeParams({
                        items: allHeaders,
                        isHeaderItem: (r) => !!r.isHeader,
                        onApplyRange,
                    }),
                ),
            );
            let applied = true;
            act(() => {
                applied = result.current.applyShiftClick(firstHeader, true);
            });
            expect(applied).toBe(false);
            expect(onApplyRange).not.toHaveBeenCalled();
        });

        it('ignores notifyAnchor when getItemKey returns null', () => {
            const onApplyRange = makeApplyMock();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({getItemKey: (row) => row.keyForList || null, onApplyRange})));
            act(() => result.current.notifyAnchor({keyForList: ''}));
            act(() => {
                result.current.applyShiftClick(ROW_C, true);
            });
            // The null-key notifyAnchor was ignored, so the next shift+click falls back to the first selectable row (a).
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: ['a', 'b', 'c'], toDeselect: []});
        });

        it('honors an empty-string anchor key when the list has such a row', () => {
            const onApplyRange = makeApplyMock();
            const emptyKeyRow: Row = {keyForList: ''};
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({items: [emptyKeyRow, ...ROWS], onApplyRange})));
            act(() => result.current.notifyAnchor(emptyKeyRow));
            act(() => {
                result.current.applyShiftClick(ROW_B, true);
            });
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: ['', 'a', 'b'], toDeselect: []});
        });

        it('clearAnchor on an idle hook does not emit a batch', () => {
            const onApplyRange = makeApplyMock();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({items: [], onApplyRange})));
            act(() => result.current.clearAnchor());
            expect(onApplyRange).not.toHaveBeenCalled();
        });
    });
});

describe('getShiftKeyFromEvent', () => {
    it('returns false for nullish input', () => {
        expect(getShiftKeyFromEvent(undefined)).toBe(false);
        expect(getShiftKeyFromEvent(null)).toBe(false);
    });

    it('reads shiftKey from the outer event when present', () => {
        expect(getShiftKeyFromEvent({shiftKey: true})).toBe(true);
        expect(getShiftKeyFromEvent({shiftKey: false})).toBe(false);
    });

    it('falls back to nativeEvent.shiftKey when outer shiftKey is absent', () => {
        expect(getShiftKeyFromEvent({nativeEvent: {shiftKey: true}})).toBe(true);
        expect(getShiftKeyFromEvent({nativeEvent: {shiftKey: false}})).toBe(false);
    });

    it('outer shiftKey false takes precedence over nativeEvent shiftKey true', () => {
        expect(getShiftKeyFromEvent({shiftKey: false, nativeEvent: {shiftKey: true}})).toBe(false);
    });

    it('safely ignores a nativeEvent that lacks shiftKey or is not an object', () => {
        // nativeEvent is untyped (unknown), so the runtime guard must handle real RN press events, null, and non-objects without throwing.
        expect(getShiftKeyFromEvent({nativeEvent: {locationX: 5}})).toBe(false);
        expect(getShiftKeyFromEvent({nativeEvent: {}})).toBe(false);
        expect(getShiftKeyFromEvent({nativeEvent: null})).toBe(false);
        expect(getShiftKeyFromEvent({nativeEvent: 'shift'})).toBe(false);
    });
});

describe('applyShiftRangeBatchToKeySet', () => {
    type Item = {keyForList: string; isDisabled?: boolean};
    const getKey = (i: Item) => i.keyForList;

    it('returns a deduped copy of prevKeys for empty batches', () => {
        const prev = ['a', 'a', 'b'];
        const out = applyShiftRangeBatchToKeySet({toSelect: [], toDeselect: []}, prev, getKey);
        expect(out).toEqual(['a', 'b']);
        expect(out).not.toBe(prev);
    });

    it('adds toSelect keys when the previous list is empty', () => {
        const out = applyShiftRangeBatchToKeySet({toSelect: [{keyForList: 'a'}, {keyForList: 'b'}], toDeselect: []}, [] as string[], getKey);
        expect(out).toEqual(['a', 'b']);
    });

    it('adds toSelect keys, preserving prevKeys order then new keys', () => {
        const out = applyShiftRangeBatchToKeySet({toSelect: [{keyForList: 'c'}, {keyForList: 'd'}], toDeselect: []}, ['a', 'b'], getKey);
        expect(out).toEqual(['a', 'b', 'c', 'd']);
    });

    it('removes toDeselect keys', () => {
        const out = applyShiftRangeBatchToKeySet({toSelect: [], toDeselect: [{keyForList: 'b'}]}, ['a', 'b', 'c'], getKey);
        expect(out).toEqual(['a', 'c']);
    });

    it('dedupes new keys against prevKeys', () => {
        const out = applyShiftRangeBatchToKeySet({toSelect: [{keyForList: 'a'}, {keyForList: 'b'}, {keyForList: 'c'}], toDeselect: []}, ['a'], getKey);
        expect(out).toEqual(['a', 'b', 'c']);
    });

    it('dedupes keys already duplicated within prevKeys', () => {
        const out = applyShiftRangeBatchToKeySet({toSelect: [{keyForList: 'b'}], toDeselect: []}, ['a', 'a'], getKey);
        expect(out).toEqual(['a', 'b']);
    });

    it('re-adds a key at the end when it appears in both toDeselect and toSelect', () => {
        const out = applyShiftRangeBatchToKeySet({toSelect: [{keyForList: 'b'}], toDeselect: [{keyForList: 'b'}]}, ['a', 'b', 'c'], getKey);
        expect(out).toEqual(['a', 'c', 'b']);
    });

    it('skips items whose key is null/undefined', () => {
        type WithNullKey = {keyForList: string | null};
        const out = applyShiftRangeBatchToKeySet<WithNullKey, string>({toSelect: [{keyForList: null}, {keyForList: 'c'}], toDeselect: []}, ['a'], (i) => i.keyForList);
        expect(out).toEqual(['a', 'c']);
    });
});
