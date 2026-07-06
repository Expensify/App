import type {ShiftRangeBatch} from '@libs/shiftRangeSelection';

import {useEffect, useRef, useState} from 'react';

type ItemWithKey = {keyForList?: string | null};

type Params<TItem> = {
    items: TItem[];
    getItemKey?: (item: TItem) => string | null | undefined;
    getSelectedKeys?: () => ReadonlySet<string> | readonly string[];
    isHeaderItem?: (item: TItem) => boolean;
    isDisabledItem?: (item: TItem) => boolean;
    onApplyRange?: (batch: ShiftRangeBatch<TItem>) => void;
};

type Api<TItem> = {
    applyShiftClick: (item: TItem, shiftKey?: boolean) => boolean;
    notifyAnchor: (item: TItem) => void;
    seedFullRange: () => void;
    clearAnchor: () => void;
};

// `deselect` makes the range direction-aware: an anchor seeded by a click that *removed* a row extends the deselection on the next
// shift+click instead of re-selecting it (the "range follows the anchor's state" model).
type SessionState = {kind: 'idle'} | {kind: 'anchored'; anchor: string; deselect: boolean} | {kind: 'ranging'; anchor: string; prevEnd: string; deselect: boolean};

type SessionEvent = {type: 'notify'; key: string; deselect: boolean} | {type: 'clear'} | {type: 'range'; anchor: string; prevEnd: string; deselect: boolean};

const IDLE: SessionState = {kind: 'idle'};

function sessionReducer(state: SessionState, event: SessionEvent): SessionState {
    switch (event.type) {
        case 'notify':
            return {kind: 'anchored', anchor: event.key, deselect: event.deselect};
        case 'clear':
            return IDLE;
        case 'range':
            return {kind: 'ranging', anchor: event.anchor, prevEnd: event.prevEnd, deselect: event.deselect};
        default: {
            const exhaustive: never = event;
            return exhaustive;
        }
    }
}

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
            if (result.batch.toSelect.length || result.batch.toDeselect.length) {
                currentParams.onApplyRange?.(result.batch);
            }
            sessionRef.current = sessionReducer(sessionRef.current, {type: 'range', anchor: result.anchor, prevEnd: result.prevEnd, deselect: result.deselect});
            return true;
        },
        notifyAnchor: (item) => {
            const currentParams = paramsRef.current;
            const key = keyOf(currentParams, item);
            if (!key) {
                return;
            }
            // A click on an already-selected row removes it → seed a deselecting anchor so the next shift+click extends the deselection. Selecting clicks seed a normal anchor.
            const deselect = isSelected(currentParams, key);
            sessionRef.current = sessionReducer(sessionRef.current, {type: 'notify', key, deselect});
        },
        seedFullRange: () => {
            // After Select All: seed a full-list range so the next shift+click collapses the selection to the clicked sub-range.
            const currentParams = paramsRef.current;
            let first: TItem | null = null;
            let last: TItem | null = null;
            for (const item of currentParams.items) {
                if (isExcluded(currentParams, item) || !keyOf(currentParams, item)) {
                    continue;
                }
                if (first === null) {
                    first = item;
                }
                last = item;
            }
            const anchorKey = keyOf(currentParams, first);
            const endKey = keyOf(currentParams, last);
            if (anchorKey && endKey) {
                sessionRef.current = sessionReducer(sessionRef.current, {type: 'range', anchor: anchorKey, prevEnd: endKey, deselect: false});
            } else {
                sessionRef.current = sessionReducer(sessionRef.current, {type: 'clear'});
            }
        },
        clearAnchor: () => {
            sessionRef.current = sessionReducer(sessionRef.current, {type: 'clear'});
        },
    }));

    return api;
}

type ShiftRangeResult<TItem> = {
    batch: ShiftRangeBatch<TItem>;
    anchor: string;
    prevEnd: string;
    deselect: boolean;
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

function computeShiftRange<TItem>(params: Params<TItem>, state: SessionState, target: TItem): ShiftRangeResult<TItem> | null {
    const targetKey = keyOf(params, target);
    if (!targetKey || isExcluded(params, target)) {
        return null;
    }

    const keyToIndex = buildKeyIndex(params);

    const seed = state.kind === 'idle' ? null : state.anchor;
    const anchor = resolveAnchor(params, keyToIndex, seed);
    if (!anchor) {
        return null;
    }
    // Keep the direction and prior range only while the same anchor survives; a re-resolved or cold anchor starts a fresh selecting range.
    const sameAnchor = state.kind !== 'idle' && anchor === state.anchor;
    const deselect = sameAnchor ? state.deselect : false;
    const prevEnd = state.kind === 'ranging' && sameAnchor ? state.prevEnd : null;

    const anchorIdx = keyToIndex.get(anchor);
    const targetIdx = keyToIndex.get(targetKey);
    if (anchorIdx === undefined || targetIdx === undefined) {
        return null;
    }

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
    return {batch, anchor, prevEnd: targetKey, deselect};
}

function hasKeyForList(item: unknown): item is ItemWithKey {
    return typeof item === 'object' && item !== null && 'keyForList' in item;
}

function keyOf<TItem>(params: Params<TItem>, item: TItem | null | undefined): string | null {
    if (item == null) {
        return null;
    }
    if (params.getItemKey) {
        return params.getItemKey(item) ?? null;
    }
    return hasKeyForList(item) ? (item.keyForList ?? null) : null;
}

function isSelected<TItem>(params: Params<TItem>, key: string): boolean {
    const selected = params.getSelectedKeys?.();
    if (!selected) {
        return false;
    }
    return (selected instanceof Set ? selected : new Set(selected)).has(key);
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
    if (params.getSelectedKeys) {
        const selected = params.getSelectedKeys();
        const set: ReadonlySet<string> = selected instanceof Set ? selected : new Set(selected);
        if (set.size) {
            for (const row of params.items) {
                if (isExcluded(params, row)) {
                    continue;
                }
                const key = keyOf(params, row);
                if (key && set.has(key)) {
                    return key;
                }
            }
        }
    }
    // A first shift+click with no prior anchor and no selection ranges from the first selectable row (Excel/Sheets/Finder).
    for (const row of params.items) {
        if (isExcluded(params, row)) {
            continue;
        }
        const key = keyOf(params, row);
        if (key) {
            return key;
        }
    }
    return null;
}

export default useShiftRangeSelection;
