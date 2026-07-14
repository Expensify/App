import {createContext, useContext} from 'react';

import type {DragAndDropActionsContextType, DragAndDropStateContextType} from './types';

import {defaultDragAndDropActionsContextValue, defaultDragAndDropStateContextValue} from './default';

const DragAndDropStateContext = createContext<DragAndDropStateContextType>(defaultDragAndDropStateContextValue);
const DragAndDropActionsContext = createContext<DragAndDropActionsContextType>(defaultDragAndDropActionsContextValue);

function useDragAndDropState(): DragAndDropStateContextType {
    return useContext(DragAndDropStateContext);
}

function useDragAndDropActions(): DragAndDropActionsContextType {
    return useContext(DragAndDropActionsContext);
}

export {DragAndDropActionsContext, DragAndDropStateContext, useDragAndDropActions, useDragAndDropState};
