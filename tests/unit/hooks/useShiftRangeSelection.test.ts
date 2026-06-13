import {act, renderHook} from '@testing-library/react-native';
import useShiftRangeSelection from '@hooks/useShiftRangeSelection';
import {applyShiftRangeBatchToKeySet, farthestEndFromAnchor, getModifierKeysFromEvent} from '@libs/shiftRangeSelection';
import type {ShiftRangeBatch} from '@libs/shiftRangeSelection';

type Row = {keyForList: string; isHeader?: boolean; isDisabled?: boolean};

// Fixed-length tuple types let the test access indices without triggering the `prefer-at` lint rule.
type Tuple2<T> = [T, T];
type Tuple5<T> = [T, T, T, T, T];
type Tuple6<T> = [T, T, T, T, T, T];
type Tuple7<T> = [T, T, T, T, T, T, T];

const ROWS: Tuple5<Row> = [{keyForList: 'a'}, {keyForList: 'b'}, {keyForList: 'c'}, {keyForList: 'd'}, {keyForList: 'e'}];

const GROUPED: Tuple7<Row> = [
    {keyForList: 'h1', isHeader: true},
    {keyForList: 'a'},
    {keyForList: 'b'},
    {keyForList: 'h2', isHeader: true},
    {keyForList: 'c'},
    {keyForList: 'd'},
    {keyForList: 'e'},
];

