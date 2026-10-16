import type {ListItem} from '@components/SelectionList/ListItem/types';
import type {FlattenedItem, Section, SectionListItem} from '@components/SelectionList/SelectionListWithSections/types';

import CONST from '@src/CONST';

import {useMemo} from 'react';

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

type UseFlattenedSectionsResult = {
    flattenedData: Array<FlattenedItem<ListItem>>;
    disabledIndexes: number[];
    itemsCount: number;
    selectedItems: ListItem[];
    initialFocusedIndex: number;
    firstFocusableIndex: number;
};

/**
 * Non-generic implementation so OXC's React Compiler can memoize the hook.
 * OXC bails on type params inside hooks ("Unsupported declaration type for hoisting").
 */
function useFlattenedSectionsImpl(sections: Array<Section<ListItem>>, initiallyFocusedItemKey?: string | null): UseFlattenedSectionsResult {
    return useMemo(() => {
        const data: Array<FlattenedItem<ListItem>> = [];
        const selectedOptions: ListItem[] = [];
        const disabledIndices: number[] = [];
        let focusedIndex = -1;
        let firstNonHeaderIndex = -1;
        let itemsTotalCount = 0;

        for (const section of sections) {
            const sectionDataLength = section.data?.length ?? 0;
            itemsTotalCount += sectionDataLength;
            const hasHeader = sectionDataLength > 0 && (section.customHeader ?? section.title);

            if (hasHeader) {
                disabledIndices.push(data.length);
                data.push({
                    type: CONST.SECTION_LIST_ITEM_TYPE.HEADER,
                    keyForList: `header-${section.sectionIndex}`,
                    isDisabled: true,
                    ...(section.title && {title: section.title}),
                    ...(section.customHeader && {customHeader: section.customHeader}),
                });
            }

            for (const item of section.data ?? []) {
                const currentIndex = data.length;
                const itemData = {
                    ...item,
                    type: CONST.SECTION_LIST_ITEM_TYPE.ROW,
                    isDisabled: section.isDisabled === true || item.isDisabled === true,
                    flatListKey: `${section.sectionIndex}-${item.keyForList}`,
                } as SectionListItem<ListItem>;
                data.push(itemData);

                if (firstNonHeaderIndex === -1) {
                    firstNonHeaderIndex = currentIndex;
                }

                if (item.keyForList === initiallyFocusedItemKey && focusedIndex === -1) {
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
            firstFocusableIndex: firstNonHeaderIndex === -1 ? 0 : firstNonHeaderIndex,
        };
    }, [initiallyFocusedItemKey, sections]);
}

type UseFlattenedSectionsResultGeneric<TItem extends ListItem> = {
    flattenedData: Array<FlattenedItem<TItem>>;
    disabledIndexes: number[];
    itemsCount: number;
    selectedItems: TItem[];
    initialFocusedIndex: number;
    firstFocusableIndex: number;
};

/**
 * Hook that flattens sections with headers and items into a single array for FlashList.
 * Also computes disabled indexes, selected items, and initial focus index.
 */
function useFlattenedSections<TItem extends ListItem>(sections: Array<Section<TItem>>, initiallyFocusedItemKey?: string | null): UseFlattenedSectionsResultGeneric<TItem> {
    return useFlattenedSectionsImpl(sections as Array<Section<ListItem>>, initiallyFocusedItemKey) as UseFlattenedSectionsResultGeneric<TItem>;
}

export default useFlattenedSections;
export {isItemSelected, shouldTreatItemAsDisabled};
