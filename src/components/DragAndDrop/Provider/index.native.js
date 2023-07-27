import dragAndDropProviderPropTypes from './dragAndDropProviderPropTypes';

function DragAndDropProvider({children}) {
    return children;
}

DragAndDropProvider.propTypes = dragAndDropProviderPropTypes;
DragAndDropProvider.displayName = 'DragAndDropProvider';

export default DragAndDropProvider;
