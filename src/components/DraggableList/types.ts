import type {DraggableChildrenFn} from 'react-beautiful-dnd';
import {FlatList} from 'react-native-gesture-handler';
import type {RenderItemParams as OriginalRenderItemParams} from 'react-native-draggable-flatlist';

type RefType<T> = Pick<FlatList<T>, 'scrollToEnd'>;

type DraggableListType = <T>(props: DraggableListProps<T> & {ref?: React.ForwardedRef<RefType<T>>}) => JSX.Element;

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

export type {DraggableListProps, RenderItemParams, RefType, DraggableListType};
