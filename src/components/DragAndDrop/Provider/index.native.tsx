import React from 'react';
import {defaultDragAndDropActionsContextValue, defaultDragAndDropStateContextValue} from './default';
import {DragAndDropActionsContext, DragAndDropStateContext} from './DragAndDropContext';
import type {DragAndDropProviderProps} from './types';

function DragAndDropProvider({children}: DragAndDropProviderProps) {
    return (
        <DragAndDropStateContext.Provider value={defaultDragAndDropStateContextValue}>
            <DragAndDropActionsContext.Provider value={defaultDragAndDropActionsContextValue}>{children}</DragAndDropActionsContext.Provider>
        </DragAndDropStateContext.Provider>
    );
}

export default DragAndDropProvider;
export {useDragAndDropActions, useDragAndDropState} from './DragAndDropContext';
