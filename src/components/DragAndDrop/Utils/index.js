import {createContext} from 'react';

const dragAndDropContexts = {};
const onDropCallbacks = {};

/**
 * @param {String} dropZoneID
 * @param {Boolean} [shouldCreateNewContext] – should this create a new context for the dropZoneID if one does not already exist?
 * @returns {Object}
 */
function getDragAndDropContext(dropZoneID, shouldCreateNewContext = false) {
    if (dropZoneID in dragAndDropContexts) {
        return dragAndDropContexts[dropZoneID];
    }

    if (!shouldCreateNewContext) {
        throw new Error(`Could not find DragAndDrop context with dropZoneID: ${dropZoneID}`);
    }

    dragAndDropContexts[dropZoneID] = createContext({});
    return dragAndDropContexts[dropZoneID];
}

function deleteDragAndDropContext(dropZoneID) {
    delete dragAndDropContexts[dropZoneID];
}

/**
 * @param {String} dropZoneID
 * @param {Function} callback
 */
function registerOnDropCallback(dropZoneID, callback) {
    if (!(dropZoneID in onDropCallbacks)) {
        onDropCallbacks[dropZoneID] = [];
    }
    onDropCallbacks[dropZoneID].push(callback);
}

/**
 * @param {String} dropZoneID
 * @param {Function} callback
 */
function deregisterOnDropCallback(dropZoneID, callback) {
    if (!(dropZoneID in onDropCallbacks)) {
        return;
    }
    const index = onDropCallbacks[dropZoneID].indexOf(callback);
    if (index < 0) {
        return;
    }
    onDropCallbacks[dropZoneID] = onDropCallbacks[dropZoneID].splice(index, 1);
}

/**
 * @param {Event} event – onDrop event
 * @param {String} dropZoneID – dropZoneID that triggered the event
 */
function executeOnDropCallbacks(event, dropZoneID) {
    if (!(dropZoneID in onDropCallbacks)) {
        return;
    }
    onDropCallbacks[dropZoneID].forEach((callback) => callback(event));
}

export default {
    getDragAndDropContext,
    deleteDragAndDropContext,
    registerOnDropCallback,
    deregisterOnDropCallback,
    executeOnDropCallbacks,
};
