import type {ShiftRangeBatch} from '@libs/shiftRangeSelection';

import {useLayoutEffect, useRef, useState} from 'react';

type Params<TItem> = {
    /** The rendered rows, in the order they appear on screen */
    items: TItem[];

    /** Keys must be unique within `items`. A null key keeps a row out of ranges, since there is no identity to collapse it by later */
    getItemKey: (item: TItem) => string | null | undefined;

    /** Whether a row reads as selected, which is how a cold shift+click finds an anchor */
    isItemSelected: (item: TItem) => boolean;

    /** Rows a range must never deselect. Defaults to `isItemSelected`; pass it where a row can read as selected without having been picked on its own */
    isItemProtected?: (item: TItem) => boolean;

    /** Headers are never part of a range, and never anchor one */
    isHeaderItem?: (item: TItem) => boolean;

    /** Disabled rows are excluded from ranges, anchors and targets */
    isDisabledItem?: (item: TItem) => boolean;

    /** Called with the rows to select and the rows to give back, once a shift+click resolves */
    onApplyRange?: (batch: ShiftRangeBatch<TItem>) => void;
};

type Api<TItem> = {
    /** Applies a range when the click carried Shift, and reports whether it handled the click */
    applyShiftClick: (item: TItem, shiftKey?: boolean) => boolean;

    /** Records a plainly clicked row, so the next shift+click continues from there */
    notifyAnchor: (item: TItem) => void;

    /** Lets a selection made elsewhere, such as a group header, be narrowed by the next shift+click. Pass a test where the rows may still be loading */
    seedRangeFromSelection: (members: ReadonlySet<string> | readonly string[] | ((key: string) => boolean)) => void;

    /** The same, for Select All */
    seedFullRange: () => void;

    /** Forgets the session, so the next shift+click starts cold */
    clearAnchor: () => void;
};

/**
 * Shift+click only ever selects, so the session has no mode to get stuck in. `painted` is the set of rows this session
 * selected, held by key so reordering the list cannot confuse it, and shrinking a range gives back only those rows.
 */
type ResolvedSession = {kind: 'idle'} | {kind: 'anchored'; anchor: string} | {kind: 'ranging'; anchor: string; painted: ReadonlySet<string>};

/** A seeded block is held as a membership test, not as rows: it resolves at the next shift+click, so rows that had not loaded when it was seeded still join. */
type SessionState = ResolvedSession | {kind: 'seeded'; isMember: (key: string) => boolean};

const IDLE: ResolvedSession = {kind: 'idle'};

/** Nothing painted. Shared so a session that adopts no block compares against one empty set rather than allocating its own. */
const NO_KEYS: ReadonlySet<string> = new Set();

