import {useState} from 'react';
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
};

/**
 * Pins items that were pre-selected on first load to the top of a long list, so they don't get lost
 * when the user starts toggling. Returns the snapshot plus an `isFrozen` predicate (matched by
 * `keyForList`) for deduping. Captures during render — no extra renders.
 */
function useFrozenPreSelection<T extends {keyForList?: string}>({
    selectedOptions,
    isReady,
    visibleCount,
    canCapture = true,
    threshold = CONST.STANDARD_LIST_ITEM_LIMIT,
}: UseFrozenPreSelectionOptions<T>): {
    frozen: T[];
    isFrozen: (option: T) => boolean;
} {
    // null = not captured yet; [] = captured but list was too short to pin.
    const [frozen, setFrozen] = useState<T[] | null>(null);
    if (frozen === null && isReady && canCapture) {
        setFrozen(visibleCount >= threshold ? selectedOptions : []);
    }

    const frozenKeys = new Set<string>();
    for (const option of frozen ?? []) {
        if (!option.keyForList) {
            continue;
        }
        frozenKeys.add(option.keyForList);
    }

    const isFrozen = (option: T) => !!option.keyForList && frozenKeys.has(option.keyForList);

    return {frozen: frozen ?? [], isFrozen};
}

export default useFrozenPreSelection;
