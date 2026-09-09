import type React from 'react';

type DraggableListRenderItemParams<T> = {
    item: T;
    drag: () => void;
    getIndex: () => number | undefined;
    isActive: boolean;
    isFocused?: boolean;
};

type DraggableListData<T> = {
    data: T[];
};

type DraggableListRef = {
    scrollToEnd: (options?: {animated?: boolean}) => void;
};

/** Props shared by the native LegendList drag implementation and the web sortable list. */
type DraggableListProps<T> = {
    /** Unique key for each item (required) */
    keyExtractor: (item: T, index: number) => string;

    /** Render each item. Call `drag` when the row should become active. */
    renderItem: (params: DraggableListRenderItemParams<T>) => React.ReactNode;

    /** Called after the animation has been completed. Returns updated ordering of data  */
    onDragEnd?: (params: DraggableListData<T>) => void;

    /** Called when a row is selected via Enter/Space key */
    onSelectRow?: (item: T) => void;

    isItemDragDisabled?: (item: T) => boolean;

    /** Whether the given item should be skipped during keyboard navigation */
    isItemDisabled?: (item: T) => boolean;

    /** Rendered at the bottom of all the items. Just like in the FlatList. */
    ListFooterComponent?: React.ReactElement;

    disableScroll?: boolean;

    /** Externally controlled focused index. When provided, DraggableList skips its internal keyboard navigation. */
    focusedIndex?: number;
} & DraggableListData<T>;

type SortableItemProps = {
    id: string | number;
    children: React.ReactNode;
    /** Whether dragging is disabled for this item */
    disabled?: boolean;
    /** Whether this item is currently focused for keyboard navigation */
    isFocused?: boolean;
};

export default DraggableListProps;
export type {DraggableListRef, DraggableListRenderItemParams, SortableItemProps};