/** Shift+click range selection. Consumers notify on plain clicks / select-all so the hook can resolve an anchor for the next shift+click. */
function useShiftRangeSelection<TItem>(params: Params<TItem>): Api<TItem> {
    // The api methods are built once and read the latest params here, refreshed during the commit so a click in the same frame as a re-render sees the current rows.
    const paramsRef = useRef(params);
    useLayoutEffect(() => {
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
            const currentParams = paramsRef.current;
            const key = keyOf(currentParams, item);
            // Better to keep the last reachable anchor than store one that would send the next shift+click back to the top of the list.
            if (key == null || !canAnchor(currentParams, key)) {
                return;
            }
            sessionRef.current = {kind: 'anchored', anchor: key};
        },
        seedRangeFromSelection: (members) => {
            // Recorded, not resolved: the caller's selection is optimistic, and the rows may not even be in the list yet.
            if (typeof members === 'function') {
                sessionRef.current = {kind: 'seeded', isMember: members};
                return;
            }
            const set = members instanceof Set ? members : new Set(members);
            // A block with nothing in it is not a block: the caller selected no rows, so whatever session it would replace is still the truth.
            if (set.size === 0) {
                return;
            }
            sessionRef.current = {kind: 'seeded', isMember: (key) => set.has(key)};
        },
        seedFullRange: () => {
            // After Select All: seed a full-list range so the next shift+click collapses the selection to the clicked sub-range.
            sessionRef.current = {kind: 'seeded', isMember: () => true};
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

/** Builds a `ranging` session anchored at the first selectable item passing `isIncluded` and painting every passing key, or `null` when none qualify. */
function seedRangeState<TItem>(params: Params<TItem>, isIncluded: (key: string) => boolean): ResolvedSession | null {
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
    return null;
}

/**
 * A session with no continuity adopts rows that read as selected without having been picked on their own, since those came from a
 * block selection a range may narrow. Inert unless `isItemProtected` is passed.
 */
function adoptUnprotectedBlock<TItem>(params: Params<TItem>): ReadonlySet<string> {
    const keys = new Set<string>();
    const isProtected = params.isItemProtected ?? params.isItemSelected;
    for (const row of params.items) {
        if (isExcluded(params, row)) {
            continue;
        }
        const key = keyOf(params, row);
        if (key != null && params.isItemSelected(row) && !isProtected(row)) {
            keys.add(key);
        }
    }
    return keys;
}

/** Selected keys the session didn't paint — derived fresh each click so protection tracks the live selection; the session never deselects these. */
function protectedKeys<TItem>(params: Params<TItem>, painted: ReadonlySet<string>): ReadonlySet<string> {
    const keys = new Set<string>();
    const isProtected = params.isItemProtected ?? params.isItemSelected;
    for (const row of params.items) {
        if (isExcluded(params, row)) {
            continue;
        }
        const key = keyOf(params, row);
        if (key != null && !painted.has(key) && isProtected(row)) {
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

    // A seeded block resolves here rather than when it was seeded. With none of it on screen there is nothing to narrow, so the click starts a range where it landed.
    const resolved: ResolvedSession = state.kind === 'seeded' ? (seedRangeState(params, state.isMember) ?? {kind: 'anchored', anchor: targetKey}) : state;

    const seed = resolved.kind === 'idle' ? null : resolved.anchor;
    const anchor = resolveAnchor(params, keyToIndex, seed);
    if (anchor == null) {
        return null;
    }
    // The session survives only while the same anchor does; a re-resolved or cold anchor starts fresh.
    const sameAnchor = resolved.kind !== 'idle' && anchor === resolved.anchor;
    const continuing = resolved.kind === 'ranging' && sameAnchor;
    let prevPainted: ReadonlySet<string>;
    if (continuing) {
        prevPainted = resolved.painted;
    } else if (sameAnchor) {
        // The anchor is the row the user just clicked, so there is no earlier block for this session to adopt.
        prevPainted = NO_KEYS;
    } else {
        prevPainted = adoptUnprotectedBlock(params);
    }
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
    const targetSide = Math.sign(targetIdx - anchorIdx);
    const collapseRows: TItem[] = [];
    const carriedPainted: string[] = [];
    for (const key of prevPainted) {
        if (newRangeKeys.has(key)) {
            continue;
        }
        const idx = keyToIndex.get(key);
        if (idx === undefined) {
            // A hidden row can't go in the batch — it stays painted so the collapse lands once it's back.
            carriedPainted.push(key);
            continue;
        }
        // Crossing the anchor paints the other side without undoing this one (Gmail/production behavior); only same-side rows collapse as the endpoint moves.
        if (targetSide !== 0 && Math.sign(idx - anchorIdx) === -targetSide) {
            carriedPainted.push(key);
            continue;
        }
        const row = params.items.at(idx);
        if (row == null) {
            carriedPainted.push(key);
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
    for (const key of carriedPainted) {
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

/** Whether a key belongs to a row that is currently in the list and free to take part in a range. Matched by key: callers pass clones. */
function canAnchor<TItem>(params: Params<TItem>, key: string): boolean {
    return params.items.some((row) => keyOf(params, row) === key && !isExcluded(params, row));
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
