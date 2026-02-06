import React from 'react';
import type {DragAndDropContextParams, DragAndDropProviderProps} from './types';

const DragAndDropContext = React.createContext<DragAndDropContextParams>({});

function DragAndDropProvider({children}: DragAndDropProviderProps) {
    return children;
}

export default DragAndDropProvider;
export {DragAndDropContext};
