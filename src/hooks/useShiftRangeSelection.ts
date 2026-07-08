import type {ShiftRangeBatch} from '@libs/shiftRangeSelection';

import {useEffect, useRef, useState} from 'react';

type Params<TItem> = {
    items: TItem[];
    // Keys must be unique within items; a null/undefined key keeps the row out of ranges.
    getItemKey: (item: TItem) => string | null | undefined;
    isItemSelected: (item: TItem) => boolean;
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

// Shift+click always selects — a deselect mode left Shift looking dead. painted: keys the session selected, tracked by key so re-sorts and removals can't misattribute the collapse.
// Selected rows the session didn't paint are protected from collapse (derived per click, see protectedKeys); a seeded session paints its whole span, so Select All still collapses.
type SessionState = {kind: 'idle'} | {kind: 'anchored'; anchor: string} | {kind: 'ranging'; anchor: string; painted: ReadonlySet<string>};

const IDLE: SessionState = {kind: 'idle'};
const NO_KEYS: ReadonlySet<string> = new Set();

/** Shift+click range selection. Consumers notify on plain clicks / select-all so the hook can resolve an anchor for the next shift+click. */
function useShiftRangeSelection<TItem>(params: Params<TItem>): Api<TItem> {
    // The api methods are built once but read the latest params through this ref, refreshed after every commit.
    const paramsRef = useRef(params);
    useEffect(() => {
        paramsRef.current = params;
    });

    // The session is touched only in event handlers, never in render, so a ref avoids the re-renders state would trigger.
    const sessionRef = useRef<SessionState>(IDLE);

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
            // The session is written first so an onApplyRange that calls back into the api isn't clobbered.
            sessionRef.current = {kind: 'ranging', anchor: result.anchor, painted: result.painted};
            currentParams.onApplyRange?.(result.batch);
            return true;
        },
        notifyAnchor: (item) => {
            const key = keyOf(paramsRef.current, item);
            if (key == null) {
                return;
            }
            sessionRef.current = {kind: 'anchored', anchor: key};
        },
        seedRangeFromSelection: (selectedKeys) => {
            // Keys are passed in because the caller's selection is optimistic — reading it here would see the pre-toggle set.
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
    painted: ReadonlySet<string>;
};

/** Built once per shift+click so the anchor/target/painted lookups are O(1) instead of repeated linear scans. */
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

/** Builds a `ranging` session anchored at the first selectable item passing `isIncluded` and painting every passing key, or `IDLE` when none qualify. */
function seedRangeState<TItem>(params: Params<TItem>, isIncluded: (key: string) => boolean): SessionState {
    let anchor: string | null = null;
    const painted = new Set<string>();
    for (const item of params.items) {
        if (isExcluded(params, item)) {
            continue;
        }
        const key = keyOf(params, item);
        if (key === null || !isIncluded(key)) {
            continue;
        }
        anchor ??= key;
        painted.add(key);
    }
    if (anchor !== null) {
        return {kind: 'ranging', anchor, painted};
    }
    return IDLE;
}

/** Selected keys the session didn't paint — derived fresh each click so protection tracks the live selection; the session never deselects these. */
function protectedKeys<TItem>(params: Params<TItem>, painted: ReadonlySet<string>): ReadonlySet<string> {
    const keys = new Set<string>();
    for (const row of params.items) {
        const key = keyOf(params, row);
        if (key != null && !painted.has(key) && params.isItemSelected(row)) {
            keys.add(key);
        }
    }
    return keys;
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
    // The session survives only while the same anchor does; a re-resolved or cold anchor starts fresh.
    const sameAnchor = state.kind !== 'idle' && anchor === state.anchor;
    const continuing = state.kind === 'ranging' && sameAnchor;
    const prevPainted: ReadonlySet<string> = continuing ? state.painted : NO_KEYS;
    const preSelected = protectedKeys(params, prevPainted);

    const anchorIdx = keyToIndex.get(anchor);
    const targetIdx = keyToIndex.get(targetKey);
    if (anchorIdx === undefined || targetIdx === undefined) {
        return null;
    }

    const newRange = orderedRange(anchorIdx, targetIdx);
    const rangeRows: TItem[] = [];
    const newRangeKeys = new Set<string>();
    for (let i = newRange[0]; i <= newRange[1]; i++) {
        const row = params.items.at(i);
        if (row == null || isExcluded(params, row)) {
            continue;
        }
        const key = keyOf(params, row);
        // No key means no identity to collapse by later, so the row can't join the range.
        if (key == null) {
            continue;
        }
        rangeRows.push(row);
        newRangeKeys.add(key);
    }

    // Painted rows that leave the range collapse back to deselected, matched by key so re-sorts and removals can't hide them.
    const collapseRows: TItem[] = [];
    const hiddenPainted: string[] = [];
    for (const key of prevPainted) {
        if (newRangeKeys.has(key)) {
            continue;
        }
        const idx = keyToIndex.get(key);
        const row = idx !== undefined ? params.items.at(idx) : undefined;
        if (row == null) {
            // A hidden row can't go in the batch — it stays painted so the collapse lands once it's back.
            hiddenPainted.push(key);
        } else {
            // Present rows always collapse, even ones disabled mid-session — a disabled checkbox can't be unchecked any other way.
            collapseRows.push(row);
        }
    }

    const painted = new Set<string>();
    for (const key of newRangeKeys) {
        if (!preSelected.has(key)) {
            painted.add(key);
        }
    }
    for (const key of hiddenPainted) {
        painted.add(key);
    }

    return {batch: {toSelect: rangeRows, toDeselect: collapseRows}, anchor, painted};
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
    for (const row of params.items) {
        if (isExcluded(params, row)) {
            continue;
        }
        const key = keyOf(params, row);
        if (key != null && params.isItemSelected(row)) {
            return key;
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
