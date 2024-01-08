import {last} from 'lodash';
import {TextInput} from 'react-native';
import CONST from '@src/CONST';

let focusedInput = null;
let uniqueModalId = 1;
const focusMap = new Map();
const activeModals = [];
const promiseMap = new Map();

function getActiveInput() {
    return TextInput.State.currentlyFocusedInput ? TextInput.State.currentlyFocusedInput() : TextInput.State.currentlyFocusedField();
}

/**
 * On web platform, if the modal is displayed by a click, the blur event is fired before the modal appears,
 * so we need to cache the focused input in the pointerdown handler, which is fired before the blur event.
 */
function saveFocusedInput() {
    focusedInput = getActiveInput();
}

/**
 * If a click does not display the modal, we also should clear the cached value to avoid potential issues.
 */
function clearFocusedInput() {
    if (!focusedInput) {
        return;
    }

    // we have to use timeout because of measureLayout
    setTimeout(() => (focusedInput = null), CONST.ANIMATION_IN_TIMING);
}

/**
 * When a TextInput is unmounted, we also should release the reference here to avoid potential issues.
 *
 * @param {TextInput | Falsy} input
 */
function releaseInput(input) {
    if (!input) {
        return;
    }
    if (input === focusedInput) {
        focusedInput = null;
    }
    [...focusMap].forEach(([key, value]) => {
        if (value !== input) {
            return;
        }
        focusMap.delete(key);
    });
}

function getId() {
    return uniqueModalId++;
}

/**
 * Save the focus state when opening the modal.
 *
 * @param {Number} id
 * @param {any} container
 */
function saveFocusState(id, container = undefined) {
    const activeInput = getActiveInput();

    // For popoverWithoutOverlay, react calls autofocus before useEffect.
    const input = focusedInput || activeInput;
    focusedInput = null;
    if (activeModals.indexOf(id) < 0) {
        activeModals.push(id);
    }
    if (!input) {
        return;
    }
    if (container && container.contains(input)) {
        return;
    }
    focusMap.set(id, input);
    input.blur();
}

/**
 * On web platform, if we intentionally click on another input box, there is no need to restore focus.
 * But if we are closing the RHP, we can ignore the focused input.
 *
 * @param {TextInput} input
 * @param {Boolean} shouldIgnoreFocused
 */
function focus(input, shouldIgnoreFocused = false) {
    if (shouldIgnoreFocused) {
        input.focus();
        return;
    }
    const activeInput = getActiveInput();
    if (activeInput) {
        return;
    }
    input.focus();
}

/**
 * Restore the focus state after the modal is dismissed.
 *
 * @param {Number} id
 * @param {String} type
 * @param {Boolean} shouldIgnoreFocused
 */
function restoreFocusState(id, type = CONST.MODAL.RESTORE_FOCUS_TYPE.DEFAULT, shouldIgnoreFocused = false) {
    if (!id) {
        return;
    }

    // The stack is empty
    if (activeModals.length < 1) {
        return;
    }
    const index = activeModals.indexOf(id);

    // This id has been removed from the stack.
    if (index < 0) {
        return;
    }
    activeModals.splice(index, 1);
    if (type === CONST.MODAL.RESTORE_FOCUS_TYPE.PRESERVE) {
        return;
    }
    if (type === CONST.MODAL.RESTORE_FOCUS_TYPE.DELETE) {
        focusMap.delete(id);
        return;
    }

    // This modal is not the topmost one, do not restore it.
    if (activeModals.length > index) {
        return;
    }
    const input = focusMap.get(id);
    if (input) {
        focus(input, shouldIgnoreFocused);
        focusMap.delete(id);
        return;
    }

    // Try to find the topmost one and restore it
    if (focusMap.size < 1) {
        return;
    }
    const [lastId, lastInput] = last([...focusMap]);

    // The previous modal is still active
    if (activeModals.indexOf(lastId) >= 0) {
        return;
    }
    focus(lastInput, shouldIgnoreFocused);
    focusMap.delete(lastId);
}

function resetReadyToFocus(id) {
    const obj = {};
    obj.ready = new Promise((resolve) => {
        obj.resolve = resolve;
    });
    promiseMap.set(id, obj);
}

function getKey(id) {
    if (id) {
        return id;
    }
    if (promiseMap.size < 1) {
        return 0;
    }
    return last([...promiseMap.keys()]);
}

function setReadyToFocus(id) {
    const key = getKey(id);
    const promise = promiseMap.get(key);
    if (!promise) {
        return;
    }
    promise.resolve();
    promiseMap.delete(key);
}

function removePromise(id) {
    const key = getKey(id);
    promiseMap.delete(key);
}

function isReadyToFocus(id) {
    const key = getKey(id);
    const promise = promiseMap.get(key);
    if (!promise) {
        return Promise.resolve();
    }
    return promise.ready;
}

function tryRestoreFocusAfterClosedCompletely(id, restoreType) {
    isReadyToFocus(id).then(() => restoreFocusState(id, restoreType));
}

function tryRestoreFocusByExternal() {
    if (focusMap.size < 1) {
        return;
    }
    const [key, input] = last([...focusMap]);
    input.focus();
    focusMap.delete(key);
}

export default {
    getId,
    saveFocusedInput,
    clearFocusedInput,
    releaseInput,
    saveFocusState,
    restoreFocusState,
    resetReadyToFocus,
    setReadyToFocus,
    isReadyToFocus,
    tryRestoreFocusAfterClosedCompletely,
    removePromise,
    tryRestoreFocusByExternal,
};
