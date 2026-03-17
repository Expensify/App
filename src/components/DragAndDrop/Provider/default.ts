import type {DragAndDropActionsContextType, DragAndDropStateContextType} from './types';

const defaultDragAndDropStateContextValue: DragAndDropStateContextType = {
    isDraggingOver: false,
    dropZoneID: '',
};

const defaultDragAndDropActionsContextValue: DragAndDropActionsContextType = {
    setOnDropHandler: () => undefined,
};

export {defaultDragAndDropActionsContextValue, defaultDragAndDropStateContextValue};
