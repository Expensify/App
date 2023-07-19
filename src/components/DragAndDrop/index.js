import {useCallback, useEffect, useRef} from 'react';
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

function DragAndDrop(props) {
    const dropZone = useRef(null);
    const dropZoneRect = useRef(null);
    const dropZoneDragState = useRef('dragleave');

    /**
     * @param {Object} event native Event
     */
    const dragOverHandler = (event) => {
        props.onDragOver(event);
    };

    const throttledDragOverHandler = _.throttle(dragOverHandler, 100);

    const calculateDropZoneClientReact = useCallback(() => {
        const boundingClientRect = dropZone.current.getBoundingClientRect();

        // Handle edge case when we are under responsive breakpoint the browser doesn't normalize rect.left to 0 and rect.right to window.innerWidth
        return {
            width: boundingClientRect.width,
            left: window.innerWidth <= variables.mobileResponsiveWidthBreakpoint ? 0 : boundingClientRect.left,
            right: window.innerWidth <= variables.mobileResponsiveWidthBreakpoint ? window.innerWidth : boundingClientRect.right,
            top: boundingClientRect.top,
            bottom: boundingClientRect.bottom,
        };
    }, []);

    const dragNDropWindowResizeListener = () => {
        // Update bounding client rect on window resize
        dropZoneRect.current = calculateDropZoneClientReact();
    };

    const throttledDragNDropWindowResizeListener = _.throttle(dragNDropWindowResizeListener, 100);

    /**
     * @param {Object} event native Event
     */
    const dropZoneDragHandler = useCallback(
        (event) => {
            console.log('dropZoneDragHandler');
            // Setting dropEffect for dragover is required for '+' icon on certain platforms/browsers (eg. Safari)
            switch (event.type) {
                case 'dragover':
                    // Continuous event -> can hurt performance, be careful when subscribing
                    // eslint-disable-next-line no-param-reassign
                    event.dataTransfer.dropEffect = COPY_DROP_EFFECT;
                    throttledDragOverHandler(event);
                    break;
                case 'dragenter':
                    // Avoid reporting onDragEnter for children views -> not performant
                    if (dropZoneDragState.current === 'dragleave') {
                        dropZoneDragState.current = 'dragenter';
                        console.log('should assign copy effect');
                        // eslint-disable-next-line no-param-reassign
                        event.dataTransfer.dropEffect = COPY_DROP_EFFECT;
                        props.onDragEnter(event);
                    }
                    break;
                case 'dragleave':
                    if (dropZoneDragState.current === 'dragenter') {
                        if (
                            event.clientY <= dropZoneRect.current.top ||
                            event.clientY >= dropZoneRect.current.bottom ||
                            event.clientX <= dropZoneRect.current.left ||
                            event.clientX >= dropZoneRect.current.right ||
                            // Cancel drag when file manager is on top of the drop zone area - works only on chromium
                            (event.target.getAttribute('id') === props.activeDropZoneId && !event.relatedTarget)
                        ) {
                            dropZoneDragState.current = 'dragleave';
                            props.onDragLeave(event);
                        }
                    }
                    break;
                case 'drop':
                    dropZoneDragState.current = 'dragleave';
                    props.onDrop(event);
                    break;
                default:
                    break;
            }
        },
        [props, throttledDragOverHandler],
    );

    /**
     * Handles all types of drag-N-drop events on the drop zone associated with composer
     *
     * @param {Object} event native Event
     */
    const dropZoneDragListener = useCallback(
        (event) => {
            event.preventDefault();

            if (dropZone.current.contains(event.target) && props.shouldAcceptDrop(event)) {
                dropZoneDragHandler(event);
            } else {
                // eslint-disable-next-line no-param-reassign
                event.dataTransfer.dropEffect = NONE_DROP_EFFECT;
            }
        },
        [props, dropZoneDragHandler],
    );

    const addEventListeners = useCallback(() => {
        dropZone.current = document.getElementById(props.dropZoneId);
        dropZoneRect.current = calculateDropZoneClientReact();
        document.addEventListener('dragover', dropZoneDragListener);
        document.addEventListener('dragenter', dropZoneDragListener);
        document.addEventListener('dragleave', dropZoneDragListener);
        document.addEventListener('drop', dropZoneDragListener);
        window.addEventListener('resize', throttledDragNDropWindowResizeListener);
    }, [props.dropZoneId, calculateDropZoneClientReact, dropZoneDragListener, throttledDragNDropWindowResizeListener]);

    const removeEventListeners = useCallback(() => {
        document.removeEventListener('dragover', dropZoneDragListener);
        document.removeEventListener('dragenter', dropZoneDragListener);
        document.removeEventListener('dragleave', dropZoneDragListener);
        document.removeEventListener('drop', dropZoneDragListener);
        window.removeEventListener('resize', throttledDragNDropWindowResizeListener);
    }, [dropZoneDragListener, throttledDragNDropWindowResizeListener]);

    useEffect(() => {
        if (props.disabled) {
            return;
        }
        console.log('did add listeners');
        addEventListeners();

        return () => {
            console.log('did remove listeners');
            removeEventListeners();
        };
    }, []);

    // These refs are used to store the previous values of props
    const isFocusedRef = useRef(props.isFocused);
    const isDisabledRef = useRef(props.disabled);

    useEffect(() => {
        if (props.isFocused !== isFocusedRef.current) {
            if (!props.isFocused) {
                console.log('focused did remove listeners');
                removeEventListeners();
            } else {
                console.log('focused add listeners');
                addEventListeners();
            }
        }

        if (props.disabled !== isDisabledRef.current) {
            if (props.disabled) {
                console.log('disabled did remove listeners');
                removeEventListeners();
            } else {
                console.log('disabled add listeners');
                addEventListeners();
            }
        }

        isFocusedRef.current = props.isFocused;
        isDisabledRef.current = props.disabled;
    });

    return props.children;
}

DragAndDrop.propTypes = propTypes;
DragAndDrop.defaultProps = defaultProps;

export default withNavigationFocus(DragAndDrop);
