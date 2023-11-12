import React from 'react';
import dragAndDropProviderPropTypes from './dragAndDropProviderPropTypes';

const DragAndDropContext = React.createContext({});

function DragAndDropProvider({children}) {
    return children;
}

DragAndDropProvider.propTypes = dragAndDropProviderPropTypes;
DragAndDropProvider.displayName = 'DragAndDropProvider';

export default DragAndDropProvider;
export {DragAndDropContext};
