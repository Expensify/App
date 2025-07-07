"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var PopoverProvider_1 = require("@components/PopoverProvider");
var COPY_DROP_EFFECT = 'copy';
var NONE_DROP_EFFECT = 'none';
var DRAG_ENTER_EVENT = 'dragenter';
var DRAG_OVER_EVENT = 'dragover';
var DRAG_LEAVE_EVENT = 'dragleave';
var DROP_EVENT = 'drop';
/**
 * @param dropZone – ref to the dropZone component
 */
var useDragAndDrop = function (_a) {
    var dropZone = _a.dropZone, _b = _a.onDrop, onDrop = _b === void 0 ? function () { } : _b, _c = _a.shouldAllowDrop, shouldAllowDrop = _c === void 0 ? true : _c, _d = _a.isDisabled, isDisabled = _d === void 0 ? false : _d, _e = _a.shouldAcceptDrop, shouldAcceptDrop = _e === void 0 ? function () { return true; } : _e, _f = _a.shouldHandleDragEvent, shouldHandleDragEvent = _f === void 0 ? true : _f, _g = _a.shouldStopPropagation, shouldStopPropagation = _g === void 0 ? true : _g;
    var isFocused = (0, native_1.useIsFocused)();
    var _h = (0, react_1.useState)(false), isDraggingOver = _h[0], setIsDraggingOver = _h[1];
    var closePopover = (0, react_1.useContext)(PopoverProvider_1.PopoverContext).close;
    var dragCounter = (0, react_1.useRef)(0);
    var debounceTimeoutRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(function () {
        if (isFocused && !isDisabled) {
            return;
        }
        setIsDraggingOver(false);
        dragCounter.current = 0;
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
            debounceTimeoutRef.current = null;
        }
    }, [isFocused, isDisabled]);
    var handleDragEvent = (0, react_1.useCallback)(function (event) {
        if (!shouldHandleDragEvent) {
            return;
        }
        var shouldAcceptThisDrop = shouldAllowDrop && shouldAcceptDrop(event);
        if (shouldAcceptThisDrop && event.type === DRAG_ENTER_EVENT) {
            closePopover();
        }
        var effect = shouldAcceptThisDrop ? COPY_DROP_EFFECT : NONE_DROP_EFFECT;
        if (event.dataTransfer) {
            // eslint-disable-next-line no-param-reassign
            event.dataTransfer.dropEffect = effect;
            // eslint-disable-next-line no-param-reassign
            event.dataTransfer.effectAllowed = effect;
        }
    }, [shouldHandleDragEvent, shouldAllowDrop, shouldAcceptDrop, closePopover]);
    /**
     * Handles all types of drag-N-drop events on the drop zone associated with composer
     */
    var dropZoneDragHandler = (0, react_1.useCallback)(function (event) {
        if (!isFocused || isDisabled || !shouldAcceptDrop(event)) {
            return;
        }
        event.preventDefault();
        if (shouldStopPropagation) {
            event.stopPropagation();
        }
        // Clear any existing debounce timeout
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
            debounceTimeoutRef.current = null;
        }
        switch (event.type) {
            case DRAG_OVER_EVENT:
                handleDragEvent(event);
                break;
            case DRAG_ENTER_EVENT:
                handleDragEvent(event);
                dragCounter.current += 1;
                if (dragCounter.current === 1 && !isDraggingOver) {
                    setIsDraggingOver(true);
                }
                break;
            case DRAG_LEAVE_EVENT:
                dragCounter.current -= 1;
                if (dragCounter.current <= 0) {
                    dragCounter.current = 0;
                    // Add small debounce to prevent rapid flickering
                    debounceTimeoutRef.current = setTimeout(function () {
                        setIsDraggingOver(false);
                    }, 50);
                }
                break;
            case DROP_EVENT:
                dragCounter.current = 0;
                setIsDraggingOver(false);
                onDrop(event);
                break;
            default:
                break;
        }
    }, [isFocused, isDisabled, shouldAcceptDrop, shouldStopPropagation, handleDragEvent, isDraggingOver, onDrop]);
    (0, react_1.useEffect)(function () {
        if (!dropZone.current) {
            return;
        }
        var dropZoneRef = dropZone.current;
        // Note that the dragover event needs to be called with `event.preventDefault` in order for the drop event to be fired:
        // https://stackoverflow.com/questions/21339924/drop-event-not-firing-in-chrome
        dropZoneRef.setAttribute('webkitdirectory', '');
        dropZoneRef.addEventListener(DRAG_OVER_EVENT, dropZoneDragHandler);
        dropZoneRef.addEventListener(DRAG_ENTER_EVENT, dropZoneDragHandler);
        dropZoneRef.addEventListener(DRAG_LEAVE_EVENT, dropZoneDragHandler);
        dropZoneRef.addEventListener(DROP_EVENT, dropZoneDragHandler);
        return function () {
            if (!dropZoneRef) {
                return;
            }
            dropZoneRef.removeAttribute('webkitdirectory');
            dropZoneRef.removeEventListener(DRAG_OVER_EVENT, dropZoneDragHandler);
            dropZoneRef.removeEventListener(DRAG_ENTER_EVENT, dropZoneDragHandler);
            dropZoneRef.removeEventListener(DRAG_LEAVE_EVENT, dropZoneDragHandler);
            dropZoneRef.removeEventListener(DROP_EVENT, dropZoneDragHandler);
        };
    }, [dropZone, dropZoneDragHandler]);
    return { isDraggingOver: isDraggingOver };
};
exports.default = useDragAndDrop;
