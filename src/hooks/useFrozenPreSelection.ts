import {useMemo, useState} from 'react';
import CONST from '@src/CONST';

type UseFrozenPreSelectionOptions<T> = {
    /** Currently selected items. Captured as the frozen snapshot on the first ready render. */
    selectedOptions: T[];

    /** Whether the underlying options are initialized and the snapshot can be evaluated. */
    isReady: boolean;

    /** Total number of items visible in the section list used to decide whether pinning is needed. */
    visibleCount: number;

    /**
     * Extra gate to delay capture until pre-selected options have been hydrated (e.g. wait for
     * `selectedOptions` to populate from `initialAccountIDs`). Defaults to true.
     */
    canCapture?: boolean;

    /** Minimum visible-count required before pinning kicks in. Defaults to STANDARD_LIST_ITEM_LIMIT. */
    threshold?: number;

    /** Returns identity keys for an option (e.g. `[reportID]`, or `[accountID, login]`). */
    getKeys: (option: T) => Array<string | number | undefined>;
};

function isValidKey(key: string | number | undefined | null): key is string | number {
    return key !== undefined && key !== null && key !== '' && key !== CONST.DEFAULT_NUMBER_ID;
}

/**
 * Captures an immutable snapshot of the pre-selected items on the first render where data is
 * available and the visible list is long enough to warrant pinning. Returns the snapshot and a
 * predicate to dedupe rows elsewhere in the list. The snapshot is taken via React's "set state
 * during render" pattern so callers can use it on the same render where data first becomes
 * available — no extra renders are introduced.
 */
function useFrozenPreSelection<T>({selectedOptions, isReady, visibleCount, canCapture = true, threshold = CONST.STANDARD_LIST_ITEM_LIMIT, getKeys}: UseFrozenPreSelectionOptions<T>): {
    frozen: T[];
    isFrozen: (option: T) => boolean;
} {
    // `null` means we haven't captured yet; an empty array means we evaluated and chose not to pin.
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
