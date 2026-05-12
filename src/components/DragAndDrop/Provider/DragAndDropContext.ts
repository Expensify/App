import {createContext, useContext} from 'react';
import {defaultDragAndDropActionsContextValue, defaultDragAndDropStateContextValue} from './default';
import type {DragAndDropActionsContextType, DragAndDropStateContextType} from './types';

const DragAndDropStateContext = createContext<DragAndDropStateContextType>(defaultDragAndDropStateContextValue);
const DragAndDropActionsContext = createContext<DragAndDropActionsContextType>(defaultDragAndDropActionsContextValue);

function useDragAndDropState(): DragAndDropStateContextType {
    return useContext(DragAndDropStateContext);
}

function useDragAndDropActions(): DragAndDropActionsContextType {
    return useContext(DragAndDropActionsContext);
}

export {DragAndDropActionsContext, DragAndDropStateContext, useDragAndDropActions, useDragAndDropState};
export type {DragAndDropActionsContextType, DragAndDropStateContextType} from './types';
