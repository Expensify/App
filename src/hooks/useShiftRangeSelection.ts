import {useRef} from 'react';
import type {Modifiers, ShiftRangeBatch} from '@libs/shiftRangeSelection';

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
    applyShiftClick: (item: TItem, options?: Partial<Modifiers>) => boolean;
    notifyAnchor: (item: TItem) => void;
    notifyRange: (anchor: TItem, end: TItem) => void;
    clearAnchor: () => void;
    getAnchorKey: () => string | null;
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
    // Session lives entirely in event handlers, never in render output — useRef avoids re-renders that useReducer/useState would trigger.
    const sessionRef = useRef<SessionState>(IDLE);

    return {
        applyShiftClick: (target, options) => {
            if (!options?.shiftKey) {
                return false;
            }
            const result = computeShiftRange(params, sessionRef.current, target);
            if (!result) {
                return false;
            }
            if (result.batch.toSelect.length || result.batch.toDeselect.length) {
                params.onApplyRange?.(result.batch);
            }
            sessionRef.current = sessionReducer(sessionRef.current, {type: 'range', anchor: result.anchor, prevEnd: result.prevEnd});
            return true;
        },
        notifyAnchor: (item) => {
            const key = keyOf(params, item);
            if (key) {
                sessionRef.current = sessionReducer(sessionRef.current, {type: 'notify', key});
            }
        },
        notifyRange: (anchor, end) => {
            const anchorKey = keyOf(params, anchor);
            const endKey = keyOf(params, end);
            if (anchorKey && endKey) {
                sessionRef.current = sessionReducer(sessionRef.current, {type: 'range', anchor: anchorKey, prevEnd: endKey});
            }
        },
        clearAnchor: () => {
            sessionRef.current = sessionReducer(sessionRef.current, {type: 'clear'});
        },
        getAnchorKey: () => (sessionRef.current.kind === 'idle' ? resolveAnchor(params, null) : sessionRef.current.anchor),
    };
}

type ShiftRangeResult<TItem> = {
    batch: ShiftRangeBatch<TItem>;
    anchor: string;
    prevEnd: string;
};

function computeShiftRange<TItem>(params: Params<TItem>, state: SessionState, target: TItem): ShiftRangeResult<TItem> | null {
    const targetKey = keyOf(params, target);
    if (!targetKey || isExcluded(params, target)) {
        return null;
    }

    let anchor: string;
    let prevEnd: string | null;
    if (state.kind === 'ranging') {
        const resolved = resolveAnchor(params, state.anchor);
        if (!resolved) {
            return null;
        }
        anchor = resolved;
        prevEnd = resolved === state.anchor ? state.prevEnd : null;
    } else {
        const seed = state.kind === 'anchored' ? state.anchor : null;
        const resolved = resolveAnchor(params, seed);
        if (!resolved) {
            return null;
        }
        anchor = resolved;
        prevEnd = null;
    }

    const anchorIdx = indexOfKey(params, anchor);
    const targetIdx = indexOfKey(params, targetKey);
    if (anchorIdx < 0 || targetIdx < 0) {
        return null;
    }

    const newRange = orderedRange(anchorIdx, targetIdx);
    const prevEndIdx = prevEnd != null ? indexOfKey(params, prevEnd) : -1;
    const prevRange = prevEndIdx >= 0 ? orderedRange(anchorIdx, prevEndIdx) : null;

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

function indexOfKey<TItem>(params: Params<TItem>, key: string): number {
    return params.items.findIndex((row) => keyOf(params, row) === key);
}

function orderedRange(a: number, b: number): readonly [number, number] {
    return a <= b ? [a, b] : [b, a];
}

function resolveAnchor<TItem>(params: Params<TItem>, source: string | null): string | null {
    if (source) {
        const idx = indexOfKey(params, source);
        if (idx >= 0 && !isExcluded(params, params.items.at(idx))) {
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
