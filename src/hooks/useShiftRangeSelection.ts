import type {KeyboardEvent as ReactKeyboardEvent} from 'react';
import {useEffect, useMemo, useRef} from 'react';
import type {GestureResponderEvent} from 'react-native';

/**
 * Excel/AG Grid-style shift+click range selection. Consumers call notifyAnchor on plain
 * clicks / focus changes and clearAnchor on select-all / deselect-all; the session lives
 * between shift+clicks and is ended by either notify. Headers and disabled rows are excluded.
 */

type ItemWithKey = {keyForList?: string | null};

type ModifierEvent = (GestureResponderEvent | KeyboardEvent | ReactKeyboardEvent | MouseEvent) & {
    shiftKey?: boolean;
    nativeEvent?: {shiftKey?: boolean};
};

type ShiftRangeBatch<TItem> = {
    toSelect: TItem[];
    toDeselect: TItem[];
};

type KeyboardDirection = 'up' | 'down';

type Params<TItem> = {
    items: TItem[];
    getItemKey?: (item: TItem) => string | null | undefined;
    getSelectedKeys?: () => ReadonlySet<string> | readonly string[];
    isHeaderItem?: (item: TItem) => boolean;
    isDisabledItem?: (item: TItem) => boolean;
    onApplyRange: (batch: ShiftRangeBatch<TItem>) => void;
};

type Api<TItem> = {
    applyShiftClick: (item: TItem, options?: {shiftKey?: boolean}) => boolean;
    notifyAnchor: (item: TItem) => void;
    clearAnchor: () => void;
    extendByKeyboard: (direction: KeyboardDirection) => string | null;
    getAnchorKey: () => string | null;
};

type Session = {anchor: string; prevEnd: string};

function useShiftRangeSelection<TItem>(params: Params<TItem>): Api<TItem> {
    const paramsRef = useRef(params);
    useEffect(() => {
        paramsRef.current = params;
    });
    const anchorRef = useRef<string | null>(null);
    const sessionRef = useRef<Session | null>(null);

    return useMemo<Api<TItem>>(() => {
        const runRange = (target: TItem): boolean => {
            const p = paramsRef.current;
            const targetKey = keyOf(p, target);
            if (!targetKey || isExcluded(p, target)) {
                return false;
            }

            const session = sessionRef.current;
            let anchor: string;
            let prevEnd: string | null;
            if (session) {
                anchor = session.anchor;
                prevEnd = session.prevEnd;
            } else {
                const resolved = resolveAnchor(p, anchorRef.current);
                if (!resolved) {
                    return false;
                }
                anchor = resolved;
                prevEnd = null;
            }

            const anchorIdx = indexOfKey(p, anchor);
            const targetIdx = indexOfKey(p, targetKey);
            if (anchorIdx < 0 || targetIdx < 0) {
                return false;
            }

            const newRange = orderedRange(anchorIdx, targetIdx);
            const prevRange = prevEnd != null ? orderedRange(anchorIdx, indexOfKey(p, prevEnd)) : null;
            const isUsable = (i: number) => !isExcluded(p, p.items.at(i));

            const toSelect: TItem[] = [];
            for (let i = newRange[0]; i <= newRange[1]; i++) {
                if (isUsable(i)) {
                    const row = p.items.at(i);
                    if (row) {
                        toSelect.push(row);
                    }
                }
            }
            const toDeselect: TItem[] = [];
            if (prevRange) {
                for (let i = prevRange[0]; i <= prevRange[1]; i++) {
                    if (i >= newRange[0] && i <= newRange[1]) {
                        continue;
                    }
                    if (isUsable(i)) {
                        const row = p.items.at(i);
                        if (row) {
                            toDeselect.push(row);
                        }
                    }
                }
            }

            if (toSelect.length || toDeselect.length) {
                p.onApplyRange({toSelect, toDeselect});
            }
            sessionRef.current = {anchor, prevEnd: targetKey};
            return true;
        };

        return {
            applyShiftClick: (item, options) => !!options?.shiftKey && runRange(item),
            notifyAnchor: (item) => {
                const k = keyOf(paramsRef.current, item);
                if (k) {
                    anchorRef.current = k;
                }
                sessionRef.current = null;
            },
            clearAnchor: () => {
                anchorRef.current = null;
                sessionRef.current = null;
            },
            getAnchorKey: () => sessionRef.current?.anchor ?? anchorRef.current,
            extendByKeyboard: (direction) => {
                const p = paramsRef.current;
                const session = sessionRef.current;
                const fromKey = session?.prevEnd ?? anchorRef.current;
                if (!fromKey) {
                    return null;
                }
                const fromIdx = indexOfKey(p, fromKey);
                if (fromIdx < 0) {
                    return null;
                }
                const nextIdx = stepFocus(p, fromIdx, direction);
                if (nextIdx < 0) {
                    return null;
                }
                const nextRow = p.items.at(nextIdx);
                const nextKey = nextRow ? keyOf(p, nextRow) : null;
                if (!nextRow || !nextKey || !runRange(nextRow)) {
                    return null;
                }
                return nextKey;
            },
        };
    }, []);
}

function hasKeyForList(item: unknown): item is ItemWithKey {
    return typeof item === 'object' && item !== null && 'keyForList' in item;
}

