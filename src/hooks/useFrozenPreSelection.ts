import {useState} from 'react';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import type {Section} from '@components/SelectionList/SelectionListWithSections/types';
import CONST from '@src/CONST';

type UseFrozenPreSelectionOptions<TItem extends ListItem> = {
    /** Identifiers (matched against the result of `getKey`, or `item.keyForList` when `getKey` is omitted) of items that should be pinned at the top on first capture. */
    initialSelectedValues: string[];

    /** Whether the input sections are ready to be inspected. Capture happens on the first render where this becomes true. */
    canCapture: boolean;

    /**
     * Optional predicate to keep a captured item in the pinned section. Required for lazy-loaded
     * lists where pinned rows must outlive the current section data (e.g. to apply the search filter
     * to pinned rows that aren't otherwise present in the visible sections).
     */
    shouldRenderPinned?: (item: TItem) => boolean;

    /**
     * Optional extractor for the identity used to match items against `initialSelectedValues`.
     * Defaults to `item.keyForList`. Use this when the caller's identifier scheme doesn't match
     * `keyForList` — e.g. participants are passed in by accountID but their `keyForList` is the
     * 1:1 DM's reportID.
     */
    getKey?: (item: TItem) => string | undefined;
};

/**
 * Pins pre-selected rows to a new top section on first ready render, then locks the order.
 * Items are matched against `initialSelectedValues` using `getKey` (or `keyForList` when `getKey`
 * is omitted) and removed from their original sections; toggling a pinned row updates `isSelected`
 * in place without moving it. Returns `sections` unchanged while `canCapture` is false or when the
 * combined item count is below `STANDARD_LIST_ITEM_LIMIT`.
 */
function useFrozenPreSelection<TItem extends ListItem>(sections: Array<Section<TItem>>, options: UseFrozenPreSelectionOptions<TItem>): Array<Section<TItem>> {
    const {initialSelectedValues, canCapture, shouldRenderPinned, getKey} = options;
    const resolveKey = (item: TItem) => (getKey ? getKey(item) : item.keyForList);

    // null = not captured yet; empty Map = captured but list was too short to pin.
    const [frozenData, setFrozenData] = useState<Map<string, TItem> | null>(null);

    if (frozenData === null && canCapture) {
        const totalCount = sections.reduce((sum, section) => sum + section.data.length, 0);
        if (totalCount < CONST.STANDARD_LIST_ITEM_LIMIT) {
            setFrozenData(new Map());
        } else {
            const captured = new Map<string, TItem>();
            for (const section of sections) {
                for (const item of section.data) {
                    const key = resolveKey(item);
                    if (key && initialSelectedValues.includes(key)) {
                        captured.set(key, {...item, isSelected: false});
                    }
                }
            }
            setFrozenData(captured);
        }
    }

    if (!frozenData || frozenData.size === 0) {
        return sections;
    }

    const frozenSectionData = new Map<string, TItem>(shouldRenderPinned ? frozenData : undefined);
    const filteredSections = sections.map((section) => {
        const data: TItem[] = [];
        for (const item of section.data) {
            const key = resolveKey(item);
            if (key && frozenData.has(key)) {
                frozenSectionData.set(key, {...item, isSelected: item.isSelected});
            } else {
                data.push(item);
            }
        }
        return {...section, data};
    });

    if (shouldRenderPinned) {
        for (const [key, value] of frozenSectionData) {
            if (!shouldRenderPinned(value)) {
                frozenSectionData.delete(key);
            }
        }
    }

    if (frozenSectionData.size === 0) {
        return filteredSections;
    }

    return [{data: [...frozenSectionData.values()], sectionIndex: 0}, ...filteredSections];
}

export default useFrozenPreSelection;
