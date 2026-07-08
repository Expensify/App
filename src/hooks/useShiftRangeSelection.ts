import type {ShiftRangeBatch} from '@libs/shiftRangeSelection';

import {useEffect, useRef, useState} from 'react';

type Params<TItem> = {
    items: TItem[];
    getItemKey: (item: TItem) => string | null | undefined;
    isItemSelected?: (item: TItem) => boolean;
    isHeaderItem?: (item: TItem) => boolean;
    isDisabledItem?: (item: TItem) => boolean;
    onApplyRange?: (batch: ShiftRangeBatch<TItem>) => void;
};

type Api<TItem> = {
    applyShiftClick: (item: TItem, shiftKey?: boolean) => boolean;
    notifyAnchor: (item: TItem) => void;
    seedRangeFromSelection: (selectedKeys: ReadonlySet<string> | readonly string[]) => void;
    seedFullRange: () => void;
    clearAnchor: () => void;
};

// `anchorWasSelected` records the anchor's pre-click selection; direction derives at apply time — an anchor its click removed (was selected,
// no longer is) extends the deselection, while a click that left the row unchanged (e.g. a row press that navigates) still selects.
type SessionState = {kind: 'idle'} | {kind: 'anchored'; anchor: string; anchorWasSelected: boolean} | {kind: 'ranging'; anchor: string; prevEnd: string; anchorWasSelected: boolean};

const IDLE: SessionState = {kind: 'idle'};

/** Shift+click range selection. Consumers notify on plain clicks / select-all so the hook can resolve an anchor for the next shift+click. */
function useShiftRangeSelection<TItem>(params: Params<TItem>): Api<TItem> {
    // The session is touched only in event handlers, never in render, so a ref avoids the re-renders state would trigger.
    const sessionRef = useRef<SessionState>(IDLE);

    // The API methods are built once but read the latest params through this ref, refreshed after every commit.
    const paramsRef = useRef(params);
    useEffect(() => {
        paramsRef.current = params;
    });

    // useState's lazy init builds the API once (setter never called) — a stable reference for deps, without reading a ref in render.
    const [api] = useState<Api<TItem>>(() => ({
        applyShiftClick: (target, shiftKey) => {
            if (!shiftKey) {
                return false;
            }
            const currentParams = paramsRef.current;
            const result = computeShiftRange(currentParams, sessionRef.current, target);
            if (!result) {
                return false;
            }
            // A successful result always spans at least the target row, so the batch is never empty — apply it unconditionally.
            currentParams.onApplyRange?.(result.batch);
            sessionRef.current = {kind: 'ranging', anchor: result.anchor, prevEnd: result.prevEnd, anchorWasSelected: result.anchorWasSelected};
            return true;
        },
        notifyAnchor: (item) => {
            const currentParams = paramsRef.current;
            const key = keyOf(currentParams, item);
            if (key == null) {
                return;
            }
            // Pre-toggle read — callers MUST call this BEFORE applying the toggle so "was selected and no longer is" identifies a real removal.
            const anchorWasSelected = currentParams.isItemSelected?.(item) ?? false;
            sessionRef.current = {kind: 'anchored', anchor: key, anchorWasSelected};
        },
        seedRangeFromSelection: (selectedKeys) => {
            // Keys are passed in rather than read from state: the caller's selection is optimistic, so reading it here would see the pre-toggle set.
            const currentParams = paramsRef.current;
            const set = selectedKeys instanceof Set ? selectedKeys : new Set(selectedKeys);
            sessionRef.current = seedRangeState(currentParams, (key) => set.has(key));
        },
        seedFullRange: () => {
            // After Select All: seed a full-list range so the next shift+click collapses the selection to the clicked sub-range.
            sessionRef.current = seedRangeState(paramsRef.current, () => true);
        },
        clearAnchor: () => {
            sessionRef.current = IDLE;
        },
    }));

    return api;
}

type ShiftRangeResult<TItem> = {
    batch: ShiftRangeBatch<TItem>;
    anchor: string;
    prevEnd: string;
    anchorWasSelected: boolean;
};

/** Built once per shift+click so the anchor/target/prevEnd lookups are O(1) instead of repeated linear scans. */
function buildKeyIndex<TItem>(params: Params<TItem>): Map<string, number> {
    const keyToIndex = new Map<string, number>();
    for (const [index, row] of params.items.entries()) {
        const key = keyOf(params, row);
        if (key !== null && !keyToIndex.has(key)) {
            keyToIndex.set(key, index);
        }
    }
    return keyToIndex;
}

/**
 * Builds a `ranging` state spanning the first→last selectable item that passes `isIncluded`, or `IDLE` when none qualify. Callers must
 * pass a contiguous selection: a sparse set (e.g. {A, E}) seeds the outer span A..E, so a later shift+click treats the gap as filled.
 * Shared by `seedFullRange` (all selectable) and `seedRangeFromSelection` (the selected subset).
 */
