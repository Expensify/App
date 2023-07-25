import DragAndDropPropTypes from './dragAndDropPropTypes';

const DragAndDrop = (props) => props.children;

DragAndDrop.propTypes = DragAndDropPropTypes;
DragAndDrop.displayName = 'DragAndDrop';

export default DragAndDrop;
