import type React from 'react';
import type {RenderItemParams} from 'react-native-draggable-flatlist';

type DraggableListData<T> = {
    data: T[];
};

type DraggableItemState = {
    isDragDisabled: boolean;
    isDisabled: boolean;
};

function getDraggableItemState(item: unknown): DraggableItemState {
    if (!item || typeof item !== 'object') {
        return {isDragDisabled: false, isDisabled: false};
    }

    return {
        isDragDisabled: 'isDragDisabled' in item && Boolean(item.isDragDisabled),
        isDisabled: 'isDisabled' in item && Boolean(item.isDisabled),
    };
}

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

    /** Called when a row is selected via Enter key */
    onSelectRow?: (item: T) => void;

    /** Whether keyboard navigation is active for this list. Defaults to true. */
    isKeyboardActive?: boolean;

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
    /** Whether this item is currently focused for keyboard navigation */
    isFocused?: boolean;
    /** Whether this item is disabled (not selectable, skipped in Tab navigation) */
    isItemDisabled?: boolean;
};

export default DraggableListProps;
export type {SortableItemProps};
export {getDraggableItemState};
