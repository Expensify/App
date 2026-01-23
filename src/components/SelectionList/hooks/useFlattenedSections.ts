import {useMemo} from 'react';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import type {FlattenedItem, Section, SectionListItem} from '@components/SelectionList/SelectionListWithSections/types';
import CONST from '@src/CONST';

function isItemSelected<TItem extends ListItem>(item: TItem): boolean {
    return item?.isSelected ?? false;
}

/**
 * Checks if an item should be treated as disabled.
 * An item is effectively disabled if it has isDisabled=true AND is not selected.
 * Selected items remain interactive even when marked as disabled.
 */
function shouldTreatItemAsDisabled<TItem extends ListItem>(item: TItem | FlattenedItem<TItem>): boolean {
    return !!item?.isDisabled && !isItemSelected(item as TItem);
}

type UseFlattenedSectionsResult<TItem extends ListItem> = {
    /** Flattened array of headers and items for FlashList */
    flattenedData: Array<FlattenedItem<TItem>>;

    /** Indices of disabled items (headers + disabled items) for arrow key navigation */
    disabledIndexes: number[];

    /** Total count of row items (excluding headers) */
    itemsCount: number;

    /** Array of selected items */
    selectedItems: TItem[];

    /** Index of initially focused item in flattenedData, or -1 if none */
    initialFocusedIndex: number;
};

/**
 * Hook that flattens sections with headers and items into a single array for FlashList.
 * Also computes disabled indexes, selected items, and initial focus index.
 */
function useFlattenedSections<TItem extends ListItem>(sections: Array<Section<TItem>>, initiallyFocusedItemKey?: string | null): UseFlattenedSectionsResult<TItem> {
    return useMemo(() => {
        const data: Array<FlattenedItem<TItem>> = [];
        const selectedOptions: TItem[] = [];
        const disabledIndices: number[] = [];
        let focusedIndex = -1;
        let itemsTotalCount = 0;

        for (const section of sections) {
            if (section.title) {
                disabledIndices.push(data.length);
                data.push({
                    type: CONST.SECTION_LIST_ITEM_TYPE.HEADER,
                    title: section.title,
                    keyForList: `header-${section.title}`,
                    isDisabled: true,
                });
            }
            itemsTotalCount += section.data?.length ?? 0;

            for (const item of section.data ?? []) {
                const currentIndex = data.length;
                // Unique key for the item to avoid duplicates among sections
                const uniqueKey = `${item.keyForList}#${itemsTotalCount}`;
                const itemData = {
                    ...item,
                    type: CONST.SECTION_LIST_ITEM_TYPE.ROW,
                    isDisabled: section.isDisabled === true || item.isDisabled === true,
                    keyForList: uniqueKey,
                } as SectionListItem<TItem>;
                data.push(itemData);

                if (item.keyForList === initiallyFocusedItemKey) {
                    focusedIndex = currentIndex;
                }

                if (item.isSelected) {
                    selectedOptions.push(itemData);
                }

                const isDisabled = section.isDisabled === true || shouldTreatItemAsDisabled(item);
                if (isDisabled) {
                    disabledIndices.push(currentIndex);
                }
            }
        }

        return {
            flattenedData: data,
            disabledIndexes: disabledIndices,
            itemsCount: itemsTotalCount,
            selectedItems: selectedOptions,
            initialFocusedIndex: focusedIndex,
        };
    }, [initiallyFocusedItemKey, sections]);
}

export default useFlattenedSections;
export {isItemSelected, shouldTreatItemAsDisabled};
