import {act, renderHook} from '@testing-library/react-native';
import useShiftRangeSelection, {applyShiftRangeBatchToKeySet, applyShiftRangeBatchToValueArray, getShiftKeyFromEvent} from '@hooks/useShiftRangeSelection';
import type {ShiftRangeBatch} from '@hooks/useShiftRangeSelection';

type Row = {keyForList: string; isHeader?: boolean; isDisabled?: boolean};

const ROWS: Row[] = [{keyForList: 'a'}, {keyForList: 'b'}, {keyForList: 'c'}, {keyForList: 'd'}, {keyForList: 'e'}];

const GROUPED: Row[] = [
    {keyForList: 'h1', isHeader: true},
    {keyForList: 'a'},
    {keyForList: 'b'},
    {keyForList: 'h2', isHeader: true},
    {keyForList: 'c'},
    {keyForList: 'd'},
    {keyForList: 'e'},
];

const MIXED: Row[] = [{keyForList: 'a'}, {keyForList: 'b', isDisabled: true}, {keyForList: 'c'}, {keyForList: 'd', isDisabled: true}, {keyForList: 'e'}];

function makeParams(overrides: Partial<Parameters<typeof useShiftRangeSelection<Row>>[0]> = {}): Parameters<typeof useShiftRangeSelection<Row>>[0] {
    return {
        items: ROWS,
        onApplyRange: jest.fn(),
        ...overrides,
    };
}

function keys(batch: ShiftRangeBatch<Row>): {toSelect: string[]; toDeselect: string[]} {
    return {
        toSelect: batch.toSelect.map((r) => r.keyForList),
        toDeselect: batch.toDeselect.map((r) => r.keyForList),
    };
}

