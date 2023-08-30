import type {DraggableChildrenFn} from 'react-beautiful-dnd';
import type {RenderItemParams as OriginalRenderItemParams} from 'react-native-draggable-flatlist';

type DefaultItemProps = {
    id: string;
};

type DraggableListProps<T extends DefaultItemProps> = {
    data: T[];
    keyExtractor: (item: T, index: number) => string;
    renderItem: (params: RenderItemParams<T>) => React.ReactNode;
    onDragEnd?: (params: {data: T[]}) => void;
    onDragBegin?: () => void;
    onPlaceholderIndexChange?: ((placeholderIndex: number) => void);
    renderClone?: DraggableChildrenFn;
    shouldUsePortal?: boolean;
    onContentSizeChange?: ((w: number, h: number) => void) | undefined;
};

type RenderItemParams<T> = OriginalRenderItemParams<T>;

export type {DefaultItemProps, DraggableListProps, RenderItemParams};
