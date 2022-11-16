import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';

import variables from '../../styles/variables';

const COPY_DROP_EFFECT = 'copy';
const NONE_DROP_EFFECT = 'none';

const DragAndDropPropTypes = {
    /** Callback to fire when a file has being dragged over the text input & report body */
    onDragOver: PropTypes.func,

    /** Callback to fire when a file has been dragged into the text input & report body */
    onDragEnter: PropTypes.func.isRequired,

    /** Callback to fire when the user is no longer dragging over the text input & report body */
    onDragLeave: PropTypes.func.isRequired,

    /** Callback to fire when a file is dropped on the text input & report body */
    onDrop: PropTypes.func.isRequired,

    /** Id of the element on which we want to detect drag */
    dropZoneId: PropTypes.string.isRequired,

    /** Id of the element which is shown while drag is active */
    activeDropZoneId: PropTypes.string.isRequired,
};

const propTypes = {
    ...DragAndDropPropTypes,

    /** Rendered child component */
    children: PropTypes.node.isRequired,
};

export default class DragAndDrop extends React.Component {
    constructor(props) {
        super(props);

        this.dropZone = document.getElementById(props.dropZoneId);
        this.dropZoneRect = this.calculateDropZoneClientReact();

        this.dragOverHandler = _.throttle(this.dragOverHandler.bind(this), 100);
        this.dragNDropWindowResizeListener = _.throttle(this.dragNDropWindowResizeListener.bind(this), 100);
        this.dropZoneDragHandler = this.dropZoneDragHandler.bind(this);
        this.dropZoneDragListener = this.dropZoneDragListener.bind(this);

        /*
        Last detected drag state on the dropzone -> we start with dragleave since user is not dragging initially.
        This state is updated when drop zone is left/entered entirely(not taking the children in the account) or entire window is left
        */
        this.dropZoneDragState = 'dragleave';
    }

    componentDidMount() {
        document.addEventListener('dragover', this.dropZoneDragListener);
        document.addEventListener('dragenter', this.dropZoneDragListener);
        document.addEventListener('dragleave', this.dropZoneDragListener);
        document.addEventListener('drop', this.dropZoneDragListener);
        window.addEventListener('resize', this.dragNDropWindowResizeListener);
    }

    componentWillUnmount() {
        document.removeEventListener('dragover', this.dropZoneDragListener);
        document.removeEventListener('dragenter', this.dropZoneDragListener);
        document.removeEventListener('dragleave', this.dropZoneDragListener);
        document.removeEventListener('drop', this.dropZoneDragListener);
        window.removeEventListener('resize', this.dragNDropWindowResizeListener);
    }

    /**
     * @param {Object} event native Event
     */
    dragOverHandler(event) {
        if (!this.props.onDragOver) {
            return;
        }
        this.props.onDragOver(event);
    }

    dragNDropWindowResizeListener() {
        // Update bounding client rect on window resize
        this.dropZoneRect = this.calculateDropZoneClientReact();
    }

    calculateDropZoneClientReact() {
        const boundingClientRect = this.dropZone.getBoundingClientRect();

        // Handle edge case when we are under responsive breakpoint the browser doesn't normalize rect.left to 0 and rect.right to window.innerWidth
        return {
            width: boundingClientRect.width,
            left: window.innerWidth <= variables.mobileResponsiveWidthBreakpoint ? 0 : boundingClientRect.left,
            right: window.innerWidth <= variables.mobileResponsiveWidthBreakpoint
                ? window.innerWidth : boundingClientRect.right,
            top: boundingClientRect.top,
            bottom: boundingClientRect.bottom,
        };
    }

    /**
     * @param {Object} event native Event
     */
    dropZoneDragHandler(event) {
        // Setting dropEffect for dragover is required for '+' icon on certain platforms/browsers (eg. Safari)
        switch (event.type) {
            case 'dragover':
                // Continuous event -> can hurt performance, be careful when subscribing
                // eslint-disable-next-line no-param-reassign
                event.dataTransfer.dropEffect = COPY_DROP_EFFECT;
                this.dragOverHandler(event);
                break;
            case 'dragenter':
                // Avoid reporting onDragEnter for children views -> not performant
                if (this.dropZoneDragState === 'dragleave') {
                    this.dropZoneDragState = 'dragenter';
                    // eslint-disable-next-line no-param-reassign
                    event.dataTransfer.dropEffect = COPY_DROP_EFFECT;
                    this.props.onDragEnter(event);
                }
                break;
            case 'dragleave':
                if (this.dropZoneDragState === 'dragenter') {
                    if (
                        event.clientY <= this.dropZoneRect.top
                                || event.clientY >= this.dropZoneRect.bottom
                                || event.clientX <= this.dropZoneRect.left
                                || event.clientX >= this.dropZoneRect.right

                                // Cancel drag when file manager is on top of the drop zone area - works only on chromium
                                || (event.target.getAttribute('id') === this.props.activeDropZoneId && !event.relatedTarget)
                    ) {
                        this.dropZoneDragState = 'dragleave';
                        this.props.onDragLeave(event);
                    }
                }
                break;
            case 'drop':
                this.dropZoneDragState = 'dragleave';
                this.props.onDrop(event);
                break;
            default: break;
        }
    }

    /**
     * Handles all types of drag-N-drop events on the drop zone associated with composer
     *
     * @param {Object} event native Event
     */
    dropZoneDragListener(event) {
        event.preventDefault();
        if (this.dropZone.contains(event.target)) {
            this.dropZoneDragHandler(event);
        } else {
            // eslint-disable-next-line no-param-reassign
            event.dataTransfer.dropEffect = NONE_DROP_EFFECT;
        }
    }

    render() {
        return this.props.children;
    }
}

DragAndDrop.propTypes = propTypes;

export {
    DragAndDropPropTypes,
};
