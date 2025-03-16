import type {DraggableChildrenFn} from 'react-beautiful-dnd';
import type {RenderItemParams} from 'react-native-draggable-flatlist';
import React from 'react';

type DraggableListData<T> = {
    data: T[];
};

/**
 * Props for DraggableList are inspired by the `react-native-draggable-flatlist` library.
 * https://github.com/computerjazz/react-native-draggable-flatlist#props
 */
type DraggableListProps<T> = {
    /** Unique key for each item (required) */
    keyExtractor: (item: T, index: number) => string;

    /** Render each item. Call `drag` when the row should become active. */
    renderItem: (params: RenderItemParams<T>) => React.ReactNode;

    /** Called after the animation has been completed. Returns updated ordering of data  */
    onDragEnd?: (params: DraggableListData<T>) => void;

    /**  Function used to render a clone (replacement) of the dragging draggable while a drag is occurring. */
    renderClone?: DraggableChildrenFn;

    /** [web] Portals are required when any of the parent components use transform prop. */
    shouldUsePortal?: boolean;

    /** Rendered at the bottom of all the items. Just like in the FlatList. */
    ListFooterComponent?: React.ReactElement;
} & DraggableListData<T>;

type SortableItemProps = {
    id: string | number;
    children:  React.ReactNode | React.ReactNode[];
}

export type { DraggableListProps, RenderItemParams, DraggableListData, SortableItemProps };
