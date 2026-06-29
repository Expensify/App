import {useEffect, useRef, useState} from 'react';
import type {ShiftRangeBatch} from '@libs/shiftRangeSelection';

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

type SessionState = {kind: 'idle'} | {kind: 'anchored'; anchor: string} | {kind: 'ranging'; anchor: string; prevEnd: string};

type SessionEvent = {type: 'notify'; key: string} | {type: 'clear'} | {type: 'range'; anchor: string; prevEnd: string};

const IDLE: SessionState = {kind: 'idle'};

function sessionReducer(state: SessionState, event: SessionEvent): SessionState {
    switch (event.type) {
        case 'notify':
            return {kind: 'anchored', anchor: event.key};
        case 'clear':
            return IDLE;
        case 'range':
            return {kind: 'ranging', anchor: event.anchor, prevEnd: event.prevEnd};
        default: {
            const exhaustive: never = event;
            return exhaustive;
        }
    }
}

/** Shift+click range selection. Consumers notify on plain clicks / select-all so the hook can resolve an anchor for the next shift+click. */
function useShiftRangeSelection<TItem>(params: Params<TItem>): Api<TItem> {
    // The session lives entirely in event handlers, never in render output, so a ref avoids the re-renders that updating state would trigger.
    const sessionRef = useRef<SessionState>(IDLE);

    // The API methods are built once but read the latest params through this ref, refreshed after every commit.
    const paramsRef = useRef(params);
    useEffect(() => {
        paramsRef.current = params;
    });

    // useState's lazy initializer builds the API exactly once (the setter is never called), giving a stable reference consumers can list
    // in dependency arrays — without reading a ref during render.
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
            sessionRef.current = sessionReducer(sessionRef.current, {type: 'range', anchor: result.anchor, prevEnd: result.prevEnd});
            return true;
        },
        notifyAnchor: (item) => {
            const key = keyOf(paramsRef.current, item);
            if (key) {
                sessionRef.current = sessionReducer(sessionRef.current, {type: 'notify', key});
            }
        },
        seedFullRange: () => {
            // Seed a virtual range spanning every selectable row so the next shift+click collapses the selection to it (used after Select All).
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
                sessionRef.current = sessionReducer(sessionRef.current, {type: 'range', anchor: anchorKey, prevEnd: endKey});
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
    // On a continuing range keep prevEnd only if the same anchor survived; a re-resolved anchor (its row was removed) invalidates the prior range.
    const prevEnd = state.kind === 'ranging' && anchor === state.anchor ? state.prevEnd : null;

    const anchorIdx = keyToIndex.get(anchor);
    const targetIdx = keyToIndex.get(targetKey);
    if (anchorIdx === undefined || targetIdx === undefined) {
        return null;
    }

    const newRange = orderedRange(anchorIdx, targetIdx);
    const prevEndIdx = prevEnd != null ? keyToIndex.get(prevEnd) : undefined;
    const prevRange = prevEndIdx !== undefined ? orderedRange(anchorIdx, prevEndIdx) : null;

    const toSelect: TItem[] = [];
    for (let i = newRange[0]; i <= newRange[1]; i++) {
        const row = params.items.at(i);
        if (row && !isExcluded(params, row)) {
            toSelect.push(row);
        }
    }
    const toDeselect: TItem[] = [];
    if (prevRange) {
        for (let i = prevRange[0]; i <= prevRange[1]; i++) {
            if (i >= newRange[0] && i <= newRange[1]) {
                continue;
            }
            const row = params.items.at(i);
            if (row && !isExcluded(params, row)) {
                toDeselect.push(row);
            }
        }
    }

    return {batch: {toSelect, toDeselect}, anchor, prevEnd: targetKey};
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