const MIXED: Tuple5<Row> = [{keyForList: 'a'}, {keyForList: 'b', isDisabled: true}, {keyForList: 'c'}, {keyForList: 'd', isDisabled: true}, {keyForList: 'e'}];

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
    describe('getAnchorKey', () => {
        it('returns null when no session and no prior anchor', () => {
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams()));
            expect(result.current.getAnchorKey()).toBeNull();
        });

        it('falls back to the first selected row when no session', () => {
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({getSelectedKeys: () => new Set(['c'])})));
            expect(result.current.getAnchorKey()).toBe('c');
        });

        it('returns null when items is empty and no selection', () => {
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({items: []})));
            expect(result.current.getAnchorKey()).toBeNull();
        });

        it('returns the key of the most recent notifyAnchor call', () => {
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams()));
            act(() => result.current.notifyAnchor(ROWS[2]));
            expect(result.current.getAnchorKey()).toBe('c');
        });

        it('returns the active anchor across a shift+click sequence', () => {
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams()));
            act(() => result.current.notifyAnchor(ROWS[1]));
            act(() => {
                result.current.applyShiftClick(ROWS[3], {shiftKey: true});
            });
            expect(result.current.getAnchorKey()).toBe('b');
        });

        it('clearAnchor resets the session so the next anchor query returns null', () => {
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams()));
            act(() => result.current.notifyAnchor(ROWS[0]));
            act(() => {
                result.current.applyShiftClick(ROWS[2], {shiftKey: true});
            });
            act(() => result.current.clearAnchor());
            expect(result.current.getAnchorKey()).toBeNull();
        });
    });

    describe('applyShiftClick — gating', () => {
        it('returns false when shiftKey is missing or false', () => {
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams()));
            act(() => result.current.notifyAnchor(ROWS[0]));
            let applied = true;
            act(() => {
                applied = result.current.applyShiftClick(ROWS[2]);
            });
            expect(applied).toBe(false);
            act(() => {
                applied = result.current.applyShiftClick(ROWS[2], {shiftKey: false});
            });
            expect(applied).toBe(false);
        });

        it.each([
            {kind: 'header', items: GROUPED, anchor: GROUPED[1], target: GROUPED[3], excludeKey: 'isHeaderItem' as const},
            {kind: 'disabled', items: MIXED, anchor: MIXED[0], target: MIXED[1], excludeKey: 'isDisabledItem' as const},
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
                applied = result.current.applyShiftClick(target, {shiftKey: true});
            });
            expect(applied).toBe(false);
            expect(onApplyRange).not.toHaveBeenCalled();
        });

        it("returns false when the target row's key is empty", () => {
            const onApplyRange = makeApplyMock();
            const missingKeyRow: Row = {keyForList: ''};
            const itemsWithMissingKey: Tuple6<Row> = [...ROWS, missingKeyRow];
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({items: itemsWithMissingKey, onApplyRange})));
            act(() => result.current.notifyAnchor(ROWS[0]));
            let applied = true;
            act(() => {
                applied = result.current.applyShiftClick(missingKeyRow, {shiftKey: true});
            });
            expect(applied).toBe(false);
        });
    });

    describe('applyShiftClick — anchor resolution', () => {
        it('uses notifyAnchor key as anchor for the first shift+click', () => {
            const onApplyRange = makeApplyMock();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({onApplyRange})));
            act(() => result.current.notifyAnchor(ROWS[1]));
            act(() => {
                result.current.applyShiftClick(ROWS[3], {shiftKey: true});
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
                result.current.applyShiftClick(ROWS[4], {shiftKey: true});
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
                result.current.applyShiftClick(ROWS[4], {shiftKey: true});
            });
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: ['c', 'd', 'e'], toDeselect: []});
        });

        it('returns false when nothing is selected and no prior anchor', () => {
            const onApplyRange = makeApplyMock();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({onApplyRange})));
            let consumed = false;
            act(() => {
                consumed = result.current.applyShiftClick(ROWS[2], {shiftKey: true});
            });
            expect(consumed).toBe(false);
            expect(onApplyRange).not.toHaveBeenCalled();
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
            act(() => result.current.notifyAnchor(GROUPED[0]));
            act(() => {
                result.current.applyShiftClick(GROUPED[5], {shiftKey: true});
            });
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: ['c', 'd'], toDeselect: []});
        });

        it('ignores a disabled row passed to notifyAnchor and emits nothing when no selection exists', () => {
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
            act(() => result.current.notifyAnchor(MIXED[1]));
            let consumed = false;
            act(() => {
                consumed = result.current.applyShiftClick(MIXED[4], {shiftKey: true});
            });
            expect(consumed).toBe(false);
            expect(onApplyRange).not.toHaveBeenCalled();
        });
    });

    describe('range computation', () => {
        it('selects from anchor down through the target when the target is below', () => {
            const onApplyRange = makeApplyMock();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({onApplyRange})));
            act(() => result.current.notifyAnchor(ROWS[0]));
            act(() => {
                result.current.applyShiftClick(ROWS[3], {shiftKey: true});
            });
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: ['a', 'b', 'c', 'd'], toDeselect: []});
        });

        it('selects from the target up through anchor when the target is above', () => {
            const onApplyRange = makeApplyMock();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({onApplyRange})));
            act(() => result.current.notifyAnchor(ROWS[4]));
            act(() => {
                result.current.applyShiftClick(ROWS[1], {shiftKey: true});
            });
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: ['b', 'c', 'd', 'e'], toDeselect: []});
        });

        it.each([
            {kind: 'headers', items: GROUPED, anchor: GROUPED[1], target: GROUPED[5], excludeKey: 'isHeaderItem' as const, expected: ['a', 'b', 'c', 'd']},
            {kind: 'disabled rows', items: MIXED, anchor: MIXED[0], target: MIXED[4], excludeKey: 'isDisabledItem' as const, expected: ['a', 'c', 'e']},
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
                result.current.applyShiftClick(target, {shiftKey: true});
            });
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: expected, toDeselect: []});
        });

        it('emits a single-row batch when the target equals the anchor', () => {
            const onApplyRange = makeApplyMock();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({onApplyRange})));
            act(() => result.current.notifyAnchor(ROWS[2]));
            act(() => {
                result.current.applyShiftClick(ROWS[2], {shiftKey: true});
            });
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: ['c'], toDeselect: []});
        });
    });

    describe('session continuity', () => {
        it('deselects the tail when a second shift+click lands inside the existing range', () => {
            const onApplyRange = makeApplyMock();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({onApplyRange})));
            act(() => result.current.notifyAnchor(ROWS[0]));
            act(() => {
                result.current.applyShiftClick(ROWS[4], {shiftKey: true});
            });
            act(() => {
                result.current.applyShiftClick(ROWS[2], {shiftKey: true});
            });
            expect(nthBatchKeys(onApplyRange, 1)).toEqual({toSelect: ['a', 'b', 'c'], toDeselect: ['d', 'e']});
        });

        it('keeps the anchor stable when a second shift+click extends past the previous end', () => {
            const onApplyRange = makeApplyMock();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({onApplyRange})));
            act(() => result.current.notifyAnchor(ROWS[0]));
            act(() => {
                result.current.applyShiftClick(ROWS[2], {shiftKey: true});
            });
            act(() => {
                result.current.applyShiftClick(ROWS[4], {shiftKey: true});
            });
            expect(nthBatchKeys(onApplyRange, 1)).toEqual({toSelect: ['a', 'b', 'c', 'd', 'e'], toDeselect: []});
        });

        it('deselects the prior side when a shift+click reverses direction across the anchor', () => {
            const onApplyRange = makeApplyMock();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({onApplyRange})));
            act(() => result.current.notifyAnchor(ROWS[2]));
            act(() => {
                result.current.applyShiftClick(ROWS[4], {shiftKey: true});
            });
            act(() => {
                result.current.applyShiftClick(ROWS[0], {shiftKey: true});
            });
            expect(nthBatchKeys(onApplyRange, 1)).toEqual({toSelect: ['a', 'b', 'c'], toDeselect: ['d', 'e']});
        });

        it('notifyAnchor mid-session ends the session', () => {
            const onApplyRange = makeApplyMock();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({onApplyRange})));
            act(() => result.current.notifyAnchor(ROWS[0]));
            act(() => {
                result.current.applyShiftClick(ROWS[4], {shiftKey: true});
            });
            act(() => result.current.notifyAnchor(ROWS[2]));
            act(() => {
                result.current.applyShiftClick(ROWS[3], {shiftKey: true});
            });
            expect(nthBatchKeys(onApplyRange, 1)).toEqual({toSelect: ['c', 'd'], toDeselect: []});
        });

        it('re-emits the full range when a shift+click lands on the same target as the previous one', () => {
            const onApplyRange = makeApplyMock();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({onApplyRange})));
            act(() => result.current.notifyAnchor(ROWS[0]));
            act(() => {
                result.current.applyShiftClick(ROWS[3], {shiftKey: true});
            });
            onApplyRange.mockClear();
            act(() => {
                result.current.applyShiftClick(ROWS[3], {shiftKey: true});
            });
            expect(onApplyRange).toHaveBeenCalledTimes(1);
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: ['a', 'b', 'c', 'd'], toDeselect: []});
        });

        it('clearAnchor mid-session lets the next shift+click start fresh', () => {
            const onApplyRange = makeApplyMock();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({onApplyRange})));
            act(() => result.current.notifyAnchor(ROWS[0]));
            act(() => {
                result.current.applyShiftClick(ROWS[4], {shiftKey: true});
            });
            act(() => result.current.clearAnchor());
            onApplyRange.mockClear();
            act(() => {
                result.current.notifyAnchor(ROWS[2]);
            });
            act(() => {
                result.current.applyShiftClick(ROWS[3], {shiftKey: true});
            });
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: ['c', 'd'], toDeselect: []});
        });
    });

    describe('notifyRange', () => {
        it('deselects items outside the new range on a subsequent shift+click', () => {
            const onApplyRange = makeApplyMock();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({onApplyRange})));
            act(() => result.current.notifyRange(ROWS[0], ROWS[4]));
            act(() => {
                result.current.applyShiftClick(ROWS[2], {shiftKey: true});
            });
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: ['a', 'b', 'c'], toDeselect: ['d', 'e']});
        });

        it('reports the anchor through getAnchorKey', () => {
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams()));
            act(() => result.current.notifyRange(ROWS[1], ROWS[4]));
            expect(result.current.getAnchorKey()).toBe('b');
        });

        it('notifyAnchor after notifyRange clears the prior range so no deselect is emitted', () => {
            const onApplyRange = makeApplyMock();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({onApplyRange})));
            act(() => result.current.notifyRange(ROWS[0], ROWS[4]));
            act(() => result.current.notifyAnchor(ROWS[2]));
            act(() => {
                result.current.applyShiftClick(ROWS[3], {shiftKey: true});
            });
            // notifyAnchor resets prevEnd, so no Excel collapse from the prior range.
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: ['c', 'd'], toDeselect: []});
        });
    });

    describe('items change mid-session', () => {
        it('extends from the anchor when the previous endpoint disappears mid-session', () => {
            const onApplyRange = makeApplyMock();
            const {result, rerender} = renderHook(({items}: {items: Row[]}) => useShiftRangeSelection<Row>(makeParams({items, onApplyRange})), {
                initialProps: {items: [...ROWS]},
            });
            act(() => result.current.notifyAnchor(ROWS[0]));
            act(() => {
                result.current.applyShiftClick(ROWS[4], {shiftKey: true});
            });
            rerender({items: ROWS.slice(0, 3)});
            onApplyRange.mockClear();
            act(() => {
                result.current.applyShiftClick(ROWS[1], {shiftKey: true});
            });
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: ['a', 'b'], toDeselect: []});
        });

        it('keeps the anchor active when items shrink mid-session', () => {
            const onApplyRange = makeApplyMock();
            const {result, rerender} = renderHook(({items}: {items: Row[]}) => useShiftRangeSelection<Row>(makeParams({items, onApplyRange})), {
                initialProps: {items: [...ROWS]},
            });
            act(() => result.current.notifyAnchor(ROWS[0]));
            rerender({items: ROWS.slice(0, 3)});
            act(() => {
                result.current.applyShiftClick(ROWS[2], {shiftKey: true});
            });
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: ['a', 'b', 'c'], toDeselect: []});
        });

        it('falls back to a selected row when the ranging anchor disappears between shift+clicks', () => {
            const onApplyRange = makeApplyMock();
            // Selection includes 'c' which survives the items change — that becomes the fresh anchor.
            const {result, rerender} = renderHook(({items}: {items: Row[]}) => useShiftRangeSelection<Row>(makeParams({items, onApplyRange, getSelectedKeys: () => ['c']})), {
                initialProps: {items: [...ROWS]},
            });
            act(() => result.current.notifyAnchor(ROWS[0]));
            act(() => {
                result.current.applyShiftClick(ROWS[2], {shiftKey: true});
            });
            // Anchor 'a' is removed from the items list while the session is ranging.
            rerender({items: ROWS.slice(1)});
            onApplyRange.mockClear();
            act(() => {
                result.current.applyShiftClick(ROWS[4], {shiftKey: true});
            });
            expect(nthBatchKeys(onApplyRange, 0)).toEqual({toSelect: ['c', 'd', 'e'], toDeselect: []});
        });

        it('returns false when the ranging anchor disappears and nothing is selected', () => {
            const onApplyRange = makeApplyMock();
            const {result, rerender} = renderHook(({items}: {items: Row[]}) => useShiftRangeSelection<Row>(makeParams({items, onApplyRange})), {
                initialProps: {items: [...ROWS]},
            });
            act(() => result.current.notifyAnchor(ROWS[0]));
            act(() => {
                result.current.applyShiftClick(ROWS[2], {shiftKey: true});
            });
            rerender({items: ROWS.slice(1)});
            onApplyRange.mockClear();
            let consumed = false;
            act(() => {
                consumed = result.current.applyShiftClick(ROWS[4], {shiftKey: true});
            });
            expect(consumed).toBe(false);
            expect(onApplyRange).not.toHaveBeenCalled();
        });
    });

    describe('defensive bails', () => {
        it('returns false when every item is excluded and no anchor can be resolved', () => {
            const onApplyRange = makeApplyMock();
            const allHeaders: Tuple2<Row> = [
                {keyForList: 'h1', isHeader: true},
                {keyForList: 'h2', isHeader: true},
            ];
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
                applied = result.current.applyShiftClick(allHeaders[0], {shiftKey: true});
            });
            expect(applied).toBe(false);
            expect(onApplyRange).not.toHaveBeenCalled();
        });

        it('ignores notifyAnchor when the item key is empty', () => {
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({items: []})));
            act(() => result.current.notifyAnchor({keyForList: ''}));
            expect(result.current.getAnchorKey()).toBeNull();
        });

        it('clearAnchor on an idle hook does not emit a batch', () => {
            const onApplyRange = makeApplyMock();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({items: [], onApplyRange})));
            act(() => result.current.clearAnchor());
            expect(onApplyRange).not.toHaveBeenCalled();
            expect(result.current.getAnchorKey()).toBeNull();
        });
    });
});

