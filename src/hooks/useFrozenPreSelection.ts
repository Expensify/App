import type {ListItem} from '@components/SelectionList/ListItem/types';
import type {Section} from '@components/SelectionList/SelectionListWithSections/types';

import CONST from '@src/CONST';

import {useState} from 'react';

type UseFrozenPreSelectionOptions<TItem extends ListItem> = {
    /** Item identifiers to pin on first capture. Matched against `getKey(item)`, or `item.keyForList` if `getKey` is omitted. */
    initialSelectedValues: string[];

    /** Set to `true` once the sections are ready to inspect — capture fires on the next render. */
    canCapture: boolean;

    /** Optional filter for pinned rows (e.g. to honor a search term). Needed when pinned rows may not appear in the input `sections`. */
    shouldRenderPinned?: (item: TItem) => boolean;

    /** Optional identity extractor. Defaults to `item.keyForList`. Override when the caller's identifier doesn't match `keyForList`. */
    getKey?: (item: TItem) => string | undefined;
};

/**
 * Pins pre-selected rows to a top section on first ready render, then locks them in place.
 * Toggling a pinned row updates `isSelected` without moving it.
 * Returns `sections` unchanged while not ready, or when the list is shorter than `STANDARD_LIST_ITEM_LIMIT`.
 */
function useFrozenPreSelection<TItem extends ListItem>(sections: Array<Section<TItem>>, options: UseFrozenPreSelectionOptions<TItem>): Array<Section<TItem>> {
    const {initialSelectedValues, canCapture, shouldRenderPinned, getKey} = options;
    const resolveKey = (item: TItem) => (getKey ? getKey(item) : item.keyForList);

    // null = not captured yet; empty Map = captured but the list was too short to pin.
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
