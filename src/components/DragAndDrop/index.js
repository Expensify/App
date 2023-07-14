import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';

import variables from '../../styles/variables';
import DragAndDropPropTypes from './dragAndDropPropTypes';
import withNavigationFocus from '../withNavigationFocus';

const COPY_DROP_EFFECT = 'copy';
const NONE_DROP_EFFECT = 'none';

const propTypes = {
    ...DragAndDropPropTypes,

    /** Callback to fire when a file has being dragged over the text input & report body. This prop is necessary to be inlined to satisfy the linter */
    onDragOver: DragAndDropPropTypes.onDragOver,

    /** Guard for accepting drops in drop zone. Drag event is passed to this function as first parameter. This prop is necessary to be inlined to satisfy the linter */
    shouldAcceptDrop: PropTypes.func,

    /** Whether drag & drop should be disabled */
    disabled: PropTypes.bool,

    /** Rendered child component */
    children: PropTypes.node.isRequired,
};

const defaultProps = {
    onDragOver: () => {},
    shouldAcceptDrop: (e) => {
        if (e.dataTransfer.types) {
            for (let i = 0; i < e.dataTransfer.types.length; i++) {
                if (e.dataTransfer.types[i] === 'Files') {
                    return true;
                }
            }
        }
        return false;
    },
    disabled: false,
};

class DragAndDrop extends React.Component {
    constructor(props) {
        super(props);

        this.throttledDragOverHandler = _.throttle(this.dragOverHandler.bind(this), 100);
        this.throttledDragNDropWindowResizeListener = _.throttle(this.dragNDropWindowResizeListener.bind(this), 100);
        this.dropZoneDragHandler = this.dropZoneDragHandler.bind(this);
        this.dropZoneDragListener = this.dropZoneDragListener.bind(this);

        /*
        Last detected drag state on the dropzone -> we start with dragleave since user is not dragging initially.
        This state is updated when drop zone is left/entered entirely(not taking the children in the account) or entire window is left
        */
        this.dropZoneDragState = 'dragleave';
    }

    componentDidMount() {
        if (this.props.disabled) {
            return;
        }
        this.addEventListeners();
    }

    componentDidUpdate(prevProps) {
        const isDisabled = this.props.disabled;
        if (this.props.isFocused === prevProps.isFocused && isDisabled === prevProps.disabled) {
            return;
        }
        if (!this.props.isFocused || isDisabled) {
            this.removeEventListeners();
        } else {
            this.addEventListeners();
        }
    }

    componentWillUnmount() {
        if (this.props.disabled) {
            return;
        }
        this.removeEventListeners();
    }

    addEventListeners() {
        this.dropZone = document.getElementById(this.props.dropZoneId);
        this.dropZoneRect = this.calculateDropZoneClientReact();
        document.addEventListener('dragover', this.dropZoneDragListener);
        document.addEventListener('dragenter', this.dropZoneDragListener);
        document.addEventListener('dragleave', this.dropZoneDragListener);
        document.addEventListener('drop', this.dropZoneDragListener);
        window.addEventListener('resize', this.throttledDragNDropWindowResizeListener);
    }

    removeEventListeners() {
        document.removeEventListener('dragover', this.dropZoneDragListener);
        document.removeEventListener('dragenter', this.dropZoneDragListener);
        document.removeEventListener('dragleave', this.dropZoneDragListener);
        document.removeEventListener('drop', this.dropZoneDragListener);
        window.removeEventListener('resize', this.throttledDragNDropWindowResizeListener);
    }

    /**
     * @param {Object} event native Event
     */
    dragOverHandler(event) {
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
            right: window.innerWidth <= variables.mobileResponsiveWidthBreakpoint ? window.innerWidth : boundingClientRect.right,
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
                this.throttledDragOverHandler(event);
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
                        event.clientY <= this.dropZoneRect.top ||
                        event.clientY >= this.dropZoneRect.bottom ||
                        event.clientX <= this.dropZoneRect.left ||
                        event.clientX >= this.dropZoneRect.right ||
                        // Cancel drag when file manager is on top of the drop zone area - works only on chromium
                        (event.target.getAttribute('id') === this.props.activeDropZoneId && !event.relatedTarget)
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
            default:
                break;
        }
    }

    /**
     * Handles all types of drag-N-drop events on the drop zone associated with composer
     *
     * @param {Object} event native Event
     */
    dropZoneDragListener(event) {
        event.preventDefault();

        if (this.dropZone.contains(event.target) && this.props.shouldAcceptDrop(event)) {
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
DragAndDrop.defaultProps = defaultProps;

export default withNavigationFocus(DragAndDrop);
