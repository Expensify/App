import {useState} from 'react';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import type {Section} from '@components/SelectionList/SelectionListWithSections/types';
import CONST from '@src/CONST';

type UseFrozenPreSelectionParams<TItem extends ListItem> = {
    /** The "main list" sections (e.g. Recents / Contacts) the hook walks to find pinned items. */
    sections: Array<Section<TItem>>;

    /** Items considered pre-selected. Snapshotted on the first ready render; order becomes the pinned order. */
    snapshotSource: TItem[];

    /** Identity used to match an item across renders. */
    getKey: (item: TItem) => string | undefined;

    /** True once the list has loaded — gates capture. */
    isReady: boolean;

    /** Total items visible. Pinning only kicks in once this passes the threshold. */
    visibleCount: number;

    /** Hold off capturing until pre-selection has hydrated. Defaults to true. */
    canCapture?: boolean;

    /** Override the threshold. Defaults to STANDARD_LIST_ITEM_LIMIT. */
    threshold?: number;

    /** sectionIndex to assign to the pinned section. Defaults to 0. */
    frozenSectionIndex?: number;
};

/**
 * Pins items that were pre-selected on first load to a new top section and locks their order, so
 * they don't get lost when the user toggles. Capture happens during render — no extra renders, no
 * `isSelected` plumbing. Pinned rows take the live item from the input sections so toggles refresh
 * the row in place; rows that drop out of the input sections (e.g. filtered by search) are omitted
 * from the pinned section too. `isFrozen` reports whether an item was captured in the snapshot,
 * regardless of whether it's currently rendered — callers use it to keep pre-selected items out of
 * their "extra-selected" section.
 */
function useFrozenPreSelection<TItem extends ListItem>({
    sections,
    snapshotSource,
    getKey,
    isReady,
    visibleCount,
    canCapture = true,
    threshold = CONST.STANDARD_LIST_ITEM_LIMIT,
    frozenSectionIndex = 0,
}: UseFrozenPreSelectionParams<TItem>): {
    frozenSections: Array<Section<TItem>>;
    listSections: Array<Section<TItem>>;
    isFrozen: (item: TItem) => boolean;
} {
    // null = not captured yet; [] = captured but list was too short to pin.
    const [snapshot, setSnapshot] = useState<TItem[] | null>(null);
    if (snapshot === null && isReady && canCapture) {
        setSnapshot(visibleCount >= threshold ? snapshotSource : []);
    }

    const frozen = snapshot ?? [];

    const frozenKeys = new Set<string>();
    for (const item of frozen) {
        const key = getKey(item);
        if (key) {
            frozenKeys.add(key);
        }
    }

    const isFrozen = (item: TItem) => {
        const key = getKey(item);
        return !!key && frozenKeys.has(key);
    };

    if (frozen.length === 0) {
        return {frozenSections: [], listSections: sections, isFrozen};
    }

    // Latest row per frozen key, sourced from the input sections so toggles refresh in place.
    const liveByKey = new Map<string, TItem>();
    for (const section of sections) {
        for (const item of section.data) {
            const key = getKey(item);
            if (key && frozenKeys.has(key) && !liveByKey.has(key)) {
                liveByKey.set(key, item);
            }
        }
    }

    // Walk the snapshot to preserve capture order; drop frozen rows that aren't in any input section.
    const frozenData: TItem[] = [];
    for (const item of frozen) {
        const key = getKey(item);
        const live = key ? liveByKey.get(key) : undefined;
        if (live) {
            frozenData.push(live);
        }
    }

    const listSections = sections.map((section) => ({
        ...section,
        data: section.data.filter((item) => !isFrozen(item)),
    }));

    return {
        frozenSections: frozenData.length > 0 ? [{data: frozenData, sectionIndex: frozenSectionIndex}] : [],
        listSections,
        isFrozen,
    };
}

export default useFrozenPreSelection;
