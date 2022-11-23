import PropTypes from 'prop-types';

export default {
    /** Callback to fire when a file has being dragged over the text input & report body */
    onDragOver: PropTypes.func,

    /** Callback to fire when a file has been dragged into the text input & report body */
    onDragEnter: PropTypes.func.isRequired,

    /** Callback to fire when the user is no longer dragging over the text input & report body */
    onDragLeave: PropTypes.func.isRequired,

    /** Callback to fire when a file is dropped on the text input & report body */
    onDrop: PropTypes.func.isRequired,

    /** Guard for accepting drops in drop zone. Drag event is passed to this function as first parameter */
    shouldAcceptDrop: PropTypes.func,

    /** Id of the element on which we want to detect drag */
    dropZoneId: PropTypes.string.isRequired,

    /** Id of the element which is shown while drag is active */
    activeDropZoneId: PropTypes.string.isRequired,
};