function seedRangeState<TItem>(params: Params<TItem>, isIncluded: (key: string) => boolean): SessionState {
    let first: TItem | null = null;
    let last: TItem | null = null;
    for (const item of params.items) {
        if (isExcluded(params, item)) {
            continue;
        }
        const key = keyOf(params, item);
        if (key === null || !isIncluded(key)) {
            continue;
        }
        if (first === null) {
            first = item;
        }
        last = item;
    }
    const anchor = keyOf(params, first);
    const prevEnd = keyOf(params, last);
    if (anchor !== null && prevEnd !== null) {
        return {kind: 'ranging', anchor, prevEnd, anchorWasSelected: false};
    }
    return IDLE;
}

function computeShiftRange<TItem>(params: Params<TItem>, state: SessionState, target: TItem): ShiftRangeResult<TItem> | null {
    const targetKey = keyOf(params, target);
    if (targetKey == null || isExcluded(params, target)) {
        return null;
    }

    const keyToIndex = buildKeyIndex(params);

    const seed = state.kind === 'idle' ? null : state.anchor;
    const anchor = resolveAnchor(params, keyToIndex, seed);
    if (anchor == null) {
        return null;
    }
    // Keep the pre-click state and prior range only while the same anchor survives; a re-resolved or cold anchor starts a fresh selecting range.
    const sameAnchor = state.kind !== 'idle' && anchor === state.anchor;
    const anchorWasSelected = sameAnchor && state.anchorWasSelected;
    const prevEnd = state.kind === 'ranging' && sameAnchor ? state.prevEnd : null;

    const anchorIdx = keyToIndex.get(anchor);
    const targetIdx = keyToIndex.get(targetKey);
    if (anchorIdx === undefined || targetIdx === undefined) {
        return null;
    }

    // Deselect only when the anchor's click actually removed it (was selected, no longer is) — not when the click left it selected (navigation).
    const anchorRow = params.items.at(anchorIdx);
    const deselect = anchorWasSelected && anchorRow != null && !(params.isItemSelected?.(anchorRow) ?? false);

    const newRange = orderedRange(anchorIdx, targetIdx);
    const prevEndIdx = prevEnd != null ? keyToIndex.get(prevEnd) : undefined;
    const prevRange = prevEndIdx !== undefined ? orderedRange(anchorIdx, prevEndIdx) : null;

    // Rows in the new range take the anchor's direction; rows the prior range covered but the new one drops collapse to the opposite.
    const rangeRows: TItem[] = [];
    for (let i = newRange[0]; i <= newRange[1]; i++) {
        const row = params.items.at(i);
        if (row && !isExcluded(params, row)) {
            rangeRows.push(row);
        }
    }
    const collapseRows: TItem[] = [];
    if (prevRange) {
        for (let i = prevRange[0]; i <= prevRange[1]; i++) {
            if (i >= newRange[0] && i <= newRange[1]) {
                continue;
            }
            const row = params.items.at(i);
            if (row && !isExcluded(params, row)) {
                collapseRows.push(row);
            }
        }
    }

    const batch: ShiftRangeBatch<TItem> = deselect ? {toSelect: collapseRows, toDeselect: rangeRows} : {toSelect: rangeRows, toDeselect: collapseRows};
    return {batch, anchor, prevEnd: targetKey, anchorWasSelected};
}

function keyOf<TItem>(params: Params<TItem>, item: TItem | null | undefined): string | null {
    if (item == null) {
        return null;
    }
    return params.getItemKey(item) ?? null;
}

function isExcluded<TItem>(params: Params<TItem>, item: TItem | null | undefined): boolean {
    if (item == null) {
        return true;
    }
    if (params.isHeaderItem?.(item)) {
        return true;
    }
    if (params.isDisabledItem?.(item)) {
        return true;
    }
    return false;
}

function orderedRange(a: number, b: number): readonly [number, number] {
    return a <= b ? [a, b] : [b, a];
}

function resolveAnchor<TItem>(params: Params<TItem>, keyToIndex: Map<string, number>, source: string | null): string | null {
    if (source !== null) {
        const idx = keyToIndex.get(source);
        if (idx !== undefined && !isExcluded(params, params.items.at(idx))) {
            return source;
        }
    }
    if (params.isItemSelected) {
        for (const row of params.items) {
            if (isExcluded(params, row)) {
                continue;
            }
            const key = keyOf(params, row);
            if (key != null && params.isItemSelected(row)) {
                return key;
            }
        }
    }
    // A first shift+click with no prior anchor and no selection ranges from the first selectable row (Excel/Sheets/Finder).
    for (const row of params.items) {
        if (isExcluded(params, row)) {
            continue;
        }
        const key = keyOf(params, row);
        if (key != null) {
            return key;
        }
    }
    return null;
}

export default useShiftRangeSelection;
