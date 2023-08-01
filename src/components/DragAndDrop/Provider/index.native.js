import dragAndDropProviderPropTypes from './dragAndDropProviderPropTypes';

const DragAndDropContext = {};

function DragAndDropProvider({children}) {
    return children;
}

DragAndDropProvider.propTypes = dragAndDropProviderPropTypes;
DragAndDropProvider.displayName = 'DragAndDropProvider';

export default DragAndDropProvider;
export {DragAndDropContext};
