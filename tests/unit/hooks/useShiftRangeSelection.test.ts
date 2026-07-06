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

        it("returns false when the target row's key is empty", () => {
            const onApplyRange = makeApplyMock();
            const missingKeyRow: Row = {keyForList: ''};
            const itemsWithMissingKey: Row[] = [...ROWS, missingKeyRow];
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({items: itemsWithMissingKey, onApplyRange})));
            act(() => result.current.notifyAnchor(ROW_A));
            let applied = true;
            act(() => {
                applied = result.current.applyShiftClick(missingKeyRow, true);
            });
            expect(applied).toBe(false);
        });
    });

    describe('applyShiftClick — anchor resolution', () => {
        it('uses notifyAnchor key as anchor for the first shift+click', () => {
            const onApplyRange = makeApplyMock();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({onApplyRange})));
            act(() => result.current.notifyAnchor(ROW_B));
            act(() => {
                result.current.applyShiftClick(ROW_D, true);
            });
            expect(onApplyRange).toHaveBeenCalledTimes(1);
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: ['b', 'c', 'd'], toDeselect: []});
        });

        it('uses the first selected row as anchor when no plain click came first', () => {
            const onApplyRange = makeApplyMock();
            const {result} = renderHook(() =>
                useShiftRangeSelection<Row>(
                    makeParams({
                        getSelectedKeys: () => new Set(['c']),
                        onApplyRange,
                    }),
                ),
            );
            act(() => {
                result.current.applyShiftClick(ROW_E, true);
            });
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: ['c', 'd', 'e'], toDeselect: []});
        });

        it('accepts an array from getSelectedKeys in addition to a Set', () => {
            const onApplyRange = makeApplyMock();
            const {result} = renderHook(() =>
                useShiftRangeSelection<Row>(
                    makeParams({
                        getSelectedKeys: () => ['c'],
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

        it('ignores a header passed to notifyAnchor and falls back to the selected row', () => {
            const onApplyRange = makeApplyMock();
            const {result} = renderHook(() =>
                useShiftRangeSelection<Row>(
                    makeParams({
                        items: GROUPED,
                        isHeaderItem: (r) => !!r.isHeader,
                        getSelectedKeys: () => new Set(['c']),
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
            // Span a..e; collapsing to a..c drops the tail (e); disabled rows never appear.
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

    describe('seedRange', () => {
        it('seeds a block span so a subsequent shift+click collapses within the block', () => {
            const onApplyRange = makeApplyMock();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({onApplyRange})));
            act(() => result.current.seedRange(ROW_B, ROW_D, false));
            act(() => {
                result.current.applyShiftClick(ROW_C, true);
            });
            // Seeded block was b..d; collapsing to b..c drops the tail (d).
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: ['b', 'c'], toDeselect: ['d']});
        });

        it('extends the selection when the shift+click lands past the seeded block', () => {
            const onApplyRange = makeApplyMock();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({onApplyRange})));
            act(() => result.current.seedRange(ROW_B, ROW_C, false));
            act(() => {
                result.current.applyShiftClick(ROW_E, true);
            });
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: ['b', 'c', 'd', 'e'], toDeselect: []});
        });

        it('seeds a deselecting block (deselect=true) so a shift+click extends the deselection', () => {
            const onApplyRange = makeApplyMock();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({onApplyRange})));
            act(() => result.current.seedRange(ROW_B, ROW_D, true));
            act(() => {
                result.current.applyShiftClick(ROW_C, true);
            });
            // Direction is deselect: the b..c range deselects, and the dropped tail (d) flips back to select.
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: ['d'], toDeselect: ['b', 'c']});
        });

        it('clears the session when an endpoint has no key, so the next shift+click resolves a cold anchor', () => {
            const onApplyRange = makeApplyMock();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({onApplyRange})));
            act(() => result.current.seedRange(ROW_B, {keyForList: ''}, false));
            act(() => {
                // Session cleared → cold shift+click resolves the anchor from the first selectable row (a), not the seeded b.
                result.current.applyShiftClick(ROW_C, true);
            });
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: ['a', 'b', 'c'], toDeselect: []});
        });
    });

    describe('direction-aware (deselect) ranges', () => {
        const ALL_SELECTED = () => new Set(['a', 'b', 'c', 'd', 'e']);

        it('extends the deselection when the anchor row was just removed by a plain click', () => {
            const onApplyRange = makeApplyMock();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({getSelectedKeys: ALL_SELECTED, onApplyRange})));
            // 'a' is selected, so clicking it seeds a deselecting anchor.
            act(() => result.current.notifyAnchor(ROW_A));
            act(() => {
                result.current.applyShiftClick(ROW_D, true);
            });
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: [], toDeselect: ['a', 'b', 'c', 'd']});
        });

        it('still selects the range when the anchor row was just added, even if other rows are selected', () => {
            const onApplyRange = makeApplyMock();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({getSelectedKeys: () => new Set(['c']), onApplyRange})));
            // 'a' isn't selected, so it seeds a selecting anchor; the unrelated 'c' must not flip direction.
            act(() => result.current.notifyAnchor(ROW_A));
            act(() => {
                result.current.applyShiftClick(ROW_C, true);
            });
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: ['a', 'b', 'c'], toDeselect: []});
        });

        it('re-selects the collapsed tail when a deselecting range shrinks on the second shift+click', () => {
            const onApplyRange = makeApplyMock();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({getSelectedKeys: ALL_SELECTED, onApplyRange})));
            act(() => result.current.notifyAnchor(ROW_A));
            act(() => {
                result.current.applyShiftClick(ROW_E, true);
            });
            act(() => {
                result.current.applyShiftClick(ROW_C, true);
            });
            // New range a..c stays deselected; d,e fall outside and are re-selected.
            expect(nthBatchKeys(onApplyRange, 1)).toEqual({toSelect: ['d', 'e'], toDeselect: ['a', 'b', 'c']});
        });

        it('extends the deselection after select-all when a row is removed then shift+clicked (the reported flow)', () => {
            const onApplyRange = makeApplyMock();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({getSelectedKeys: ALL_SELECTED, onApplyRange})));
            act(() => result.current.seedFullRange());
            act(() => result.current.notifyAnchor(ROW_B));
            act(() => {
                result.current.applyShiftClick(ROW_D, true);
            });
            // Select-all seeds a selecting span; removing 'b' re-seeds a deselecting anchor, so shift extends the deselection.
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: [], toDeselect: ['b', 'c', 'd']});
        });

        it('a cold shift+click selects even when every row is already selected (no deselecting anchor without a click)', () => {
            const onApplyRange = makeApplyMock();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({getSelectedKeys: ALL_SELECTED, onApplyRange})));
            act(() => {
                result.current.applyShiftClick(ROW_C, true);
            });
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: ['a', 'b', 'c'], toDeselect: []});
        });
    });

    describe('items change mid-session', () => {
        it('extends from the anchor when the previous endpoint disappears mid-session', () => {
            const onApplyRange = makeApplyMock();
            const {result, rerender} = renderHook(({items}: {items: Row[]}) => useShiftRangeSelection<Row>(makeParams({items, onApplyRange})), {
                initialProps: {items: [...ROWS]},
            });
            act(() => result.current.notifyAnchor(ROW_A));
            act(() => {
                result.current.applyShiftClick(ROW_E, true);
            });
            rerender({items: ROWS.slice(0, 3)});
            onApplyRange.mockClear();
            act(() => {
                result.current.applyShiftClick(ROW_B, true);
            });
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: ['a', 'b'], toDeselect: []});
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
            const {result, rerender} = renderHook(({items}: {items: Row[]}) => useShiftRangeSelection<Row>(makeParams({items, onApplyRange, getSelectedKeys: () => ['c']})), {
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

        it('ignores notifyAnchor when the item key is empty', () => {
            const onApplyRange = makeApplyMock();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({onApplyRange})));
            act(() => result.current.notifyAnchor({keyForList: ''}));
            act(() => {
                result.current.applyShiftClick(ROW_C, true);
            });
            // The empty-key notifyAnchor was ignored, so the next shift+click falls back to the first selectable row (a).
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: ['a', 'b', 'c'], toDeselect: []});
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
});

