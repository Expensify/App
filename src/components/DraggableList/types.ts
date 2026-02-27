import type React from 'react';
import type {RenderItemParams} from 'react-native-draggable-flatlist';

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

    /** Rendered at the bottom of all the items. Just like in the FlatList. */
    ListFooterComponent?: React.ReactElement;

    /** Disables scrolling of the list */
    disableScroll?: boolean;
} & DraggableListData<T>;

type SortableItemProps = {
    id: string | number;
    children: React.ReactNode | React.ReactNode[];
    /** Whether dragging is disabled for this item */
    disabled?: boolean;
};

export default DraggableListProps;
export type {SortableItemProps};
