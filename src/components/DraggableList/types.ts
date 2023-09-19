import type {DraggableChildrenFn} from 'react-beautiful-dnd';
import {FlatList} from 'react-native-gesture-handler';
import type {RenderItemParams as OriginalRenderItemParams} from 'react-native-draggable-flatlist';
import {ScrollView} from 'react-native';

type DraggableListType = <T>(props: DraggableListProps<T> & {ref?: React.ForwardedRef<FlatList<T> | ScrollView>}) => JSX.Element;

type DraggableListData<T> = {
    data: T[];
};

type DraggableListProps<T> = {
    keyExtractor: (item: T, index: number) => string;
    renderItem: (params: RenderItemParams<T>) => React.ReactNode;
    onDragEnd?: (params: DraggableListData<T>) => void;
    onDragBegin?: () => void;
    onPlaceholderIndexChange?: (placeholderIndex: number) => void;
    renderClone?: DraggableChildrenFn;
    shouldUsePortal?: boolean;
    ListFooterComponent?: React.ReactNode | null;
} & DraggableListData<T>;

type RenderItemParams<T> = OriginalRenderItemParams<T>;

export type {DraggableListProps, RenderItemParams, DraggableListType};
