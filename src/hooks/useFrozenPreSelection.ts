import {useMemo, useState} from 'react';
import CONST from '@src/CONST';

type UseFrozenPreSelectionOptions<T> = {
    /** Items to snapshot on the first ready render. */
    selectedOptions: T[];

    /** True once the underlying list has loaded and we can take the snapshot. */
    isReady: boolean;

    /** How many items the list shows. Pinning only kicks in once this passes the threshold. */
    visibleCount: number;

    /** Hold off capturing until the selection is hydrated. Defaults to true. */
    canCapture?: boolean;

    /** Skip pinning unless the list has at least this many items. Defaults to STANDARD_LIST_ITEM_LIMIT. */
    threshold?: number;

    /** Identity keys for an item, e.g. `[reportID]` or `[accountID, login]`. */
    getKeys: (option: T) => Array<string | number | undefined>;
};

function isValidKey(key: string | number | undefined | null): key is string | number {
    return key !== undefined && key !== null && key !== '' && key !== CONST.DEFAULT_NUMBER_ID;
}

/**
 * Pins the items that were pre-selected on first load to the top of a long list, so they don't
 * get lost when the user starts toggling things. Returns the frozen snapshot and an `isFrozen`
 * predicate for deduping rows elsewhere. Captures during render so callers can use it on the
 * same render where data first becomes available — no extra renders.
 */
function useFrozenPreSelection<T>({selectedOptions, isReady, visibleCount, canCapture = true, threshold = CONST.STANDARD_LIST_ITEM_LIMIT, getKeys}: UseFrozenPreSelectionOptions<T>): {
    frozen: T[];
    isFrozen: (option: T) => boolean;
} {
    // null = not captured yet; [] = captured but list was too short to pin.
    const [frozen, setFrozen] = useState<T[] | null>(null);
    if (frozen === null && isReady && canCapture) {
        setFrozen(visibleCount >= threshold ? selectedOptions : []);
    }

    const frozenList = frozen ?? [];

    const frozenKeys = useMemo(() => {
        const keys = new Set<string | number>();
        for (const option of frozenList) {
            for (const key of getKeys(option)) {
                if (!isValidKey(key)) {
                    continue;
                }
                keys.add(key);
            }
        }
        return keys;
    }, [frozenList, getKeys]);

    const isFrozen = (option: T) => {
        for (const key of getKeys(option)) {
            if (isValidKey(key) && frozenKeys.has(key)) {
                return true;
            }
        }
        return false;
    };

    return {frozen: frozenList, isFrozen};
}

export default useFrozenPreSelection;