function keyOf<TItem>(p: Params<TItem>, item: TItem | null | undefined): string | null {
    if (item == null) {
        return null;
    }
    if (p.getItemKey) {
        return p.getItemKey(item) ?? null;
    }
    return hasKeyForList(item) ? (item.keyForList ?? null) : null;
}

function isExcluded<TItem>(p: Params<TItem>, item: TItem | null | undefined): boolean {
    if (item == null) {
        return true;
    }
    if (p.isHeaderItem?.(item)) {
        return true;
    }
    if (p.isDisabledItem?.(item)) {
        return true;
    }
    return false;
}

function indexOfKey<TItem>(p: Params<TItem>, key: string): number {
    return p.items.findIndex((row) => keyOf(p, row) === key);
}

function orderedRange(a: number, b: number): readonly [number, number] {
    return a <= b ? [a, b] : [b, a];
}

function resolveAnchor<TItem>(p: Params<TItem>, source: string | null): string | null {
    if (source) {
        const idx = indexOfKey(p, source);
        if (idx >= 0 && !isExcluded(p, p.items.at(idx))) {
            return source;
        }
    }
    if (p.getSelectedKeys) {
        const sel = p.getSelectedKeys();
        const set: ReadonlySet<string> = sel instanceof Set ? sel : new Set(sel);
        if (set.size) {
            for (const row of p.items) {
                if (isExcluded(p, row)) {
                    continue;
                }
                const k = keyOf(p, row);
                if (k && set.has(k)) {
                    return k;
                }
            }
        }
    }
    for (const row of p.items) {
        if (isExcluded(p, row)) {
            continue;
        }
        const k = keyOf(p, row);
        if (k) {
            return k;
        }
    }
    return null;
}

function stepFocus<TItem>(p: Params<TItem>, from: number, dir: KeyboardDirection): number {
    const step = dir === 'up' ? -1 : 1;
    for (let i = from + step; i >= 0 && i < p.items.length; i += step) {
        if (!isExcluded(p, p.items.at(i))) {
            return i;
        }
    }
    return -1;
}

function getShiftKeyFromEvent(e?: ModifierEvent | null): boolean {
    return !!(e?.shiftKey ?? e?.nativeEvent?.shiftKey);
}

function applyShiftRangeBatchToKeySet<TItem, TKey extends string | number>(
    batch: ShiftRangeBatch<TItem>,
    prevKeys: readonly TKey[],
    getKey: (item: TItem) => TKey | null | undefined,
    isSelectable?: (item: TItem) => boolean,
): TKey[] {
    if (!batch.toSelect.length && !batch.toDeselect.length) {
        return [...prevKeys];
    }
    const removeSet = new Set<TKey>();
    for (const it of batch.toDeselect) {
        const k = getKey(it);
        if (k != null) {
            removeSet.add(k);
        }
    }
    const addOrdered: TKey[] = [];
    const addSet = new Set<TKey>();
    for (const it of batch.toSelect) {
        const k = getKey(it);
        if (k == null || addSet.has(k)) {
            continue;
        }
        if (isSelectable ? !isSelectable(it) : isBlocked(it)) {
            continue;
        }
        addSet.add(k);
        addOrdered.push(k);
    }
    const next: TKey[] = [];
    const seen = new Set<TKey>();
    for (const k of prevKeys) {
        if (removeSet.has(k) || seen.has(k)) {
            continue;
        }
        seen.add(k);
        next.push(k);
    }
    for (const k of addOrdered) {
        if (!seen.has(k)) {
            seen.add(k);
            next.push(k);
        }
    }
    return next;
}

function applyShiftRangeBatchToValueArray<TItem, TValue, TKey extends string | number>(
    batch: ShiftRangeBatch<TItem>,
    prevValues: readonly TValue[],
    getItemKey: (item: TItem) => TKey | null | undefined,
    getValueKey: (value: TValue) => TKey,
    buildValue: (item: TItem) => TValue | null | undefined,
    isSelectable?: (item: TItem) => boolean,
): TValue[] {
    if (!batch.toSelect.length && !batch.toDeselect.length) {
        return [...prevValues];
    }
    const removeSet = new Set<TKey>();
    for (const it of batch.toDeselect) {
        const k = getItemKey(it);
        if (k != null) {
            removeSet.add(k);
        }
    }
    const next: TValue[] = [];
    const seen = new Set<TKey>();
    for (const v of prevValues) {
        const k = getValueKey(v);
        if (removeSet.has(k) || seen.has(k)) {
            continue;
        }
        seen.add(k);
        next.push(v);
    }
    for (const it of batch.toSelect) {
        const k = getItemKey(it);
        if (k == null || seen.has(k)) {
            continue;
        }
        if (isSelectable ? !isSelectable(it) : isBlocked(it)) {
            continue;
        }
        const v = buildValue(it);
        if (v != null) {
            seen.add(k);
            next.push(v);
        }
    }
    return next;
}

function isBlocked(item: unknown): boolean {
    if (typeof item !== 'object' || item === null) {
        return false;
    }
    return ('isDisabled' in item && !!item.isDisabled) || ('isDisabledCheckbox' in item && !!item.isDisabledCheckbox);
}

export default useShiftRangeSelection;
export {getShiftKeyFromEvent, applyShiftRangeBatchToKeySet, applyShiftRangeBatchToValueArray};
export type {ShiftRangeBatch};
