import {useState} from 'react';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import type {Section} from '@components/SelectionList/SelectionListWithSections/types';
import CONST from '@src/CONST';

/**
 * Pins pre-selected rows to a new top section on first ready render, then locks the order.
 * Items are matched by `keyForList` against `initialSelectedValues` and removed from their
 * original sections. Returns `sections` unchanged while `canCapture` is false or when the
 * combined item count is below `STANDARD_LIST_ITEM_LIMIT`.
 */
function useFrozenPreSelection<TItem extends ListItem>(sections: Array<Section<TItem>>, initialSelectedValues: string[], canCapture: boolean): Array<Section<TItem>> {
    // null = not captured yet; empty Set = captured but list was too short to pin.
    const [frozenKeys, setFrozenKeys] = useState<Set<string> | null>(null);

    if (frozenKeys === null && canCapture) {
        const totalCount = sections.reduce((sum, section) => sum + section.data.length, 0);
        setFrozenKeys(totalCount < CONST.STANDARD_LIST_ITEM_LIMIT ? new Set() : new Set(initialSelectedValues));
    }

    if (!frozenKeys || frozenKeys.size === 0) {
        return sections;
    }

    // Walk sections in order to collect the latest live rows for frozen keys so toggles refresh in place.
    const frozenData: TItem[] = [];
    for (const section of sections) {
        for (const item of section.data) {
            if (item.keyForList && frozenKeys.has(item.keyForList)) {
                frozenData.push(item);
            }
        }
    }

    const filteredSections = sections.map((section) => ({
        ...section,
        data: section.data.filter((item) => !item.keyForList || !frozenKeys.has(item.keyForList)),
    }));

    if (frozenData.length === 0) {
        return filteredSections;
    }

    return [{data: frozenData, sectionIndex: 0}, ...filteredSections];
}

export default useFrozenPreSelection;