describe('applyShiftRangeBatchToKeySet', () => {
    type Item = {keyForList: string; isDisabled?: boolean};
    const getKey = (i: Item) => i.keyForList;

    it('returns a copy of prevKeys for empty batches', () => {
        const prev = ['a', 'b'];
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

    it('re-adds a key at the end when it appears in both toDeselect and toSelect', () => {
        const out = applyShiftRangeBatchToKeySet({toSelect: [{keyForList: 'b'}], toDeselect: [{keyForList: 'b'}]}, ['a', 'b', 'c'], getKey);
        expect(out).toEqual(['a', 'c', 'b']);
    });

    it('skips items where isSelectable returns false', () => {
        const out = applyShiftRangeBatchToKeySet({toSelect: [{keyForList: 'b'}, {keyForList: 'c'}], toDeselect: []}, ['a'], getKey, (i) => i.keyForList !== 'b');
        expect(out).toEqual(['a', 'c']);
    });

    it('skips items with isDisabled or isDisabledCheckbox by default', () => {
        const out = applyShiftRangeBatchToKeySet({toSelect: [{keyForList: 'b', isDisabled: true}, {keyForList: 'c'}], toDeselect: []}, ['a'], getKey);
        expect(out).toEqual(['a', 'c']);
    });

    it('skips items whose key is null/undefined', () => {
        type WithNullKey = {keyForList: string | null};
        const out = applyShiftRangeBatchToKeySet<WithNullKey, string>({toSelect: [{keyForList: null}, {keyForList: 'c'}], toDeselect: []}, ['a'], (i) => i.keyForList);
        expect(out).toEqual(['a', 'c']);
    });
});
