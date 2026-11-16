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
    return !!item?.isDisabled && !('isSelected' in item && isItemSelected(item));
}

/**
 * Hook that flattens sections with headers and items into a single array for FlashList.
 * Also computes disabled indexes, selected items, and initial focus index.
 */
function useFlattenedSections<TItem extends ListItem>(sections: Array<Section<TItem>>, initiallyFocusedItemKey?: string | null): UseFlattenedSectionsResult<TItem> {
    // Force memoization because this hook does not call other React hooks.
    'use memo';

    const data: Array<FlattenedItem<TItem>> = [];
    const selectedOptions: TItem[] = [];
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
            const itemData: SectionListItem<TItem> = {
                ...item,
                type: CONST.SECTION_LIST_ITEM_TYPE.ROW,
                isDisabled: section.isDisabled === true || item.isDisabled === true,
                flatListKey: `${section.sectionIndex}-${item.keyForList}`,
            };
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
}

type UseFlattenedSectionsResult<TItem extends ListItem> = {
    flattenedData: Array<FlattenedItem<TItem>>;
    disabledIndexes: number[];
    itemsCount: number;
    selectedItems: TItem[];
    initialFocusedIndex: number;
    firstFocusableIndex: number;
};

export default useFlattenedSections;
export {isItemSelected, shouldTreatItemAsDisabled};
