import type {DragAndDropContextParams, DragAndDropProviderProps} from './types';

const DragAndDropContext: DragAndDropContextParams = {};

function DragAndDropProvider({children}: DragAndDropProviderProps) {
    return children;
}

DragAndDropProvider.displayName = 'DragAndDropProvider';

export default DragAndDropProvider;
export {DragAndDropContext};
