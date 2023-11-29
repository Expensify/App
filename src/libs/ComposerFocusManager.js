import {forEach} from 'lodash';
import {TextInput} from 'react-native';
import _ from 'underscore';
import CONST from '@src/CONST';

let focusedElement = null;

function getActiveElement() {
    return TextInput.State.currentlyFocusedInput ? TextInput.State.currentlyFocusedInput() : TextInput.State.currentlyFocusedField();
}

function saveFocusedElement(e) {
    const target = e.target;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
    }
    const activeElement = getActiveElement();
    if (!activeElement || (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA')) {
        return;
    }
    focusedElement = activeElement;
}

function removeFocusedElement() {
    if (!focusedElement) {
        return;
    }
    // we have to use timeout because of measureLayout
    setTimeout(() => (focusedElement = null), CONST.ANIMATION_IN_TIMING);
}

let uniqueModalId = 1;
const focusMap = new Map();
const activeModals = [];
const promiseMap = new Map();

// TODO:debug
global.demo = new Proxy(
    {
        obj: () => [...focusMap.values()],
        arr: () => activeModals,
        promise: () => [...promiseMap],
        el: () => focusedElement,
    },
    {
        get: (target, key) => target[key] && target[key](),
    },
);

function releaseElement(el) {
    if (!el) {
        return;
    }
    if (el === focusedElement) {
        focusedElement = null;
    }
    forEach(focusMap, ([key, value]) => {
        if (value !== el) {
            return;
        }
        focusMap.delete(key);
    });
}

function getId() {
    return uniqueModalId++;
}

function saveFocusState(id, container) {
    // For popoverWithoutOverlay, react calls autofocus before useEffect.
    const input = focusedElement || getActiveElement();
    focusedElement = null;
    if (activeModals.indexOf(id) < 0) {
        activeModals.push(id);
    }
    if (!input) {
        return;
    }
    // TODO: can we refine this logic?
    if (container && container.contains(input)) {
        return;
    }
    focusMap.set(id, input);
    input.blur();
}

/**
 * If we intentionally clicked on another input box, there is no need to restore focus.
 * But if we are closing the RHP, we can ignore the focused input.
 *
 * @param {Element} element
 * @param {Boolean} shouldIgnoreFocused
 */
function focusElement(element, shouldIgnoreFocused = false) {
    if (shouldIgnoreFocused) {
        element.focus();
        return;
    }
    const focused = getActiveElement();
    if (focused) {
        return;
    }
    element.focus();
}

function restoreFocusState(id, type = CONST.MODAL.RESTORE_TYPE.DEFAULT, shouldIgnoreFocused = false) {
    // TODO:del
    console.debug(`restore ${id}, type is ${type}, active modals are`, activeModals.join());
    if (!id) {
        // TODO:del
        console.debug('todo id empty');
        return;
    }
    if (activeModals.length < 1) {
        // TODO:del
        console.debug('stack is empty');
        return;
    }
    const index = activeModals.indexOf(id);
    if (index < 0) {
        // TODO:del
        console.debug('activeModals does not contain this id');
        return;
    }
    activeModals.splice(index, 1);
    if (type === CONST.MODAL.RESTORE_TYPE.PRESERVE) {
        // TODO:del
        console.debug('preserve input focus');
        return;
    }
    if (type === CONST.MODAL.RESTORE_TYPE.DELETE) {
        // TODO:del
        console.debug('delete, no restore');
        focusMap.delete(id);
        return;
    }
    if (activeModals.length > index) {
        // this modal is not the topmost one, do not restore it.
        // TODO:del
        console.debug('modal is not the topmost one');
        return;
    }
    const element = focusMap.get(id);
    if (element) {
        focusElement(element, shouldIgnoreFocused);
        focusMap.delete(id);
        return;
    }

    if (focusMap.size < 1) {
        // TODO:del
        console.debug('obj is also empty, so return');
        return;
    }

    // find the topmost one
    const [lastKey, lastElement] = _.last([...focusMap]);
    if (!lastElement) {
        // TODO:del
        console.error('no, impossible');
        return;
    }
    // TODO:del
    console.debug('oh, try to restore topmost');
    focusElement(lastElement, shouldIgnoreFocused);
    focusMap.delete(lastKey);
}

function resetReadyToFocus(id) {
    // TODO:del
    console.debug('reset ready to focus', id);
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
    return _.last([...promiseMap.keys()]);
}

function setReadyToFocus(id) {
    const key = getKey(id);
    const promise = promiseMap.get(key);
    // TODO:del
    console.debug('set ready to focus', id, key);
    if (!promise) {
        return;
    }
    promise.resolve();
    promiseMap.delete(key);
}

function removePromise(id) {
    // TODO:del
    console.debug('remove promise', id);
    const key = getKey(id);
    promiseMap.delete(key);
}

function isReadyToFocus(id) {
    const key = getKey(id);
    const promise = promiseMap.get(key);
    // TODO:del
    console.debug('is ready to focus', id, key, promise);
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
    const [key, input] = _.last([...focusMap]);
    console.debug('oh, try to restore by external');
    input.focus();
    focusMap.delete(key);
}

export default {
    getId,
    saveFocusedElement,
    removeFocusedElement,
    releaseElement,
    saveFocusState,
    restoreFocusState,
    resetReadyToFocus,
    setReadyToFocus,
    isReadyToFocus,
    tryRestoreFocusAfterClosedCompletely,
    removePromise,
    tryRestoreFocusByExternal,
};
