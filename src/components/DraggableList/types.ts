import type {DraggableChildrenFn} from 'react-beautiful-dnd';
import type {RenderItemParams as OriginalRenderItemParams} from 'react-native-draggable-flatlist';

type DataType<T> = {
    data: T[];
};

type DraggableListProps<T> = {
    keyExtractor: (item: T, index: number) => string;
    renderItem: (params: RenderItemParams<T>) => React.ReactNode;
    onDragEnd?: (params: DataType<T>) => void;
    onDragBegin?: () => void;
    onPlaceholderIndexChange?: (placeholderIndex: number) => void;
    renderClone?: DraggableChildrenFn;
    shouldUsePortal?: boolean;
    onContentSizeChange?: ((w: number, h: number) => void) | undefined;
    // TODO: implement on web
    onScrollOffsetChange?: (() => void) | undefined;
} & DataType<T>;

type RenderItemParams<T> = OriginalRenderItemParams<T>;

export type {DraggableListProps, RenderItemParams};
