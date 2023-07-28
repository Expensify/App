import dragAndDropConsumerPropTypes from './dragAndDropConsumerPropTypes';

function DragAndDropConsumer({children}) {
    return children;
}

DragAndDropConsumer.propTypes = dragAndDropConsumerPropTypes;
DragAndDropConsumer.displayName = 'DragAndDropConsumer';

export default DragAndDropConsumer;
