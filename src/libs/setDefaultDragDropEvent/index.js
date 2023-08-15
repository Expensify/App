function dragDropListener(event) {
    event.preventDefault();
    // eslint-disable-next-line no-param-reassign
    event.dataTransfer.dropEffect = 'none';
}

function setDefaultDragDropEvent() {
    document.addEventListener('dragover', dragDropListener);
    document.addEventListener('dragenter', dragDropListener);
    document.addEventListener('dragleave', dragDropListener);
    document.addEventListener('drop', dragDropListener);
}
export default setDefaultDragDropEvent;