describe('useShiftRangeSelection', () => {
    describe('getAnchorKey', () => {
        it('returns null when no anchor and no session', () => {
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams()));
            expect(result.current.getAnchorKey()).toBeNull();
        });

        it('returns the last notifyAnchor key', () => {
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams()));
            act(() => result.current.notifyAnchor(ROWS[2]));
            expect(result.current.getAnchorKey()).toBe('c');
        });

        it('returns the session anchor while a shift session is active', () => {
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams()));
            act(() => result.current.notifyAnchor(ROWS[1]));
            act(() => {
                result.current.applyShiftClick(ROWS[3], {shiftKey: true});
            });
            expect(result.current.getAnchorKey()).toBe('b');
        });

        it('clearAnchor wipes both anchor and session', () => {
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

        it('returns false when the target row is a header', () => {
            const onApplyRange = jest.fn();
            const {result} = renderHook(() =>
                useShiftRangeSelection<Row>(
                    makeParams({
                        items: GROUPED,
                        isHeaderItem: (r) => !!r.isHeader,
                        onApplyRange,
                    }),
                ),
            );
            act(() => result.current.notifyAnchor(GROUPED[1]));
            let applied = true;
            act(() => {
                applied = result.current.applyShiftClick(GROUPED[3], {shiftKey: true});
            });
            expect(applied).toBe(false);
            expect(onApplyRange).not.toHaveBeenCalled();
        });

        it('returns false when the target row is disabled', () => {
            const onApplyRange = jest.fn();
            const {result} = renderHook(() =>
                useShiftRangeSelection<Row>(
                    makeParams({
                        items: MIXED,
                        isDisabledItem: (r) => !!r.isDisabled,
                        onApplyRange,
                    }),
                ),
            );
            act(() => result.current.notifyAnchor(MIXED[0]));
            let applied = true;
            act(() => {
                applied = result.current.applyShiftClick(MIXED[1], {shiftKey: true});
            });
            expect(applied).toBe(false);
            expect(onApplyRange).not.toHaveBeenCalled();
        });

        it('returns false when target has no key', () => {
            const onApplyRange = jest.fn();
            const itemsWithMissingKey = [...ROWS, {keyForList: ''} as Row];
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({items: itemsWithMissingKey, onApplyRange})));
            act(() => result.current.notifyAnchor(itemsWithMissingKey[0]));
            let applied = true;
            act(() => {
                applied = result.current.applyShiftClick(itemsWithMissingKey.at(-1) as Row, {shiftKey: true});
            });
            expect(applied).toBe(false);
        });
    });

    describe('applyShiftClick — anchor resolution', () => {
        it('uses notifyAnchor key as anchor for the first shift+click', () => {
            const onApplyRange = jest.fn();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({onApplyRange})));
            act(() => result.current.notifyAnchor(ROWS[1]));
            act(() => {
                result.current.applyShiftClick(ROWS[3], {shiftKey: true});
            });
            expect(onApplyRange).toHaveBeenCalledTimes(1);
            expect(keys(onApplyRange.mock.calls[0][0])).toEqual({toSelect: ['b', 'c', 'd'], toDeselect: []});
        });

        it('falls back to first-selected when no notifyAnchor', () => {
            const onApplyRange = jest.fn();
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
            expect(keys(onApplyRange.mock.calls[0][0])).toEqual({toSelect: ['c', 'd', 'e'], toDeselect: []});
        });

        it('accepts an array from getSelectedKeys in addition to a Set', () => {
            const onApplyRange = jest.fn();
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
            expect(keys(onApplyRange.mock.calls[0][0])).toEqual({toSelect: ['c', 'd', 'e'], toDeselect: []});
        });

        it('falls back to first-visible when no anchor and no selection', () => {
            const onApplyRange = jest.fn();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({onApplyRange})));
            act(() => {
                result.current.applyShiftClick(ROWS[2], {shiftKey: true});
            });
            expect(keys(onApplyRange.mock.calls[0][0])).toEqual({toSelect: ['a', 'b', 'c'], toDeselect: []});
        });

        it('first-visible fallback skips headers', () => {
            const onApplyRange = jest.fn();
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
                result.current.applyShiftClick(GROUPED[2], {shiftKey: true});
            });
            expect(keys(onApplyRange.mock.calls[0][0])).toEqual({toSelect: ['a', 'b'], toDeselect: []});
        });
    });

    describe('range computation — direction', () => {
        it('selects from anchor down through the target when the target is below', () => {
            const onApplyRange = jest.fn();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({onApplyRange})));
            act(() => result.current.notifyAnchor(ROWS[0]));
            act(() => {
                result.current.applyShiftClick(ROWS[3], {shiftKey: true});
            });
            expect(keys(onApplyRange.mock.calls[0][0])).toEqual({toSelect: ['a', 'b', 'c', 'd'], toDeselect: []});
        });

        it('selects from the target up through anchor when the target is above', () => {
            const onApplyRange = jest.fn();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({onApplyRange})));
            act(() => result.current.notifyAnchor(ROWS[4]));
            act(() => {
                result.current.applyShiftClick(ROWS[1], {shiftKey: true});
            });
            expect(keys(onApplyRange.mock.calls[0][0])).toEqual({toSelect: ['b', 'c', 'd', 'e'], toDeselect: []});
        });

        it('headers between anchor and target are excluded from the batch', () => {
            const onApplyRange = jest.fn();
            const {result} = renderHook(() =>
                useShiftRangeSelection<Row>(
                    makeParams({
                        items: GROUPED,
                        isHeaderItem: (r) => !!r.isHeader,
                        onApplyRange,
                    }),
                ),
            );
            act(() => result.current.notifyAnchor(GROUPED[1]));
            act(() => {
                result.current.applyShiftClick(GROUPED[5], {shiftKey: true});
            });
            expect(keys(onApplyRange.mock.calls[0][0])).toEqual({toSelect: ['a', 'b', 'c', 'd'], toDeselect: []});
        });

        it('disabled rows between anchor and target are excluded from the batch', () => {
            const onApplyRange = jest.fn();
            const {result} = renderHook(() =>
                useShiftRangeSelection<Row>(
                    makeParams({
                        items: MIXED,
                        isDisabledItem: (r) => !!r.isDisabled,
                        onApplyRange,
                    }),
                ),
            );
            act(() => result.current.notifyAnchor(MIXED[0]));
            act(() => {
                result.current.applyShiftClick(MIXED[4], {shiftKey: true});
            });
            expect(keys(onApplyRange.mock.calls[0][0])).toEqual({toSelect: ['a', 'c', 'e'], toDeselect: []});
        });
    });

    describe('session continuity', () => {
        it('deselects the tail when a second shift+click lands inside the existing range', () => {
            const onApplyRange = jest.fn();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({onApplyRange})));
            act(() => result.current.notifyAnchor(ROWS[0])); // anchor='a'
            act(() => {
                result.current.applyShiftClick(ROWS[4], {shiftKey: true}); // extend to 'e'
            });
            act(() => {
                result.current.applyShiftClick(ROWS[2], {shiftKey: true}); // shrink to 'c'
            });
            expect(keys(onApplyRange.mock.calls[1][0])).toEqual({toSelect: ['a', 'b', 'c'], toDeselect: ['d', 'e']});
        });

        it('keeps the anchor stable when a second shift+click extends past the previous end', () => {
            const onApplyRange = jest.fn();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({onApplyRange})));
            act(() => result.current.notifyAnchor(ROWS[0]));
            act(() => {
                result.current.applyShiftClick(ROWS[2], {shiftKey: true});
            });
            act(() => {
                result.current.applyShiftClick(ROWS[4], {shiftKey: true});
            });
            expect(keys(onApplyRange.mock.calls[1][0])).toEqual({toSelect: ['a', 'b', 'c', 'd', 'e'], toDeselect: []});
        });

        it('deselects the prior side when a shift+click reverses direction across the anchor', () => {
            const onApplyRange = jest.fn();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({onApplyRange})));
            act(() => result.current.notifyAnchor(ROWS[2])); // anchor='c'
            act(() => {
                result.current.applyShiftClick(ROWS[4], {shiftKey: true});
            });
            act(() => {
                result.current.applyShiftClick(ROWS[0], {shiftKey: true});
            });
            expect(keys(onApplyRange.mock.calls[1][0])).toEqual({toSelect: ['a', 'b', 'c'], toDeselect: ['d', 'e']});
        });

        it('ends the session when notifyAnchor is called mid-session, so the next shift+click starts fresh', () => {
            const onApplyRange = jest.fn();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({onApplyRange})));
            act(() => result.current.notifyAnchor(ROWS[0]));
            act(() => {
                result.current.applyShiftClick(ROWS[4], {shiftKey: true}); // session: anchor='a', prevEnd='e'
            });
            act(() => result.current.notifyAnchor(ROWS[2])); // plain click on 'c' → session ends
            act(() => {
                result.current.applyShiftClick(ROWS[3], {shiftKey: true}); // anchor='c', range ['c','d'], no deselect
            });
            expect(keys(onApplyRange.mock.calls[1][0])).toEqual({toSelect: ['c', 'd'], toDeselect: []});
        });

        it('re-emits the full range when a shift+click lands on the same target as the previous one', () => {
            const onApplyRange = jest.fn();
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
            expect(keys(onApplyRange.mock.calls[0][0])).toEqual({toSelect: ['a', 'b', 'c', 'd'], toDeselect: []});
        });
    });

    describe('extendByKeyboard', () => {
        it('returns null when no anchor and no session', () => {
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams()));
            let key: string | null = 'sentinel';
            act(() => {
                key = result.current.extendByKeyboard('down');
            });
            expect(key).toBeNull();
        });

        it('steps down from anchor and applies the range', () => {
            const onApplyRange = jest.fn();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({onApplyRange})));
            act(() => result.current.notifyAnchor(ROWS[1]));
            let key: string | null = null;
            act(() => {
                key = result.current.extendByKeyboard('down');
            });
            expect(key).toBe('c');
            expect(keys(onApplyRange.mock.calls[0][0])).toEqual({toSelect: ['b', 'c'], toDeselect: []});
        });

        it('steps up from session.prevEnd while continuing the session', () => {
            const onApplyRange = jest.fn();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({onApplyRange})));
            act(() => result.current.notifyAnchor(ROWS[1]));
            act(() => {
                result.current.applyShiftClick(ROWS[4], {shiftKey: true}); // session: anchor='b', prevEnd='e'
            });
            let key: string | null = null;
            act(() => {
                key = result.current.extendByKeyboard('up');
            });
            expect(key).toBe('d');
            expect(keys(onApplyRange.mock.calls[1][0])).toEqual({toSelect: ['b', 'c', 'd'], toDeselect: ['e']});
        });

        it('skips headers and disabled rows when stepping', () => {
            const onApplyRange = jest.fn();
            const {result} = renderHook(() =>
                useShiftRangeSelection<Row>(
                    makeParams({
                        items: GROUPED,
                        isHeaderItem: (r) => !!r.isHeader,
                        onApplyRange,
                    }),
                ),
            );
            act(() => result.current.notifyAnchor(GROUPED[2]));
            let key: string | null = null;
            act(() => {
                key = result.current.extendByKeyboard('down');
            });
            expect(key).toBe('c'); // skips header h2 between b and c
        });

        it('returns null when stepping off the end of the list', () => {
            const onApplyRange = jest.fn();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({onApplyRange})));
            act(() => result.current.notifyAnchor(ROWS[4])); // last
            let key: string | null = 'sentinel';
            act(() => {
                key = result.current.extendByKeyboard('down');
            });
            expect(key).toBeNull();
            expect(onApplyRange).not.toHaveBeenCalled();
        });
    });

    describe('defensive bails', () => {
        it('returns false when every item is excluded and no anchor can be resolved', () => {
            const onApplyRange = jest.fn();
            const allHeaders: Row[] = [
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

        it('returns false when getItemKey returns null/undefined for the target', () => {
            const onApplyRange = jest.fn();
            const items: Row[] = [{keyForList: 'a'}, {keyForList: 'b'}];
            const {result} = renderHook(() =>
                useShiftRangeSelection<Row>(
                    makeParams({
                        items,
                        getItemKey: () => null,
                        onApplyRange,
                    }),
                ),
            );
            let applied = true;
            act(() => {
                applied = result.current.applyShiftClick(items[1], {shiftKey: true});
            });
            expect(applied).toBe(false);
        });

        it('does not emit deselects from a vanished previous endpoint when items change mid-session', () => {
            const onApplyRange = jest.fn();
            const {result, rerender} = renderHook(({items}: {items: Row[]}) => useShiftRangeSelection<Row>(makeParams({items, onApplyRange})), {
                initialProps: {items: ROWS},
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
            expect(keys(onApplyRange.mock.calls[0][0])).toEqual({toSelect: ['a', 'b'], toDeselect: []});
        });

        it('extendByKeyboard returns null when the focused key no longer exists in items', () => {
            const onApplyRange = jest.fn();
            const {result, rerender} = renderHook(({items}: {items: Row[]}) => useShiftRangeSelection<Row>(makeParams({items, onApplyRange})), {
                initialProps: {items: ROWS},
            });
            act(() => result.current.notifyAnchor(ROWS[2]));
            rerender({items: [{keyForList: 'x'}, {keyForList: 'y'}]});
            let key: string | null = 'sentinel';
            act(() => {
                key = result.current.extendByKeyboard('down');
            });
            expect(key).toBeNull();
            expect(onApplyRange).not.toHaveBeenCalled();
        });
    });

    describe('end-to-end interaction flows', () => {
        it('includes the anchor row in the range when the user selected then deselected it before shift+clicking', () => {
            const onApplyRange = jest.fn();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({onApplyRange})));
            act(() => result.current.notifyAnchor(ROWS[1]));
            act(() => result.current.notifyAnchor(ROWS[1]));
            act(() => {
                result.current.applyShiftClick(ROWS[4], {shiftKey: true});
            });
            expect(keys(onApplyRange.mock.calls[0][0])).toEqual({toSelect: ['b', 'c', 'd', 'e'], toDeselect: []});
        });

        it('shrinks the existing range when a second shift+click lands before the previous endpoint with no plain click in between', () => {
            const onApplyRange = jest.fn();
            const {result} = renderHook(() => useShiftRangeSelection<Row>(makeParams({onApplyRange})));
            act(() => result.current.notifyAnchor(ROWS[0]));
            act(() => {
                result.current.applyShiftClick(ROWS[4], {shiftKey: true});
            });
            act(() => {
                result.current.applyShiftClick(ROWS[2], {shiftKey: true});
            });
            expect(keys(onApplyRange.mock.calls[1][0])).toEqual({toSelect: ['a', 'b', 'c'], toDeselect: ['d', 'e']});
        });
    });
});

describe('getShiftKeyFromEvent', () => {
    it('returns false for nullish input', () => {
        expect(getShiftKeyFromEvent(undefined)).toBe(false);
        expect(getShiftKeyFromEvent(null)).toBe(false);
    });

    it('reads shiftKey from the outer event when present', () => {
        expect(getShiftKeyFromEvent({shiftKey: true} as Parameters<typeof getShiftKeyFromEvent>[0])).toBe(true);
        expect(getShiftKeyFromEvent({shiftKey: false} as Parameters<typeof getShiftKeyFromEvent>[0])).toBe(false);
    });

    it('falls back to nativeEvent.shiftKey when outer shiftKey is absent', () => {
        expect(getShiftKeyFromEvent({nativeEvent: {shiftKey: true}} as Parameters<typeof getShiftKeyFromEvent>[0])).toBe(true);
        expect(getShiftKeyFromEvent({nativeEvent: {shiftKey: false}} as Parameters<typeof getShiftKeyFromEvent>[0])).toBe(false);
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

    it('skips items where isSelectable returns false', () => {
        const out = applyShiftRangeBatchToKeySet({toSelect: [{keyForList: 'b'}, {keyForList: 'c'}], toDeselect: []}, ['a'], getKey, (i) => i.keyForList !== 'b');
        expect(out).toEqual(['a', 'c']);
    });

    it('default isSelectable skips items with isDisabled or isDisabledCheckbox', () => {
        const out = applyShiftRangeBatchToKeySet({toSelect: [{keyForList: 'b', isDisabled: true}, {keyForList: 'c'}], toDeselect: []}, ['a'], getKey);
        expect(out).toEqual(['a', 'c']);
    });

    it('skips items whose key is null/undefined', () => {
        type WithNullKey = {keyForList: string | null};
        const out = applyShiftRangeBatchToKeySet<WithNullKey, string>({toSelect: [{keyForList: null}, {keyForList: 'c'}], toDeselect: []}, ['a'], (i) => i.keyForList);
        expect(out).toEqual(['a', 'c']);
    });
});

describe('applyShiftRangeBatchToValueArray', () => {
    type Item = {id: string; isDisabled?: boolean};
    type Value = {id: string; label: string};
    const getItemKey = (i: Item) => i.id;
    const getValueKey = (v: Value) => v.id;
    const buildValue = (i: Item): Value => ({id: i.id, label: i.id.toUpperCase()});

    it('returns a copy of prevValues for empty batches', () => {
        const prev: Value[] = [{id: 'a', label: 'A'}];
        const out = applyShiftRangeBatchToValueArray({toSelect: [], toDeselect: []}, prev, getItemKey, getValueKey, buildValue);
        expect(out).toEqual(prev);
        expect(out).not.toBe(prev);
    });

    it('builds and appends new values for toSelect items', () => {
        const out = applyShiftRangeBatchToValueArray({toSelect: [{id: 'b'}, {id: 'c'}], toDeselect: []}, [{id: 'a', label: 'A'}], getItemKey, getValueKey, buildValue);
        expect(out).toEqual([
            {id: 'a', label: 'A'},
            {id: 'b', label: 'B'},
            {id: 'c', label: 'C'},
        ]);
    });

    it('removes prev values whose key matches toDeselect', () => {
        const out = applyShiftRangeBatchToValueArray(
            {toSelect: [], toDeselect: [{id: 'b'}]},
            [
                {id: 'a', label: 'A'},
                {id: 'b', label: 'B'},
                {id: 'c', label: 'C'},
            ],
            getItemKey,
            getValueKey,
            buildValue,
        );
        expect(out).toEqual([
            {id: 'a', label: 'A'},
            {id: 'c', label: 'C'},
        ]);
    });

    it('skips toSelect items whose key is already present in prev', () => {
        const out = applyShiftRangeBatchToValueArray({toSelect: [{id: 'a'}, {id: 'b'}], toDeselect: []}, [{id: 'a', label: 'A'}], getItemKey, getValueKey, buildValue);
        expect(out).toEqual([
            {id: 'a', label: 'A'},
            {id: 'b', label: 'B'},
        ]);
    });

    it('skips items where buildValue returns null/undefined', () => {
        const out = applyShiftRangeBatchToValueArray({toSelect: [{id: 'b'}, {id: 'c'}], toDeselect: []}, [{id: 'a', label: 'A'}], getItemKey, getValueKey, (i) =>
            i.id === 'b' ? null : buildValue(i),
        );
        expect(out).toEqual([
            {id: 'a', label: 'A'},
            {id: 'c', label: 'C'},
        ]);
    });

    it('skips items where isSelectable returns false', () => {
        const out = applyShiftRangeBatchToValueArray({toSelect: [{id: 'b'}, {id: 'c'}], toDeselect: []}, [{id: 'a', label: 'A'}], getItemKey, getValueKey, buildValue, (i) => i.id !== 'b');
        expect(out).toEqual([
            {id: 'a', label: 'A'},
            {id: 'c', label: 'C'},
        ]);
    });
});
