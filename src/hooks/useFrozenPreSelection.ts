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
    // null = not captured yet; [] = captured but list was too short to pin.
    const [frozenKeys, setFrozenKeys] = useState<string[] | null>(null);

    if (frozenKeys === null && canCapture) {
        const totalCount = sections.reduce((sum, section) => sum + section.data.length, 0);
        if (totalCount < CONST.STANDARD_LIST_ITEM_LIMIT) {
            setFrozenKeys([]);
        } else {
            const initialSet = new Set(initialSelectedValues);
            const captured: string[] = [];
            const seen = new Set<string>();
            for (const section of sections) {
                for (const item of section.data) {
                    const key = item.keyForList;
                    if (!key || !initialSet.has(key) || seen.has(key)) {
                        continue;
                    }
                    seen.add(key);
                    captured.push(key);
                }
            }
            setFrozenKeys(captured);
        }
    }

    if (!frozenKeys || frozenKeys.length === 0) {
        return sections;
    }

    const frozenSet = new Set(frozenKeys);
    // Latest live row per frozen key, sourced from the input sections so toggles refresh in place.
    const liveByKey = new Map<string, TItem>();
    for (const section of sections) {
        for (const item of section.data) {
            const key = item.keyForList;
            if (key && frozenSet.has(key) && !liveByKey.has(key)) {
                liveByKey.set(key, item);
            }
        }
    }

    // Walk captured keys to preserve original order; drop frozen rows that aren't in any input section.
    const frozenData: TItem[] = [];
    for (const key of frozenKeys) {
        const live = liveByKey.get(key);
        if (live) {
            frozenData.push(live);
        }
    }

    const filteredSections = sections.map((section) => ({
        ...section,
        data: section.data.filter((item) => !item.keyForList || !frozenSet.has(item.keyForList)),
    }));

    if (frozenData.length === 0) {
        return filteredSections;
    }

    return [{data: frozenData, sectionIndex: 0}, ...filteredSections];
}

export default useFrozenPreSelection;