describe('getModifierKeysFromEvent', () => {
    it('returns shiftKey false for nullish input', () => {
        expect(getModifierKeysFromEvent(undefined)).toEqual({shiftKey: false});
        expect(getModifierKeysFromEvent(null)).toEqual({shiftKey: false});
    });

    it('reads shiftKey from the outer event when present', () => {
        expect(getModifierKeysFromEvent({shiftKey: true}).shiftKey).toBe(true);
        expect(getModifierKeysFromEvent({shiftKey: false}).shiftKey).toBe(false);
    });

    it('falls back to nativeEvent.shiftKey when outer shiftKey is absent', () => {
        expect(getModifierKeysFromEvent({nativeEvent: {shiftKey: true}}).shiftKey).toBe(true);
        expect(getModifierKeysFromEvent({nativeEvent: {shiftKey: false}}).shiftKey).toBe(false);
    });

    it('outer shiftKey false takes precedence over nativeEvent shiftKey true', () => {
        expect(getModifierKeysFromEvent({shiftKey: false, nativeEvent: {shiftKey: true}}).shiftKey).toBe(false);
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

describe('farthestEndFromAnchor', () => {
    it('returns last when the anchor is above the group', () => {
        expect(farthestEndFromAnchor(3, 6, 0)).toBe('last');
    });

    it('returns first when the anchor is below the group', () => {
        expect(farthestEndFromAnchor(3, 6, 10)).toBe('first');
    });

    it('returns last when there is no anchor', () => {
        expect(farthestEndFromAnchor(3, 6, -1)).toBe('last');
    });
});
